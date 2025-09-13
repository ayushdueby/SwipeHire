import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['candidate', 'recruiter']),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User and profile schemas
export const createUserSchema = z.object({
  authUserId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['candidate', 'recruiter'])
});

export const candidateProfileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  skills: z.array(z.string().min(1)).min(1, 'At least one skill is required').max(20),
  yoe: z.number().min(0).max(50),
  location: z.string().min(1, 'Location is required').max(100),
  expectedCTC: z.number().min(0),
  about: z.string().max(2000).optional(),
  experiences: z
    .array(
      z.object({
        company: z.string().min(1).max(100),
        role: z.string().min(1).max(100),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        description: z.string().max(1000).optional(),
      })
    )
    .optional(),
  achievements: z.array(z.string().min(1).max(200)).optional(),
  avatarUrl: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  links: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional()
  }).optional()
});

export const recruiterProfileSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name is required').max(100),
    domain: z.string().min(1, 'Company domain is required').max(100)
  }),
  seatCount: z.number().min(1).max(10000),
  bookingUrl: z.string().url().optional()
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100),
  stack: z.array(z.string().min(1)).min(1, 'At least one technology is required').max(15),
  minYoe: z.number().min(0).max(50),
  location: z.string().min(1, 'Location is required').max(100),
  remote: z.boolean().default(false),
  salaryBand: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.max >= data.min, {
    message: 'Maximum salary must be greater than or equal to minimum salary'
  }),
  mustHaves: z.array(z.string().min(1)).min(1, 'At least one requirement is needed').max(10),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000)
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['open', 'closed']).optional()
});

export const jobQuerySchema = z.object({
  location: z.string().optional(),
  stack: z.string().optional(), // Comma-separated string
  minYoe: z.coerce.number().min(0).max(50).optional(),
  remote: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20)
});

// Swipe schemas
export const swipeSchema = z.object({
  targetType: z.enum(['job', 'candidate']),
  targetId: z.string().min(1, 'Target ID is required'),
  dir: z.enum(['right', 'left'])
});

// Message schemas
export const sendMessageSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  body: z.string().min(1, 'Message body is required').max(2000)
});

export const getMessagesSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().optional() // ISO date string for pagination
});

// Report schema
export const createReportSchema = z.object({
  reportedId: z.string().min(1, 'Reported ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000)
});

// Common validation helpers
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

// Webhook schemas
export const clerkWebhookSchema = z.object({
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string().email(),
      verification: z.object({
        status: z.string()
      })
    })),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }),
  type: z.string()
});

// File upload schemas
export const uploadSignatureSchema = z.object({
  folder: z.string().default('swipehire'),
  resourceType: z.enum(['image', 'raw']).default('image')
});

// Analytics event schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1),
  userId: z.string().optional(),
  properties: z.record(z.any()).optional()
});

// Type exports for use in controllers
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
export type SwipeInput = z.infer<typeof swipeSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ClerkWebhookInput = z.infer<typeof clerkWebhookSchema>;
export type UploadSignatureInput = z.infer<typeof uploadSignatureSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
