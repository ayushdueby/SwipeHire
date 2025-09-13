'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  BriefcaseIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'swipe' | 'match' | 'message' | 'job_posted';
  title: string;
  description: string;
  timestamp: string;
  data?: any;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        
        // Fetch recent data from multiple endpoints
        const [swipesRes, matchesRes] = await Promise.all([
          api.get('/swipes?page=1&pageSize=5').catch(() => ({ data: { swipes: [] } })),
          api.get('/matches?page=1&pageSize=5').catch(() => ({ data: { matches: [] } })),
        ]);

        const activities: ActivityItem[] = [];

        // Add recent swipes (only for recruiters)
        if (user?.role === 'recruiter' && swipesRes.data.swipes) {
          swipesRes.data.swipes.forEach((swipe: any) => {
            activities.push({
              id: `swipe-${swipe.id}`,
              type: 'swipe',
              title: swipe.dir === 'right' ? 'Liked Candidate' : 'Passed on Candidate',
              description: `Swiped ${swipe.dir === 'right' ? 'right' : 'left'} on a candidate`,
              timestamp: swipe.ts,
              data: swipe,
            });
          });
        }

        // Add recent matches
        if (matchesRes.data.matches) {
          matchesRes.data.matches.forEach((match: any) => {
            const otherName = match.other?.name || match.other?.title || 'a user';
            activities.push({
              id: `match-${match.id}`,
              type: 'match',
              title: 'New Match!',
              description: `Matched with ${otherName}`,
              timestamp: match.ts,
              data: match,
            });
          });
        }

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setActivities(activities.slice(0, 10)); // Keep only latest 10
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [api, user?.role]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'swipe':
        return HeartIcon;
      case 'match':
        return ChatBubbleLeftRightIcon;
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'job_posted':
        return BriefcaseIcon;
      default:
        return UserIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'swipe':
        return 'text-primary-500';
      case 'match':
        return 'text-success-500';
      case 'message':
        return 'text-secondary-500';
      case 'job_posted':
        return 'text-warning-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBadgeVariant = (type: string): 'primary' | 'success' | 'secondary' | 'warning' | 'default' => {
    switch (type) {
      case 'swipe':
        return 'primary';
      case 'match':
        return 'success';
      case 'message':
        return 'secondary';
      case 'job_posted':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-100">No activity yet</h3>
            <p className="mt-1 text-sm text-gray-400">
              {user?.role === 'recruiter' 
                ? 'Start swiping candidates to see your activity here!' 
                : 'Start messaging to see your activity here!'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
      </div>
      <div className="card-body p-0">
        <div className="divide-y divide-gray-800">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="p-6 hover:bg-gray-800 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 ${iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {activity.title}
                      </p>
                      <Badge variant={getBadgeVariant(activity.type)} size="sm">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
