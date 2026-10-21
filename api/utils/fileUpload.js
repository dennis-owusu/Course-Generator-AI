import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const ALLOWED_RECORDING_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RECORDING_SIZE = 500 * 1024 * 1024; // 500 MB

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subfolder) => {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', subfolder);
  ensureDir(uploadDir);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

export const uploadImage = multer({
  storage: createStorage('images'),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

export const uploadDocument = multer({
  storage: createStorage('documents'),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
});

export const uploadRecording = multer({
  storage: createStorage('recordings'),
  limits: { fileSize: MAX_RECORDING_SIZE, files: 1 },
  fileFilter: fileFilter(ALLOWED_RECORDING_TYPES),
});

export const getFilePath = (subfolder, filename) => {
  return path.join(__dirname, '..', '..', 'uploads', subfolder, filename);
};
