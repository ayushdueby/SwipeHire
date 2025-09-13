'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';

export default function CreateJobPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const api = useApi();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [minYOE, setMinYOE] = useState(0);
  const [maxYOE, setMaxYOE] = useState(5);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('CreateJobPage auth:', { isLoading, isAuthenticated, user });
  }, [isLoading, isAuthenticated, user]);

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
        <p className="text-gray-600">Please log in to create a job.</p>
      </div>
    );
  }

  const submit = async () => {
    setSaving(true);
    try {
      await api.post('/jobs2', {
        title,
        location,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        minYOE: Number(minYOE),
        maxYOE: Number(maxYOE),
        description
      });
      alert('Job created');
      setTitle(''); setLocation(''); setSkills(''); setMinYOE(0); setMaxYOE(5); setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Create Job</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">Create a job in your active organization.</p>
      </div>
      <div className="card">
        <div className="card-body space-y-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <Input label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min YOE" type="number" value={minYOE} onChange={e => setMinYOE(Number(e.target.value))} />
            <Input label="Max YOE" type="number" value={maxYOE} onChange={e => setMaxYOE(Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Create Job'}</Button>
        </div>
      </div>
    </div>
  );
}


