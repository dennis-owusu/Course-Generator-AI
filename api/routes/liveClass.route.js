import express from 'express';
import { verifyToken, requireTeacherOrAdmin } from '../utils/verifyUser.js';
import { uploadRecording } from '../utils/fileUpload.js';
import {
  createLiveClass,
  getLiveClasses,
  getLiveClassById,
  uploadRecording as handleRecordingUpload,
  markAttendance,
} from '../controllers/liveClass.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getLiveClasses);
router.get('/:id', getLiveClassById);
router.post('/:id/attendance', markAttendance);
router.post('/', requireTeacherOrAdmin, createLiveClass);
router.post('/:id/recording', requireTeacherOrAdmin, uploadRecording.single('recording'), handleRecordingUpload);

export default router;
