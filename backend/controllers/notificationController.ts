import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const allNotifs = db.getNotifications();
    const userNotifs = allNotifs.filter((n) => n.userId === userId || req.user?.role === 'admin');

    res.json({
      success: true,
      notifications: userNotifs,
      unreadCount: userNotifs.filter((n) => !n.read).length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notifications = db.getNotifications();
    const notif = notifications.find((n) => n.id === id);

    if (notif) {
      notif.read = true;
      db.save();
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark notification.', error: err.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const notifications = db.getNotifications();
    notifications.forEach((n) => {
      if (n.userId === userId || req.user?.role === 'admin') {
        n.read = true;
      }
    });
    db.save();

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.', error: err.message });
  }
};
