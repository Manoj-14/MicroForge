const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const Notification = require('./models/notification');
require('dotenv').config();

const logger = require('./utils/logger');
const notificationRoutes = require('./routes/notifications');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Origin-Agent-Cluster', '?1'); // Enable origin-keying
    next();
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) }
}));

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('📊 Database connected successfully');
    
    // Create tables if they don't exist
    await sequelize.sync();
    console.log('📋 Database tables synchronized');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications', healthRoutes);
app.use('/actuator', healthRoutes); // Spring Boot compatibility

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

const PORT = process.env.NOTIFICATION_SERVICE_PORT;


initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Notification Service started on port ${PORT}`);
    logger.info(`📧 Email service configured: ${process.env.MAIL_HOST || 'Not configured'}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = app;