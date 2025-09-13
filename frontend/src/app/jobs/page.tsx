'use client';

import { BackButton } from "@/components/ui/BackButton";

export default function JobsPage() {
  return (
    <div className="container py-8">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Browse Jobs</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">Job listings placeholder for beta.</p>
      </div>
      <div className="card">
        <div className="card-body">
          <p className="text-gray-400">Coming soon.</p>
        </div>
      </div>
    </div>
  );
}


