import express from 'express';
import { createContent, generateCourse, getUserCourses, getCourseById, getCommunityCoursesWithFilters } from '../controllers/content.controller.js';

const router = express.Router();

// Course creation routes
router.post('/create-content', createContent);
router.post('/generate-course', generateCourse); 

// Course retrieval routes
router.get('/user-courses/:userId', getUserCourses);
router.get('/course/:courseId', getCourseById);

// Community courses routes
router.get('/community-courses', getCommunityCoursesWithFilters);

export default router;