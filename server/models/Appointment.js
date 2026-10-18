const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    consultationType: { type: String, enum: ['ONLINE', 'IN_PERSON'], required: true },
    date: { type: Date, required: true },
    slotTime: { type: String, required: true }, // "HH:MM"
    slotEnd: { type: String }, // "HH:MM"
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'REJECTED',
        'RESCHEDULE_REQUESTED',
        'RESCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ],
      default: 'PENDING',
    },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rescheduleRequest: {
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      newDate: Date,
      newSlotTime: String,
      reason: String,
      requestedAt: Date,
    },
    symptoms: { type: String },
    notes: { type: String },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    reminderSent: { type: Boolean, default: false },
    videoRoomId: { type: String }, // WebRTC room ID for online consultations
  },
  { timestamps: true }
);

// Prevent double booking: unique index on doctorId + date + slotTime
appointmentSchema.index(
  { doctorId: 1, date: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['CANCELLED', 'REJECTED', 'NO_SHOW'] },
    },
  }
);
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
