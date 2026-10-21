import express from 'express';
import { signup, signin, google, signout } from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import User from '../models/user.model.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.get('/signout', signout);

// GET /api/auth/me — returns current authenticated user
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;