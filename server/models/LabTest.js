const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    category: {
      type: String,
      enum: ['BLOOD', 'URINE', 'IMAGING', 'CULTURE', 'PATHOLOGY', 'GENETICS', 'OTHER'],
    },
    description: String,
    price: { type: Number, required: true },
    homeCollectionAvailable: { type: Boolean, default: false },
    homeCollectionCharge: { type: Number, default: 0 },
    turnaroundTime: { type: String }, // e.g. "24-48 hours"
    sampleType: { type: String }, // e.g. "Blood", "Urine"
    preparationInstructions: String,
    referenceRange: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

labTestSchema.index({ labId: 1 });
labTestSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);
