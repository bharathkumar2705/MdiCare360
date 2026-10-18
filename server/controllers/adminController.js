const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../utils/auditLogger');
const { createNotification } = require('../services/notificationService');

const Payment = require('../models/Payment');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingVerifications,
      totalOrgs,
      recentUsers,
      appointmentsByStatus,
      rawMonthlyAppointments,
      usersByRole,
      orgsByType,
      consultationTypes,
      paymentStats,
      recentAppointments,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments({ verificationStatus: 'PENDING' }),
      Organization.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(6).select('name email role createdAt avatar isActive phone'),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Appointment.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Organization.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $group: { _id: '$consultationType', count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patientId', 'name email phone avatar')
        .populate('doctorUserId', 'name email')
        .populate('doctorId', 'specialization consultationFee'),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('userId', 'name role email'),
    ]);

    // Ensure a rich multi-month curve for the chart so it never renders as a single isolated block
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const monthlyMap = {};
    rawMonthlyAppointments.forEach((m) => {
      monthlyMap[`${m._id.year}-${m._id.month}`] = m.count;
    });

    const monthlyAppointments = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${m}`;
      monthlyAppointments.push({
        _id: { year: y, month: m },
        monthName: monthNames[m - 1],
        year: y,
        label: `${monthNames[m - 1]} ${y}`,
        count: monthlyMap[key] || 0,
      });
    }

    const totalRevenue = paymentStats[0]?.totalAmount || 0;
    const totalTransactions = paymentStats[0]?.count || 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        pendingVerifications,
        totalOrgs,
        appointmentsByStatus,
        monthlyAppointments,
        recentUsers,
        usersByRole,
        orgsByType,
        consultationTypes,
        totalRevenue,
        totalTransactions,
        recentAppointments,
        recentAuditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password -refreshTokens'),
      User.countDocuments(filter),
    ]);

    return res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: { $in: ['PENDING', 'UNDER_REVIEW'] } })
      .populate('userId', 'name email avatar createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

const verifyDoctor = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    doctor.verificationStatus = status;
    doctor.verificationNote = note;
    if (status === 'VERIFIED') {
      doctor.verifiedAt = new Date();
      doctor.verifiedBy = req.user._id;
    }
    await doctor.save();

    await createAuditLog({ userId: req.user._id, userRole: req.user.role, action: 'DOCTOR_VERIFY', resource: 'Doctor', resourceId: doctor._id, description: `Doctor verification status set to ${status}`, ipAddress: req.ip });

    await createNotification({
      userId: doctor.userId._id,
      type: 'DOCTOR_VERIFIED',
      title: status === 'VERIFIED' ? 'Profile Verified!' : `Verification ${status}`,
      message: status === 'VERIFIED'
        ? 'Congratulations! Your profile has been verified. You can now receive appointments.'
        : `Your verification was ${status.toLowerCase()}. ${note || ''}`,
      link: '/doctor/verification',
    });

    return res.json({ success: true, data: doctor, message: `Doctor ${status.toLowerCase()} successfully.` });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('userId', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    await createAuditLog({ userId: req.user._id, userRole: req.user.role, action: 'ADMIN_ACTION', resource: 'User', resourceId: user._id, description: `User ${user.isActive ? 'activated' : 'deactivated'}`, ipAddress: req.ip });
    return res.json({ success: true, data: { isActive: user.isActive } });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization, experience } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      isEmailVerified: true,
      isActive: true,
    });

    if (role === 'DOCTOR') {
      await Doctor.create({
        userId: user._id,
        specialization: specialization || 'General Medicine',
        experience: Number(experience) || 5,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
      });
    } else if (role === 'PATIENT') {
      const Patient = require('../models/Patient');
      await Patient.create({ userId: user._id });
    }

    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ADMIN_CREATE',
      resource: 'User',
      resourceId: user._id,
      description: `User ${email} created with role ${role} by admin`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, data: user, message: 'User created successfully.' });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ADMIN_UPDATE',
      resource: 'User',
      resourceId: user._id,
      description: `User ${user.email} updated by admin`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, data: user, message: 'User updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active admin account.' });
    }

    if (user.role === 'DOCTOR') {
      await Doctor.deleteOne({ userId: user._id });
    } else if (user.role === 'PATIENT') {
      const Patient = require('../models/Patient');
      await Patient.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(user._id);

    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ADMIN_DELETE',
      resource: 'User',
      resourceId: user._id,
      description: `User ${user.email} deleted by admin`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    await Doctor.findByIdAndDelete(doctor._id);
    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ADMIN_DELETE',
      resource: 'Doctor',
      resourceId: doctor._id,
      description: 'Doctor record removed by admin',
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Doctor profile removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getPendingDoctors,
  verifyDoctor,
  getAuditLogs,
  toggleUserActive,
  createUser,
  updateUser,
  deleteUser,
  deleteDoctor,
};
