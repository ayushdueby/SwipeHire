import posthog from 'posthog-js';

// Initialize PostHog
export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      // Disable automatic pageview capture as we'll handle it manually
      capture_pageview: false,
      // Disable session recording for privacy
      disable_session_recording: true,
      // Other configuration options
      persistence: 'localStorage',
      autocapture: false, // Disable automatic event capture
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 PostHog analytics initialized');
        }
      },
    });
  }
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Kolkata',
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Event tracked: ${eventName}`, properties);
    }
  }
}

// Identify user
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, traits);
  }
}

// Reset user identity (on logout)
export function resetUser() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
}

// Page view tracking
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  trackEvent('page_view', {
    page: pageName,
    ...properties,
  });
}

// Predefined event tracking functions
export const analytics = {
  // User events
  userSignedUp: (role: 'candidate' | 'recruiter') => {
    trackEvent('user_signed_up', { role });
  },

  profileCompleted: (role: 'candidate' | 'recruiter', data?: any) => {
    const properties: Record<string, any> = { role };
    
    if (role === 'candidate' && data) {
      properties.hasLinks = !!(data.links?.github || data.links?.linkedin);
      properties.skillsCount = data.skills?.length || 0;
    }
    
    trackEvent('profile_completed', properties);
  },

  // Job events
  jobPosted: (jobData: {
    stack: string[];
    location: string;
    minYoe: number;
    remote: boolean;
  }) => {
    trackEvent('job_posted', {
      stack: jobData.stack,
      location: jobData.location,
      minYoe: jobData.minYoe,
      remote: jobData.remote,
      stackCount: jobData.stack.length,
    });
  },

  // Swipe events
  swipeMade: (data: {
    actorRole: 'candidate' | 'recruiter';
    targetType: 'job' | 'candidate';
    dir: 'right' | 'left';
  }) => {
    trackEvent('swipe_made', data);
  },

  // Match events
  matchCreated: (data: {
    userType: 'candidate' | 'recruiter';
    jobId: string;
  }) => {
    trackEvent('match_created', data);
  },

  // Message events
  messageSent: (data: { length: number; matchId: string }) => {
    trackEvent('message_sent', {
      length: data.length,
      matchId: data.matchId,
    });
  },

  // Daily active user
  dailyActive: (role: 'candidate' | 'recruiter') => {
    trackEvent('daily_active', { role });
  },

  // Feature usage
  featureUsed: (feature: string, context?: Record<string, any>) => {
    trackEvent('feature_used', {
      feature,
      ...context,
    });
  },

  // Error tracking
  errorOccurred: (error: string, context?: Record<string, any>) => {
    trackEvent('error_occurred', {
      error,
      ...context,
    });
  },

  // Navigation events
  navigationClicked: (destination: string, source?: string) => {
    trackEvent('navigation_clicked', {
      destination,
      source,
    });
  },

  // Search events
  searchPerformed: (query: string, filters?: Record<string, any>) => {
    trackEvent('search_performed', {
      query,
      ...filters,
    });
  },

  // Onboarding events
  onboardingStep: (step: string, completed: boolean) => {
    trackEvent('onboarding_step', {
      step,
      completed,
    });
  },

  onboardingCompleted: (role: 'candidate' | 'recruiter', timeSpent?: number) => {
    trackEvent('onboarding_completed', {
      role,
      timeSpent,
    });
  },
};

// Hook for analytics in React components
export function useAnalytics() {
  return {
    track: trackEvent,
    identify: identifyUser,
    reset: resetUser,
    pageView: trackPageView,
    ...analytics,
  };
}

export default analytics;
