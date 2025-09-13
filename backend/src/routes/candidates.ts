import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser, requireRole } from '@/middleware/requireUser';
import { mockDB } from '@/lib/mockDB';

const router: ExpressRouter = Router();

router.use(requireUser);

// GET /api/v1/candidates/search?skills=ts,react&location=...&minYOE=1&maxYOE=4&page=1&pageSize=20
router.get('/search', requireRole('recruiter'), (req, res) => {
  const { skills = '', location = '', minYOE, maxYOE, page = 1, pageSize = 20 } = req.query as any;
  const skillsArr = String(skills || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const items = (mockDB as any).searchCandidates({ skills: skillsArr, location: String(location || ''), minYOE: minYOE ? Number(minYOE) : undefined, maxYOE: maxYOE ? Number(maxYOE) : undefined });
  const start = (Number(page) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  const slice = items.slice(start, end);
  res.json({
    items: slice.map((r: any) => ({ userId: r.profile.userId, title: r.profile.title, skills: r.profile.skills, location: r.profile.location, avatarUrl: r.profile.avatarUrl, score: r.score })),
    total: items.length,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

export { router as candidatesRouter };




