import User from '../models/user.model.js';

// Point values for gamified actions
export const POINTS = {
  COMPLETE_LESSON: 10,
  CREATE_COURSE: 20,
  FINISH_COURSE: 50,
  WAEC_CORRECT: 10,
};

// Free plan limits
export const FREE_AI_COURSES_PER_MONTH = 2;

// Badge definitions. `check` receives a context object and returns true when earned.
export const BADGES = [
  {
    id: 'first-course',
    name: 'First Steps',
    description: 'Created your first AI course',
    icon: '🎓',
    check: ({ coursesCreated }) => coursesCreated >= 1,
  },
  {
    id: 'course-creator',
    name: 'Course Creator',
    description: 'Created 3 AI courses',
    icon: '🛠️',
    check: ({ coursesCreated }) => coursesCreated >= 3,
  },
  {
    id: 'lesson-learner',
    name: 'Lesson Learner',
    description: 'Completed 10 lessons',
    icon: '📚',
    check: ({ lessonsCompleted }) => lessonsCompleted >= 10,
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Completed 25 lessons',
    icon: '🤓',
    check: ({ lessonsCompleted }) => lessonsCompleted >= 25,
  },
  {
    id: 'waec-warrior',
    name: 'WAEC Warrior',
    description: 'Answered 10 WAEC practice questions correctly',
    icon: '⚔️',
    check: ({ waecCorrect }) => waecCorrect >= 10,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Earned 100 points',
    icon: '🏅',
    check: ({ points }) => points >= 100,
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Earned 500 points',
    icon: '🏆',
    check: ({ points }) => points >= 500,
  },
];

const currentMonthKey = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

// Returns the user's monthly AI-course usage, resetting the counter when the month rolls over.
export const getMonthlyUsage = (user) => {
  const key = currentMonthKey();
  if (user.monthlyAiCourses?.month !== key) {
    return { month: key, count: 0 };
  }
  return { month: key, count: user.monthlyAiCourses.count || 0 };
};

export const isPro = (user) => {
  if (user.plan !== 'pro') return false;
  if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) return false;
  return true;
};

// Checks whether the user may generate another AI course this month.
// Returns { allowed, used, limit, remaining } — limit is null (unlimited) for PRO.
export const checkCourseQuota = (user) => {
  if (isPro(user)) {
    const usage = getMonthlyUsage(user);
    return { allowed: true, used: usage.count, limit: null, remaining: null };
  }
  const usage = getMonthlyUsage(user);
  const remaining = Math.max(0, FREE_AI_COURSES_PER_MONTH - usage.count);
  return {
    allowed: remaining > 0,
    used: usage.count,
    limit: FREE_AI_COURSES_PER_MONTH,
    remaining,
  };
};

// Increments the monthly AI course counter (persists the month rollover).
export const incrementCourseUsage = async (user) => {
  const usage = getMonthlyUsage(user);
  user.monthlyAiCourses = { month: usage.month, count: usage.count + 1 };
  await user.save();
  return user.monthlyAiCourses;
};

// Awards points and evaluates badge thresholds. Returns { points, newBadges }.
export const awardPoints = async (userId, amount, context = {}) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.points = (user.points || 0) + amount;

  const badgeContext = {
    points: user.points,
    lessonsCompleted: user.completedLessons?.length || 0,
    waecCorrect: user.waecStats?.correct || 0,
    coursesCreated: context.coursesCreated ?? 0,
  };

  const ownedIds = new Set((user.badges || []).map((b) => b.id));
  const newBadges = [];
  for (const badge of BADGES) {
    if (!ownedIds.has(badge.id) && badge.check(badgeContext)) {
      user.badges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
      newBadges.push(badge);
    }
  }

  await user.save();
  return { points: user.points, newBadges };
};
