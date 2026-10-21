import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup.js';

let app;

describe('Authentication API', () => {
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

  it('should register a new student', async () => {
    const res = await supertest(app).post('/api/auth/signup').send({
      username: 'student1',
      email: 'student1@test.edu',
      password: 'Password123!',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'User created successfully');
  });

  it('should reject signup with missing password', async () => {
    const res = await supertest(app).post('/api/auth/signup').send({
      username: 'student2',
      email: 'student2@test.edu',
    });
    assert.equal(res.status, 400);
  });

  it('should login and set httpOnly cookie', async () => {
    await supertest(app).post('/api/auth/signup').send({
      username: 'student3',
      email: 'student3@test.edu',
      password: 'Password123!',
    });
    const res = await supertest(app).post('/api/auth/signin').send({
      email: 'student3@test.edu',
      password: 'Password123!',
    });
    assert.equal(res.status, 200);
    assert.ok(res.headers['set-cookie']);
    assert.ok(res.headers['set-cookie'][0].includes('HttpOnly'));
  });

  it('should reject invalid credentials', async () => {
    const res = await supertest(app).post('/api/auth/signin').send({
      email: 'nobody@test.edu',
      password: 'wrong',
    });
    if (res.status !== 404) {
      console.log('signin nobody body:', res.status, res.body);
    }
    assert.equal(res.status, 404);
  });

  it('should return current user when authenticated', async () => {
    await supertest(app).post('/api/auth/signup').send({
      username: 'student4',
      email: 'student4@test.edu',
      password: 'Password123!',
    });
    const login = await supertest(app).post('/api/auth/signin').send({
      email: 'student4@test.edu',
      password: 'Password123!',
    });
    const cookie = login.headers['set-cookie'];
    assert.ok(cookie);
    const me = await supertest(app).get('/api/auth/me').set('Cookie', cookie);
    assert.equal(me.status, 200);
    assert.equal(me.body.success, true);
    assert.equal(me.body.user.email, 'student4@test.edu');
  });
});
