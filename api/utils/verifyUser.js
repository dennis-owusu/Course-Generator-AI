import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(errorHandler(401, 'Unauthorized: no token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return next(errorHandler(401, 'Unauthorized: invalid token'));
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(errorHandler(403, 'Forbidden: insufficient permissions'));
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireTeacherOrAdmin = requireRole('teacher', 'admin');
export const requireStudent = requireRole('student');
