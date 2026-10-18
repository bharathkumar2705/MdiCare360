const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabBooking', required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    fileUrl: { type: String, required: true },
    fileName: String,
    results: [
      {
        testName: String,
        value: String,
        unit: String,
        referenceRange: String,
        flag: { type: String, enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'] },
      },
    ],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    releasedAt: Date,
    summary: String,
    aiSummary: String,
    aiSummaryGeneratedAt: Date,
  },
  { timestamps: true }
);

labReportSchema.index({ patientId: 1 });

module.exports = mongoose.model('LabReport', labReportSchema);
