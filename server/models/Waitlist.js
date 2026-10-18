const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    slotTime: { type: String, required: true },
    consultationType: { type: String, enum: ['ONLINE', 'IN_PERSON'] },
    entries: [
      {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['WAITING', 'NOTIFIED', 'BOOKED', 'EXPIRED'], default: 'WAITING' },
        notifiedAt: Date,
        offerExpiresAt: Date,
      },
    ],
  },
  { timestamps: true }
);

waitlistSchema.index({ doctorId: 1, date: 1, slotTime: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
