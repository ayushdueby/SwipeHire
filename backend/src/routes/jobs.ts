import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser, requireRole } from '@/middleware/requireUser';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMyJobs 
} from '@/controllers/jobs.controller';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/jobs - Get all jobs (with filters)
router.get('/', getJobs);

// GET /api/v1/jobs/my - Get recruiter's own jobs
router.get('/my', requireRole('recruiter'), getMyJobs);

// POST /api/v1/jobs - Create new job (recruiter only)
router.post('/', requireRole('recruiter'), createJob);

// GET /api/v1/jobs/:id - Get job by ID
router.get('/:id', getJobById);

// PATCH /api/v1/jobs/:id - Update job (recruiter only, own jobs)
router.patch('/:id', requireRole('recruiter'), updateJob);

// DELETE /api/v1/jobs/:id - Delete job (recruiter only, own jobs)
router.delete('/:id', requireRole('recruiter'), deleteJob);

export { router as jobsRouter };
