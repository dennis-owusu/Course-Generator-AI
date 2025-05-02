import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import contentRoute from './routes/content.route.js'
import authRoute from './routes/auth.route.js';

dotenv.config(); 

const PORT = 3000
const app = express(); 
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

//connect to mongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('Connected to MongoDB') }).catch((err) => { console.log(err) });

 
app.use('/api/content', contentRoute)
app.use('/api/auth', authRoute)

// Serve static files from the public directory in production
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicPath = path.join(__dirname, '..', 'public');
    
    app.use(express.static(publicPath));
    
    // Handle all other routes by serving the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});