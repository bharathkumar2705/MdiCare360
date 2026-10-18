const { body } = require('express-validator');

const registerPatientRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
  body('phone').optional({ values: 'falsy' }).trim(),
];

const registerDoctorRules = [
  ...registerPatientRules,
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').optional({ values: 'falsy' }).toInt(),
  body('registrationNumber').optional({ values: 'falsy' }).trim(),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordRules = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
];

module.exports = { registerPatientRules, registerDoctorRules, loginRules, forgotPasswordRules, resetPasswordRules };
