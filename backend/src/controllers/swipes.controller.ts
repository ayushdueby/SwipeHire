import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { Swipe } from '@/models/Swipe';
import { Match } from '@/models/Match';
import { Job } from '@/models/Job';
import { CandidateProfile } from '@/models/CandidateProfile';
import { swipeSchema } from '@/utils/validators';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { trackSwipeMade, trackMatchCreated } from '@/utils/analytics';
import { isValidObjectId } from 'mongoose';
import { mockDB } from '@/lib/mockDB';

export const createSwipe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const fromUserId = req.user.id;
  const userRole = req.user.role;
  const swipeData = req.body;

  // Validate swipe data
  const validatedData = swipeSchema.parse(swipeData);
  const { targetType, targetId, dir } = validatedData;

  // Validate swipe logic based on user role
  if (userRole === 'candidate' && targetType !== 'job') {
    throw createError('Candidates can only swipe on jobs', 400);
  }

  if (userRole === 'recruiter' && targetType !== 'candidate') {
    throw createError('Recruiters can only swipe on candidates', 400);
  }

  // Mock mode path
  if (!isValidObjectId(fromUserId)) {
    const { targetType, targetId, dir } = validatedData;
    console.log('🔄 Creating swipe in mock mode:', { fromUserId, targetType, targetId, dir });
    const { swipe, match } = mockDB.createSwipe(fromUserId, targetType, String(targetId), dir);
    console.log('✅ Swipe created:', { swipe: swipe.id, match: match?.id });
    return res.status(201).json({
      message: 'Swipe recorded successfully (mock mode)',
      swipe,
      ...(match ? { match, isNewMatch: true } : {})
    });
  }

  // Check if user has already swiped on this target
  const existingSwipe = await Swipe.findOne({
    fromUserId,
    targetType,
    targetId
  });

  if (existingSwipe) {
    throw createError('You have already swiped on this target', 409);
  }

  // Verify target exists
  if (targetType === 'job') {
    const job = await Job.findById(targetId);
    if (!job) {
      throw createError('Job not found', 404);
    }
    if (job.status !== 'open') {
      throw createError('Job is no longer open', 400);
    }
  } else if (targetType === 'candidate') {
    const candidateProfile = await CandidateProfile.findById(targetId);
    if (!candidateProfile) {
      throw createError('Candidate not found', 404);
    }
  }

  // Create the swipe
  const swipe = new Swipe({
    fromUserId,
    targetType,
    targetId,
    dir
  });

  await swipe.save();

  // Track swipe analytics
  await trackSwipeMade(fromUserId, {
    actorRole: userRole,
    targetType,
    dir
  });

  let match = null;
  let candidateUserId: string | undefined;
  let recruiterUserId: string | undefined;
  let jobId: string | undefined;

  // Check for mutual right swipe to create a match
  if (dir === 'right') {
    let isMatch = false;

    if (userRole === 'candidate' && targetType === 'job') {
      // Candidate swiped right on job, check if recruiter swiped right on candidate
      const job = await Job.findById(targetId);
      if (!job) {
        throw createError('Job not found', 404);
      }

      recruiterUserId = job.recruiterId.toString();
      candidateUserId = fromUserId;
      jobId = targetId;

      // Find candidate profile to get the profile ID for recruiter's swipe check
      const candidateProfile = await CandidateProfile.findOne({ userId: candidateUserId });
      if (!candidateProfile) {
        throw createError('Candidate profile not found', 404);
      }

      const recruiterSwipe = await Swipe.findOne({
        fromUserId: recruiterUserId,
        targetType: 'candidate',
        targetId: candidateProfile._id,
        dir: 'right'
      });

      isMatch = !!recruiterSwipe;

    } else if (userRole === 'recruiter' && targetType === 'candidate') {
      // Recruiter swiped right on candidate, check if candidate swiped right on any of recruiter's jobs
      const candidateProfile = await CandidateProfile.findById(targetId);
      if (!candidateProfile) {
        throw createError('Candidate profile not found', 404);
      }

      candidateUserId = candidateProfile.userId.toString();
      recruiterUserId = fromUserId;

      // Find recruiter's jobs
      const recruiterJobs = await Job.find({ recruiterId: recruiterUserId, status: 'open' });
      
      // Check if candidate swiped right on any of these jobs
      const candidateSwipes = await Swipe.find({
        fromUserId: candidateUserId,
        targetType: 'job',
        targetId: { $in: recruiterJobs.map(job => job._id) },
        dir: 'right'
      });

      if (candidateSwipes.length > 0) {
        // Use the most recent job that the candidate swiped right on
        const latestSwipe = candidateSwipes.sort((a, b) => b.ts.getTime() - a.ts.getTime())[0];
        jobId = latestSwipe!.targetId.toString();
        isMatch = true;
      }
    }

    // Create match if mutual right swipe
    if (isMatch && candidateUserId && recruiterUserId && jobId) {
      try {
        match = new Match({
          candidateUserId,
          recruiterUserId,
          jobId
        });

        await match.save();
        await match.populate(['candidateUserId', 'recruiterUserId', 'jobId']);

        // Track match creation
        await trackMatchCreated(candidateUserId, recruiterUserId, jobId);

      } catch (error: any) {
        // Handle duplicate match error gracefully
        if (error.code === 11000) {
          console.log('Match already exists, ignoring duplicate');
        } else {
          throw error;
        }
      }
    }
  }

  res.status(201).json({
    message: 'Swipe recorded successfully',
    swipe: {
      id: swipe._id,
      fromUserId: swipe.fromUserId,
      targetType: swipe.targetType,
      targetId: swipe.targetId,
      dir: swipe.dir,
      ts: swipe.ts
    },
    ...(match && { 
      match: {
        id: match._id,
        candidateUserId: match.candidateUserId,
        recruiterUserId: match.recruiterUserId,
        jobId: match.jobId,
        ts: match.ts
      },
      isNewMatch: true
    })
  });
});

