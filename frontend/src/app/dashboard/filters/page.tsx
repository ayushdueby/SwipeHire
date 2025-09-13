'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FiltersPage() {
  const api = useApi();
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [minYOE, setMinYOE] = useState('');
  const [maxYOE, setMaxYOE] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'recruiter') return;
    api.get('/swipes/filters').then(res => {
      const f = res.data.filters || {};
      setSkills(Array.isArray(f.skills) ? f.skills.join(', ') : '');
      setLocation(f.location || '');
      setMinYOE(typeof f.minYOE === 'number' ? String(f.minYOE) : '');
      setMaxYOE(typeof f.maxYOE === 'number' ? String(f.maxYOE) : '');
    }).catch(() => {});
  }, [api, isAuthenticated, user]);

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = {
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        location: location || undefined,
        minYOE: minYOE ? Number(minYOE) : undefined,
        maxYOE: maxYOE ? Number(maxYOE) : undefined,
      };
      await api.put('/swipes/filters', payload);
      toast.success('Filters updated');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="container py-8">
        <div className="card"><div className="card-body"><p className="text-gray-400">Recruiters only.</p></div></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">My Filters</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">Set your default candidate filters. Swipes will use these.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card gradient-border hover-glow">
          <div className="card-body space-y-4">
            <Input label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} placeholder="react, typescript, node" />
            <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="remote or city" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min YOE" value={minYOE} onChange={e => setMinYOE(e.target.value)} placeholder="2" />
              <Input label="Max YOE" value={maxYOE} onChange={e => setMaxYOE(e.target.value)} placeholder="8" />
            </div>
            <div className="flex gap-3">
              <Button onClick={save} disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save Filters'}</Button>
              <Link href="/swipe" className="btn-secondary">Go to Swipe</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


