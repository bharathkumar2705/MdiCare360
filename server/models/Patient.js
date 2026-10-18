const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    allergies: [{ type: String }],
    currentMedications: [{ name: String, dosage: String, frequency: String }],
    medicalHistory: [
      {
        condition: String,
        diagnosedYear: Number,
        status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'CHRONIC'] },
      },
    ],
    surgicalHistory: [{ procedure: String, year: Number, hospital: String }],
    familyHistory: [{ condition: String, relationship: String }],
    smokingStatus: { type: String, enum: ['NEVER', 'FORMER', 'CURRENT'] },
    alcoholUse: { type: String, enum: ['NONE', 'OCCASIONAL', 'MODERATE', 'HEAVY'] },
    height: { value: Number, unit: { type: String, default: 'cm' } },
    weight: { value: Number, unit: { type: String, default: 'kg' } },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
