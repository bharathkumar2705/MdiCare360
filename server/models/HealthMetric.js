const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['WEIGHT', 'BLOOD_PRESSURE', 'HEART_RATE', 'BLOOD_GLUCOSE', 'TEMPERATURE', 'SPO2', 'SLEEP', 'STEPS'],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: { type: String },
    notes: String,
    recordedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['MANUAL', 'DEVICE', 'LAB'], default: 'MANUAL' },
  },
  { timestamps: true }
);

healthMetricSchema.index({ patientId: 1, type: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
