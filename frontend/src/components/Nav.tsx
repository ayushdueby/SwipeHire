'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useProfile } from '@/hooks/useProfile';
import { analytics } from '@/lib/analytics';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: 'candidate' | 'recruiter' | 'both';
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    role: 'both' 
  },

  { 
    name: 'My Jobs', 
    href: '/jobs/my', 
    icon: BriefcaseIcon, 
    role: 'recruiter' 
  },
  { 
    name: 'Post Job', 
    href: '/jobs/create', 
    icon: PlusIcon, 
    role: 'recruiter' 
  },
  { 
    name: 'Swipe', 
    href: '/swipe', 
    icon: HeartIcon, 
    role: 'recruiter' 
  },
  { 
    name: 'My Filters', 
    href: '/dashboard/filters', 
    icon: FunnelIcon, 
    role: 'recruiter' 
  },
  { 
    name: 'Messages', 
    href: '/messages', 
    icon: ChatBubbleLeftRightIcon, 
    role: 'both' 
  },
  { 
    name: 'Profile', 
    href: '/profile/view', 
    icon: UserIcon, 
    role: 'both' 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon, 
    role: 'recruiter' 
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: ExclamationTriangleIcon, 
    role: 'both' 
  },
];

interface NavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Nav({ mobile = false, onNavigate }: NavProps) {
  const pathname = usePathname();
  const { user, loading } = useProfile();

  const handleNavClick = (href: string, name: string) => {
    analytics.navigationClicked(href, 'sidebar');
    onNavigate?.();
  };

  const filteredNavigation = navigation.filter(item => {
    // During loading, show a safe minimal set so sidebar is visible
    if (loading || !user?.role) {
      return item.role === 'both';
    }
    return item.role === 'both' || item.role === user.role;
  });

  if (mobile) {
    return (
      <nav className="space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.href, item.name)}
              className={clsx(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-900/40 text-primary-300'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-gray-900 border-r border-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.href, item.name)}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-900/40 text-primary-300'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
