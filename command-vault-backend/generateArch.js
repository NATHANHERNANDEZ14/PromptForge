const fs = require('fs');
const path = require('path');

const makeDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

makeDir('src/repositories');
makeDir('src/services');
makeDir('src/controllers');
makeDir('src/routes');

// Repositories
const folderRepo = `const Folder = require('../models/Folder');
class FolderRepository {
  async findAll() { return await Folder.find(); }
  async findById(id) { return await Folder.findById(id); }
  async create(data) { return await Folder.create(data); }
  async update(id, data) { return await Folder.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Folder.findByIdAndDelete(id); }
}
module.exports = new FolderRepository();`;

const commandRepo = `const Command = require('../models/Command');
class CommandRepository {
  async findAll() { return await Command.find(); }
  async findByFolderId(folderId) { return await Command.find({ folderId }); }
  async create(data) { return await Command.create(data); }
  async update(id, data) { return await Command.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Command.findByIdAndDelete(id); }
  async deleteByFolderId(folderId) { return await Command.deleteMany({ folderId }); }
}
module.exports = new CommandRepository();`;

const userRepo = `const User = require('../models/User');
class UserRepository {
  async findAll() { return await User.find(); }
  async findById(id) { return await User.findById(id); }
  async findByUsername(username) { return await User.findOne({ username }); }
  async create(data) { return await User.create(data); }
  async update(id, data) { return await User.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await User.findByIdAndDelete(id); }
}
module.exports = new UserRepository();`;

fs.writeFileSync('src/repositories/folderRepository.js', folderRepo);
fs.writeFileSync('src/repositories/commandRepository.js', commandRepo);
fs.writeFileSync('src/repositories/userRepository.js', userRepo);

// Services
const folderService = `const folderRepo = require('../repositories/folderRepository');
const commandRepo = require('../repositories/commandRepository');
class FolderService {
  async getAllFolders() { return await folderRepo.findAll(); }
  async getFolderById(id) { return await folderRepo.findById(id); }
  async createFolder(data) { return await folderRepo.create(data); }
  async updateFolder(id, data) { return await folderRepo.update(id, data); }
  async deleteFolder(id) { 
    await commandRepo.deleteByFolderId(id);
    return await folderRepo.delete(id); 
  }
}
module.exports = new FolderService();`;

const commandService = `const commandRepo = require('../repositories/commandRepository');
class CommandService {
  async getAllCommands() { return await commandRepo.findAll(); }
  async getCommandsByFolderId(folderId) { return await commandRepo.findByFolderId(folderId); }
  async saveFolderCommands(folderId, commands) {
    await commandRepo.deleteByFolderId(folderId);
    const newCommands = commands.map(c => ({ ...c, folderId }));
    return await Promise.all(newCommands.map(c => commandRepo.create(c)));
  }
}
module.exports = new CommandService();`;

const userService = `const userRepo = require('../repositories/userRepository');
class UserService {
  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if(user && user.password === password) return user;
    return null;
  }
  async getAllUsers() { return await userRepo.findAll(); }
  async createUser(data) { return await userRepo.create(data); }
  async updateUser(id, data) { return await userRepo.update(id, data); }
  async deleteUser(id) { return await userRepo.delete(id); }
}
module.exports = new UserService();`;

fs.writeFileSync('src/services/folderService.js', folderService);
fs.writeFileSync('src/services/commandService.js', commandService);
fs.writeFileSync('src/services/userService.js', userService);

// Controllers
const folderController = `const folderService = require('../services/folderService');
class FolderController {
  async getAll(req, res) { res.json(await folderService.getAllFolders()); }
  async getOne(req, res) { res.json(await folderService.getFolderById(req.params.id)); }
  async create(req, res) { res.json(await folderService.createFolder(req.body)); }
  async update(req, res) { res.json(await folderService.updateFolder(req.params.id, req.body)); }
  async delete(req, res) { res.json(await folderService.deleteFolder(req.params.id)); }
}
module.exports = new FolderController();`;

const commandController = `const commandService = require('../services/commandService');
class CommandController {
  async getAll(req, res) { res.json(await commandService.getAllCommands()); }
  async getByFolder(req, res) { res.json(await commandService.getCommandsByFolderId(req.params.folderId)); }
  async saveForFolder(req, res) { res.json(await commandService.saveFolderCommands(req.params.folderId, req.body.commands)); }
}
module.exports = new CommandController();`;

const userController = `const userService = require('../services/userService');
class UserController {
  async login(req, res) {
    const user = await userService.login(req.body.username, req.body.password);
    if(user) {
      if(!user.active) return res.status(403).json({ error: 'User disabled' });
      return res.json(user);
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  async getAll(req, res) { res.json(await userService.getAllUsers()); }
  async create(req, res) { res.json(await userService.createUser(req.body)); }
  async update(req, res) { res.json(await userService.updateUser(req.params.id, req.body)); }
  async delete(req, res) { res.json(await userService.deleteUser(req.params.id)); }
}
module.exports = new UserController();`;

fs.writeFileSync('src/controllers/folderController.js', folderController);
fs.writeFileSync('src/controllers/commandController.js', commandController);
fs.writeFileSync('src/controllers/userController.js', userController);

// Routes
const routesIndex = `const express = require('express');
const router = express.Router();

const folderController = require('../controllers/folderController');
const commandController = require('../controllers/commandController');
const userController = require('../controllers/userController');

// Folders
router.get('/folders', folderController.getAll);
router.post('/folders', folderController.create);
router.put('/folders/:id', folderController.update);
router.delete('/folders/:id', folderController.delete);

// Commands
router.get('/commands', commandController.getAll);
router.get('/folders/:folderId/commands', commandController.getByFolder);
router.post('/folders/:folderId/commands', commandController.saveForFolder);

// Users
router.post('/auth/login', userController.login);
router.get('/users', userController.getAll);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

module.exports = router;`;

fs.writeFileSync('src/routes/index.js', routesIndex);

// Server setup
const serverJs = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

fs.writeFileSync('server.js', serverJs);
fs.writeFileSync('.env', 'MONGO_URI=mongodb://localhost:27017/command-vault\nPORT=3000');

console.log('Architecture generated.');
