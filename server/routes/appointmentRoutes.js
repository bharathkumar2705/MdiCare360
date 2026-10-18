const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  requestReschedule,
  joinWaitlist,
  payAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('PATIENT'), bookAppointment);
router.get('/', getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);
router.post('/:id/reschedule', requestReschedule);
router.post('/:id/pay', authorize('PATIENT'), payAppointment);
router.post('/waitlist', authorize('PATIENT'), joinWaitlist);

module.exports = router;
