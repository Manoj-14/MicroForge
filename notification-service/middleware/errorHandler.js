const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);
    
    // Default error response
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        error.statusCode = 400;
        error.message = 'Validation Error';
        error.details = Object.values(err.errors).map(val => val.message);
    } else if (err.name === 'CastError') {
        error.statusCode = 400;
        error.message = 'Invalid ID format';
    } else if (err.code === 11000) {
        error.statusCode = 400;
        error.message = 'Duplicate field value';
    } else if (err.name === 'JsonWebTokenError') {
        error.statusCode = 401;
        error.message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        error.statusCode = 401;
        error.message = 'Token expired';
    }
    
    // Set status code
    const statusCode = err.statusCode || error.statusCode || 500;
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        delete error.stack;
        if (statusCode === 500) {
            error.message = 'Something went wrong';
        }
    } else {
        error.stack = err.stack;
    }
    
    res.status(statusCode).json(error);
};

module.exports = errorHandler;