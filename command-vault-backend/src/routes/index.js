const express = require('express');
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

// Notifications
const notificationController = require('../controllers/notificationController');
router.get('/notifications', notificationController.getAll);
router.put('/notifications/read', notificationController.markAsRead);

// Devices (Almacén de Laptops/PCs)
const deviceController = require('../controllers/deviceController');
router.get('/devices', deviceController.getAll);
router.get('/devices/:id', deviceController.getOne);
router.post('/devices', deviceController.create);
router.put('/devices/:id', deviceController.update);
router.delete('/devices/:id', deviceController.delete);

module.exports = router;