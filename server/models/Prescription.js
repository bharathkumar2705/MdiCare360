const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g. "Twice daily"
  duration: { type: String, required: true }, // e.g. "7 days"
  route: { type: String, enum: ['ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'OTHER'] },
  instructions: String,
  refills: { type: Number, default: 0 },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    medicines: { type: [medicineItemSchema], default: [] },
    diagnosis: String,
    notes: String,
    followUpDate: Date,
    isActive: { type: Boolean, default: true },
    dispensedAt: Date,
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pharmacist
    prescriptionNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1 });

// Auto-generate prescription number
prescriptionSchema.pre('save', function () {
  if (!this.prescriptionNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.prescriptionNumber = `RX-${dateStr}-${random}`;
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
