import { body, validationResult } from 'express-validator'

export const validateEmail = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address')

export const validatePassword = body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array()
        })
    }
    next()
}

export const validateRegistration = [
    validateEmail,
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required'),
    validatePassword,
    body('role')
        .isIn(['farmer', 'client', 'admin'])
        .withMessage('Invalid role'),
    handleValidationErrors
]

export const validateLogin = [
    validateEmail,
    validatePassword,
    handleValidationErrors
]
