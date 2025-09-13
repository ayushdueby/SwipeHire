// Common types used across the frontend application

export interface User {
  id: string;
  authUserId: string;
  role: 'candidate' | 'recruiter';
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  title: string;
  skills: string[];
  yoe: number;
  location: string;
  expectedCTC: number;
  links?: {
    github?: string;
    linkedin?: string;
  };
  lastActive: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  company: {
    name: string;
    domain: string;
  };
  seatCount: number;
  bookingUrl?: string;
}

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  stack: string[];
  minYoe: number;
  location: string;
  remote: boolean;
  salaryBand: {
    min: number;
    max: number;
  };
  mustHaves: string[];
  description: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  candidateUserId: string;
  jobId: string;
  recruiterUserId: string;
  ts: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  ts: string;
  sender?: {
    email: string;
  };
}

export interface Swipe {
  id: string;
  fromUserId: string;
  targetType: 'job' | 'candidate';
  targetId: string;
  dir: 'right' | 'left';
  ts: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
