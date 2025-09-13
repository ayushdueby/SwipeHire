import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { Message } from '@/models/Message';
import { Match } from '@/models/Match';
import { sendMessageSchema, getMessagesSchema } from '@/utils/validators';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { trackMessageSent } from '@/utils/analytics';
import { isValidObjectId } from 'mongoose';
import { mockDB } from '@/lib/mockDB';

export const getMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const query = getMessagesSchema.parse(req.query);
  const { matchId, limit, before } = query;

  // Verify user is part of the match (mock path)
  if (!isValidObjectId(userId)) {
    const userMatches = mockDB.listMatchesForUser(userId, userRole);
    const found = userMatches.find(m => m.id === matchId);
    if (!found) {
      throw createError('Match not found', 404);
    }
    const messages = mockDB.listMessages(matchId, limit);
    return res.json({ messages, hasMore: false });
  }

  // Verify user is part of the match
  const match = await Match.findById(matchId);
  if (!match) {
    throw createError('Match not found', 404);
  }

  const isUserInMatch = 
    (userRole === 'candidate' && match.candidateUserId.toString() === userId) ||
    (userRole === 'recruiter' && match.recruiterUserId.toString() === userId);

  if (!isUserInMatch) {
    throw createError('You do not have access to this match', 403);
  }

  // Build query filter
  const filter: any = { matchId };
  if (before) {
    filter.ts = { $lt: new Date(before) };
  }

  const messages = await Message.find(filter)
    .populate('senderId', 'email')
    .sort({ ts: -1 })
    .limit(limit)
    .lean();

  res.json({
    messages: messages.reverse(), // Return in ascending order (oldest first)
    hasMore: messages.length === limit
  });
});

export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const messageData = req.body;

  // Validate message data
  const validatedData = sendMessageSchema.parse(messageData);
  const { matchId, body } = validatedData;

  // Verify user is part of the match (mock path)
  if (!isValidObjectId(userId)) {
    const userMatches = mockDB.listMatchesForUser(userId, userRole);
    const found = userMatches.find(m => m.id === matchId);
    if (!found) {
      throw createError('Match not found', 404);
    }
    const message = mockDB.createMessage(matchId, userId, body);
    await trackMessageSent(userId, { length: body.length, matchId });
    return res.status(201).json({ message: 'Message sent successfully', data: message });
  }

  // Verify user is part of the match
  const match = await Match.findById(matchId);
  if (!match) {
    throw createError('Match not found', 404);
  }

  const isUserInMatch = 
    (userRole === 'candidate' && match.candidateUserId.toString() === userId) ||
    (userRole === 'recruiter' && match.recruiterUserId.toString() === userId);

  if (!isUserInMatch) {
    throw createError('You do not have access to this match', 403);
  }

  // Create message
  const message = new Message({
    matchId,
    senderId: userId,
    body: body.trim()
  });

  await message.save();
  await message.populate('senderId', 'email');

  // Track message analytics
  await trackMessageSent(userId, {
    length: body.length,
    matchId
  });

  res.status(201).json({
    message: 'Message sent successfully',
    data: message
  });
});

export const getMessageStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // In mock/dev mode, avoid casting invalid ObjectIds
  if (!isValidObjectId(userId)) {
    return res.json({
      stats: {
        total: 0,
        today: 0,
        dailyLimit: 1000,
        remainingToday: 1000
      }
    });
  }

  const [totalMessages, todayMessages] = await Promise.all([
    Message.countDocuments({ senderId: userId }),
    Message.countDocuments({ senderId: userId, ts: { $gte: today } })
  ]);

  res.json({
    stats: {
      total: totalMessages,
      today: todayMessages,
      dailyLimit: 1000, // Conservative limit for beta
      remainingToday: Math.max(0, 1000 - todayMessages)
    }
  });
});
