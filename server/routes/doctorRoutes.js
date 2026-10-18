const express = require('express');
const router = express.Router();
const { searchDoctors, getDoctorById, getDoctorAvailability, updateDoctorProfile, getMyDoctorProfile, getDoctorReviews, getSpecializations } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/specializations', getSpecializations);
router.get('/', searchDoctors);
router.get('/me/profile', protect, authorize('DOCTOR'), getMyDoctorProfile);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);
router.get('/:id/reviews', getDoctorReviews);
router.patch('/profile', protect, authorize('DOCTOR'), updateDoctorProfile);

module.exports = router;
