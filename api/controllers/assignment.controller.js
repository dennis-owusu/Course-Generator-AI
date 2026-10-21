import Assignment from '../models/assignment.model.js';
import Submission from '../models/submission.model.js';
import Content from '../models/content.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { createNotification } from './notification.controller.js';

// GET /api/assignments?status=...&studentId=...
export const getAssignments = async (req, res, next) => {
  try {
    const { status, studentId, courseId } = req.query;
    const filter = { isPublished: true };
    if (courseId) filter.course = courseId;

    const assignments = await Assignment.find(filter).populate('course', 'title').sort({ dueDate: 1 });

    // If studentId provided, join with their submission status
    let result = assignments;
    if (studentId) {
      const submissions = await Submission.find({ student: studentId, assignment: { $in: assignments.map(a => a._id) } });
      const subMap = new Map(submissions.map(s => [s.assignment.toString(), s]));
      result = assignments.map(a => {
        const sub = subMap.get(a._id.toString());
        let derivedStatus = 'Pending';
        if (sub) {
          derivedStatus = sub.status === 'graded' ? 'Graded' : 'Submitted';
        }
        return {
          ...a.toObject(),
          status: status ? (derivedStatus === status ? derivedStatus : null) : derivedStatus,
          submission: sub || null,
        };
      }).filter(a => !status || a.status);
    }

    res.status(200).json({ success: true, assignments: result });
  } catch (error) {
    next(error);
  }
};

// POST /api/assignments — teacher/admin only
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, course, term, type, totalPoints, dueDate } = req.body;
    if (!title || !course || !term || !type || !totalPoints || !dueDate) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const assignment = new Assignment({
      title,
      description,
      course,
      term,
      type,
      totalPoints,
      dueDate: new Date(dueDate),
      createdBy: req.userId,
    });
    await assignment.save();
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// POST /api/assignments/:id/submit
export const submitAssignment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const assignmentId = req.params.id;
    const studentId = req.userId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(errorHandler(404, 'Assignment not found'));

    const isLate = new Date() > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmission) {
      return next(errorHandler(400, 'Late submissions are not allowed'));
    }

    const filter = { assignment: assignmentId, student: studentId };
    const update = {
      content,
      submittedAt: new Date(),
      isLate,
      status: 'submitted',
    };

    const submission = await Submission.findOneAndUpdate(filter, update, { upsert: true, new: true });

    // Notify course teacher(s)
    const assignmentDoc = await Assignment.findById(assignmentId).populate('course', 'createdBy title');
    if (assignmentDoc?.course?.createdBy) {
      await createNotification({
        recipient: assignmentDoc.course.createdBy,
        type: 'assignment_submitted',
        title: 'New submission',
        message: 'A student submitted an assignment.',
        link: `/dashboard/assignments`,
        metadata: { assignmentId, studentId },
      });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};

// POST /api/assignments/:id/grade — teacher/admin only
export const gradeSubmission = async (req, res, next) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignmentId = req.params.id;

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: studentId },
      {
        grade,
        feedback,
        status: 'graded',
        gradedBy: req.userId,
        gradedAt: new Date(),
      },
      { new: true }
    );

    if (!submission) return next(errorHandler(404, 'Submission not found'));

    // Notify student
    await createNotification({
      recipient: studentId,
      type: 'graded',
      title: 'Assignment graded',
      message: `Your assignment has been graded. Grade: ${grade}/${submission.assignment?.totalPoints || ''}`,
      link: `/dashboard/assignments`,
      metadata: { assignmentId, grade },
    });

    res.status(200).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};
