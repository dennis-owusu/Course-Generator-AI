import express from 'express';
import { verifyToken, requireTeacherOrAdmin } from '../utils/verifyUser.js';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignment.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAssignments);
router.post('/', requireTeacherOrAdmin, createAssignment);
router.post('/:id/submit', submitAssignment);
router.post('/:id/grade', requireTeacherOrAdmin, gradeSubmission);

export default router;
