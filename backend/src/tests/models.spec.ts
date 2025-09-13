import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { CandidateProfile } from '../models/CandidateProfile';
import { Job } from '../models/Job';
import { Swipe } from '../models/Swipe';

describe('Database Models', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key]?.deleteMany({});
    }
  });

  describe('User Model', () => {
    it('should create a valid user', async () => {
      const userData = {
        authUserId: 'test_auth_123',
        email: 'test@example.com',
        role: 'candidate' as const
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.authUserId).toBe(userData.authUserId);
    });

    it('should require authUserId to be unique', async () => {
      const userData = {
        authUserId: 'duplicate_auth_id',
        email: 'test1@example.com',
        role: 'candidate' as const
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User({
        ...userData,
        email: 'test2@example.com'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should require email to be unique', async () => {
      const email = 'duplicate@example.com';
      
      const user1 = new User({
        authUserId: 'auth_id_1',
        email,
        role: 'candidate' as const
      });
      await user1.save();

      const user2 = new User({
        authUserId: 'auth_id_2',
        email,
        role: 'recruiter' as const
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const user = new User({
        authUserId: 'test_auth_456',
        email: 'test@example.com',
        role: 'invalid_role' as any
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('CandidateProfile Model', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = new User({
        authUserId: 'test_candidate_123',
        email: 'candidate@example.com',
        role: 'candidate'
      });
      await testUser.save();
    });

    it('should create a valid candidate profile', async () => {
      const profileData = {
        userId: testUser._id,
        title: 'Software Developer',
        skills: ['JavaScript', 'React', 'Node.js'],
        yoe: 3,
        location: 'Bangalore',
        expectedCTC: 1200000,
        links: {
          github: 'https://github.com/testuser',
          linkedin: 'https://linkedin.com/in/testuser'
        }
      };

      const profile = new CandidateProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile._id).toBeDefined();
      expect(savedProfile.title).toBe(profileData.title);
      expect(savedProfile.skills).toHaveLength(3);
      expect(savedProfile.yoe).toBe(3);
      expect(savedProfile.lastActive).toBeDefined();
    });

    it('should validate required fields', async () => {
      const profile = new CandidateProfile({
        userId: testUser._id
        // Missing required fields
      });

      await expect(profile.save()).rejects.toThrow();
    });

    it('should validate skills array is not empty', async () => {
      const profile = new CandidateProfile({
        userId: testUser._id,
        title: 'Developer',
        skills: [], // Empty array should fail
        yoe: 2,
        location: 'Mumbai',
        expectedCTC: 1000000
      });

      await expect(profile.save()).rejects.toThrow();
    });

    it('should validate YOE range', async () => {
      const profile = new CandidateProfile({
        userId: testUser._id,
        title: 'Developer',
        skills: ['JavaScript'],
        yoe: -1, // Invalid negative value
        location: 'Mumbai',
        expectedCTC: 1000000
      });

      await expect(profile.save()).rejects.toThrow();
    });

    it('should validate GitHub URL format', async () => {
      const profile = new CandidateProfile({
        userId: testUser._id,
        title: 'Developer',
        skills: ['JavaScript'],
        yoe: 2,
        location: 'Mumbai',
        expectedCTC: 1000000,
        links: {
          github: 'invalid-url'
        }
      });

      await expect(profile.save()).rejects.toThrow();
    });
  });

  describe('Job Model', () => {
    let testRecruiter: any;

    beforeEach(async () => {
      testRecruiter = new User({
        authUserId: 'test_recruiter_123',
        email: 'recruiter@company.com',
        role: 'recruiter'
      });
      await testRecruiter.save();
    });

    it('should create a valid job', async () => {
      const jobData = {
        recruiterId: testRecruiter._id,
        title: 'Frontend Developer',
        stack: ['React', 'JavaScript', 'CSS'],
        minYoe: 2,
        location: 'Bangalore',
        remote: true,
        salaryBand: {
          min: 800000,
          max: 1200000
        },
        mustHaves: ['React experience', 'Problem solving'],
        description: 'We are looking for a skilled frontend developer...'
      };

      const job = new Job(jobData);
      const savedJob = await job.save();

      expect(savedJob._id).toBeDefined();
      expect(savedJob.title).toBe(jobData.title);
      expect(savedJob.status).toBe('open'); // Default status
      expect(savedJob.remote).toBe(true);
    });

    it('should validate salary band min <= max', async () => {
      const job = new Job({
        recruiterId: testRecruiter._id,
        title: 'Test Job',
        stack: ['JavaScript'],
        minYoe: 1,
        location: 'Mumbai',
        remote: false,
        salaryBand: {
          min: 1500000,
          max: 1000000 // Max < Min should fail
        },
        mustHaves: ['Experience'],
        description: 'Test job description'
      });

      await expect(job.save()).rejects.toThrow();
    });

    it('should require at least one skill in stack', async () => {
      const job = new Job({
        recruiterId: testRecruiter._id,
        title: 'Test Job',
        stack: [], // Empty stack should fail
        minYoe: 1,
        location: 'Mumbai',
        remote: false,
        salaryBand: {
          min: 1000000,
          max: 1500000
        },
        mustHaves: ['Experience'],
        description: 'Test job description'
      });

      await expect(job.save()).rejects.toThrow();
    });
  });

  describe('Swipe Model', () => {
    let testUser: any;
    let testJob: any;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        authUserId: 'test_user_123',
        email: 'user@example.com',
        role: 'candidate'
      });
      await testUser.save();

      // Create test recruiter for job
      const testRecruiter = new User({
        authUserId: 'test_recruiter_123',
        email: 'recruiter@company.com',
        role: 'recruiter'
      });
      await testRecruiter.save();

      // Create test job
      testJob = new Job({
        recruiterId: testRecruiter._id,
        title: 'Test Job',
        stack: ['JavaScript'],
        minYoe: 1,
        location: 'Bangalore',
        remote: false,
        salaryBand: { min: 1000000, max: 1500000 },
        mustHaves: ['Experience'],
        description: 'Test job'
      });
      await testJob.save();
    });

    it('should create a valid swipe', async () => {
      const swipeData = {
        fromUserId: testUser._id,
        targetType: 'job' as const,
        targetId: testJob._id,
        dir: 'right' as const
      };

      const swipe = new Swipe(swipeData);
      const savedSwipe = await swipe.save();

      expect(savedSwipe._id).toBeDefined();
      expect(savedSwipe.dir).toBe('right');
      expect(savedSwipe.targetType).toBe('job');
      expect(savedSwipe.ts).toBeDefined();
    });

    it('should prevent duplicate swipes', async () => {
      const swipeData = {
        fromUserId: testUser._id,
        targetType: 'job' as const,
        targetId: testJob._id,
        dir: 'right' as const
      };

      const swipe1 = new Swipe(swipeData);
      await swipe1.save();

      const swipe2 = new Swipe(swipeData);
      await expect(swipe2.save()).rejects.toThrow();
    });

    it('should validate direction enum', async () => {
      const swipe = new Swipe({
        fromUserId: testUser._id,
        targetType: 'job',
        targetId: testJob._id,
        dir: 'invalid_direction' as any
      });

      await expect(swipe.save()).rejects.toThrow();
    });

    it('should validate target type enum', async () => {
      const swipe = new Swipe({
        fromUserId: testUser._id,
        targetType: 'invalid_target' as any,
        targetId: testJob._id,
        dir: 'right'
      });

      await expect(swipe.save()).rejects.toThrow();
    });
  });
});
