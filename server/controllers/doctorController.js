const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Review = require('../models/Review');
const { getAvailableSlots } = require('../services/slotService');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 min

const searchDoctors = async (req, res, next) => {
  try {
    const {
      specialization, city, minFee, maxFee, minRating, minExperience,
      consultationType, language, page = 1, limit = 12, sort = 'rating',
    } = req.query;

    const redis = getRedis();
    const cacheKey = `doctors:search:${JSON.stringify(req.query)}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }

    const doctorFilter = { verificationStatus: 'VERIFIED' };
    if (specialization) doctorFilter.specialization = { $regex: specialization, $options: 'i' };
    if (minFee || maxFee) {
      const feeField = consultationType === 'ONLINE' ? 'consultationFeeOnline' : 'consultationFeeInPerson';
      doctorFilter[feeField] = {};
      if (minFee) doctorFilter[feeField].$gte = Number(minFee);
      if (maxFee) doctorFilter[feeField].$lte = Number(maxFee);
    }
    if (minRating) doctorFilter.rating = { $gte: Number(minRating) };
    if (minExperience) doctorFilter.experience = { $gte: Number(minExperience) };
    if (consultationType === 'ONLINE') doctorFilter.isOnlineConsultationAvailable = true;
    if (language) doctorFilter.languages = { $in: [language] };

    const userFilter = {};
    if (city) userFilter['address.city'] = { $regex: city, $options: 'i' };

    const sortMap = {
      rating: { rating: -1 },
      experience: { experience: -1 },
      fee_asc: { consultationFeeOnline: 1 },
      fee_desc: { consultationFeeOnline: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const doctors = await Doctor.find(doctorFilter)
      .populate({
        path: 'userId',
        select: 'name email avatar phone',
      })
      .sort(sortMap[sort] || { rating: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Doctor.countDocuments(doctorFilter);

    const result = {
      success: true,
      data: doctors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    };

    if (redis) await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email avatar phone')
      .populate('hospitalAffiliations', 'name address')
      .lean();

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const recentReviews = await Review.find({ doctorId: doctor._id, isVisible: true })
      .populate('patientId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({ success: true, data: { ...doctor, recentReviews } });
  } catch (err) {
    next(err);
  }
};

const getDoctorAvailability = async (req, res, next) => {
  try {
    const { date, consultationType = 'IN_PERSON' } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const availability = await Availability.findOne({ doctorId: doctor._id });
    if (!availability) return res.json({ success: true, data: { slots: [] } });

    const slots = await getAvailableSlots(availability, doctor._id, date, consultationType);

    return res.json({ success: true, data: { slots, consultationDuration: availability.consultationDuration } });
  } catch (err) {
    next(err);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    const allowedFields = ['bio', 'languages', 'consultationFeeOnline', 'consultationFeeInPerson', 'clinics', 'isOnlineConsultationAvailable', 'isInPersonAvailable', 'qualifications'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await Doctor.findByIdAndUpdate(doctor._id, updates, { new: true, runValidators: true })
      .populate('userId', 'name email avatar');

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar phone')
      .populate('hospitalAffiliations', 'name address');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    return res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

const getDoctorReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ doctorId: req.params.id, isVisible: true })
      .populate('patientId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments({ doctorId: req.params.id, isVisible: true });

    return res.json({ success: true, data: reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const getSpecializations = async (req, res, next) => {
  try {
    const redis = getRedis();
    const cacheKey = 'specializations:list';

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }

    const specs = await Doctor.distinct('specialization', { verificationStatus: 'VERIFIED' });
    const result = { success: true, data: specs.sort() };

    if (redis) await redis.setEx(cacheKey, 3600, JSON.stringify(result)); // 1 hour cache

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { searchDoctors, getDoctorById, getDoctorAvailability, updateDoctorProfile, getMyDoctorProfile, getDoctorReviews, getSpecializations };
