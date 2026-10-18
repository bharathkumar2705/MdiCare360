const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, required: true },
    policyNumber: { type: String, required: true },
    groupNumber: String,
    holderName: String,
    relationship: { type: String, enum: ['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER'] },
    coverageType: { type: String }, // e.g., "Individual", "Family"
    coverageAmount: Number,
    deductible: Number,
    copay: Number,
    validFrom: Date,
    validUntil: Date,
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'PENDING'], default: 'ACTIVE' },
    cardImageUrl: String,
    notes: String,
  },
  { timestamps: true }
);

insuranceSchema.index({ patientId: 1 });

module.exports = mongoose.model('Insurance', insuranceSchema);
