const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: String,
    manufacturer: String,
    category: {
      type: String,
      enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'INHALER', 'OTHER'],
    },
    strength: String, // e.g. "500mg"
    price: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    requiresPrescription: { type: Boolean, default: false },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    description: String,
    sideEffects: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text' });
medicineSchema.index({ pharmacyId: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
