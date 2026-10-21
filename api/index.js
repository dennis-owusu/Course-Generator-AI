import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import contentRoute from './routes/content.route.js'
import authRoute from './routes/auth.route.js';
import aiContentRoute from './routes/aiContent.route.js';
import gamificationRoute from './routes/gamification.route.js';
import studyToolsRoute from './routes/studyTools.route.js';
import dashboardRoute from './routes/dashboard.route.js';
import assignmentRoute from './routes/assignment.route.js';
import scheduleRoute from './routes/schedule.route.js';
import studyGroupRoute from './routes/studyGroup.route.js';
import notificationRoute from './routes/notification.route.js';
import aiAssistantRoute from './routes/aiAssistant.route.js';
import uploadRoute from './routes/upload.route.js';
import adminRoute from './routes/admin.route.js';
import liveClassRoute from './routes/liveClass.route.js';

dotenv.config();

// Validate critical secrets before starting
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const app = express();
const __dirname = path.resolve();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'AI assistant rate limit reached.' },
});

app.use('/api/auth', authLimiter);
app.use('/api/ai-assistant', aiLimiter);
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'https://course-generator-ai.onrender.com',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(cookieParser());
 
//connect to mongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('Connected to MongoDB') }).catch((err) => { console.log(err) });

 
app.use('/api/content', contentRoute)
app.use('/api/auth', authRoute)
app.use('/api/ai-content', aiContentRoute)
app.use('/api/gamification', gamificationRoute)
app.use('/api/study-tools', studyToolsRoute)
app.use('/api/dashboard', dashboardRoute)
app.use('/api/assignments', assignmentRoute)
app.use('/api/schedules', scheduleRoute)
app.use('/api/study-groups', studyGroupRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/ai-assistant', aiAssistantRoute)
app.use('/api/upload', uploadRoute)
app.use('/api/admin', adminRoute)
app.use('/api/live-classes', liveClassRoute)

// Serve public uploaded images
app.use('/uploads/images', express.static(path.join(__dirname, '..', 'uploads', 'images')));

// Protect private documents and recordings behind auth
import { verifyToken } from './utils/verifyUser.js';
app.use('/uploads/documents', verifyToken, express.static(path.join(__dirname, '..', 'uploads', 'documents')));
app.use('/uploads/recordings', verifyToken, express.static(path.join(__dirname, '..', 'uploads', 'recordings')));

// Serve static files from the public directory in production

app.use(express.static(path.join(__dirname, '/client/dist')));

// Unknown API routes should return JSON 404, not the SPA HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, statusCode: 404, message: `Not found: ${req.method} ${req.originalUrl}` });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });
// Export for tests; start server only when this file is run directly
export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}