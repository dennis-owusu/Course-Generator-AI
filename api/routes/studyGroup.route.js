import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getStudyGroups, createStudyGroup, joinStudyGroup } from '../controllers/studyGroup.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getStudyGroups);
router.post('/', createStudyGroup);
router.post('/:id/join', joinStudyGroup);

export default router;
