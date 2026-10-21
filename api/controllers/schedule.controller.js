import Schedule from '../models/schedule.model.js';
import { errorHandler } from '../utils/error.js';

export const getSchedules = async (req, res, next) => {
  try {
    const { courseId, from, to, type } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (type) filter.type = type;
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const schedules = await Schedule.find(filter)
      .populate('course', 'title')
      .populate('supervisor', 'name username')
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { title, course, term, type, startTime, endTime, location, supervisor, description } = req.body;
    if (!title || !course || !term || !type || !startTime || !endTime) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const schedule = new Schedule({
      title,
      course,
      term,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      supervisor,
      description,
      createdBy: req.userId,
    });
    await schedule.save();
    res.status(201).json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};
