'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { BackButton } from '@/components/ui/BackButton';

export default function MyJobsPage() {
  const api = useApi();
  const [jobs, setJobs] = useState<any[]>([]);
  const load = async () => {
    const res = await api.get('/jobs2/my');
    setJobs(res.data.jobs || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="container py-12">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">My Jobs</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">Jobs in your active organization.</p>
      </div>
      <div className="space-y-4">
        {jobs.map(j => (
          <div key={j.id} className="card">
            <div className="card-body">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-gray-100 font-medium">{j.title}</h3>
                  <p className="text-gray-400 text-sm">{j.location} • {j.skills?.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${j.active ? 'badge-success' : 'badge-default'}`}>{j.active ? 'Open' : 'Closed'}</span>
                  {j.active && (
                    <button className="btn-danger btn-xs" onClick={async () => { await api.post(`/jobs2/${j.id}/close`); load(); }}>Close</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="card"><div className="card-body">No jobs yet.</div></div>}
      </div>
    </div>
  );
}


