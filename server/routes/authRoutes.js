const express = require('express');
const router = express.Router();
const {
  register, verifyEmail, resendVerification, login, refresh, logout, forgotPassword, resetPassword, changePassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerPatientRules, registerDoctorRules, loginRules, forgotPasswordRules, resetPasswordRules,
} = require('../validators/authValidators');

router.post('/register', registerPatientRules, validate, register);
router.post('/register/doctor', registerDoctorRules, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.patch('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;
