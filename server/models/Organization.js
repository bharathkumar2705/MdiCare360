const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY'], required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    logo: String,
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
      coordinates: { lat: Number, lng: Number },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    departments: [{ name: String, head: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' } }],
    services: [{ type: String }],
    facilities: [{ type: String }],
    accreditations: [{ body: String, year: Number }],
    operatingHours: {
      MON: { open: String, close: String, isOpen: Boolean },
      TUE: { open: String, close: String, isOpen: Boolean },
      WED: { open: String, close: String, isOpen: Boolean },
      THU: { open: String, close: String, isOpen: Boolean },
      FRI: { open: String, close: String, isOpen: Boolean },
      SAT: { open: String, close: String, isOpen: Boolean },
      SUN: { open: String, close: String, isOpen: Boolean },
    },
    rating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

organizationSchema.index({ type: 1, 'address.city': 1 });
organizationSchema.index({ name: 'text' });

module.exports = mongoose.model('Organization', organizationSchema);
