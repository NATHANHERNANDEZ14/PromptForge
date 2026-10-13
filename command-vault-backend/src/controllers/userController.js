const crypto = require('crypto');
const userService = require('../services/userService');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');
const emailService = require('../services/emailService');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: crear notificación interna sin bloquear la respuesta
// ─────────────────────────────────────────────────────────────────────────────
function createNotification(message, type = 'info', metadata = {}) {
  Notification.create({ message, type, metadata }).catch(err =>
    console.error('[Notification] Error al crear notificación:', err.message)
  );
}

class UserController {

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for'] || 'desconocida';

      const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+loginAttempts +lockUntil');

      if (!user) {
        return res.status(401).json({ error: 'El usuario no está registrado en el sistema.' });
      }

      // Verificar si la cuenta está bloqueada temporalmente
      if (user.isLocked()) {
        createNotification(
          `Intento de acceso bloqueado (cuenta temporal bloqueada): "${user.username}" desde IP ${ip}.`,
          'alert', { username: user.username, userId: user._id, ip }
        );
        return res.status(429).json({
          error: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta más tarde.'
        });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        // Incrementar intentos fallidos
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        // Bloquear cuenta después de 5 intentos por 30 minutos
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
          user.loginAttempts = 0;

          createNotification(
            `Cuenta de "${user.username}" bloqueada por 30 min. por ${user.loginAttempts} intentos fallidos desde IP ${ip}.`,
            'alert', { username: user.username, userId: user._id, ip }
          );

          // Notificar al usuario por correo
          if (user.email) {
            emailService.sendLoginAlertEmail({
              to: user.email,
              name: user.name,
              username: user.username,
              ip
            });
          }
        }

        await user.save();
        return res.status(401).json({ error: 'Contraseña incorrecta. Verifica tus credenciales.' });
      }

      // Login exitoso: verificar cuenta activa
      if (!user.active) {
        createNotification(
          `Intento de acceso bloqueado: "${user.username}" (${user.name}) intentó ingresar pero su cuenta está desactivada. IP: ${ip}`,
          'alert', { username: user.username, userId: user._id, ip }
        );
        return res.status(403).json({ error: 'La cuenta está desactivada. Comuníquese con su administrador.' });
      }

      // Limpiar intentos y registrar login exitoso
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      const userJson = user.toJSON();

      return res.json({ ...userJson, token });

    } catch (err) {
      console.error('[Login] Error:', err);
      return res.status(500).json({ error: 'Error en el servidor al procesar el inicio de sesión.' });
    }
  }

  // ─── Perfil del usuario autenticado ────────────────────────────────────────
  async me(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password -emailVerificationToken -passwordResetToken');
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
      res.json(user);
    } catch (err) {
      console.error('[Me] Error:', err);
      res.status(500).json({ error: 'Error obteniendo perfil del usuario.' });
    }
  }

  // ─── Listar todos los usuarios (admin) ─────────────────────────────────────
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error('[GetAll] Error:', err);
      res.status(500).json({ error: 'Error al listar usuarios.' });
    }
  }

  // ─── Crear usuario (admin) ──────────────────────────────────────────────────
  async create(req, res) {
    try {
      // req.body ya fue validado y sanitizado por validationMiddleware
      const { name, username, email, password, role } = req.body;

      // Verificar duplicados de username y email
      const existingByUsername = await User.findOne({ username: username.toLowerCase().trim() });
      if (existingByUsername) {
        return res.status(400).json({ error: `El nombre de usuario "@${username}" ya está en uso.` });
      }

      const existingByEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingByEmail) {
        return res.status(400).json({ error: `El correo "${email}" ya está registrado en el sistema.` });
      }

      const emailVerificationToken = crypto.randomBytes(20).toString('hex');
      req.body.emailVerificationToken = emailVerificationToken;
      
      const newUser = await userService.createUser(req.body);

      // Notificación interna
      createNotification(
        `Nuevo usuario creado: "${name}" (@${username}) con rol "${role || 'user'}" por el admin "${req.user.username}".`,
        'info', { createdBy: req.user.username, newUserId: newUser.id }
      );

      // Enlace de confirmación (asumiendo que la API está en la misma URL base que el frontend o apuntando a una ruta directa del backend)
      const baseUrl = req.protocol + '://' + req.get('host');
      const confirmationLink = `${baseUrl}/api/users/confirm/${emailVerificationToken}`;

      // Email de bienvenida (async, no bloquea la respuesta)
      emailService.sendWelcomeEmail({
        to: email,
        name,
        username: username.toLowerCase(),
        confirmationLink
      });

      res.status(201).json(newUser);

    } catch (err) {
      console.error('[Create] Error:', err);

      if (err.code === 11000 || (err.message && err.message.includes('duplicate key'))) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'campo';
        const value = err.keyValue ? err.keyValue[field] : '';
        return res.status(400).json({
          error: `El ${field === 'email' ? 'correo' : 'nombre de usuario'} "${value}" ya está registrado en el sistema.`
        });
      }

      return res.status(400).json({ error: err.message || 'Error al crear usuario.' });
    }
  }

  // ─── Actualizar usuario (admin) ─────────────────────────────────────────────
  async update(req, res) {
    try {
      const targetId = req.params.id;
      const { active, password, name, email } = req.body;

      // Obtener usuario antes de actualizar para comparar estado
      const previousUser = await User.findById(targetId).select('active email name username');
      if (!previousUser) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const updated = await userService.updateUser(targetId, req.body);
      if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });

      // Determinar qué cambió y enviar emails correspondientes
      const adminInfo = { adminName: req.user.name || req.user.username };
      const userEmail = email || previousUser.email;
      const userName = name || previousUser.name;
      const userUsername = updated.username || previousUser.username;

      // Si se cambió el estado activo
      if (typeof active === 'boolean' && active !== previousUser.active && userEmail) {
        if (!active) {
          emailService.sendAccountDeactivatedEmail({
            to: userEmail, name: userName, username: userUsername, ...adminInfo
          });
          createNotification(
            `Cuenta desactivada: "${userName}" (@${userUsername}) por el admin "${req.user.username}".`,
            'warning', { adminId: req.user.id, targetId }
          );
        } else {
          emailService.sendAccountActivatedEmail({
            to: userEmail, name: userName, username: userUsername, ...adminInfo
          });
          createNotification(
            `Cuenta reactivada: "${userName}" (@${userUsername}) por el admin "${req.user.username}".`,
            'info', { adminId: req.user.id, targetId }
          );
        }
      }

      // Si se cambió la contraseña
      if (password && userEmail) {
        emailService.sendPasswordChangedEmail({
          to: userEmail,
          name: userName,
          username: userUsername,
          changedByAdmin: req.user.id !== targetId,
          ...adminInfo
        });
      }

      res.json(updated);

    } catch (err) {
      console.error('[Update] Error:', err);
      res.status(400).json({ error: err.message || 'Error al actualizar usuario.' });
    }
  }

  // ─── Eliminar usuario (admin) ───────────────────────────────────────────────
  async delete(req, res) {
    try {
      const targetId = req.params.id;

      // Obtener datos antes de eliminar para el email
      const userToDelete = await User.findById(targetId).select('name username email');
      if (!userToDelete) return res.status(404).json({ error: 'Usuario no encontrado.' });

      // Evitar que un admin se elimine a sí mismo
      if (targetId === req.user.id) {
        return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta.' });
      }

      const deleted = await userService.deleteUser(targetId);
      if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado.' });

      // Notificación interna
      createNotification(
        `Cuenta eliminada: "${userToDelete.name}" (@${userToDelete.username}) por el admin "${req.user.username}".`,
        'alert', { adminId: req.user.id, deletedUserId: targetId, username: userToDelete.username }
      );

      // Email de notificación al usuario eliminado
      if (userToDelete.email) {
        emailService.sendAccountDeletedEmail({
          to: userToDelete.email,
          name: userToDelete.name,
          username: userToDelete.username,
          adminName: req.user.name || req.user.username
        });
      }

      res.json({ message: `Usuario "${userToDelete.name}" eliminado correctamente.` });

    } catch (err) {
      console.error('[Delete] Error:', err);
      res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  }

  // ─── Confirmar Email (Clic desde el correo) ─────────────────────────────────
  async confirmEmail(req, res) {
    try {
      const { token } = req.params;
      const user = await User.findOne({ emailVerificationToken: token });

      if (!user) {
        return res.status(400).send(`
          <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h2>Enlace inválido o expirado</h2>
            <p>El enlace de confirmación no es válido o la cuenta ya fue confirmada.</p>
          </div>
        `);
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      // Crear notificación para el administrador (plataforma)
      createNotification(
        `Confirmación de credenciales recibida con éxito: El usuario "${user.name}" (@${user.username}) ha confirmado de recibido su correo y contraseña.`,
        'success', { userId: user._id, username: user.username }
      );

      // Enviar correo al administrador
      emailService.sendAdminNotificationEmail({
        title: 'Usuario confirmado',
        message: `El usuario <strong>${user.name}</strong> ha confirmado correctamente la recepción de sus credenciales.`,
        details: {
          'Usuario': `@${user.username}`,
          'Correo': user.email,
          'Fecha de confirmación': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
        }
      });

      return res.status(200).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #15803d;">
          <h2>¡Confirmación exitosa!</h2>
          <p>Has confirmado la recepción de tus credenciales. Ya puedes cerrar esta ventana e iniciar sesión en la plataforma.</p>
        </div>
      `);
    } catch (err) {
      console.error('[ConfirmEmail] Error:', err);
      return res.status(500).send('Error interno del servidor.');
    }
  }
}

module.exports = new UserController();