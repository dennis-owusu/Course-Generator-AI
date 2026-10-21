import LiveClass from '../models/liveClass.model.js';
import Content from '../models/content.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

const generateRoomName = () => {
  const prefix = 'nursehub';
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${prefix}-${suffix}`;
};

// POST /api/live-classes
export const createLiveClass = async (req, res, next) => {
  try {
    const { title, description, course, startTime, endTime } = req.body;
    if (!title || !course || !startTime || !endTime) {
      return next(errorHandler(400, 'Title, course, startTime, and endTime are required'));
    }

    const courseDoc = await Content.findById(course);
    if (!courseDoc) return next(errorHandler(404, 'Course not found'));

    // Verified teachers can create live classes for courses they own or are assigned to
    const isOwner = courseDoc.createdBy?.toString() === req.userId;
    const isAssigned = (courseDoc.assignedTeachers || []).some(id => id.toString() === req.userId);
    if (!isOwner && !isAssigned && req.userRole !== 'admin') {
      return next(errorHandler(403, 'You can only create live classes for courses you teach'));
    }

    const teacher = await User.findById(req.userId);
    if (teacher.role === 'teacher' && teacher.teacherStatus !== 'verified') {
      return next(errorHandler(403, 'Your teacher account is pending verification'));
    }

    const liveClass = new LiveClass({
      title,
      description,
      course,
      teacher: req.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      meetingRoom: generateRoomName(),
    });
    await liveClass.save();

    res.status(201).json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// GET /api/live-classes
export const getLiveClasses = async (req, res, next) => {
  try {
    const { courseId, upcoming } = req.query;
    const filter = { isActive: true };

    if (courseId) filter.course = courseId;
    if (req.userRole === 'teacher') filter.teacher = req.userId;

    if (upcoming === 'true') {
      filter.endTime = { $gte: new Date() };
    }

    const liveClasses = await LiveClass.find(filter)
      .populate('course', 'title')
      .populate('teacher', 'name username')
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, liveClasses });
  } catch (error) {
    next(error);
  }
};

// GET /api/live-classes/:id
export const getLiveClassById = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('course', 'title')
      .populate('teacher', 'name username');

    if (!liveClass) return next(errorHandler(404, 'Live class not found'));

    const meetingUrl = `https://meet.jit.si/${liveClass.meetingRoom}#config.startWithVideoMuted=false&config.startWithAudioMuted=true&config.prejoinPageEnabled=false`;

    res.status(200).json({ success: true, liveClass: { ...liveClass.toObject(), meetingUrl } });
  } catch (error) {
    next(error);
  }
};

// POST /api/live-classes/:id/recording
export const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) return next(errorHandler(400, 'No recording uploaded'));

    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return next(errorHandler(404, 'Live class not found'));
    if (liveClass.teacher.toString() !== req.userId && req.userRole !== 'admin') {
      return next(errorHandler(403, 'Forbidden'));
    }

    liveClass.recordingUrl = `/uploads/recordings/${req.file.filename}`;
    liveClass.recordingMimeType = req.file.mimetype;
    liveClass.recordingStatus = 'available';
    await liveClass.save();

    res.status(200).json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// POST /api/live-classes/:id/attendance
export const markAttendance = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return next(errorHandler(404, 'Live class not found'));

    if (!liveClass.attendees.includes(req.userId)) {
      liveClass.attendees.push(req.userId);
      await liveClass.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
