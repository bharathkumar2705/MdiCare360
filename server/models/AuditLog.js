const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userRole: String,
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'PROFILE_UPDATE',
        'RECORD_ACCESS',
        'RECORD_CREATE',
        'RECORD_UPDATE',
        'RECORD_DELETE',
        'PRESCRIPTION_CREATE',
        'PRESCRIPTION_VIEW',
        'DOCUMENT_UPLOAD',
        'DOCUMENT_ACCESS',
        'CONSENT_GRANT',
        'CONSENT_REVOKE',
        'CONSENT_MODIFY',
        'ADMIN_ACTION',
        'DOCTOR_VERIFY',
        'PAYMENT',
      ],
      required: true,
    },
    resource: String, // e.g. "Appointment", "MedicalDocument"
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    description: String,
    ipAddress: String,
    userAgent: String,
    outcome: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceId: 1 });
// Audit logs should be retained — no TTL by default

module.exports = mongoose.model('AuditLog', auditLogSchema);
