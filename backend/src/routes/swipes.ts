import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser, requireRole } from '@/middleware/requireUser';
import { swipeRateLimit } from '@/middleware/rateLimit';
import { 
  createSwipe, 
  getMySwipes, 
  getSwipeStats 
} from '@/controllers/swipes.controller';
import { mockDB } from '@/lib/mockDB';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/swipes - Get user's swipe history
router.get('/', getMySwipes);

// GET /api/v1/swipes/stats - Get user's swipe statistics
router.get('/stats', getSwipeStats);

// POST /api/v1/swipes - Create new swipe (recruiters only in dev)
router.post('/', requireRole('recruiter'), swipeRateLimit, createSwipe);

// GET /api/v1/swipes/feed - Recruiter feed of candidate profiles (mock/dev)
router.get('/feed', (req, res) => {
  const user = (req as any).user;
  console.log('🔍 Feed request from user:', { userId: user?.id, role: user?.role });
  
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  if (user.role !== 'recruiter') {
    res.status(403).json({ error: 'Only recruiters can view candidate feed' });
    return;
  }
  // Optional basic filters; merge with saved filters
  const saved = (mockDB as any).getRecruiterFilters(user.id) || {};
  const { skills = '', location = '', minYOE, maxYOE } = req.query as any;
  const skillsArr = String(skills || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const merged = {
    skills: (skillsArr.length ? skillsArr : (saved.skills || [])),
    location: String(location || saved.location || ''),
    minYOE: minYOE ? Number(minYOE) : (typeof saved.minYOE === 'number' ? saved.minYOE : undefined),
    maxYOE: maxYOE ? Number(maxYOE) : (typeof saved.maxYOE === 'number' ? saved.maxYOE : undefined)
  };
  console.log('🔎 Merged filters:', merged);
  const search = (mockDB as any).searchCandidates(merged);
  // Exclude matched & cooldown
  const filtered = search.filter((row: any) => {
    const candidateId = row.profile.userId;
    const matched = (mockDB as any).listMatchesForUser(user.id, 'recruiter').some((m: any) => m.candidateUserId === candidateId);
    const onCooldown = (mockDB as any).isCandidateUnderCooldown(candidateId, user.id);
    return !matched && !onCooldown;
  });
  // Apply strict filters (AND logic) so UI filters actually narrow results
  const mergedSkills: string[] = Array.isArray(merged.skills) ? merged.skills.map((s: string) => String(s).trim()).filter(Boolean) : [];
  const lc = String(merged.location || '').toLowerCase();
  const minVal = typeof merged.minYOE === 'number' && !Number.isNaN(merged.minYOE) ? merged.minYOE : undefined;
  const maxVal = typeof merged.maxYOE === 'number' && !Number.isNaN(merged.maxYOE) ? merged.maxYOE : undefined;
  const strict = filtered.filter((row: any) => {
    const p = row.profile as any;
    const profileSkills = (p.skills || []).map((x: string) => String(x).toLowerCase());
    const skillsOk = mergedSkills.length === 0 || mergedSkills.some((s: string) => {
      const needle = String(s).toLowerCase();
      return profileSkills.some((ps: string) => ps.includes(needle));
    });
    const locationOk = !lc || String(p.location || '').toLowerCase().includes(lc);
    const yoe = typeof p.yoe === 'number' ? p.yoe : (Number(p.yoe) || 0);
    const minOk = minVal === undefined || yoe >= minVal;
    const maxOk = maxVal === undefined || yoe <= maxVal;
    return skillsOk && locationOk && minOk && maxOk;
  });
  const allProfiles: Array<{ userId: string; title: string; skills: string[]; location: string; avatarUrl?: string; about?: string; experiences?: any[] }>
    = strict.slice(0, 50).map((x: any) => x.profile as any);
  console.log('✅ After strict filter count:', strict.length);
  console.log('🔍 All candidate profiles found:', allProfiles.length, allProfiles.map(p => ({ userId: p.userId, title: p.title })));
  
  const list = allProfiles.map((p) => ({
    userId: p.userId,
    title: p.title,
    skills: p.skills,
    location: p.location,
    avatarUrl: p.avatarUrl,
    about: p.about,
    experiences: Array.isArray(p.experiences) ? p.experiences : [],
  }));
  
  console.log('✅ Sending real profiles to recruiter:', list);
  res.json({ candidates: list });
});

// GET /api/v1/swipes/filters - get saved recruiter filters
router.get('/filters', (req, res) => {
  const user = (req as any).user;
  if (!user || user.role !== 'recruiter') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const filters = (mockDB as any).getRecruiterFilters(user.id) || {};
  res.json({ filters });
});

// PUT /api/v1/swipes/filters - update saved recruiter filters
router.put('/filters', (req, res) => {
  const user = (req as any).user;
  if (!user || user.role !== 'recruiter') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const { skills, location, minYOE, maxYOE } = req.body || {};
  const clean = {
    skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? String(skills).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined),
    location: typeof location === 'string' ? location : undefined,
    minYOE: typeof minYOE === 'number' ? minYOE : (typeof minYOE === 'string' && minYOE.trim() ? Number(minYOE) : undefined),
    maxYOE: typeof maxYOE === 'number' ? maxYOE : (typeof maxYOE === 'string' && maxYOE.trim() ? Number(maxYOE) : undefined),
  } as any;
  const saved = (mockDB as any).setRecruiterFilters(user.id, clean);
  res.json({ message: 'Filters saved', filters: saved });
});

export { router as swipesRouter };
