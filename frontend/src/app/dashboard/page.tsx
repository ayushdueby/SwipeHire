'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard auth state changed:', { 
      isLoading, 
      isAuthenticated, 
      user,
      hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false,
      hasStoredUser: typeof window !== 'undefined' ? !!localStorage.getItem('user') : false
    });
    
    // COMPLETELY DISABLE ALL REDIRECTS FROM DASHBOARD
    console.log('📊 Dashboard page loaded - auth redirects disabled for debugging');
  }, [isLoading, isAuthenticated, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user.firstName || user.email}!
        </h1>
        <p className="page-subtitle">
          {user.role === 'candidate' 
            ? 'Ready to find your next opportunity?' 
            : 'Ready to discover great talent?'
          }
        </p>
        {user.role === 'recruiter' && (
          <div className="mt-4">
            <Link href="/dashboard/filters" className="btn-primary btn-sm">My Filters</Link>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardStats />
          <RecentActivity />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
