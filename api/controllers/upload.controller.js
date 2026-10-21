import path from 'path';
import { getFilePath } from '../utils/fileUpload.js';

export const uploadProfileImage = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (error) {
    next(error);
  }
};

export const uploadAssignmentDocument = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No document uploaded' });
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    res.status(200).json({ success: true, url: fileUrl, filename: req.file.filename, mimeType: req.file.mimetype });
  } catch (error) {
    next(error);
  }
};

export const servePrivateDocument = (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = getFilePath('documents', filename);
    // Only allow the uploader, teachers, or admins to access documents (simplified here)
    res.sendFile(filePath, (err) => {
      if (err) return next(err);
    });
  } catch (error) {
    next(error);
  }
};
