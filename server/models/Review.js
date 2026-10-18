const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    tags: [{ type: String }], // e.g. "Punctual", "Knowledgeable"
    isAnonymous: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    doctorResponse: { type: String },
    doctorRespondedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1, createdAt: -1 });
reviewSchema.index({ patientId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
