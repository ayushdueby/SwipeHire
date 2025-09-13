import { Router } from 'express';
import { register, login, logout, getMe } from '@/controllers/auth.controller';
import { requireUser } from '@/middleware/requireUser';
import { asyncHandler } from '@/middleware/errorHandler';
import { authRateLimit } from '@/middleware/rateLimit';

const router: Router = Router();

// Public routes (rate limiting disabled for testing)
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Protected routes
router.get('/me', requireUser, asyncHandler(getMe));
router.post('/logout', requireUser, asyncHandler(logout));

export default router;
