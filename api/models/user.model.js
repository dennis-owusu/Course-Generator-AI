import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    // Add fields for Google OAuth if needed, e.g., googleId
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple documents without the field
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;