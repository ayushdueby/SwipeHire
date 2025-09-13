import axios, { AxiosError, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const message = getErrorMessage(error);
    
    // Don't show toast for certain endpoints or status codes
    const shouldShowToast = 
      !error.config?.url?.includes('/auth/') &&
      error.response?.status !== 401 &&
      error.response?.status !== 403;
    
    if (shouldShowToast) {
      toast.error(message);
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      console.log('🔥 API 401 ERROR - Clearing auth and redirecting to login!', {
        url: error.config?.url,
        hasToken: !!localStorage.getItem('auth_token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      // Only clear and redirect if the request actually included Authorization header
      const sentAuthHeader = Boolean((error.config?.headers as any)?.Authorization);
      if (typeof window !== 'undefined' && sentAuthHeader) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        console.log('🔥 localStorage cleared due to 401 error (auth header present)');
        window.location.href = '/login';
      } else {
        console.log('ℹ️ 401 received without Authorization header; not clearing auth.');
      }
    }

    return Promise.reject(error);
  }
);

// Error message extraction
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.error) {
      return typeof data.error === 'string' ? data.error : 'An error occurred';
    }
    if (data.message) {
      return data.message;
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Network error occurred';
}

// Custom hook to use authenticated API (simplified)
export function useApi() {
  return api; // Just return the main api instance since it already handles auth
}

// API endpoints
export const endpoints = {
  // Auth
  me: '/me',
  
  // Jobs
  jobs: '/jobs',
  myJobs: '/jobs/my',
  
  // Swipes
  swipes: '/swipes',
  swipeStats: '/swipes/stats',
  
  // Matches
  matches: '/matches',
  matchStats: '/matches/stats',
  
  // Messages
  messages: '/messages',
  messageStats: '/messages/stats',
  
  // Reports
  reports: '/reports',
} as const;

// Common API functions
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  
  return response.json();
}

// Utility functions
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export default api;
