import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser } from '@/middleware/requireUser';
import { mockDB } from '@/lib/mockDB';

const router: ExpressRouter = Router();

router.use(requireUser);

// POST /api/v1/orgs { name }
router.post('/', (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'recruiter') return res.status(403).json({ error: 'Only recruiters can create organizations' });
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name required' });
  const org = (mockDB as any).createOrganization(name, user.id);
  res.status(201).json({ org });
});

// GET /api/v1/orgs
router.get('/', (req, res) => {
  const user = (req as any).user;
  const list = (mockDB as any).listUserOrganizations(user.id);
  res.json({ organizations: list });
});

// GET /api/v1/orgs/:id/members
router.get('/:id/members', (req, res) => {
  const user = (req as any).user;
  const orgId = req.params.id;
  // Simple membership check
  const orgs = (mockDB as any).listUserOrganizations(user.id) as any[];
  if (!orgs.some(o => o.id === orgId)) return res.status(403).json({ error: 'Not a member' });
  const members = (mockDB as any).listOrgMembers(orgId);
  res.json({ members });
});

export { router as orgsRouter };




