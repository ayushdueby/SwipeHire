import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { Report } from '@/models/Report';
import { User } from '@/models/User';
import { createReportSchema } from '@/utils/validators';
import { asyncHandler, createError } from '@/middleware/errorHandler';

export const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reporterId = req.user.id;
  const reportData = req.body;

  // Validate report data
  const validatedData = createReportSchema.parse(reportData);
  const { reportedId, reason } = validatedData;

  // Verify reported user exists
  const reportedUser = await User.findById(reportedId);
  if (!reportedUser) {
    throw createError('Reported user not found', 404);
  }

  // Prevent self-reporting
  if (reportedId === reporterId) {
    throw createError('You cannot report yourself', 400);
  }

  // Check for duplicate reports from the same user
  const existingReport = await Report.findOne({
    reporterId,
    reportedId,
    status: 'open'
  });

  if (existingReport) {
    throw createError('You have already reported this user', 409);
  }

  // Create report
  const report = new Report({
    reportedId,
    reporterId,
    reason: reason.trim()
  });

  await report.save();
  await report.populate({ path: 'reportedId', select: 'email' });
  await report.populate({ path: 'reporterId', select: 'email' });

  res.status(201).json({
    message: 'Report submitted successfully',
    report: {
      id: report._id,
      reportedId: report.reportedId,
      reporterId: report.reporterId,
      reason: report.reason,
      status: report.status,
      ts: report.ts
    }
  });
});

export const getMyReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reporterId = req.user.id;
  const { page = 1, pageSize = 20, status } = req.query;

  const filter: any = { reporterId };
  if (status) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(pageSize);

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedId', 'email')
      .sort({ ts: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean(),
    Report.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / Number(pageSize));

  res.json({
    reports,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    }
  });
});

export const getReportById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reportId = req.params.id;
  const userId = req.user.id;

  const report = await Report.findById(reportId)
    .populate(['reportedId', 'reporterId'], 'email')
    .lean();

  if (!report) {
    throw createError('Report not found', 404);
  }

  // Only the reporter can view their own reports
  if (report.reporterId._id.toString() !== userId) {
    throw createError('You can only view your own reports', 403);
  }

  res.json({ report });
});

// Admin functions (placeholder for future admin panel)
export const getAllReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // TODO: Add admin role check when implementing admin functionality
  throw createError('Admin functionality not implemented', 501);
});

export const updateReportStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // TODO: Add admin role check when implementing admin functionality
  throw createError('Admin functionality not implemented', 501);
});
