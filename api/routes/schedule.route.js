import express from 'express';
import { verifyToken, requireTeacherOrAdmin } from '../utils/verifyUser.js';
import { getSchedules, createSchedule } from '../controllers/schedule.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getSchedules);
router.post('/', requireTeacherOrAdmin, createSchedule);

export default router;
