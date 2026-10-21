import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getDashboardStats,
  getMyEnrolledCourses,
  enrollInCourse,
  updateProgress,
  getTopLearners,
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/stats/:userId', getDashboardStats);
router.get('/my-courses/:userId', getMyEnrolledCourses);
router.post('/enroll', enrollInCourse);
router.post('/progress', updateProgress);
router.get('/leaderboard/top', getTopLearners);

export default router;
