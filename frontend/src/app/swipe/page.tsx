'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/ui/BackButton';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface CandidateCard {
  userId: string;
  title: string;
  skills: string[];
  location: string;
  avatarUrl?: string;
  about?: string;
  experiences?: Array<{ company: string; role: string; startDate?: string; endDate?: string; description?: string; skills?: string[] }>;
}

function SwipeCard({ card, isTop, zIndex, onSwiped }: { card: CandidateCard; isTop: boolean; zIndex: number; onSwiped: (dir: 'left'|'right') => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.2, 1, 0.2]);
  const likeOpacity = useTransform(x, [50, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -120], [0, 1]);

  return (
    <motion.div
      className="absolute inset-0 swipe-card"
      style={{ x, rotate, opacity, zIndex }}
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (!isTop) return;
        if (info.offset.x > 120) onSwiped('right');
        else if (info.offset.x < -120) onSwiped('left');
      }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800">
            {card.avatarUrl ? <img src={card.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : null}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">{card.title}</h2>
            <p className="text-sm text-gray-400">{card.location}</p>
          </div>
        </div>
        {card.about && (
          <p className="mt-3 text-gray-300 text-sm line-clamp-5">{card.about}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {card.skills.map(s => (
            <span key={s} className="px-3 py-1 rounded-full bg-gray-800 text-gray-100 text-xs">{s}</span>
          ))}
        </div>

        {/* Experience snippet */}
        {Array.isArray(card.experiences) && card.experiences.length > 0 && (
          <div className="mt-4 text-xs text-gray-300 bg-gray-900/40 rounded-lg p-3 border border-gray-800">
            <p className="text-gray-400 mb-1">Recent Experience</p>
            <p className="font-medium text-gray-100">
              {card.experiences[0].role} @ {card.experiences[0].company}
            </p>
            <p className="text-gray-400">
              {(card.experiences[0].startDate ? new Date(card.experiences[0].startDate).getFullYear() : '')}
              {(card.experiences[0].endDate ? ` - ${new Date(card.experiences[0].endDate).getFullYear()}` : ' - Present')}
            </p>
            {Array.isArray(card.experiences[0].skills) && card.experiences[0].skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {card.experiences[0].skills.slice(0,4).map((sk, i) => (
                  <span key={`${sk}-${i}`} className="px-2 py-0.5 rounded bg-gray-800 text-gray-200">{sk}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overlays */}
        <motion.div className="absolute top-4 left-4 px-3 py-1 rounded-md border-2 border-success-500 text-success-500 font-bold" style={{ opacity: likeOpacity }}>LIKE</motion.div>
        <motion.div className="absolute top-4 right-4 px-3 py-1 rounded-md border-2 border-danger-500 text-danger-500 font-bold" style={{ opacity: nopeOpacity }}>NOPE</motion.div>
      </div>
    </motion.div>
  );
}

export default function SwipePage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const api = useApi();
  const [candidates, setCandidates] = useState<CandidateCard[]>([]);
  const [idx, setIdx] = useState(0);
  const stack = useMemo(() => candidates.slice(idx, idx + 3), [candidates, idx]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role !== 'recruiter') {
      // Soft-guard on client: candidates shouldn't be here
      window.location.replace('/');
      return;
    }
    console.log('🔍 Fetching candidate feed (uses saved filters by default)...');
    api.get(`/swipes/feed`)
      .then(res => {
        console.log('✅ Feed response:', res.data);
        const list = res.data.candidates || [];
        setCandidates(list);
        setIdx(0);
        if (list.length === 0) {
          toast('No candidates match your filters yet. Try broadening them.', { icon: '🔎' });
        }
      })
      .catch(err => {
        console.error('❌ Feed error:', err);
        setCandidates([]);
      });
  }, [api, isAuthenticated]);

  const card = candidates[idx];

  const swipe = async (dir: 'left' | 'right') => {
    if (!card) return;
    try {
      await api.post('/swipes', { targetType: 'candidate', targetId: card.userId, dir });
    } catch {}
    setIdx(i => Math.min(i + 1, candidates.length));
    if (dir === 'right') toast.success('Liked');
    // Stay on swipe; no redirect
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === 'ArrowLeft') swipe('left');
      if (e.key === 'ArrowRight') swipe('right');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [card]);

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
        <p className="text-gray-400">Please log in to start swiping.</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role !== 'recruiter') {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Recruiters only</h1>
          <BackButton />
        </div>
        <div className="card"><div className="card-body"><p className="text-gray-400">Candidates don’t swipe — update your profile and respond to messages.</p></div></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Start Swiping</h1>
          <BackButton />
        </div>
        <div className="card"><div className="card-body"><p className="text-gray-400">No more candidates right now.</p></div></div>
      </div>
    );
  }

  return (
    <div className="container py-12 grid place-items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div />
        <BackButton />
      </div>
      <div className="relative w-full max-w-md h-[520px]">
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-between text-xs text-gray-400">
          <span>{Math.min(idx + 1, candidates.length)} / {candidates.length}</span>
          <span>{Math.max(0, candidates.length - (idx + 1))} left</span>
        </div>
        <AnimatePresence>
          {stack.map((c, i) => (
            <SwipeCard
              key={c.userId}
              card={c}
              isTop={i === 0}
              zIndex={10 - i}
              onSwiped={swipe}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-4">
        <Button variant="ghost" onClick={() => swipe('left')}>Nope</Button>
        <Button onClick={() => swipe('right')}>Like</Button>
      </div>
    </div>
  );
}


