import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    aiNotes: {
        type: String,
        required: false
    },
    youtubeVideoUrl: {
        type: String,
        required: false
    },
    duration: {
        type: Number, // in minutes
        required: false
    },
    quizQuestions: [{
        question: String,
        options: [String],
        correctAnswer: Number // index of correct option
    }],
    // WAEC-style past/exam practice questions for this lesson (lazily generated, cached)
    waecQuestions: [{
        question: String,
        options: [String],
        correctAnswer: Number, // index of correct option
        explanation: String,
        year: String, // e.g. "2022" — the past paper the question is styled on
    }],
    // Cached "Learn-at-Your-Level" explanations
    explanations: {
        JHS: { type: String, required: false },
        SHS: { type: String, required: false },
    }
});

const moduleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    lessons: [lessonSchema],
    order: {
        type: Number,
        required: true
    }
});

const contentSchema = new Schema({ 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    learningGoal: {
        type: String,
        enum: ['Career', 'Academic', 'Personal'],
        required: true
    },
    estimatedDuration: {
        type: Number, // in hours
        required: true
    },
    modules: [moduleSchema],
    category: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTeachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Community and engagement metrics
    isPublic: {
        type: Boolean,
        default: true
    },
    learners: {
        type: Number,
        default: 0
    },
    ratings: [{
        userId: String,
        rating: Number, // 1-5 stars
        review: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
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