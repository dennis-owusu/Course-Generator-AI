import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Content from '../models/content.model.js';
import Enrollment from '../models/enrollment.model.js';
import Progress from '../models/progress.model.js';
import Assignment from '../models/assignment.model.js';
import Submission from '../models/submission.model.js';
import Schedule from '../models/schedule.model.js';
import StudyGroup from '../models/studyGroup.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';
import { checkCourseQuota, isPro } from '../utils/gamification.js';
import { createNotification } from './notification.controller.js';

const toObjectId = (id) => {
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
};

// GET /api/dashboard/stats/:userId
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const uid = toObjectId(userId);
    if (!uid) return next(errorHandler(400, 'Invalid user ID'));

    // Authorization: users can only view their own stats unless admin/teacher
    if (req.userId !== userId && req.userRole !== 'admin' && req.userRole !== 'teacher') {
      return next(errorHandler(403, 'Forbidden'));
    }

    const user = await User.findById(uid).select('points badges monthlyAiCourses plan planExpiresAt role');
    if (!user) return next(errorHandler(404, 'User not found'));

    // Courses in progress = active enrollments
    const coursesInProgress = await Enrollment.countDocuments({ student: uid, status: 'active' });

    // Completed lessons count (unique)
    const completedLessons = await Progress.countDocuments({ student: uid, status: 'completed' });

    // Study streak: count distinct days with completed lessons in last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const streakDays = await Progress.distinct('completionDate', {
      student: uid,
      status: 'completed',
      completionDate: { $gte: last7Days },
    });
    const studyStreak = streakDays.filter(d => d).length;

    // Upcoming clinical session count in next 7 days
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingClinical = await Schedule.countDocuments({
      startTime: { $gte: new Date(), $lte: next7Days },
    });

    // Assignments due this week that are pending
    const assignmentsDue = await Assignment.countDocuments({
      dueDate: { $gte: new Date(), $lte: next7Days },
      isPublished: true,
    });

    // Recent AI quota
    const quota = checkCourseQuota(user);

    // Rank
    const rank = (await User.countDocuments({ points: { $gt: user.points || 0 } })) + 1;

    res.status(200).json({
      success: true,
      stats: {
        coursesInProgress,
        studyStreak,
        upcomingClinical,
        assignmentsDue,
        completedLessons,
        points: user.points || 0,
        rank,
      },
      plan: isPro(user) ? 'pro' : 'free',
      aiCourses: {
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      },
      badges: user.badges || [],
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/my-courses/:userId
export const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const uid = toObjectId(userId);
    if (!uid) return next(errorHandler(400, 'Invalid user ID'));

    if (req.userId !== userId && !['admin', 'teacher'].includes(req.userRole)) {
      return next(errorHandler(403, 'Forbidden'));
    }

    const enrollments = await Enrollment.find({ student: uid, status: { $in: ['active', 'completed'] } })
      .populate('course')
      .sort({ enrollmentDate: -1 });

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        if (!course) return null;
        const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
        const completed = await Progress.countDocuments({ student: uid, course: course._id, status: 'completed' });
        const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          level: course.level,
          thumbnail: course.thumbnail,
          estimatedDuration: course.estimatedDuration,
          modules: course.modules,
          progress,
          enrollmentStatus: enrollment.status,
        };
      })
    );

    res.status(200).json({ success: true, courses: courses.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};

// POST /api/dashboard/enroll
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId, termId } = req.body;
    const studentId = req.userId;

    if (!courseId || !termId) return next(errorHandler(400, 'courseId and termId are required'));

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) return next(errorHandler(409, 'Already enrolled in this course'));

    const enrollment = new Enrollment({ student: studentId, course: courseId, term: termId });
    await enrollment.save();

    const course = await Content.findById(courseId).select('title');
    await createNotification({
      recipient: studentId,
      type: 'enrollment',
      title: 'Enrollment confirmed',
      message: course ? `You are now enrolled in ${course.title}.` : 'You are enrolled in a new course.',
      link: `/dashboard/my-courses`,
      metadata: { courseId },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
};

// POST /api/dashboard/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId, status, timeSpentMinutes } = req.body;
    const studentId = req.userId;

    if (!courseId || !lessonId || !status) {
      return next(errorHandler(400, 'courseId, lessonId, and status are required'));
    }

    const filter = { student: studentId, course: courseId, lessonId };
    const update = {
      status,
      completionDate: status === 'completed' ? new Date() : undefined,
      timeSpentMinutes: timeSpentMinutes || 0,
    };

    await Progress.findOneAndUpdate(filter, update, { upsert: true, new: true });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/leaderboard/top
export const getTopLearners = async (req, res, next) => {
  try {
    const top = await User.find({ points: { $gt: 0 } })
      .select('name username profilePicture points')
      .sort({ points: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      leaderboard: top.map((u, i) => ({
        rank: i + 1,
        name: u.name || u.username,
        avatar: ((u.name || u.username)?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'ST').toUpperCase(),
        points: u.points,
      })),
    });
  } catch (error) {
    next(error);
  }
};