export const getMySwipes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const fromUserId = req.user.id;
  const { page = 1, pageSize = 20, targetType } = req.query;

  // In mock/dev mode, return swipes from mockDB
  if (!isValidObjectId(fromUserId)) {
    const allSwipes = mockDB.getSwipesForUser(fromUserId);
    const filteredSwipes = targetType ? allSwipes.filter(s => s.targetType === targetType) : allSwipes;
    const sortedSwipes = filteredSwipes.sort((a, b) => b.ts.getTime() - a.ts.getTime());
    const paginatedSwipes = sortedSwipes.slice((Number(page) - 1) * Number(pageSize), Number(page) * Number(pageSize));
    
    return res.json({
      swipes: paginatedSwipes.map(s => ({
        id: s.id,
        fromUserId: s.fromUserId,
        targetType: s.targetType,
        targetId: s.targetId,
        dir: s.dir,
        ts: s.ts
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: filteredSwipes.length,
        totalPages: Math.ceil(filteredSwipes.length / Number(pageSize)),
        hasNext: Number(page) * Number(pageSize) < filteredSwipes.length,
        hasPrev: Number(page) > 1
      }
    });
  }

  const filter: any = { fromUserId };
  if (targetType) {
    filter.targetType = targetType;
  }

  const skip = (Number(page) - 1) * Number(pageSize);

  const [swipes, total] = await Promise.all([
    Swipe.find(filter)
      .sort({ ts: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean(),
    Swipe.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / Number(pageSize));

  res.json({
    swipes,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    }
  });
});

export const getSwipeStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const fromUserId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // In mock/dev mode, avoid casting invalid ObjectIds
  if (!isValidObjectId(fromUserId)) {
    const stats = mockDB.getSwipeStatsForUser(fromUserId);
    return res.json({ stats });
  }

  const [totalSwipes, todaySwipes, rightSwipes, leftSwipes] = await Promise.all([
    Swipe.countDocuments({ fromUserId }),
    Swipe.countDocuments({ fromUserId, ts: { $gte: today } }),
    Swipe.countDocuments({ fromUserId, dir: 'right' }),
    Swipe.countDocuments({ fromUserId, dir: 'left' })
  ]);

  res.json({
    stats: {
      total: totalSwipes,
      today: todaySwipes,
      rightSwipes,
      leftSwipes,
      dailyLimit: 100,
      remainingToday: Math.max(0, 100 - todaySwipes)
    }
  });
});
