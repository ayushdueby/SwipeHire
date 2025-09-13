'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import toast from 'react-hot-toast';

export interface SwipeData {
  targetType: 'job' | 'candidate';
  targetId: string;
  dir: 'right' | 'left';
}

export interface SwipeResult {
  swipe: {
    id: string;
    fromUserId: string;
    targetType: string;
    targetId: string;
    dir: string;
    ts: string;
  };
  match?: {
    id: string;
    candidateUserId: string;
    recruiterUserId: string;
    jobId: string;
    ts: string;
  };
  isNewMatch?: boolean;
}

export function useSwipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const createSwipe = useCallback(async (swipeData: SwipeData): Promise<SwipeResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/swipes', swipeData);
      const result: SwipeResult = response.data;

      // Track swipe analytics
      analytics.swipeMade({
        actorRole: 'candidate', // This should be determined from user context
        targetType: swipeData.targetType,
        dir: swipeData.dir,
      });

      // Show match notification
      if (result.isNewMatch) {
        toast.success('🎉 It\'s a match! You can now start chatting.', {
          duration: 6000,
        });
        
        // Track match creation
        analytics.matchCreated({
          userType: 'candidate', // This should be determined from user context
          jobId: result.match?.jobId || '',
        });
      } else if (swipeData.dir === 'right') {
        toast.success('👍 Swiped right! Waiting for them to swipe back.');
      }

      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to record swipe';
      setError(message);
      
      // Show specific error messages
      if (message.includes('already swiped')) {
        toast.error('You\'ve already swiped on this!');
      } else if (message.includes('daily limit')) {
        toast.error('Daily swipe limit reached. Come back tomorrow!');
      } else {
        toast.error(message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getSwipeStats = useCallback(async () => {
    try {
      const response = await api.get('/swipes/stats');
      return response.data.stats;
    } catch (err: any) {
      console.error('Error fetching swipe stats:', err);
      return null;
    }
  }, [api]);

  return {
    createSwipe,
    getSwipeStats,
    loading,
    error,
  };
}
