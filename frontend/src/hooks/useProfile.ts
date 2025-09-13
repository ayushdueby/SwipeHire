'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { analytics } from '@/lib/analytics';

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

export interface UserProfile {
  id: string;
  authUserId: string;
  role: 'candidate' | 'recruiter';
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  user: UserProfile;
  profile: CandidateProfile | RecruiterProfile | null;
}

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/me');
      setData(response.data);
      
      // Track daily active user
      if (response.data.user?.role) {
        analytics.dailyActive(response.data.user.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<CandidateProfile | RecruiterProfile>) => {
    try {
      setError(null);
      
      const response = await api.put('/me', profileData);
      setData(response.data);
      
      // Track profile completion
      if (response.data.user?.role && response.data.profile) {
        analytics.profileCompleted(response.data.user.role, profileData);
      }
      
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch profile once authenticated to avoid 401 loops
    if (typeof window !== 'undefined') {
      const hasToken = !!localStorage.getItem('auth_token');
      if (isAuthenticated && hasToken) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  return {
    data,
    user: data?.user || null,
    profile: data?.profile || null,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
