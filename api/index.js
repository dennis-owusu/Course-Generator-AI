import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import contentRoute from './routes/content.route.js'
import authRoute from './routes/auth.route.js';
import aiContentRoute from './routes/aiContent.route.js';

dotenv.config(); 

const PORT = 3000
const app = express(); 
const __dirname = path.resolve();
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configure CORS to allow requests from both development and production domains
app.use(cors({
  origin: [
    'http://localhost:5173', // Development frontend
    'https://course-generator-ai.onrender.com' // Production frontend
  ],
  credentials: true
}));
app.use(cookieParser());

//connect to mongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('Connected to MongoDB') }).catch((err) => { console.log(err) });

 
app.use('/api/content', contentRoute)
app.use('/api/auth', authRoute)
app.use('/api/ai-content', aiContentRoute)

// Serve static files from the public directory in production

app.use(express.static(path.join(__dirname, '/client/dist')));

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
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });