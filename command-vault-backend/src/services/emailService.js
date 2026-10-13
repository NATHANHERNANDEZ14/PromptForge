const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────────────────────────────────────
// Configuración del transporter SMTP
// ─────────────────────────────────────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  return transporter;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'Command Vault <noreply@commandvault.app>';

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper genérico para envío con fallback silencioso en desarrollo
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'tu_correo@gmail.com') {
    console.warn(`[EmailService] SMTP no configurado. Email no enviado a: ${to} | Asunto: ${subject}`);
    return null;
  }

  try {
    const info = await getTransporter().sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });
    console.log(`[EmailService] Email enviado a ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EmailService] Error enviando a ${to}:`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons (Lucide paths, inline-safe para clientes de correo)
// Fuente: https://lucide.dev — stroke-width=2, viewBox="0 0 24 24"
// ─────────────────────────────────────────────────────────────────────────────
const icons = {
  // Terminal / Lock
  terminal: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>`,

  // Alert Triangle (warning)
  alertTriangle: (color = '#f59e0b') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,

  // Shield Alert (security)
  shieldAlert: (color = '#ef4444') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,

  // Check Circle (success)
  checkCircle: (color = '#10b981') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,

  // Lock (password)
  lock: (color = '#f59e0b') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,

  // Key (password changed)
  key: (color = '#3b82f6') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,

  // Trash (deleted)
  trash: (color = '#ef4444') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,

  // Bell (admin notification)
  bell: (color = '#3b82f6') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,

  // User check (welcome / confirmed)
  userCheck: (color = '#10b981') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
};

// Helper para renderizar un ícono con fondo coloreado en alertas
function alertBox({ color, bgColor, borderColor, icon, text }) {
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:0;">
      <tr>
        <td style="background:${bgColor};border:1px solid ${borderColor};border-radius:10px;padding:14px 16px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;padding-right:12px;width:26px;">${icon}</td>
              <td style="vertical-align:middle;color:${color};font-size:13px;line-height:1.5;">${text}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template base
// ─────────────────────────────────────────────────────────────────────────────
function baseTemplate({ title, content, footerNote = '' }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:'Inter',-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;padding:60px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#131b2f;border-radius:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);overflow:hidden;border:1px solid rgba(255,255,255,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:48px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:16px;margin-bottom:16px;">
                ${icons.terminal}
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.03em;">COMMAND VAULT</h1>
              <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;font-weight:500;">Gestión Centralizada de Flujos y Equipos</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:48px 48px 32px 48px;background:#131b2f;">
              <h2 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 24px;letter-spacing:-0.02em;">${title}</h2>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-top:1px solid rgba(255,255,255,0.05);padding:28px 48px;text-align:center;">
              ${footerNote
                ? `<p style="color:#94a3b8;font-size:13px;margin:0 0 12px;font-weight:500;">${footerNote}</p>`
                : ''}
              <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
                &copy; ${new Date().getFullYear()} <strong style="color:#64748b;">Command Vault</strong> &mdash; Sistema de uso interno.<br/>
                No responder a este correo automatizado.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function textRow(label, value) {
  return `
  <tr>
    <td style="padding:10px 0;color:#94a3b8;font-size:14px;font-weight:500;width:35%;border-bottom:1px solid rgba(255,255,255,0.04);">${label}</td>
    <td style="padding:10px 0;color:#f8fafc;font-size:15px;font-weight:600;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">${value}</td>
  </tr>`;
}

function infoTable(rows) {
  return `
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Bienvenida al nuevo usuario
// ─────────────────────────────────────────────────────────────────────────────
async function sendWelcomeEmail({ to, name, username, temporaryPassword, confirmationLink }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, tu cuenta ha sido creada exitosamente en <strong>Command Vault</strong>. A continuación encontrarás tus credenciales de acceso.
    </p>
    ${infoTable(`
      ${textRow('Usuario', `@${username}`)}
      ${textRow('Contrase&ntilde;a', temporaryPassword || '(la que definiste)')}
      ${textRow('Rol', 'Usuario del sistema')}
    `)}
    <div style="text-align:center;margin:36px 0;">
      <a href="${confirmationLink}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;box-shadow:0 10px 20px -5px rgba(59,130,246,0.4);">
        Confirmar de recibido
      </a>
      <p style="color:#64748b;font-size:13px;margin-top:14px;">Haz clic en el bot&oacute;n para confirmar la recepci&oacute;n de tus credenciales.</p>
    </div>
    ${alertBox({
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.25)',
      icon: icons.alertTriangle('#f59e0b'),
      text: '<strong>Importante:</strong> Por seguridad, cambia tu contrase&ntilde;a en tu primer inicio de sesi&oacute;n. Nunca compartas tus credenciales.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Tus credenciales de acceso',
    html: baseTemplate({ title: 'Cuenta creada exitosamente', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Cuenta desactivada
// ─────────────────────────────────────────────────────────────────────────────
async function sendAccountDeactivatedEmail({ to, name, username, adminName }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, tu acceso a <strong>Command Vault</strong> ha sido <strong style="color:#f87171;">desactivado</strong>.
    </p>
    ${infoTable(`
      ${textRow('Usuario', `@${username}`)}
      ${textRow('Estado', '<span style="color:#f87171;">Inactivo</span>')}
      ${textRow('Acci&oacute;n realizada por', adminName || 'Administrador')}
      ${textRow('Fecha', new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))}
    `)}
    ${alertBox({
      color: '#f87171',
      bgColor: 'rgba(239,68,68,0.08)',
      borderColor: 'rgba(239,68,68,0.25)',
      icon: icons.shieldAlert('#f87171'),
      text: 'No podr&aacute;s iniciar sesi&oacute;n hasta que un administrador reactive tu cuenta. Si crees que esto es un error, comm&uacute;nicate con el administrador.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Tu cuenta ha sido desactivada',
    html: baseTemplate({ title: 'Acceso desactivado', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Cuenta reactivada
// ─────────────────────────────────────────────────────────────────────────────
async function sendAccountActivatedEmail({ to, name, username, adminName }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, tu acceso a <strong>Command Vault</strong> ha sido <strong style="color:#4ade80;">reactivado</strong>. Ya puedes iniciar sesi&oacute;n nuevamente.
    </p>
    ${infoTable(`
      ${textRow('Usuario', `@${username}`)}
      ${textRow('Estado', '<span style="color:#4ade80;">Activo</span>')}
      ${textRow('Activado por', adminName || 'Administrador')}
      ${textRow('Fecha', new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))}
    `)}
    ${alertBox({
      color: '#4ade80',
      bgColor: 'rgba(74,222,128,0.08)',
      borderColor: 'rgba(74,222,128,0.25)',
      icon: icons.checkCircle('#4ade80'),
      text: 'Tu cuenta est&aacute; activa. Ingresa al sistema usando tus credenciales habituales.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Tu cuenta ha sido reactivada',
    html: baseTemplate({ title: 'Acceso reactivado', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Cuenta eliminada
// ─────────────────────────────────────────────────────────────────────────────
async function sendAccountDeletedEmail({ to, name, username, adminName }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, tu cuenta en <strong>Command Vault</strong> ha sido <strong style="color:#f87171;">eliminada permanentemente</strong>.
    </p>
    ${infoTable(`
      ${textRow('Usuario eliminado', `@${username}`)}
      ${textRow('Eliminado por', adminName || 'Administrador')}
      ${textRow('Fecha', new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))}
    `)}
    ${alertBox({
      color: '#f87171',
      bgColor: 'rgba(239,68,68,0.08)',
      borderColor: 'rgba(239,68,68,0.25)',
      icon: icons.trash('#f87171'),
      text: 'Esta acci&oacute;n es irreversible. Todos los datos asociados a tu cuenta han sido eliminados del sistema.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Cuenta eliminada del sistema',
    html: baseTemplate({ title: 'Cuenta eliminada del sistema', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Confirmación de cambio de contraseña
// ─────────────────────────────────────────────────────────────────────────────
async function sendPasswordChangedEmail({ to, name, username, changedByAdmin, adminName }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, la contrase&ntilde;a de tu cuenta en <strong>Command Vault</strong> ha sido <strong>actualizada</strong>.
    </p>
    ${infoTable(`
      ${textRow('Usuario', `@${username}`)}
      ${textRow('Cambiado por', changedByAdmin ? (adminName || 'Administrador') : 'T&uacute; mismo')}
      ${textRow('Fecha', new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))}
    `)}
    ${alertBox({
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.25)',
      icon: icons.lock('#f59e0b'),
      text: '<strong>&iquest;No fuiste t&uacute;?</strong> Contacta de inmediato al administrador del sistema. Tu cuenta puede estar comprometida.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Contrase&ntilde;a actualizada',
    html: baseTemplate({ title: 'Contraseña actualizada', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Alerta de inicio de sesión sospechoso / cuenta bloqueada
// ─────────────────────────────────────────────────────────────────────────────
async function sendLoginAlertEmail({ to, name, username, ip }) {
  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Hola <strong style="color:#ffffff;">${name}</strong>, detectamos m&uacute;ltiples intentos fallidos de inicio de sesi&oacute;n en tu cuenta.
    </p>
    ${infoTable(`
      ${textRow('Usuario', `@${username}`)}
      ${textRow('IP de origen', ip || 'Desconocida')}
      ${textRow('Fecha', new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))}
    `)}
    ${alertBox({
      color: '#f87171',
      bgColor: 'rgba(239,68,68,0.08)',
      borderColor: 'rgba(239,68,68,0.25)',
      icon: icons.shieldAlert('#f87171'),
      text: '<strong>Acci&oacute;n recomendada:</strong> Si no reconoces esta actividad, cambia tu contrase&ntilde;a inmediatamente y contacta al administrador.'
    })}`;

  return sendEmail({
    to,
    subject: 'Command Vault — Alerta de seguridad: intentos de acceso fallidos',
    html: baseTemplate({ title: 'Alerta de seguridad detectada', content })
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL: Notificación al administrador
// ─────────────────────────────────────────────────────────────────────────────
async function sendAdminNotificationEmail({ title, message, details = {} }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return null;

  const detailsRows = Object.entries(details)
    .map(([key, value]) => textRow(key, value))
    .join('');

  const content = `
    <p style="color:#cbd5e1;font-size:16px;line-height:1.7;margin:0 0 24px;">
      ${message}
    </p>
    ${Object.keys(details).length > 0 ? infoTable(detailsRows) : ''}
    ${alertBox({
      color: '#3b82f6',
      bgColor: 'rgba(59,130,246,0.08)',
      borderColor: 'rgba(59,130,246,0.25)',
      icon: icons.userCheck('#3b82f6'),
      text: 'Este es un mensaje autom&aacute;tico generado por el sistema Command Vault.'
    })}`;

  return sendEmail({
    to: adminEmail,
    subject: `Command Vault Admin — ${title}`,
    html: baseTemplate({ title, content })
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAccountDeactivatedEmail,
  sendAccountActivatedEmail,
  sendAccountDeletedEmail,
  sendPasswordChangedEmail,
  sendLoginAlertEmail,
  sendAdminNotificationEmail
};
