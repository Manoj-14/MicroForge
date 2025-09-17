const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
        })
    ),
    defaultMeta: { service: 'notification-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
    }));
    
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log'
    }));
}

module.exports = logger;