import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
