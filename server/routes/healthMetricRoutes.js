const express = require('express');
const router = express.Router();
const { addMetric, getMetrics, deleteMetric } = require('../controllers/healthMetricController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('PATIENT'));
router.post('/', addMetric);
router.get('/', getMetrics);
router.delete('/:id', deleteMetric);

module.exports = router;
