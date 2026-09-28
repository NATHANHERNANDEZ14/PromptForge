const userService = require('../services/userService');
const Notification = require('../models/Notification'); // Ensure we import model directly for fast injection

class UserController {
  async login(req, res) {
    const { username, password } = req.body;
    const user = await userService.login(username, password);
    
    if(user) {
      if(!user.active) {
        // Log notification to DB
        await Notification.create({
          message: `Intento de acceso bloqueado: El usuario "${username}" (${user.name}) intentó ingresar pero su cuenta está desactivada.`,
          type: 'alert',
          metadata: { username, userId: user._id }
        });
        return res.status(403).json({ error: 'La cuenta está desactivada. Comunicarse con su administrador.' });
      }
      return res.json(user); // Normally return JWT here, but returning user for MVP
    }
    
    // Check if user exists but wrong password
    const userExists = await require('../models/User').findOne({ username });
    if (userExists) {
      return res.status(401).json({ error: 'Error de contraseña. Verifica tus credenciales.' });
    }
    
    return res.status(401).json({ error: 'El usuario no está registrado en el sistema.' });
  }
  async getAll(req, res) { res.json(await userService.getAllUsers()); }
  async create(req, res) { res.json(await userService.createUser(req.body)); }
  async update(req, res) { res.json(await userService.updateUser(req.params.id, req.body)); }
  async delete(req, res) { res.json(await userService.deleteUser(req.params.id)); }
}
module.exports = new UserController();