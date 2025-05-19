import express from 'express';
import { createContent, generateCourse, getUserCourses, getCourseById, getCommunityCoursesController } from '../controllers/content.controller.js';

const router = express.Router();

// Course creation routes
router.post('/create-content', createContent);
router.post('/generate-course', generateCourse);

// Course retrieval routes
router.get('/user-courses/:userId', getUserCourses);
router.get('/course/:courseId', getCourseById);
router.get('/community-courses', getCommunityCoursesController);

export default router;