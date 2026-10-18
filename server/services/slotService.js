const { format, addMinutes, parse, isAfter, isBefore, startOfDay, endOfDay } = require('date-fns');
const Appointment = require('../models/Appointment');

/**
 * Generate time slots for a given day based on doctor availability settings.
 * Returns an array of slot strings ["09:00", "09:30", ...] that are not already booked.
 */
const generateSlots = (startTime, endTime, duration, bufferTime) => {
  const slots = [];
  const baseDate = new Date(2000, 0, 1);
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let current = new Date(baseDate);
  current.setHours(startHour, startMin, 0, 0);

  const end = new Date(baseDate);
  end.setHours(endHour, endMin, 0, 0);

  while (isAfter(end, addMinutes(current, duration - 1))) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, duration + bufferTime);
  }

  return slots;
};

/**
 * Get day-of-week key from a Date object.
 */
const getDayKey = (date) => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(date).getDay()];
};

/**
 * Fetch available slots for a doctor on a specific date.
 */
const getAvailableSlots = async (availability, doctorId, dateStr, consultationType) => {
  const date = new Date(dateStr);
  const dayKey = getDayKey(date);

  const schedule = consultationType === 'ONLINE' ? availability.onlineHours : availability.workingHours;
  const daySchedule = schedule?.[dayKey];

  if (!daySchedule?.enabled) return [];

  // Check for leave on this date
  const isOnLeave = availability.leaves?.some((l) => {
    const leaveDate = new Date(l.date);
    return leaveDate.toDateString() === date.toDateString();
  });
  if (isOnLeave) return [];

  // Check for holiday
  const isHoliday = availability.holidays?.some((h) => new Date(h).toDateString() === date.toDateString());
  if (isHoliday) return [];

  const allSlots = generateSlots(
    daySchedule.start,
    daySchedule.end,
    availability.consultationDuration,
    availability.bufferTime
  );

  // Get booked slots for this day
  const booked = await Appointment.find({
    doctorId,
    date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    consultationType,
    status: { $nin: ['CANCELLED', 'REJECTED', 'NO_SHOW'] },
  }).select('slotTime');

  const bookedTimes = new Set(booked.map((a) => a.slotTime));

  // Remove blocked slots
  const blocked = new Set(
    (availability.blockedSlots || [])
      .filter((s) => new Date(s.date).toDateString() === date.toDateString())
      .map((s) => s.time)
  );

  return allSlots.filter((s) => !bookedTimes.has(s) && !blocked.has(s));
};

module.exports = { generateSlots, getAvailableSlots, getDayKey };
