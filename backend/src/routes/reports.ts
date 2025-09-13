import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { requireUser } from '@/middleware/requireUser';
import { 
  createReport, 
  getMyReports, 
  getReportById,
  getAllReports,
  updateReportStatus
} from '@/controllers/reports.controller';

const router: ExpressRouter = Router();

// Apply authentication middleware to all routes
router.use(requireUser);

// GET /api/v1/reports - Get user's own reports
router.get('/', getMyReports);

// POST /api/v1/reports - Create new report
router.post('/', createReport);

// GET /api/v1/reports/:id - Get report by ID
router.get('/:id', getReportById);

// Admin routes (placeholder for future implementation)
// GET /api/v1/reports/admin/all - Get all reports (admin only)
router.get('/admin/all', getAllReports);

// PATCH /api/v1/reports/admin/:id - Update report status (admin only)
router.patch('/admin/:id', updateReportStatus);

export { router as reportsRouter };
