const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('DOCTOR'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);

module.exports = router;
