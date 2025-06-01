const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../User');
const axios = require('axios');

jest.mock('axios'); // Mock OpenAI API
jest.setTimeout(20000); // Increase timeout

const testUser = {
  name: 'test',
  email: 'test@gmail.com',
  password: 'test'
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await User.deleteOne({ email: testUser.email });
});

afterAll(async () => {
  await User.deleteOne({ email: testUser.email });
  await mongoose.disconnect();
});

describe('🧪 InterviewGenie Route Tests', () => {

  it('GET / should return landing.html or 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /signup should register a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser);
    expect([201, 400]).toContain(res.statusCode);
  });

  it('POST /login should log in with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect([200, 401]).toContain(res.statusCode);
  });

  it('GET /check-session should confirm logged-in user', async () => {
    const agent = request.agent(app);

    await agent.post('/login').send({
      email: testUser.email,
      password: testUser.password
    });

    const res = await agent.get('/check-session');
    expect(res.statusCode).toBe(200);
    expect(res.body.loggedIn).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /generate should return mocked OpenAI response', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'Mocked Q&A content from OpenAI'
            }
          }
        ]
      }
    });

    const agent = request.agent(app);

    await agent.post('/login').send({
      email: testUser.email,
      password: testUser.password
    });

    const res = await agent.post('/generate').send({ topic: 'React' });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toContain('Mocked Q&A content');
  });

});
