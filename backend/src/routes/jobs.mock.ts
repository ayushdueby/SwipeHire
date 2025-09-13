import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser, requireRole } from '@/middleware/requireUser';
import { mockDB } from '@/lib/mockDB';

const router: ExpressRouter = Router();

router.use(requireUser);

// POST /api/v1/jobs2 - recruiter only, active org required
router.post('/', requireRole('recruiter'), (req, res) => {
  const user = (req as any).user;
  const orgId = (mockDB as any).getActiveOrg(user.id);
  if (!orgId) return res.status(400).json({ error: 'Select an organization first' });
  const { title = '', location = '', minYOE = 0, maxYOE = 99, skills = [], description = '' } = req.body || {};
  const job = (mockDB as any).createJobV2(orgId, {
    title: String(title),
    location: String(location),
    minYOE: Number(minYOE),
    maxYOE: Number(maxYOE),
    skills: Array.isArray(skills) ? skills : String(skills).split(',').map((s: string) => s.trim()).filter(Boolean),
    description: String(description)
  });
  res.status(201).json({ job });
});

// GET /api/v1/jobs2/my - list jobs for active org
router.get('/my', requireRole('recruiter'), (req, res) => {
  const user = (req as any).user;
  const orgId = (mockDB as any).getActiveOrg(user.id);
  if (!orgId) return res.status(400).json({ error: 'Select an organization first' });
  const jobs = (mockDB as any).listJobsV2(orgId);
  res.json({ jobs });
});

// PATCH /api/v1/jobs2/:id
router.patch('/:id', requireRole('recruiter'), (req, res) => {
  const { id } = req.params;
  const updated = (mockDB as any).updateJobV2(id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: updated });
});

// POST /api/v1/jobs2/:id/close
router.post('/:id/close', requireRole('recruiter'), (req, res) => {
  const { id } = req.params;
  const ok = (mockDB as any).closeJobV2(id);
  if (!ok) return res.status(404).json({ error: 'Job not found' });
  res.json({ message: 'Closed' });
});

export { router as jobsMockRouter };




