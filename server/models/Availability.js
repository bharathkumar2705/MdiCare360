const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, unique: true },
    consultationDuration: { type: Number, default: 30 }, // minutes
    bufferTime: { type: Number, default: 5 }, // minutes between slots
    workingHours: {
      MON: { enabled: Boolean, start: String, end: String },
      TUE: { enabled: Boolean, start: String, end: String },
      WED: { enabled: Boolean, start: String, end: String },
      THU: { enabled: Boolean, start: String, end: String },
      FRI: { enabled: Boolean, start: String, end: String },
      SAT: { enabled: Boolean, start: String, end: String },
      SUN: { enabled: Boolean, start: String, end: String },
    },
    onlineHours: {
      MON: { enabled: Boolean, start: String, end: String },
      TUE: { enabled: Boolean, start: String, end: String },
      WED: { enabled: Boolean, start: String, end: String },
      THU: { enabled: Boolean, start: String, end: String },
      FRI: { enabled: Boolean, start: String, end: String },
      SAT: { enabled: Boolean, start: String, end: String },
      SUN: { enabled: Boolean, start: String, end: String },
    },
    leaves: [
      {
        date: { type: Date, required: true },
        reason: String,
      },
    ],
    blockedSlots: [
      {
        date: { type: Date, required: true },
        time: { type: String, required: true }, // "HH:MM"
        reason: String,
      },
    ],
    holidays: [{ type: Date }],
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
