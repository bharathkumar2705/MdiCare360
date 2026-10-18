const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    subSpecialization: { type: String, trim: true },
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    registrationNumber: { type: String, trim: true },
    registrationCouncil: { type: String, trim: true },
    experience: { type: Number, default: 0 }, // years
    bio: { type: String, maxlength: 2000 },
    languages: [{ type: String }],
    consultationFeeOnline: { type: Number, default: 0 },
    consultationFeeInPerson: { type: Number, default: 0 },
    clinics: [
      {
        name: String,
        address: String,
        city: String,
        state: String,
        phone: String,
      },
    ],
    hospitalAffiliations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    isOnlineConsultationAvailable: { type: Boolean, default: false },
    isInPersonAvailable: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verificationDocuments: [
      {
        type: { type: String },
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verificationNote: { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ consultationFeeOnline: 1 });
doctorSchema.index({ isOnlineConsultationAvailable: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
