import express from 'express';
import { verifyToken, requireAdmin } from '../utils/verifyUser.js';
import { getPendingTeachers, verifyTeacher } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/pending-teachers', getPendingTeachers);
router.post('/verify-teacher/:userId', verifyTeacher);

export default router;
