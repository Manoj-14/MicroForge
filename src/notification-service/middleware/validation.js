const Joi = require('joi');

const notificationSchema = Joi.object({
    type: Joi.string().valid('email', 'sms', 'push').required(),
    recipient: Joi.string().required(),
    subject: Joi.string().when('type', {
        is: 'email',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    message: Joi.string().required().max(1000),
    priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
    html: Joi.string().optional()
});

const emailSchema = Joi.object({
    recipient: Joi.string().email().required(),
    subject: Joi.string().required().max(255),
    message: Joi.string().required().max(5000),
    html: Joi.string().optional()
});

const validateNotification = (req, res, next) => {
    const { error } = notificationSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    
    next();
};

const validateEmail = (req, res, next) => {
    const { error } = emailSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    
    next();
};

module.exports = {
    validateNotification,
    validateEmail
};