import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

// Signup Controller
export const signup = async (req, res, next) => {
    const { username, email, password, role, qualifications, department } = req.body;

    if (!username || !email || !password || username === '' || email === '' || password === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    // Only allow requesting student or teacher roles during signup; admin must be promoted later
    const requestedRole = role === 'teacher' ? 'teacher' : 'student';
    const teacherStatus = requestedRole === 'teacher' ? 'pending' : 'not_applicable';

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: requestedRole,
        teacherStatus,
        teacherApplication: requestedRole === 'teacher' ? {
            qualifications: qualifications || '',
            department: department || null,
            submittedAt: new Date(),
        } : undefined,
    });

    try {
        await newUser.save();
        res.status(201).json({
            message: requestedRole === 'teacher'
                ? 'Teacher account created successfully. Your application is pending verification.'
                : 'User created successfully',
            user: { _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, teacherStatus: newUser.teacherStatus },
        });
    } catch (error) {
        // Handle potential duplicate key errors (username/email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return next(errorHandler(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`));
        }
        next(error);
    }
};

// Signin Controller
export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ email }).select('+password');
        if (!validUser) {
            return next(errorHandler(404, 'User not found'));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, 'Invalid credentials'));
        }

        // Generate JWT token (ensure JWT_SECRET is in your .env)
    const token = jwt.sign(
      { id: validUser._id, username: validUser.username, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

        // Separate password from the rest of the user data
        const { password: _, ...rest } = validUser._doc;

        res.status(200)
           .cookie('access_token', token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
               maxAge: 24 * 60 * 60 * 1000,
            })
           .json(rest);

    } catch (error) {
        next(error);
    }
};


// Google OAuth Controller
export const google = async (req, res, next) => {
    const { email, username, name, googlePhotoUrl } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            // User exists, sign them in
            const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const { password: _, ...rest } = user._doc;
            res.status(200).cookie('access_token', token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
               maxAge: 24 * 60 * 60 * 1000,
            }).json(rest);
        } else {
            // User doesn't exist, create a new user
            // Generate a random password since Google OAuth doesn't provide one
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            
            // Create a username (e.g., from name, ensure uniqueness)
            let generatedUsername = username.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4);
            // Optional: Add logic to ensure username uniqueness if needed
 
            const newUser = new User({
                name: name,
                username: generatedUsername,
                email: email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
                googleId: req.body.googleId // Assuming googleId is sent from frontend
            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const { password: _, ...rest } = newUser._doc;
            res.status(201).cookie('access_token', token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
               maxAge: 24 * 60 * 60 * 1000,
            }).json(rest);
        }
    } catch (error) {
        next(error);
    }
};

// Signout Controller
export const signout = (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('User has been signed out.');
    } catch (error) {
        next(error);
    }
};