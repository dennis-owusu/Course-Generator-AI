import express from 'express';
import { generateCourseWithAI, generateQuizForContent, generateAdditionalContent } from '../controllers/aiContent.controller.js';

const router = express.Router();

/**
 * Routes for AI content generation using GitHub AI function calling
 */

// Generate a complete course with GitHub AI function calling
router.post('/generate-course', generateCourseWithAI);

// Generate quiz questions for a specific lesson or module
router.post('/generate-quiz', generateQuizForContent);

// Generate additional content for an existing lesson
router.post('/generate-additional-content', generateAdditionalContent);

export default router;