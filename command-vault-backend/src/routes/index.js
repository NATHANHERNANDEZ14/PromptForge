const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');


const folderController = require('../controllers/folderController');
const commandController = require('../controllers/commandController');
const userController = require('../controllers/userController');
const notificationController = require('../controllers/notificationController');
const deviceController = require('../controllers/deviceController');
const areaController = require('../controllers/areaController');
const employeeController = require('../controllers/employeeController');

// --- Auth Routes ---
router.post('/auth/login', validate('login'), userController.login);
router.get('/auth/me', authenticateToken, userController.me);


// --- Folders Routes ---
router.get('/folders', authenticateToken, folderController.getAll);
router.get('/folders/:id', authenticateToken, folderController.getOne);
router.post('/folders', authenticateToken, folderController.create);
router.post('/folders/:id/duplicate', authenticateToken, folderController.duplicate);
router.put('/folders/:id', authenticateToken, folderController.update);
router.delete('/folders/:id', authenticateToken, folderController.delete);

// --- Commands Routes ---
router.get('/commands', authenticateToken, commandController.getAll);
router.get('/folders/:folderId/commands', authenticateToken, commandController.getByFolder);
router.post('/folders/:folderId/commands', authenticateToken, commandController.saveForFolder);
router.post('/commands/:id/copy', authenticateToken, commandController.recordCopy);

// --- Users Management Routes ---
router.get('/users/confirm/:token', userController.confirmEmail);
router.get('/users', authenticateToken, requireAdmin, userController.getAll);
router.post('/users', authenticateToken, requireAdmin, validate('createUser'), userController.create);
router.put('/users/:id', authenticateToken, requireAdmin, validate('updateUser'), userController.update);
router.delete('/users/:id', authenticateToken, requireAdmin, userController.delete);


// --- Notifications Routes ---
router.get('/notifications', authenticateToken, requireAdmin, notificationController.getAll);
router.put('/notifications/read', authenticateToken, requireAdmin, notificationController.markAsRead);
router.delete('/notifications', authenticateToken, requireAdmin, notificationController.clearAll);

// --- Devices Routes ---
router.get('/devices', authenticateToken, deviceController.getAll);
router.get('/devices/:id', authenticateToken, deviceController.getOne);
router.post('/devices', authenticateToken, deviceController.create);
router.put('/devices/:id', authenticateToken, deviceController.update);
router.delete('/devices/:id', authenticateToken, deviceController.delete);

// --- Areas Routes ---
router.get('/areas', authenticateToken, areaController.getAll);
router.post('/areas', authenticateToken, areaController.create);

// --- Employees Routes ---
router.get('/employees', authenticateToken, employeeController.getAll);
router.get('/employees/:id', authenticateToken, employeeController.getOne);
router.post('/employees', authenticateToken, requireAdmin, employeeController.create);
router.put('/employees/:id', authenticateToken, requireAdmin, employeeController.update);
router.delete('/employees/:id', authenticateToken, requireAdmin, employeeController.delete);

module.exports = router;