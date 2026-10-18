const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    type: { type: String, enum: ['PATIENT_DOCTOR', 'GENERAL'], default: 'PATIENT_DOCTOR' },
    relatedAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
