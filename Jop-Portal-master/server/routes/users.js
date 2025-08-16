const express = require('express');
const { getMe, updateProfile } = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/me
router.get('/me', getMe);

// PUT /api/users/update
router.put('/update', updateProfile);

// Message/chat routes
router.post('/messages', authMiddleware, messageController.sendMessage);
router.get('/messages/:userId', authMiddleware, messageController.getMessages);
router.post('/messages/:userId/read', authMiddleware, messageController.markAsRead);
router.delete('/messages/:id', messageController.deleteMessage);
router.get('/:id', authMiddleware, messageController.getUserById ? messageController.getUserById : require('../controllers/userController').getUserById);

module.exports = router; 