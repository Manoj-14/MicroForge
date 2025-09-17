const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { validateNotification, validateEmail } = require('../middleware/validation');

// Get notification history (for frontend panel) - THIS WAS MISSING
router.get('/', notificationController.getNotificationHistory);

// Mark notification as read - ADD THIS TOO
router.put('/:id/read', notificationController.markNotificationAsRead);

// Send generic notification
router.post('/send', validateNotification, notificationController.sendNotification);

// Send email notification
router.post('/email', validateEmail, notificationController.sendEmailNotification);

// User registration notification (webhook from login service)
router.post('/user-registration', notificationController.handleUserRegistration);

// User login notification (webhook from login service)  
router.post('/user-login', notificationController.handleUserLogin);

// Batch notifications
router.post('/batch', notificationController.sendBatchNotifications);

// Get notification status
router.get('/status/:notificationId', notificationController.getNotificationStatus);

module.exports = router;
