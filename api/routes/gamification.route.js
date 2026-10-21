import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getProfile,
  getLeaderboard,
  completeLesson,
  recordWaecAttempt,
  setPreferredLevel,
} from '../controllers/gamification.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile/:userId', getProfile);
router.get('/leaderboard', getLeaderboard);
router.post('/complete-lesson', completeLesson);
router.post('/waec-attempt', recordWaecAttempt);
router.put('/preferred-level', setPreferredLevel);

export default router;
