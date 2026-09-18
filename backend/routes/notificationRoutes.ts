import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markNotificationAsRead);
router.put('/read-all', verifyToken, markAllAsRead);

export default router;
