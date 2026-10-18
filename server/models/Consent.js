const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grantedToId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grantedToModel: { type: String, enum: ['DOCTOR', 'LAB', 'PHARMACY'], required: true },
    permissions: {
      medicalHistory: { type: Boolean, default: false },
      labReports: { type: Boolean, default: false },
      prescriptions: { type: Boolean, default: false },
      documents: { type: Boolean, default: false },
      healthMetrics: { type: Boolean, default: false },
    },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    revokedAt: Date,
    revokedReason: String,
    notes: String,
    history: [
      {
        action: { type: String, enum: ['GRANTED', 'REVOKED', 'MODIFIED', 'EXPIRED'] },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

consentSchema.index({ patientId: 1 });
consentSchema.index({ grantedToId: 1 });
consentSchema.index({ patientId: 1, grantedToId: 1 });

module.exports = mongoose.model('Consent', consentSchema);
