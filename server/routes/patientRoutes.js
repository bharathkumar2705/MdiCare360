const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMedicalRecords,
  addMedicalRecord,
  getLabTests,
  getLabBookings,
  bookLabTest,
  getMedicines,
  getPharmacyOrders,
  createPharmacyOrder,
  getPayments,
  getInsurance,
  saveInsurance,
  getConsents,
  grantConsent,
  revokeConsent,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Profile & Comprehensive Settings
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Real Medical Records
router.get('/medical-records', getMedicalRecords);
router.post('/medical-records', addMedicalRecord);

// Real Diagnostic Labs
router.get('/labs/tests', getLabTests);
router.get('/labs/bookings', getLabBookings);
router.post('/labs/book', bookLabTest);

// Real Pharmacy
router.get('/pharmacy/medicines', getMedicines);
router.get('/pharmacy/orders', getPharmacyOrders);
router.post('/pharmacy/order', createPharmacyOrder);

// Real Payments
router.get('/payments', getPayments);

// Real Insurance
router.get('/insurance', getInsurance);
router.post('/insurance', saveInsurance);

// Real ABDM Consent
router.get('/consents', getConsents);
router.post('/consents', grantConsent);
router.patch('/consents/:id/revoke', revokeConsent);

module.exports = router;
