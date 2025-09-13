'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon,
  BriefcaseIcon 
} from '@heroicons/react/24/outline';

interface Stats {
  swipes?: {
    total: number;
    today: number;
    rightSwipes: number;
    leftSwipes: number;
    remainingToday: number;
  };
  matches?: {
    total: number;
    today: number;
    thisWeek: number;
  };
  messages?: {
    total: number;
    today: number;
    remainingToday: number;
  };
  jobs?: {
    total: number;
    views: number;
  };
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const [swipesRes, matchesRes, messagesRes] = await Promise.all([
          // Only recruiters fetch swipe stats
          (user?.role === 'recruiter' ? api.get('/swipes/stats') : Promise.resolve({ data: { stats: null } })).catch(() => ({ data: { stats: null } })),
          api.get('/matches/stats').catch(() => ({ data: { stats: null } })),
          api.get('/messages/stats').catch(() => ({ data: { stats: null } })),
        ]);

        setStats({
          swipes: swipesRes.data.stats,
          matches: matchesRes.data.stats,
          messages: messagesRes.data.stats,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [api, user?.role]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    ...(user?.role === 'recruiter' ? [{
      name: 'Daily Swipes',
      value: stats.swipes?.today || 0,
      change: `${stats.swipes?.remainingToday || 0} remaining`,
      changeType: 'neutral',
      icon: HeartIcon,
    }] : []),
    {
      name: 'Matches',
      value: stats.matches?.total || 0,
      change: `${stats.matches?.today || 0} today`,
      changeType: 'positive',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Messages',
      value: stats.messages?.total || 0,
      change: `${stats.messages?.today || 0} today`,
      changeType: 'positive',
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Your Activity</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-100">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm">
                        <span
                          className={`
                            ${item.changeType === 'positive' ? 'text-success-500' : ''}
                            ${item.changeType === 'negative' ? 'text-danger-500' : ''}
                            ${item.changeType === 'neutral' ? 'text-gray-400' : ''}
                          `}
                        >
                          {item.change}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts for recruiters */}
      {user?.role === 'recruiter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Match Success Rate</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Right swipes → Matches</span>
                  <span>
                    {stats.swipes?.rightSwipes && stats.matches?.total 
                      ? Math.round((stats.matches.total / stats.swipes.rightSwipes) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-success-500 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(
                        stats.swipes?.rightSwipes && stats.matches?.total 
                          ? (stats.matches.total / stats.swipes.rightSwipes) * 100
                          : 0, 100
                      )}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {stats.matches?.total || 0} matches from {stats.swipes?.rightSwipes || 0} right swipes
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Weekly Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="text-success-500">{stats.matches?.thisWeek || 0} matches</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Today</span>
                  <span className="text-primary-500">{stats.swipes?.today || 0} swipes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Messages</span>
                  <span className="text-secondary-500">{stats.messages?.today || 0} sent</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  Daily limit: {stats.swipes?.remainingToday || 100} swipes remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Success Rate for candidates */}
      {user?.role === 'candidate' && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Engagement Rate</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Messages → Matches</span>
                <span>
                  {stats.messages?.total && stats.matches?.total
                    ? Math.round((stats.matches.total / stats.messages.total) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-success-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(
                      stats.messages?.total && stats.matches?.total
                        ? (stats.matches.total / stats.messages.total) * 100
                        : 0, 100
                    )}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-400">
                {stats.matches?.total || 0} matches from {stats.messages?.total || 0} messages
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
