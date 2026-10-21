import StudyGroup from '../models/studyGroup.model.js';
import { errorHandler } from '../utils/error.js';

export const getStudyGroups = async (req, res, next) => {
  try {
    const groups = await StudyGroup.find({ isActive: true })
      .populate('creator', 'name username')
      .populate('members', 'name username profilePicture')
      .sort({ createdAt: -1 });

    const result = groups.map(g => {
      const obj = g.toObject();
      obj.isMember = g.members.some(m => m._id.toString() === req.userId);
      return obj;
    });

    res.status(200).json({ success: true, groups: result });
  } catch (error) {
    next(error);
  }
};

export const createStudyGroup = async (req, res, next) => {
  try {
    const { name, description, topic, course, maxMembers } = req.body;
    if (!name) return next(errorHandler(400, 'Group name is required'));

    const group = new StudyGroup({
      name,
      description,
      topic,
      course,
      maxMembers: maxMembers || 30,
      creator: req.userId,
      members: [req.userId],
    });
    await group.save();
    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

export const joinStudyGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return next(errorHandler(404, 'Study group not found'));
    if (!group.isActive) return next(errorHandler(400, 'Group is no longer active'));
    if (group.members.includes(req.userId)) {
      return res.status(200).json({ success: true, alreadyJoined: true, group });
    }
    if (group.members.length >= group.maxMembers) {
      return next(errorHandler(400, 'Group is full'));
    }

    group.members.push(req.userId);
    await group.save();
    res.status(200).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};
