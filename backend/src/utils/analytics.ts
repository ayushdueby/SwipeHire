import { PostHog } from 'posthog-node';

const posthogKey = process.env.POSTHOG_KEY;

let posthog: PostHog | null = null;

if (posthogKey) {
  posthog = new PostHog(posthogKey, {
    host: 'https://app.posthog.com'
  });
  console.log('✓ PostHog analytics initialized');
} else {
  console.warn('⚠ PostHog not configured - analytics will be disabled');
}

export interface AnalyticsEvent {
  userId?: string;
  event: string;
  properties?: Record<string, any>;
  distinctId?: string;
}

export async function trackEvent(data: AnalyticsEvent): Promise<void> {
  if (!posthog) {
    console.log('Analytics disabled - would track:', data.event);
    return;
  }

  try {
    const { userId, event, properties = {}, distinctId } = data;
    
    posthog.capture({
      distinctId: distinctId || userId || 'anonymous',
      event,
      properties: {
        ...properties,
        $timezone: 'Asia/Kolkata',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📊 Analytics event tracked: ${event}`);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
}

// Predefined event tracking functions
export async function trackUserSignUp(userId: string, role: 'candidate' | 'recruiter'): Promise<void> {
  await trackEvent({
    userId,
    event: 'user_signed_up',
    properties: { role }
  });
}

export async function trackProfileCompleted(
  userId: string, 
  role: 'candidate' | 'recruiter',
  profileData?: any
): Promise<void> {
  const properties: Record<string, any> = { role };
  
  if (role === 'candidate' && profileData) {
    properties.hasLinks = !!(profileData.links?.github || profileData.links?.linkedin);
    properties.skillsCount = profileData.skills?.length || 0;
  }

  await trackEvent({
    userId,
    event: 'profile_completed',
    properties
  });
}

export async function trackJobPosted(
  userId: string,
  jobData: {
    stack: string[];
    location: string;
    minYoe: number;
    remote: boolean;
  }
): Promise<void> {
  await trackEvent({
    userId,
    event: 'job_posted',
    properties: {
      stack: jobData.stack,
      location: jobData.location,
      minYoe: jobData.minYoe,
      remote: jobData.remote,
      stackCount: jobData.stack.length
    }
  });
}

export async function trackSwipeMade(
  userId: string,
  swipeData: {
    actorRole: 'candidate' | 'recruiter';
    targetType: 'job' | 'candidate';
    dir: 'right' | 'left';
  }
): Promise<void> {
  await trackEvent({
    userId,
    event: 'swipe_made',
    properties: swipeData
  });
}

export async function trackMatchCreated(
  candidateUserId: string,
  recruiterUserId: string,
  jobId: string
): Promise<void> {
  // Track for both users
  await Promise.all([
    trackEvent({
      userId: candidateUserId,
      event: 'match_created',
      properties: { 
        userType: 'candidate',
        jobId,
        recruiterUserId 
      }
    }),
    trackEvent({
      userId: recruiterUserId,
      event: 'match_created',
      properties: { 
        userType: 'recruiter',
        jobId,
        candidateUserId 
      }
    })
  ]);
}

export async function trackMessageSent(
  userId: string,
  messageData: {
    length: number;
    matchId: string;
  }
): Promise<void> {
  await trackEvent({
    userId,
    event: 'message_sent',
    properties: {
      length: messageData.length,
      matchId: messageData.matchId
    }
  });
}

export async function trackDailyActive(userId: string, role: 'candidate' | 'recruiter'): Promise<void> {
  await trackEvent({
    userId,
    event: 'daily_active',
    properties: { role }
  });
}

// Graceful shutdown
export async function closeAnalytics(): Promise<void> {
  if (posthog) {
    await posthog.shutdown();
    console.log('✓ PostHog analytics closed');
  }
}

process.on('SIGTERM', closeAnalytics);
process.on('SIGINT', closeAnalytics);
