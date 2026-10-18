const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    chiefConcern: { type: String },
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      spO2: Number,
      respiratoryRate: Number,
    },
    observations: { type: String },
    assessment: { type: String },
    plan: { type: String },
    followUpDate: { type: Date },
    followUpNotes: { type: String },
    doctorNotes: { type: String }, // Private notes not shared with patient
    // AI Copilot section - must be explicitly approved before inclusion in record
    aiSuggestion: { type: String },
    aiSuggestionApproved: { type: Boolean, default: false },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // minutes
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
  },
  { timestamps: true }
);

consultationSchema.index({ patientId: 1 });
consultationSchema.index({ doctorId: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
