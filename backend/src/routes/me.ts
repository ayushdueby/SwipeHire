import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser } from '@/middleware/requireUser';
import { mockDB } from '@/lib/mockDB';
import { getMe, updateMe, deleteMe } from '@/controllers/me.controller';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/me - Get current user profile
router.get('/', getMe);

// PUT /api/v1/me - Update current user profile
router.put('/', updateMe);

// DELETE /api/v1/me - Delete current user account
router.delete('/', deleteMe);

// PUT /api/v1/me/cooldown - recruiter-only setting for future unmatches
router.put('/cooldown', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.role !== 'recruiter') return res.status(403).json({ error: 'Only recruiters can set cooldown' });
  const days = Number(req.body?.cooldownDays);
  if (!Number.isFinite(days) || days < 1 || days > 90) return res.status(400).json({ error: 'cooldownDays must be 1–90' });
  (mockDB as any).setRecruiterCooldownDays(user.id, Math.round(days));
  res.json({ message: 'Cooldown updated', cooldownDays: Math.round(days) });
});

// PUT /api/v1/me/active-org { orgId }
router.put('/active-org', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const orgId = String(req.body?.orgId || '');
  try {
    (mockDB as any).setActiveOrg(user.id, orgId);
    res.json({ message: 'Active organization updated', orgId });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to set active org' });
  }
});

export { router as meRouter };
