const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_REMINDER',
        'APPOINTMENT_CANCELLED',
        'APPOINTMENT_RESCHEDULED',
        'APPOINTMENT_REJECTED',
        'LAB_REPORT_READY',
        'PRESCRIPTION_AVAILABLE',
        'PAYMENT_CONFIRMED',
        'NEW_MESSAGE',
        'WAITLIST_SLOT',
        'DOCTOR_VERIFIED',
        'PHARMACY_STATUS',
        'CONSENT_REQUESTED',
        'GENERAL',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String, // Frontend route to navigate to
    isRead: { type: Boolean, default: false },
    readAt: Date,
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of related entity
    relatedModel: String,
    metadata: { type: mongoose.Schema.Types.Mixed },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
