const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getPendingDoctors,
  verifyDoctor,
  getAuditLogs,
  toggleUserActive,
  createUser,
  updateUser,
  deleteUser,
  deleteDoctor,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('PLATFORM_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle', toggleUserActive);

router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/verify', verifyDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
