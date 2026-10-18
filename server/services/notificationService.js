const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, link, relatedId, relatedModel, metadata }) => {
  try {
    const notification = await Notification.create({
      userId, type, title, message, link, relatedId, relatedModel, metadata,
    });
    return notification;
  } catch (err) {
    console.error('Notification create error:', err.message);
    return null;
  }
};

module.exports = { createNotification };
