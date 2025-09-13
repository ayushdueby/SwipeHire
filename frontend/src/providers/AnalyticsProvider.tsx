'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { authService } from '@/lib/auth';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname, {
        authenticated: isAuthenticated,
      });
    }
  }, [pathname, isAuthenticated]);

  return <>{children}</>;
}
