import express from 'express';
import { createContent, generateCourse, getUserCourses, getCourseById, getCommunityCoursesController, updateCourse, uploadCourseBanner } from '../controllers/content.controller.js';
import { uploadImage } from '../utils/fileUpload.js';
import { verifyToken, requireTeacherOrAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Public/community routes
router.get('/community-courses', getCommunityCoursesController);
router.get('/course/:courseId', getCourseById);

// Protected routes
router.use(verifyToken);

// Course creation routes
router.post('/create-content', requireTeacherOrAdmin, createContent);
router.post('/generate-course', generateCourse);

// Course retrieval routes
router.get('/user-courses/:userId', getUserCourses);

// Course update routes
router.put('/course/:courseId', updateCourse);
router.post('/course/:courseId/banner', uploadImage.single('bannerImage'), uploadCourseBanner);

export default router;