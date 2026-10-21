import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
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

describe('Role-based access control', () => {
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

  it('should allow admin to create an assignment', async () => {
    const admin = await createUser('admin', '1');
    const agent = supertest.agent(app);
    await agent.post('/api/auth/signin').send({ email: admin.email, password: 'Password123!' });
    const res = await agent.post('/api/assignments').send({
      title: 'Test Assignment',
      course: '000000000000000000000000',
      term: '000000000000000000000000',
      type: 'Quiz',
      totalPoints: 10,
      dueDate: new Date(Date.now() + 86400000),
    });
    assert.equal(res.status, 201);
  });

  it('should allow teacher to create an assignment', async () => {
    const teacher = await createUser('teacher', '1');
    const agent = supertest.agent(app);
    await agent.post('/api/auth/signin').send({ email: teacher.email, password: 'Password123!' });
    const res = await agent.post('/api/assignments').send({
      title: 'Teacher Assignment',
      course: '000000000000000000000000',
      term: '000000000000000000000000',
      type: 'Essay',
      totalPoints: 20,
      dueDate: new Date(Date.now() + 86400000),
    });
    assert.equal(res.status, 201);
  });

  it('should forbid student from creating an assignment', async () => {
    const student = await createUser('student', '1');
    const agent = supertest.agent(app);
    await agent.post('/api/auth/signin').send({ email: student.email, password: 'Password123!' });
    const res = await agent.post('/api/assignments').send({
      title: 'Bad Assignment',
      course: '000000000000000000000000',
      term: '000000000000000000000000',
      type: 'Quiz',
      totalPoints: 10,
      dueDate: new Date(Date.now() + 86400000),
    });
    assert.equal(res.status, 403);
  });

  it('should reject unauthenticated assignment access', async () => {
    const res = await supertest(app).get('/api/assignments');
    if (res.status !== 401) console.log('unauth assignments body:', res.status, res.body);
    assert.equal(res.status, 401);
  });
});
