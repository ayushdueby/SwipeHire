'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { useAuth } from '@/hooks/useAuth';

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const isPublic = pathname.startsWith('/login')
    || pathname.startsWith('/register')
    || pathname.startsWith('/sign-in')
    || pathname.startsWith('/sign-up');

  // Show shell if authenticated OR we already have a token locally (prevents sidebar flicker/absence during auth rehydration)
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false;
  const showShell = (isAuthenticated || hasToken || isLoading) && !isPublic;

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-64px)]">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 h-full min-h-[calc(100vh-64px)]">
            <Nav />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}




