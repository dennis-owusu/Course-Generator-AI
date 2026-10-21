import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { uploadImage, uploadDocument } from '../utils/fileUpload.js';
import { uploadProfileImage, uploadAssignmentDocument, servePrivateDocument } from '../controllers/upload.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/image', uploadImage.single('file'), uploadProfileImage);
router.post('/document', uploadDocument.single('file'), uploadAssignmentDocument);
router.get('/documents/:filename', servePrivateDocument);

export default router;
