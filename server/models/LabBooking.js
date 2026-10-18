const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' }],
    collectionType: { type: String, enum: ['HOME', 'LAB_VISIT'], default: 'LAB_VISIT' },
    collectionAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true }, // "HH:MM"
    status: {
      type: String,
      enum: [
        'BOOKED',
        'COLLECTION_SCHEDULED',
        'SAMPLE_COLLECTED',
        'RECEIVED',
        'PROCESSING',
        'VERIFIED',
        'REPORT_RELEASED',
        'CANCELLED',
      ],
      default: 'BOOKED',
    },
    totalAmount: { type: Number },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabReport' },
  },
  { timestamps: true }
);

labBookingSchema.index({ patientId: 1, createdAt: -1 });
labBookingSchema.index({ labId: 1, scheduledDate: 1 });
labBookingSchema.index({ status: 1 });

module.exports = mongoose.model('LabBooking', labBookingSchema);
