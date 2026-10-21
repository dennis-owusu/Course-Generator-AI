import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { askAssistant, getCaseStudyHint } from '../controllers/aiAssistant.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/ask', askAssistant);
router.post('/case-study-hint', getCaseStudyHint);

export default router;
