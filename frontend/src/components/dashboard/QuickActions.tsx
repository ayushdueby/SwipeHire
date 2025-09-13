'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { useProfile } from '@/hooks/useProfile';
import { 
  HeartIcon, 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  BriefcaseIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export function QuickActions() {
  const { user } = useProfile();

  const candidateActions = [
    {
      name: 'Update Profile',
      description: 'Keep your profile current',
      href: '/profile',
      icon: UserIcon,
      color: 'bg-secondary-500 hover:bg-secondary-600',
    },
    // Candidates do not swipe; direct them to messages
    {
      name: 'Messages',
      description: 'Chat with recruiters who matched you',
      href: '/messages',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-success-500 hover:bg-success-600',
    },
  ];

  const recruiterActions = [
    {
      name: 'Post New Job',
      description: 'Create a job posting',
      href: '/jobs/create',
      icon: PlusIcon,
      color: 'bg-primary-500 hover:bg-primary-600',
    },
    {
      name: 'Start Swiping',
      description: 'Browse candidates',
      href: '/swipe',
      icon: HeartIcon,
      color: 'bg-success-500 hover:bg-success-600',
    },
    // Matches section removed; chats live in Messages
    {
      name: 'Analytics',
      description: 'View hiring insights',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'bg-warning-500 hover:bg-warning-600',
    },
    {
      name: 'My Jobs',
      description: 'Manage your postings',
      href: '/jobs/my',
      icon: BriefcaseIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  const actions = user?.role === 'candidate' ? candidateActions : recruiterActions;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Quick Actions</h2>
      
      <div className="space-y-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="block group"
          >
            <div className="card hover:shadow-lg transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color} transition-colors duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-100 group-hover:text-primary-400 transition-colors duration-200">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Card */}
      <div className="card bg-gradient-primary">
        <div className="card-body">
          <h3 className="text-lg font-medium text-white mb-2">
            {user?.role === 'candidate' ? 'Get Discovered' : 'Find Top Talent'}
          </h3>
          <p className="text-primary-100 text-sm mb-4">
            {user?.role === 'candidate'
              ? 'Complete your profile to increase your visibility to recruiters'
              : 'Upgrade your plan to unlock premium features and reach more candidates'
            }
          </p>
          <Button variant="secondary" size="sm">
            {user?.role === 'candidate' ? 'Complete Profile' : 'Upgrade Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
