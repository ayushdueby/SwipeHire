import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { Match } from '@/models/Match';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { isValidObjectId } from 'mongoose';
import { mockDB } from '@/lib/mockDB';

export const getMatches = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { page = 1, pageSize = 20 } = req.query;

  // In mock/dev mode, return persisted mock matches
  if (!isValidObjectId(userId)) {
    console.log('🔍 Getting matches for user:', { userId, userRole });
    const raw = mockDB.listMatchesForUser(userId, userRole);
    console.log('📋 Raw matches found:', raw);
    const matches = raw.map(m => {
      const otherUserId = userRole === 'recruiter' ? m.candidateUserId : m.recruiterUserId;
      const profile = userRole === 'recruiter'
        ? mockDB.getCandidateProfile(otherUserId)
        : mockDB.getRecruiterProfile(otherUserId as any);
      const otherUser = mockDB.getUserBasicById(otherUserId);
      const displayName = otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email : '';
      console.log('👤 Profile for other user:', { otherUserId, profile, displayName });
      return {
        id: m.id,
        ts: m.ts,
        other: {
          userId: otherUserId,
          name: displayName,
          title: (profile as any)?.title || (profile as any)?.hiringRole || '',
          avatarUrl: (profile as any)?.avatarUrl,
        }
      } as any;
    });
    console.log('✅ Final matches:', matches);
    return res.json({
      matches,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: matches.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    });
  }

  // Build filter based on user role
  const filter: any = {};
  if (userRole === 'candidate') {
    filter.candidateUserId = userId;
  } else if (userRole === 'recruiter') {
    filter.recruiterUserId = userId;
  } else {
    throw createError('Invalid user role', 400);
  }

  const skip = (Number(page) - 1) * Number(pageSize);

  const [matches, total] = await Promise.all([
    Match.find(filter)
      .populate('candidateUserId', 'email')
      .populate('recruiterUserId', 'email')
      .populate('jobId', 'title location stack salaryBand')
      .sort({ ts: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean(),
    Match.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / Number(pageSize));

  return res.json({
    matches,
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

export const unmatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const matchId = req.params.id;

  if (!isValidObjectId(userId)) {
    // Remove from mock matches
    const ok = (mockDB as any).unmatchById(matchId);
    return res.json({ message: 'Unmatched successfully (mock mode)', removed: ok });
  }

  const match = await Match.findById(matchId);
  if (!match) {
    throw createError('Match not found', 404);
  }
  const allowed = (userRole === 'candidate' && match.candidateUserId.toString() === userId) ||
                  (userRole === 'recruiter' && match.recruiterUserId.toString() === userId);
  if (!allowed) throw createError('Forbidden', 403);

  await Match.findByIdAndDelete(matchId);
  return res.json({ message: 'Unmatched successfully' });
});

export const getMatchById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const matchId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const match = await Match.findById(matchId)
    .populate('candidateUserId', 'email')
    .populate('recruiterUserId', 'email')
    .populate('jobId', 'title location stack salaryBand description')
    .lean();

  if (!match) {
    throw createError('Match not found', 404);
  }

  // Verify user is part of this match
  const isUserInMatch = 
    (userRole === 'candidate' && match.candidateUserId._id.toString() === userId) ||
    (userRole === 'recruiter' && match.recruiterUserId._id.toString() === userId);

  if (!isUserInMatch) {
    throw createError('You do not have access to this match', 403);
  }

  return res.json({ match });
});

export const getMatchStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // In mock/dev mode, return zeros to avoid ObjectId casts
  if (!isValidObjectId(userId)) {
    const stats = mockDB.getMatchStatsForUser(userId, userRole);
    return res.json({ stats });
  }

  const filter: any = {};
  if (userRole === 'candidate') {
    filter.candidateUserId = userId;
  } else if (userRole === 'recruiter') {
    filter.recruiterUserId = userId;
  } else {
    throw createError('Invalid user role', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const [totalMatches, todayMatches, weekMatches] = await Promise.all([
    Match.countDocuments(filter),
    Match.countDocuments({ ...filter, ts: { $gte: today } }),
    Match.countDocuments({ ...filter, ts: { $gte: thisWeek } })
  ]);

  return res.json({
    stats: {
      total: totalMatches,
      today: todayMatches,
      thisWeek: weekMatches
    }
  });
});
