import express from 'express';
import { createContent } from '../controllers/content.controller.js';

const router = express.Router()

router.post('/create-content', createContent)

export default router