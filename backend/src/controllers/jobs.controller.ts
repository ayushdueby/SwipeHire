import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/requireUser';
import { Job } from '@/models/Job';
import { createJobSchema, updateJobSchema, jobQuerySchema } from '@/utils/validators';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { trackJobPosted } from '@/utils/analytics';

export const createJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user.id;
  const jobData = req.body;

  // Only recruiters can create jobs
  if (req.user.role !== 'recruiter') {
    throw createError('Only recruiters can create jobs', 403);
  }

  // Validate job data
  const validatedData = createJobSchema.parse(jobData);

  const job = new Job({
    ...validatedData,
    recruiterId
  });

  await job.save();
  await job.populate('recruiterId', 'email');

  // Track job posting
  await trackJobPosted(recruiterId, {
    stack: validatedData.stack,
    location: validatedData.location,
    minYoe: validatedData.minYoe,
    remote: validatedData.remote
  });

  res.status(201).json({
    message: 'Job created successfully',
    job
  });
});

export const getJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = jobQuerySchema.parse(req.query);
  const { page, pageSize, location, stack, minYoe, remote } = query;

  // Build filter criteria
  const filter: any = { status: 'open' };

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (stack) {
    const stackArray = stack.split(',').map(s => s.trim());
    filter.stack = { $in: stackArray };
  }

  if (minYoe !== undefined) {
    filter.minYoe = { $lte: minYoe };
  }

  if (remote !== undefined) {
    filter.remote = remote;
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  // Execute query with population
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiterId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Job.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / pageSize);

  res.json({
    jobs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

export const getJobById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const jobId = req.params.id;

  const job = await Job.findById(jobId)
    .populate('recruiterId', 'email')
    .lean();

  if (!job) {
    throw createError('Job not found', 404);
  }

  res.json({ job });
});

export const updateJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const jobId = req.params.id;
  const updateData = req.body;
  const userId = req.user.id;

  // Only recruiters can update jobs
  if (req.user.role !== 'recruiter') {
    throw createError('Only recruiters can update jobs', 403);
  }

  // Validate update data
  const validatedData = updateJobSchema.parse(updateData);

  // Find job and check ownership
  const job = await Job.findById(jobId);
  if (!job) {
    throw createError('Job not found', 404);
  }

  if (job.recruiterId.toString() !== userId) {
    throw createError('You can only update your own jobs', 403);
  }

  // Update job
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    validatedData,
    { new: true, runValidators: true }
  ).populate('recruiterId', 'email');

  res.json({
    message: 'Job updated successfully',
    job: updatedJob
  });
});

export const deleteJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const jobId = req.params.id;
  const userId = req.user.id;

  // Only recruiters can delete jobs
  if (req.user.role !== 'recruiter') {
    throw createError('Only recruiters can delete jobs', 403);
  }

  // Find job and check ownership
  const job = await Job.findById(jobId);
  if (!job) {
    throw createError('Job not found', 404);
  }

  if (job.recruiterId.toString() !== userId) {
    throw createError('You can only delete your own jobs', 403);
  }

  await Job.findByIdAndDelete(jobId);

  res.json({
    message: 'Job deleted successfully'
  });
});

export const getMyJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user.id;
  const { page = 1, pageSize = 20 } = req.query;

  // Only recruiters can access this endpoint
  if (req.user.role !== 'recruiter') {
    throw createError('Only recruiters can access this endpoint', 403);
  }

  const skip = (Number(page) - 1) * Number(pageSize);

  const [jobs, total] = await Promise.all([
    Job.find({ recruiterId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean(),
    Job.countDocuments({ recruiterId })
  ]);

  const totalPages = Math.ceil(total / Number(pageSize));

  res.json({
    jobs,
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
