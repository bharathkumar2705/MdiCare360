const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Consent = require('../models/Consent');
const { createAuditLog } = require('../utils/auditLogger');
const { createNotification } = require('../services/notificationService');

const createPrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    const { patientId, consultationId, appointmentId, medicines, diagnosis, notes, followUpDate } = req.body;

    if (appointmentId) {
      const appt = await Appointment.findById(appointmentId);
      if (!appt || appt.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this appointment.' });
      }
    }

    const prescription = await Prescription.create({
      patientId, doctorId: doctor._id, consultationId, appointmentId, medicines, diagnosis, notes, followUpDate,
    });

    await createAuditLog({ userId: req.user._id, userRole: req.user.role, action: 'PRESCRIPTION_CREATE', resource: 'Prescription', resourceId: prescription._id, description: `Prescription created for patient ${patientId}`, ipAddress: req.ip });

    await createNotification({ userId: patientId, type: 'PRESCRIPTION_AVAILABLE', title: 'New Prescription', message: 'A new prescription has been created for you.', link: `/patient/prescriptions/${prescription._id}`, relatedId: prescription._id });

    return res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

const getPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter = {};
    if (req.user.role === 'PATIENT') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
      filter.doctorId = doctor._id;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'name avatar')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Prescription.countDocuments(filter);

    return res.json({ success: true, data: prescriptions, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name avatar email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name avatar' } })
      .lean();

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });

    const isOwner = prescription.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';
    const isPharmacy = req.user.role === 'PHARMACY';

    if (!isOwner && !isDoctor && !isPharmacy && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await createAuditLog({ userId: req.user._id, userRole: req.user.role, action: 'PRESCRIPTION_VIEW', resource: 'Prescription', resourceId: prescription._id, description: 'Prescription viewed', ipAddress: req.ip });

    return res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPrescription, getPrescriptions, getPrescriptionById };
