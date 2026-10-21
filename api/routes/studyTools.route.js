import express from 'express';
import { getWaecQuestions, explainAtLevel } from '../controllers/studyTools.controller.js';

const router = express.Router();

router.post('/waec-questions', getWaecQuestions);
router.post('/explain', explainAtLevel);

export default router;
