import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { User } from '@/models/User';
import { CandidateProfile } from '@/models/CandidateProfile';
import { RecruiterProfile } from '@/models/RecruiterProfile';
import { candidateProfileSchema, recruiterProfileSchema } from '@/utils/validators';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { trackProfileCompleted, trackDailyActive } from '@/utils/analytics';
import { isValidObjectId } from 'mongoose';
import { mockDB } from '@/lib/mockDB';

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const role = req.user.role;

  // Track daily active user
  await trackDailyActive(userId, role);

  // In mock/dev mode the userId may not be a valid ObjectId. Avoid Mongoose casts.
  if (!isValidObjectId(userId)) {
    // Dev/mock mode: return stored mock profile based on role and shape it like DB
    if (role === 'candidate') {
      const p = mockDB.getCandidateProfile(userId);
      return res.json({ user: req.user, profile: p || null });
    } else if (role === 'recruiter') {
      const p = mockDB.getRecruiterProfile(userId);
      if (!p) return res.json({ user: req.user, profile: null });
      const shaped = {
        id: p.userId,
        userId: p.userId,
        companyName: p.companyName,
        hiringRole: p.hiringRole,
        recruiterTitle: (p as any).recruiterTitle,
        hiringExperience: p.hiringExperience || [],
        avatarUrl: p.avatarUrl,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      } as any;
      return res.json({ user: req.user, profile: shaped });
    }
  }

  if (role === 'candidate') {
    if (!isValidObjectId(userId)) {
      const profile = mockDB.getCandidateProfile(userId);
      return res.json({ user: req.user, profile: profile || null });
    }
    const profile = await CandidateProfile.findOne({ userId }).populate('userId', 'email role');
    
    res.json({
      user: req.user,
      profile: profile || null
    });
  } else if (role === 'recruiter') {
    if (!isValidObjectId(userId)) {
      const profile = mockDB.getRecruiterProfile(userId);
      return res.json({ user: req.user, profile: profile || null });
    }
    const profile = await RecruiterProfile.findOne({ userId }).populate('userId', 'email role');
    
    res.json({
      user: req.user,
      profile: profile || null
    });
  } else {
    throw createError('Invalid user role', 400);
  }
});

export const updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const role = req.user.role;
  const updateData = req.body;

  // Skip DB writes in mock mode to prevent cast errors
  if (!isValidObjectId(userId)) {
    if (role === 'candidate') {
      const saved = mockDB.upsertCandidateProfile(userId, updateData);
      return res.json({ message: 'Profile updated (mock mode)', profile: saved });
    } else {
      const saved = mockDB.upsertRecruiterProfile(userId, updateData);
      return res.json({ message: 'Profile updated (mock mode)', profile: saved });
    }
  }

  if (role === 'candidate') {
    // Validate candidate profile data
    const validatedData = candidateProfileSchema.parse(updateData);
    
    const profile = await CandidateProfile.findOneAndUpdate(
      { userId },
      { 
        ...validatedData,
        lastActive: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    ).populate('userId', 'email role');

    // Track profile completion
    await trackProfileCompleted(userId, 'candidate', validatedData);

    res.json({
      message: 'Candidate profile updated successfully',
      profile
    });

  } else if (role === 'recruiter') {
    // Validate recruiter profile data
    const validatedData = recruiterProfileSchema.parse(updateData);
    
    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId },
      validatedData,
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    ).populate('userId', 'email role');

    // Track profile completion
    await trackProfileCompleted(userId, 'recruiter', validatedData);

    res.json({
      message: 'Recruiter profile updated successfully',
      profile
    });

  } else {
    throw createError('Invalid user role', 400);
  }
});

export const deleteMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const role = req.user.role;

  // In mock mode there is nothing to delete in Mongo
  if (!isValidObjectId(userId)) {
    return res.json({
      message: 'User account deleted successfully (mock mode)'
    });
  }

  // Delete user profile
  if (role === 'candidate') {
    await CandidateProfile.findOneAndDelete({ userId });
  } else if (role === 'recruiter') {
    await RecruiterProfile.findOneAndDelete({ userId });
  }

  // Delete user record
  await User.findByIdAndDelete(userId);

  res.json({
    message: 'User account deleted successfully'
  });
});
