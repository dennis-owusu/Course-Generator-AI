import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import contentRoute from './routes/content.route.js'

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});