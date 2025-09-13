import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser } from '@/middleware/requireUser';
import { messageRateLimit } from '@/middleware/rateLimit';
import { 
  getMessages, 
  sendMessage, 
  getMessageStats 
} from '@/controllers/messages.controller';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/messages - Get messages for a match
router.get('/', getMessages);

// GET /api/v1/messages/stats - Get user's message statistics
router.get('/stats', getMessageStats);

// POST /api/v1/messages - Send new message (with rate limiting)
router.post('/', messageRateLimit, sendMessage);

export { router as messagesRouter };
