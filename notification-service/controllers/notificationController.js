const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const Notification = require('../models/notification');

class NotificationController {
  
  async sendNotification(req, res, next) {
    try {
      const { type, recipient, subject, message, priority } = req.body;
      const notificationId = uuidv4();
      
      logger.info(`Processing notification ${notificationId} of type: ${type} for: ${recipient}`);
      
      let result;
      switch (type.toLowerCase()) {
        case 'email':
          result = await emailService.sendEmail({
            to: recipient,
            subject,
            message,
            notificationId
          });
          break;
          
        case 'sms':
          result = await this.sendSMS({
            to: recipient,
            message,
            notificationId
          });
          break;
          
        case 'push':
          result = await this.sendPushNotification({
            to: recipient,
            subject,
            message,
            notificationId
          });
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: `Unsupported notification type: ${type}`,
            supportedTypes: ['email', 'sms', 'push']
          });
      }
      
      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        notificationId,
        data: result
      });
      
    } catch (error) {
      logger.error(`Error sending notification: ${error.message}`);
      next(error);
    }
  }

  async sendEmailNotification(req, res, next) {
    try {
      const { recipient, subject, message, html } = req.body;
      const notificationId = uuidv4();
      
      logger.info(`Sending email notification ${notificationId} to: ${recipient}`);
      
      const result = await emailService.sendEmail({
        to: recipient,
        subject,
        message,
        html,
        notificationId
      });
      
      res.status(200).json({
        success: true,
        message: 'Email notification sent successfully',
        notificationId,
        data: result
      });
      
    } catch (error) {
      logger.error(`Error sending email notification: ${error.message}`);
      next(error);
    }
  }

  async sendBatchNotifications(req, res, next) {
    try {
      const { notifications } = req.body;
      const batchId = uuidv4();
      
      logger.info(`Processing batch notification ${batchId} with ${notifications.length} notifications`);
      
      const results = await Promise.allSettled(
        notifications.map(async (notification, index) => {
          const notificationId = `${batchId}-${index}`;
          
          switch (notification.type.toLowerCase()) {
            case 'email':
              return await emailService.sendEmail({
                ...notification,
                notificationId
              });
            case 'sms':
              return await this.sendSMS({
                ...notification,
                notificationId
              });
            case 'push':
              return await this.sendPushNotification({
                ...notification,
                notificationId
              });
            default:
              throw new Error(`Unsupported notification type: ${notification.type}`);
          }
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      res.status(200).json({
        success: true,
        message: 'Batch notification processed',
        batchId,
        summary: {
          total: notifications.length,
          successful,
          failed
        },
        results: results.map((result, index) => ({
          index,
          status: result.status,
          ...(result.status === 'rejected' && { error: result.reason.message })
        }))
      });
      
    } catch (error) {
      logger.error(`Error processing batch notifications: ${error.message}`);
      next(error);
    }
  }

  async getNotificationStatus(req, res, next) {
    try {
      const { notificationId } = req.params;
      
      const notification = await Notification.findByPk(notificationId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      res.json({
        success: true,
        data: notification
      });
      
    } catch (error) {
      logger.error(`Error getting notification status: ${error.message}`);
      next(error);
    }
  }

  async getNotificationHistory(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        order: [['timestamp', 'DESC']],
        limit: 50
      });
      
      res.json({
        success: true,
        data: notifications
      });
      
    } catch (error) {
      logger.error(`Error getting notifications: ${error.message}`);
      next(error);
    }
  }

  async markNotificationAsRead(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      notification.read = true;
      await notification.save();
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
      
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`);
      next(error);
    }
  }

  async handleUserRegistration(req, res, next) {
    try {
      const userData = req.body;
      
      // Create notification in database
      const notification = await Notification.create({
        type: 'success',
        title: 'User Registration',
        message: `New user ${userData.username} has registered successfully`,
        service: 'login-service'
      });
      
      // Send welcome email
      if (userData.email) {
        await emailService.sendEmail({
          to: userData.email,
          subject: 'Welcome to MicroForge',
          message: `Hello ${userData.firstName || userData.username},\n\nWelcome to our MicroForge! Your account has been successfully created.\n\nBest regards,\nThe Team`
        });
      }
      
      res.json({
        success: true,
        message: 'Registration notification processed',
        notificationId: notification.id
      });
      
    } catch (error) {
      logger.error(`Error processing registration notification: ${error.message}`);
      next(error);
    }
  }

  async handleUserLogin(req, res, next) {
    try {
      const userData = req.body;
      
      // Create notification in database
      const notification = await Notification.create({
        type: 'info',
        title: 'User Login',
        message: `User ${userData.username} logged in successfully`,
        service: 'auth-service'
      });
      
      res.json({
        success: true,
        message: 'Login notification processed',
        notificationId: notification.id
      });
      
    } catch (error) {
      logger.error(`Error processing login notification: ${error.message}`);
      next(error);
    }
  }

  // Helper methods for SMS and Push notifications
  async sendSMS({ to, message, notificationId }) {
    logger.info(`SMS notification ${notificationId} sent to ${to}: ${message}`);
    return {
      notificationId,
      status: 'SENT',
      provider: 'SIMULATED',
      timestamp: new Date().toISOString(),
      recipient: to,
      message: message.substring(0, 160)
    };
  }

  async sendPushNotification({ to, subject, message, notificationId }) {
    logger.info(`Push notification ${notificationId} sent to ${to}: ${subject}`);
    return {
      notificationId,
      status: 'SENT',
      provider: 'SIMULATED',
      timestamp: new Date().toISOString(),
      recipient: to,
      title: subject,
      body: message
    };
  }
}

module.exports = new NotificationController();
