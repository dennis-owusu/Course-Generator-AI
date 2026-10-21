import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import Content from '../models/content.model.js';
import Assignment from '../models/assignment.model.js';
import Notification from '../models/notification.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup.js';

let app;

async function createUser(role, suffix) {
  const hashed = await bcryptjs.hash('Password123!', 10);
  return User.create({
    username: `${role}${suffix}`,
    email: `${role}${suffix}@test.edu`,
    password: hashed,
    role,
  });
}

describe('Academic workflows', () => {
  before(async () => {
    await connectTestDB();
    const module = await import('../index.js');
    app = module.default;
  });

  after(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should create notification on assignment submission', async () => {
    const teacher = await createUser('teacher', '1');
    const student = await createUser('student', '1');
    const course = await Content.create({
      title: 'Nursing 101',
      description: 'Test course',
      level: 'Beginner',
      category: 'Nursing',
      learningGoal: 'Academic',
      estimatedDuration: 10,
      createdBy: teacher._id,
      modules: [],
    });
    const assignment = await Assignment.create({
      title: 'Test Assignment',
      course: course._id,
      term: '000000000000000000000000',
      type: 'Quiz',
      totalPoints: 10,
      dueDate: new Date(Date.now() + 86400000),
      createdBy: teacher._id,
      isPublished: true,
    });

    const agent = supertest.agent(app);
    await agent.post('/api/auth/signin').send({ email: student.email, password: 'Password123!' });
    const submitRes = await agent.post(`/api/assignments/${assignment._id}/submit`).send({ content: 'My answer' });
    assert.equal(submitRes.status, 200);

    const notifications = await Notification.find({ recipient: teacher._id });
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].type, 'assignment_submitted');
  });

  it('should forbid student from grading submissions', async () => {
    const teacher = await createUser('teacher', '2');
    const student = await createUser('student', '2');
    const course = await Content.create({
      title: 'Nursing 102',
      description: 'Test course',
      level: 'Beginner',
      category: 'Nursing',
      learningGoal: 'Academic',
      estimatedDuration: 10,
      createdBy: teacher._id,
      modules: [],
    });
    const assignment = await Assignment.create({
      title: 'Quiz',
      course: course._id,
      term: '000000000000000000000000',
      type: 'Quiz',
      totalPoints: 10,
      dueDate: new Date(Date.now() + 86400000),
      createdBy: teacher._id,
      isPublished: true,
    });

    const agent = supertest.agent(app);
    await agent.post('/api/auth/signin').send({ email: student.email, password: 'Password123!' });
    const res = await agent.post(`/api/assignments/${assignment._id}/grade`).send({
      studentId: student._id,
      grade: 10,
      feedback: 'Good',
    });
    assert.equal(res.status, 403);
  });
});
