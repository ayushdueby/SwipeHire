'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/lib/api';
import { BackButton } from '@/components/ui/BackButton';

interface MatchItem { id: string; candidateUserId: string; recruiterUserId: string; ts: string; }

export default function MatchesPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const api = useApi();
  const [matches, setMatches] = useState<MatchItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/matches').then(res => setMatches(res.data.matches || [])).catch(() => setMatches([]));
  }, [api, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please log in to view matches.</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Matches</h1>
        <BackButton />
      </div>
      <div className="card">
        <div className="card-body">
          {matches.length === 0 ? (
            <p className="text-gray-400">No matches yet.</p>
          ) : (
            <ul className="space-y-3">
              {matches.map(m => (
                <li key={m.id} className="p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-100 text-sm">Match • {new Date(m.ts).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


