import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser } from '@/middleware/requireUser';
import { 
  getMatches, 
  getMatchById, 
  getMatchStats,
  unmatch
} from '@/controllers/matches.controller';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/matches - Get user's matches
router.get('/', getMatches);

// GET /api/v1/matches/stats - Get user's match statistics
router.get('/stats', getMatchStats);

// GET /api/v1/matches/:id - Get match by ID
router.get('/:id', getMatchById);

// DELETE /api/v1/matches/:id - Unmatch
router.delete('/:id', unmatch);

export { router as matchesRouter };
