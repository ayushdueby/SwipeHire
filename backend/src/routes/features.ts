import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';

const router: ExpressRouter = Router();

// Simple feature flags endpoint (dev defaults)
router.get('/', (_req, res) => {
  res.json({
    features: {
      searchFeed: true,
      jobs: true,
      orgs: true,
      interviews: true,
      analytics: true,
      compliance: true,
    }
  });
});

export { router as featuresRouter };




