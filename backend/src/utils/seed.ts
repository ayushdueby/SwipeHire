import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { CandidateProfile } from '@/models/CandidateProfile';
import { RecruiterProfile } from '@/models/RecruiterProfile';
import { Job } from '@/models/Job';
import { Swipe } from '@/models/Swipe';
import { Match } from '@/models/Match';
import { Message } from '@/models/Message';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      CandidateProfile.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      Job.deleteMany({}),
      Swipe.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({})
    ]);

    // Create users
    console.log('👥 Creating users...');
    
    // Recruiter user
    const recruiterUser = new User({
      authUserId: 'test_recruiter_123',
      email: 'recruiter@techcorp.com',
      role: 'recruiter'
    });
    await recruiterUser.save();

    // Candidate user
    const candidateUser = new User({
      authUserId: 'test_candidate_456',
      email: 'developer@example.com',
      role: 'candidate'
    });
    await candidateUser.save();

    console.log('✅ Users created');

    // Create recruiter profile
    console.log('🏢 Creating recruiter profile...');
    const recruiterProfile = new RecruiterProfile({
      userId: recruiterUser._id,
      company: {
        name: 'TechCorp Solutions',
        domain: 'techcorp.com'
      },
      seatCount: 50,
      bookingUrl: 'https://calendly.com/techcorp-hiring'
    });
    await recruiterProfile.save();

    // Create candidate profile
    console.log('👩‍💻 Creating candidate profile...');
    const candidateProfile = new CandidateProfile({
      userId: candidateUser._id,
      title: 'Full Stack Developer',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      yoe: 3,
      location: 'Bangalore',
      expectedCTC: 1200000,
      links: {
        github: 'https://github.com/johndeveloper',
        linkedin: 'https://linkedin.com/in/johndeveloper'
      },
      lastActive: new Date()
    });
    await candidateProfile.save();

    console.log('✅ Profiles created');

    // Create jobs
    console.log('💼 Creating jobs...');
    
    const job1 = new Job({
      recruiterId: recruiterUser._id,
      title: 'Senior Full Stack Developer',
      stack: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      minYoe: 2,
      location: 'Bangalore',
      remote: true,
      salaryBand: {
        min: 1000000,
        max: 1500000
      },
      mustHaves: ['React experience', 'Node.js proficiency', 'Good communication'],
      description: 'Join our dynamic team as a Senior Full Stack Developer. You will work on cutting-edge projects using modern technologies and contribute to building scalable web applications.',
      status: 'open'
    });
    await job1.save();

    const job2 = new Job({
      recruiterId: recruiterUser._id,
      title: 'Frontend React Developer',
      stack: ['React', 'JavaScript', 'CSS', 'Redux'],
      minYoe: 1,
      location: 'Mumbai',
      remote: false,
      salaryBand: {
        min: 800000,
        max: 1200000
      },
      mustHaves: ['React expertise', 'CSS skills', 'Team collaboration'],
      description: 'We are looking for a passionate Frontend Developer to create amazing user interfaces and enhance user experience.',
      status: 'open'
    });
    await job2.save();

    console.log('✅ Jobs created');

    // Create swipes (mutual right swipes for matching)
    console.log('👆 Creating swipes...');
    
    // Candidate swipes right on job1
    const candidateSwipe = new Swipe({
      fromUserId: candidateUser._id,
      targetType: 'job',
      targetId: job1._id,
      dir: 'right'
    });
    await candidateSwipe.save();

    // Recruiter swipes right on candidate
    const recruiterSwipe = new Swipe({
      fromUserId: recruiterUser._id,
      targetType: 'candidate',
      targetId: candidateProfile._id,
      dir: 'right'
    });
    await recruiterSwipe.save();

    // Candidate swipes left on job2 (no match)
    const candidateSwipe2 = new Swipe({
      fromUserId: candidateUser._id,
      targetType: 'job',
      targetId: job2._id,
      dir: 'left'
    });
    await candidateSwipe2.save();

    console.log('✅ Swipes created');

    // Create match (since both swiped right)
    console.log('💝 Creating match...');
    
    const match = new Match({
      candidateUserId: candidateUser._id,
      recruiterUserId: recruiterUser._id,
      jobId: job1._id
    });
    await match.save();

    console.log('✅ Match created');

    // Create sample messages
    console.log('💬 Creating messages...');
    
    const message1 = new Message({
      matchId: match._id,
      senderId: recruiterUser._id,
      body: 'Hi! I saw your profile and I think you would be a great fit for our Senior Full Stack Developer position. Would you like to have a quick chat?'
    });
    await message1.save();

    // Wait a bit to simulate realistic timing
    await new Promise(resolve => setTimeout(resolve, 100));

    const message2 = new Message({
      matchId: match._id,
      senderId: candidateUser._id,
      body: 'Hello! Thank you for reaching out. I\'m definitely interested in learning more about the role. When would be a good time to connect?'
    });
    await message2.save();

    await new Promise(resolve => setTimeout(resolve, 100));

    const message3 = new Message({
      matchId: match._id,
      senderId: recruiterUser._id,
      body: 'Great! How about tomorrow at 3 PM IST? I can send you a calendar invite. Also, feel free to check out our company website at https://techcorp.com'
    });
    await message3.save();

    console.log('✅ Messages created');

    console.log(`
🎉 Database seeding completed successfully!

📊 Created:
   • 2 Users (1 recruiter, 1 candidate)
   • 2 Profiles
   • 2 Jobs
   • 3 Swipes
   • 1 Match
   • 3 Messages

🔑 Test Credentials:
   Recruiter: recruiter@techcorp.com (test_recruiter_123)
   Candidate: developer@example.com (test_candidate_456)

🌐 You can now test the application with these sample data!
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
