import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import { User } from '../models/User';
import { CandidateProfile } from '../models/CandidateProfile';
import { Job } from '../models/Job';
import { errorHandler } from '../middleware/errorHandler';

// Mock Clerk verification
jest.mock('@/lib/clerk', () => ({
  verifyClerkToken: jest.fn().mockResolvedValue({ sub: 'test_user_123' }),
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({
        id: 'test_user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }]
      })
    }
  }
}));

// Mock analytics
jest.mock('@/utils/analytics', () => ({
  trackUserSignUp: jest.fn(),
  trackProfileCompleted: jest.fn(),
  trackJobPosted: jest.fn(),
  trackSwipeMade: jest.fn(),
  trackMatchCreated: jest.fn(),
  trackMessageSent: jest.fn(),
  trackDailyActive: jest.fn()
}));

describe('API Routes', () => {
  let mongoServer: MongoMemoryServer;
  let app: express.Application;
  let testUser: any;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Express app with routes
    app = express();
    app.use(express.json());
    
    // Import routes after mocks are set
    const { meRouter } = await import('../routes/me');
    const { jobsRouter } = await import('../routes/jobs');
    
    app.use('/api/v1/me', meRouter);
    app.use('/api/v1/jobs', jobsRouter);
    app.use(errorHandler);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await CandidateProfile.deleteMany({});
    await Job.deleteMany({});

    // Create test user
    testUser = new User({
      authUserId: 'test_user_123',
      email: 'test@example.com',
      role: 'candidate'
    });
    await testUser.save();
  });

  describe('GET /api/v1/me', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/me')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('candidate');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/me', () => {
    it('should update candidate profile', async () => {
      const profileData = {
        title: 'Software Engineer',
        skills: ['JavaScript', 'React'],
        yoe: 2,
        location: 'Bangalore',
        expectedCTC: 1000000
      };

      const response = await request(app)
        .put('/api/v1/me')
        .set('Authorization', 'Bearer valid_token')
        .send(profileData);

      expect(response.status).toBe(200);
      expect(response.body.profile.title).toBe('Software Engineer');
      expect(response.body.profile.skills).toContain('JavaScript');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        skills: [],
        yoe: -1
      };

      const response = await request(app)
        .put('/api/v1/me')
        .set('Authorization', 'Bearer valid_token')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/jobs', () => {
    beforeEach(async () => {
      // Update test user to be a recruiter
      testUser.role = 'recruiter';
      await testUser.save();
    });

    it('should create a new job for recruiter', async () => {
      const jobData = {
        title: 'Frontend Developer',
        stack: ['React', 'JavaScript'],
        minYoe: 1,
        location: 'Mumbai',
        remote: true,
        salaryBand: {
          min: 800000,
          max: 1200000
        },
        mustHaves: ['React experience'],
        description: 'Looking for a frontend developer'
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', 'Bearer valid_token')
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.job.title).toBe('Frontend Developer');
      expect(response.body.job.stack).toContain('React');
    });

    it('should reject job creation for candidates', async () => {
      // Change user back to candidate
      testUser.role = 'candidate';
      await testUser.save();

      const jobData = {
        title: 'Test Job',
        stack: ['JavaScript'],
        minYoe: 0,
        location: 'Test City',
        remote: false,
        salaryBand: { min: 100000, max: 200000 },
        mustHaves: ['Experience'],
        description: 'Test job description'
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', 'Bearer valid_token')
        .send(jobData);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/jobs', () => {
    beforeEach(async () => {
      // Create a test job
      const job = new Job({
        recruiterId: testUser._id,
        title: 'Test Job',
        stack: ['JavaScript', 'Node.js'],
        minYoe: 2,
        location: 'Bangalore',
        remote: true,
        salaryBand: {
          min: 1000000,
          max: 1500000
        },
        mustHaves: ['JavaScript', 'Problem solving'],
        description: 'A test job for testing purposes',
        status: 'open'
      });
      await job.save();
    });

    it('should return paginated jobs list', async () => {
      const response = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.jobs[0].title).toBe('Test Job');
    });

    it('should filter jobs by location', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?location=Mumbai')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(0); // No jobs in Mumbai
    });

    it('should filter jobs by stack', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?stack=JavaScript')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
    });
  });
});
