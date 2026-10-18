const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ userId, userRole, action, resource, resourceId, description, ipAddress, userAgent, outcome = 'SUCCESS', metadata }) => {
  try {
    await AuditLog.create({ userId, userRole, action, resource, resourceId, description, ipAddress, userAgent, outcome, metadata });
  } catch (err) {
    // Audit logging failures must never break application flow
    console.error('Audit log write failed:', err.message);
  }
};

const auditMiddleware = (action, resource) => async (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400) {
      createAuditLog({
        userId: req.user?._id,
        userRole: req.user?.role,
        action,
        resource,
        resourceId: req.params?.id,
        description: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        outcome: 'SUCCESS',
      });
    }
  });
  next();
};

module.exports = { createAuditLog, auditMiddleware };
