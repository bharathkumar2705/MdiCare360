const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Availability = require('../models/Availability');
const { sendTokenResponse, generateSecureToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { createAuditLog } = require('../utils/auditLogger');
const crypto = require('crypto');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, specialization, experience, registrationNumber } = req.body;

    const allowedRoles = ['PATIENT', 'DOCTOR'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Invalid role for self-registration.' });
    }

    const userRole = role || 'PATIENT';

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const verificationToken = generateSecureToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      emailVerificationExpiry: verificationExpiry,
    });

    if (userRole === 'PATIENT') {
      await Patient.create({ userId: user._id });
    }

    if (userRole === 'DOCTOR') {
      const doctor = await Doctor.create({
        userId: user._id,
        specialization: specialization || 'General Practice',
        experience: experience || 0,
        registrationNumber,
      });
      await Availability.create({
        doctorId: doctor._id,
        workingHours: {
          MON: { enabled: true, start: '09:00', end: '17:00' },
          TUE: { enabled: true, start: '09:00', end: '17:00' },
          WED: { enabled: true, start: '09:00', end: '17:00' },
          THU: { enabled: true, start: '09:00', end: '17:00' },
          FRI: { enabled: true, start: '09:00', end: '17:00' },
          SAT: { enabled: false },
          SUN: { enabled: false },
        },
        onlineHours: {
          MON: { enabled: false },
          TUE: { enabled: false },
          WED: { enabled: false },
          THU: { enabled: false },
          FRI: { enabled: false },
          SAT: { enabled: false },
          SUN: { enabled: false },
        },
      });
    }

    const verifyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const emailData = emailTemplates.verifyEmail(name, verifyLink);
    const emailResult = await sendEmail({ to: email, ...emailData });

    await createAuditLog({ userId: user._id, userRole, action: 'REGISTER', resource: 'User', resourceId: user._id, description: 'New user registered', ipAddress: req.ip });

    return res.status(201).json({
      success: true,
      message: emailResult.success
        ? 'Registration successful! A verification link has been sent to your email.'
        : 'Registration successful! However, the email could not be delivered. Please verify your SMTP settings or request a resend.',
      emailSent: emailResult.success,
    });
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, a new verification link has been sent.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified. Please sign in.' });
    }

    const verificationToken = generateSecureToken();
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const emailData = emailTemplates.verifyEmail(user.name, verifyLink);
    const emailResult = await sendEmail({ to: email, ...emailData });

    return res.json({
      success: true,
      message: emailResult.success
        ? 'A new verification link has been sent to your email.'
        : 'Could not send verification email. Please ensure your SMTP server is configured.',
      emailSent: emailResult.success,
    });
  } catch (err) {
    next(err);
  }
};

const recentlyVerifiedTokens = new Set();

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token required.' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    // Idempotency: If this token was already verified recently, return success immediately
    if (recentlyVerifiedTokens.has(hashed)) {
      return res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    }

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Remember this verified token for 5 minutes
    recentlyVerifiedTokens.add(hashed);
    setTimeout(() => recentlyVerifiedTokens.delete(hashed), 5 * 60 * 1000);

    return res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      await createAuditLog({ action: 'LOGIN', description: `Failed login attempt for ${email}`, ipAddress: req.ip, outcome: 'FAILURE' });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first.', code: 'EMAIL_NOT_VERIFIED' });
    }

    user.lastLogin = new Date();
    const refreshToken = generateRefreshToken(user._id, user.role);
    if (!user.refreshTokens) user.refreshTokens = [];
    // Keep only last 5 refresh tokens (multi-device support)
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
    user.refreshTokens.push(refreshToken);
    await user.save();

    await createAuditLog({ userId: user._id, userRole: user.role, action: 'LOGIN', resource: 'User', resourceId: user._id, description: 'User logged in', ipAddress: req.ip, userAgent: req.get('User-Agent') });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);

    const accessToken = generateAccessToken(user._id, user.role);

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens?.includes(token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired.' });
    }
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== token);
        await user.save();
      }
    }

    await createAuditLog({ userId: req.user?._id, userRole: req.user?.role, action: 'LOGOUT', resource: 'User', resourceId: req.user?._id, description: 'User logged out', ipAddress: req.ip });

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond with the same message to prevent email enumeration
    const genericMsg = 'If that email is registered, a reset link has been sent.';

    if (!user) return res.json({ success: true, message: genericMsg });

    const resetToken = generateSecureToken();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailData = emailTemplates.resetPassword(user.name, resetLink);
    await sendEmail({ to: email, ...emailData });

    return res.json({
      success: true,
      message: genericMsg,
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) return res.status(400).json({ success: false, message: 'Token required.' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokens = [];
    await user.save();

    await createAuditLog({ userId: user._id, userRole: user.role, action: 'PASSWORD_CHANGE', resource: 'User', resourceId: user._id, description: 'Password reset via forgot-password flow', ipAddress: req.ip });

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    await createAuditLog({ userId: user._id, userRole: user.role, action: 'PASSWORD_CHANGE', resource: 'User', resourceId: user._id, description: 'Password changed by user', ipAddress: req.ip });

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

module.exports = { register, verifyEmail, resendVerification, login, refresh, logout, forgotPassword, resetPassword, changePassword, getMe };
