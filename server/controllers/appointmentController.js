const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Availability = require('../models/Availability');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const Waitlist = require('../models/Waitlist');
const { getAvailableSlots } = require('../services/slotService');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../utils/auditLogger');
const { startOfDay, endOfDay, addMinutes } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, consultationType, date, slotTime, symptoms, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    if (doctor.verificationStatus !== 'VERIFIED') {
      return res.status(400).json({ success: false, message: 'Doctor is not verified yet.' });
    }

    const availability = await Availability.findOne({ doctorId });
    if (!availability) {
      return res.status(400).json({ success: false, message: 'Doctor availability not configured.' });
    }

    // Re-validate slot is available
    const availableSlots = await getAvailableSlots(availability, doctorId, date, consultationType);
    if (!availableSlots.includes(slotTime)) {
      return res.status(409).json({ success: false, message: 'This slot is no longer available.' });
    }

    const appointmentDate = new Date(date);
    const [h, m] = slotTime.split(':').map(Number);
    appointmentDate.setHours(0, 0, 0, 0);

    const [endH, endM] = slotTime.split(':').map(Number);
    const slotEnd = addMinutes(new Date(2000, 0, 1, endH, endM), availability.consultationDuration);
    const slotEndStr = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;

    const fee = consultationType === 'ONLINE' ? doctor.consultationFeeOnline : doctor.consultationFeeInPerson;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor._id,
      doctorUserId: doctor.userId,
      consultationType,
      date: appointmentDate,
      slotTime,
      slotEnd: slotEndStr,
      status: 'PENDING',
      symptoms,
      notes,
      paymentStatus: fee > 0 ? 'PENDING' : 'PAID',
      videoRoomId: consultationType === 'ONLINE' ? uuidv4() : undefined,
    });

    await createAuditLog({
      userId: req.user._id, userRole: req.user.role, action: 'RECORD_CREATE',
      resource: 'Appointment', resourceId: appointment._id,
      description: `Appointment booked with doctor ${doctor._id}`, ipAddress: req.ip,
    });

    await createNotification({
      userId: doctor.userId, type: 'APPOINTMENT_CONFIRMED',
      title: 'New Appointment Request',
      message: `You have a new appointment request for ${date} at ${slotTime}.`,
      link: `/doctor/appointments/${appointment._id}`,
      relatedId: appointment._id, relatedModel: 'Appointment',
    });

    return res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This slot was just booked. Please choose another.' });
    }
    next(err);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, role } = req.query;
    const isDoctor = req.user.role === 'DOCTOR';

    let filter = {};
    if (isDoctor) {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      filter.doctorId = doctor._id;
    } else {
      filter.patientId = req.user._id;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email avatar phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name avatar' } })
      .populate('paymentId', 'amount status')
      .sort({ date: -1, slotTime: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Appointment.countDocuments(filter);

    return res.json({ success: true, data: appointments, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email avatar phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name avatar' } })
      .populate('consultationId')
      .populate('paymentId', 'amount status currency')
      .lean();

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Resource-level authorization: only the patient or the treating doctor can view
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.userId._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'PLATFORM_ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await createAuditLog({ userId: req.user._id, userRole: req.user.role, action: 'RECORD_ACCESS', resource: 'Appointment', resourceId: appointment._id, description: 'Appointment viewed', ipAddress: req.ip });

    return res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const isDoctor = req.user.role === 'DOCTOR';
    const isPatient = appointment.patientId.toString() === req.user._id.toString();

    // Validate allowed transitions
    const doctorAllowed = ['CONFIRMED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
    const patientAllowed = ['CANCELLED'];

    if (isDoctor && !doctorAllowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Doctor cannot set status: ${status}` });
    }
    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (isPatient && !patientAllowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Patient cannot set status: ${status}` });
    }

    appointment.status = status;
    if (reason) appointment.cancellationReason = reason;
    if (status === 'CANCELLED' || status === 'REJECTED') appointment.cancelledBy = req.user._id;
    await appointment.save();

    // Notify the other party
    if (status === 'CONFIRMED') {
      await createNotification({ userId: appointment.patientId, type: 'APPOINTMENT_CONFIRMED', title: 'Appointment Confirmed', message: 'Your appointment has been confirmed by the doctor.', link: `/patient/appointments/${appointment._id}`, relatedId: appointment._id });
    }
    if (status === 'CANCELLED' || status === 'REJECTED') {
      const notifyUserId = isDoctor ? appointment.patientId : appointment.doctorUserId;
      await createNotification({ userId: notifyUserId, type: 'APPOINTMENT_CANCELLED', title: 'Appointment Cancelled', message: reason || 'Your appointment has been cancelled.', link: `/patient/appointments/${appointment._id}`, relatedId: appointment._id });

      // Trigger waitlist processing
      await processWaitlist(appointment);
    }

    return res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

const requestReschedule = async (req, res, next) => {
  try {
    const { newDate, newSlotTime, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule in current status.' });
    }

    appointment.status = 'RESCHEDULE_REQUESTED';
    appointment.rescheduleRequest = {
      requestedBy: req.user._id,
      newDate: new Date(newDate),
      newSlotTime,
      reason,
      requestedAt: new Date(),
    };
    await appointment.save();

    const notifyId = appointment.patientId.toString() === req.user._id.toString() ? appointment.doctorUserId : appointment.patientId;
    await createNotification({ userId: notifyId, type: 'APPOINTMENT_RESCHEDULED', title: 'Reschedule Request', message: `A reschedule has been requested for ${newDate} at ${newSlotTime}.`, link: `/doctor/appointments/${appointment._id}`, relatedId: appointment._id });

    return res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

const joinWaitlist = async (req, res, next) => {
  try {
    const { doctorId, date, slotTime, consultationType } = req.body;

    let waitlist = await Waitlist.findOne({ doctorId, date: new Date(date), slotTime });
    if (!waitlist) {
      waitlist = new Waitlist({ doctorId, date: new Date(date), slotTime, consultationType, entries: [] });
    }

    const alreadyJoined = waitlist.entries.some((e) => e.patientId.toString() === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(409).json({ success: false, message: 'Already on waitlist for this slot.' });
    }

    waitlist.entries.push({ patientId: req.user._id });
    await waitlist.save();

    return res.json({ success: true, message: 'Added to waitlist successfully.', position: waitlist.entries.length });
  } catch (err) {
    next(err);
  }
};

const processWaitlist = async (cancelledAppointment) => {
  try {
    const waitlist = await Waitlist.findOne({
      doctorId: cancelledAppointment.doctorId,
      date: cancelledAppointment.date,
      slotTime: cancelledAppointment.slotTime,
    });
    if (!waitlist) return;

    const nextEntry = waitlist.entries.find((e) => e.status === 'WAITING');
    if (!nextEntry) return;

    const offerExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min to accept
    nextEntry.status = 'NOTIFIED';
    nextEntry.notifiedAt = new Date();
    nextEntry.offerExpiresAt = offerExpiry;
    await waitlist.save();

    await createNotification({
      userId: nextEntry.patientId,
      type: 'WAITLIST_SLOT',
      title: 'Slot Available!',
      message: `A slot is now available for your waitlisted appointment. Book before ${offerExpiry.toLocaleTimeString()}.`,
      link: `/patient/doctors/${cancelledAppointment.doctorId}`,
      relatedId: waitlist._id,
      metadata: { offerExpiresAt: offerExpiry },
    });
  } catch (err) {
    console.error('Waitlist processing error:', err.message);
  }
};

const payAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (appointment.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Appointment fee is already paid.' });
    }

    const fee = appointment.consultationType === 'ONLINE'
      ? (appointment.doctorId?.consultationFeeOnline || 0)
      : (appointment.doctorId?.consultationFeeInPerson || 0);

    const payment = await Payment.create({
      userId: req.user._id,
      serviceType: 'APPOINTMENT',
      serviceId: appointment._id,
      amount: fee,
      currency: 'INR',
      status: 'SUCCESS',
      gateway: 'RAZORPAY_SANDBOX',
      gatewayPaymentId: 'pay_' + uuidv4().replace(/-/g, '').substring(0, 14),
      description: `Consultation fee for ${appointment.consultationType} appointment on ${appointment.slotTime}`,
    });

    appointment.paymentStatus = 'PAID';
    appointment.paymentId = payment._id;
    appointment.status = 'CONFIRMED';
    await appointment.save();

    await createNotification({
      userId: appointment.doctorUserId,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Payment Received',
      message: `Consultation fee of ₹${fee} received for appointment on ${appointment.slotTime}.`,
      link: `/doctor/appointments/${appointment._id}`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });

    return res.json({
      success: true,
      message: 'Payment completed successfully!',
      data: { appointment, payment },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  requestReschedule,
  joinWaitlist,
  payAppointment,
};
