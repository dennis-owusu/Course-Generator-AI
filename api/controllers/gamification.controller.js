import User from '../models/user.model.js';
import Content from '../models/content.model.js';
import { errorHandler } from '../utils/error.js';
import {
  POINTS,
  awardPoints,
  checkCourseQuota,
  getMonthlyUsage,
  isPro,
} from '../utils/gamification.js';

// GET /api/gamification/profile/:userId
// Returns plan, monthly usage, points, badges and leaderboard rank.
export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId && req.userRole !== 'admin') {
      return next(errorHandler(403, 'Forbidden'));
    }
    const user = await User.findById(userId).select(
      'name username profilePicture plan planExpiresAt preferredLevel monthlyAiCourses points badges completedLessons waecStats'
    );
    if (!user) return next(errorHandler(404, 'User not found'));

    const quota = checkCourseQuota(user);
    const usage = getMonthlyUsage(user);

    // Rank = 1 + number of users with strictly more points
    const rank = (await User.countDocuments({ points: { $gt: user.points || 0 } })) + 1;

    res.status(200).json({
      success: true,
      plan: isPro(user) ? 'pro' : 'free',
      planExpiresAt: user.planExpiresAt,
      preferredLevel: user.preferredLevel,
      points: user.points || 0,
      badges: user.badges || [],
      rank,
      lessonsCompleted: user.completedLessons?.length || 0,
      waecStats: user.waecStats || { attempted: 0, correct: 0 },
      aiCourses: {
        used: usage.count,
        limit: quota.limit,
        remaining: quota.remaining,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/gamification/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const top = await User.find({ points: { $gt: 0 } })
      .select('name username profilePicture points badges')
      .sort({ points: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      leaderboard: top.map((u, i) => ({
        rank: i + 1,
        name: u.name || u.username,
        profilePicture: u.profilePicture,
        points: u.points,
        badgeCount: u.badges?.length || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/gamification/complete-lesson  { userId, courseId, lessonId }
// Marks a lesson complete once and awards points.
export const completeLesson = async (req, res, next) => {
  try {
    const { userId, courseId, lessonId } = req.body;
    if (!userId || !courseId || !lessonId) {
      return next(errorHandler(400, 'userId, courseId and lessonId are required'));
    }
    if (req.userId !== userId) {
      return next(errorHandler(403, 'Forbidden'));
    }

    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    const already = (user.completedLessons || []).some(
      (l) => l.courseId === courseId && l.lessonId === lessonId
    );
    if (already) {
      return res.status(200).json({ success: true, alreadyCompleted: true, points: user.points });
    }

    user.completedLessons.push({ courseId, lessonId });
    await user.save();

    const result = await awardPoints(userId, POINTS.COMPLETE_LESSON);

    res.status(200).json({
      success: true,
      alreadyCompleted: false,
      points: result.points,
      newBadges: result.newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/gamification/waec-attempt  { userId, correct, total }
// Records a WAEC practice round and awards points for correct answers.
export const recordWaecAttempt = async (req, res, next) => {
  try {
    const { userId, correct = 0, total = 0 } = req.body;
    if (!userId) return next(errorHandler(400, 'userId is required'));
    if (req.userId !== userId) return next(errorHandler(403, 'Forbidden'));

    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    user.waecStats.attempted = (user.waecStats.attempted || 0) + total;
    user.waecStats.correct = (user.waecStats.correct || 0) + correct;
    await user.save();

    let result = { points: user.points, newBadges: [] };
    if (correct > 0) {
      result = await awardPoints(userId, correct * POINTS.WAEC_CORRECT);
    }

    res.status(200).json({
      success: true,
      points: result.points,
      newBadges: result.newBadges,
      waecStats: user.waecStats,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/gamification/preferred-level  { userId, preferredLevel }
export const setPreferredLevel = async (req, res, next) => {
  try {
    const { userId, preferredLevel } = req.body;
    if (!userId || !['JHS', 'SHS', 'Standard'].includes(preferredLevel)) {
      return next(errorHandler(400, 'Valid userId and preferredLevel (JHS, SHS, Standard) are required'));
    }
    if (req.userId !== userId) return next(errorHandler(403, 'Forbidden'));
    const user = await User.findByIdAndUpdate(userId, { preferredLevel }, { new: true });
    if (!user) return next(errorHandler(404, 'User not found'));
    res.status(200).json({ success: true, preferredLevel: user.preferredLevel });
  } catch (error) {
    next(error);
  }
};
