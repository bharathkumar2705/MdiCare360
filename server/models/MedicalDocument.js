const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String }, // MIME type
    fileSize: { type: Number }, // bytes
    documentType: {
      type: String,
      enum: ['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DISCHARGE_SUMMARY', 'INSURANCE', 'OTHER'],
    },
    title: { type: String, required: true },
    description: String,
    relatedAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    relatedConsultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    // AI summarization
    aiSummary: String,
    aiSummaryGeneratedAt: Date,
  },
  { timestamps: true }
);

medicalDocumentSchema.index({ patientId: 1, createdAt: -1 });
medicalDocumentSchema.index({ documentType: 1 });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
