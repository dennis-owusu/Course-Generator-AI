import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const contentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    description: {
        type: String,
        required: false
    },
    youtubeVideoUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chapters: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const Content = mongoose.model('Content', contentSchema);

export default Content;