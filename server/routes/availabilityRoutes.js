const express = require('express');
const router = express.Router();
const { getMyAvailability, updateMyAvailability, addLeave } = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('DOCTOR'));
router.get('/', getMyAvailability);
router.put('/', updateMyAvailability);
router.post('/leave', addLeave);

module.exports = router;
