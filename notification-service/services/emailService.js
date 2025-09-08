const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }
    
    initializeTransporter() {
        try {
            if (!process.env.MAIL_HOST) {
                logger.warn('Email not configured - MAIL_HOST not set');
                return;
            }
            
            this.transporter = nodemailer.createTransporter({
                host: process.env.MAIL_HOST,
                port: parseInt(process.env.MAIL_PORT) || 587,
                secure: process.env.MAIL_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                }
            });
            
            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    logger.error(`Email transporter verification failed: ${error.message}`);
                } else {
                    logger.info('📧 Email service ready');
                }
            });
            
        } catch (error) {
            logger.error(`Failed to initialize email transporter: ${error.message}`);
        }
    }
    
    async sendEmail({ to, subject, message, html, notificationId }) {
        if (!this.transporter) {
            logger.info(`Email not configured, simulating send to ${to}: ${subject}`);
            return {
                notificationId,
                status: 'SIMULATED',
                message: 'Email service not configured, email was simulated',
                timestamp: new Date().toISOString()
            };
        }
        
        try {
            const mailOptions = {
                from: process.env.MAIL_FROM || `"${process.env.MAIL_FROM_NAME || 'Microservices App'}" <${process.env.MAIL_USERNAME}>`,
                to,
                subject,
                text: message,
                ...(html && { html })
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            
            logger.info(`Email sent successfully to ${to} - MessageId: ${info.messageId}`);
            
            return {
                notificationId,
                status: 'SENT',
                messageId: info.messageId,
                timestamp: new Date().toISOString(),
                recipient: to,
                subject
            };
            
        } catch (error) {
            logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }
    
    async sendTemplate({ to, template, data, notificationId }) {
        // Template-based email sending
        // In a real implementation, you'd use a template engine
        let subject, message;
        
        switch (template) {
            case 'welcome':
                subject = 'Welcome to Microservices Demo!';
                message = `Hello ${data.name},\n\nWelcome to our application! Your account has been created successfully.\n\nBest regards,\nThe Team`;
                break;
                
            case 'password-reset':
                subject = 'Password Reset Request';
                message = `Hello ${data.name},\n\nYou requested a password reset. Click the link below:\n${data.resetLink}\n\nIf you didn't request this, please ignore this email.`;
                break;
                
            case 'notification':
                subject = data.subject || 'Notification';
                message = data.message;
                break;
                
            default:
                throw new Error(`Unknown email template: ${template}`);
        }
        
        return await this.sendEmail({
            to,
            subject,
            message,
            notificationId
        });
    }
}

module.exports = new EmailService();