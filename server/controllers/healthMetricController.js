const HealthMetric = require('../models/HealthMetric');

const addMetric = async (req, res, next) => {
  try {
    const { type, value, unit, notes, recordedAt } = req.body;
    const metric = await HealthMetric.create({
      patientId: req.user._id, type, value, unit, notes,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });
    return res.status(201).json({ success: true, data: metric });
  } catch (err) {
    next(err);
  }
};

const getMetrics = async (req, res, next) => {
  try {
    const { type, from, to, limit = 50 } = req.query;
    const filter = { patientId: req.user._id };
    if (type) filter.type = type;
    if (from || to) {
      filter.recordedAt = {};
      if (from) filter.recordedAt.$gte = new Date(from);
      if (to) filter.recordedAt.$lte = new Date(to);
    }

    const metrics = await HealthMetric.find(filter)
      .sort({ recordedAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};

const deleteMetric = async (req, res, next) => {
  try {
    const metric = await HealthMetric.findOne({ _id: req.params.id, patientId: req.user._id });
    if (!metric) return res.status(404).json({ success: false, message: 'Metric not found.' });
    await metric.deleteOne();
    return res.json({ success: true, message: 'Metric deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addMetric, getMetrics, deleteMetric };
