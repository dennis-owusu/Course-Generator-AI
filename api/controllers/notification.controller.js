import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.userId, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, recipient: req.userId };
    await Notification.findOneAndUpdate(filter, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Internal helper for workflow triggers
export const createNotification = async ({ recipient, type, title, message, link, metadata }) => {
  try {
    await Notification.create({ recipient, type, title, message, link, metadata });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};
