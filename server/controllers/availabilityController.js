const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const { getRedis } = require('../config/redis');

const getMyAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const availability = await Availability.findOne({ doctorId: doctor._id });
    if (!availability) return res.status(404).json({ success: false, message: 'Availability not configured.' });

    return res.json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
};

const updateMyAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const { workingHours, onlineHours, consultationDuration, bufferTime, leaves, blockedSlots, holidays } = req.body;

    const updates = {};
    if (workingHours) updates.workingHours = workingHours;
    if (onlineHours) updates.onlineHours = onlineHours;
    if (consultationDuration) updates.consultationDuration = consultationDuration;
    if (bufferTime !== undefined) updates.bufferTime = bufferTime;
    if (leaves) updates.leaves = leaves;
    if (blockedSlots) updates.blockedSlots = blockedSlots;
    if (holidays) updates.holidays = holidays;

    const availability = await Availability.findOneAndUpdate(
      { doctorId: doctor._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    // Invalidate availability cache for this doctor
    const redis = getRedis();
    if (redis) {
      const keys = await redis.keys(`doctors:availability:${doctor._id}:*`);
      if (keys.length) await redis.del(keys);
    }

    return res.json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
};

const addLeave = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const { date, reason } = req.body;
    const availability = await Availability.findOne({ doctorId: doctor._id });
    if (!availability) return res.status(404).json({ success: false, message: 'Availability not found.' });

    availability.leaves.push({ date: new Date(date), reason });
    await availability.save();

    return res.json({ success: true, data: availability.leaves });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAvailability, updateMyAvailability, addLeave };
