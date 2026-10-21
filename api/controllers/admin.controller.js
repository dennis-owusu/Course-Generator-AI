import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

// GET /api/admin/pending-teachers
export const getPendingTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher', teacherStatus: 'pending' })
      .select('-password')
      .populate('teacherApplication.department', 'name code')
      .sort({ 'teacherApplication.submittedAt': -1 });
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/verify-teacher/:userId
export const verifyTeacher = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, reviewNote } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return next(errorHandler(400, 'Status must be verified or rejected'));
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return next(errorHandler(404, 'Teacher account not found'));
    }

    user.teacherStatus = status;
    user.teacherApplication = {
      ...user.teacherApplication,
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      reviewNote: reviewNote || '',
    };
    await user.save();

    res.status(200).json({ success: true, message: `Teacher ${status}`, user: { _id: user._id, teacherStatus: user.teacherStatus } });
  } catch (error) {
    next(error);
  }
};
