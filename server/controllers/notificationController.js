const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    const total = await Notification.countDocuments(filter);

    return res.json({ success: true, data: notifications, unreadCount, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = id === 'all'
      ? { userId: req.user._id, isRead: false }
      : { _id: id, userId: req.user._id };

    await Notification.updateMany(query, { isRead: true, readAt: new Date() });

    return res.json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead };
