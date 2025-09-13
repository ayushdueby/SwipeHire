'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';

export default function ProfilePage() {
  const api = useApi();
  const { profile, loading } = useProfile();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [yoe, setYoe] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [expectedCTC, setExpectedCTC] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [achievements, setAchievements] = useState('');
  const [about, setAbout] = useState('');
  const [experiencesText, setExperiencesText] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [hiringRole, setHiringRole] = useState('');
  const [recruiterTitle, setRecruiterTitle] = useState('');
  const [hiringExperience, setHiringExperience] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setTitle((profile as any).title || '');
      setSkills(Array.isArray((profile as any).skills) ? (profile as any).skills.join(', ') : '');
      setYoe((profile as any).yoe || 0);
      setLocation((profile as any).location || '');
      setExpectedCTC((profile as any).expectedCTC || 0);
      setAvatarUrl((profile as any).avatarUrl || '');
      setResumeUrl((profile as any).resumeUrl || '');
      setAchievements(Array.isArray((profile as any).achievements) ? (profile as any).achievements.join('\n') : '');
      setAbout((profile as any).about || '');
      // Experiences -> editable text format (Company|Role|Start|End|SkillsCSV|Description)
      const exps = (profile as any).experiences;
      if (Array.isArray(exps) && exps.length) {
        const lines = exps.map((e: any) => {
          const start = e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '';
          const end = e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '';
          const skillsCsv = Array.isArray((e as any).skills) ? (e as any).skills.join(',') : ((e as any).skills || '');
          return `${e.company || ''}|${e.role || ''}|${start}|${end}|${skillsCsv}|${e.description || ''}`;
        });
        setExperiencesText(lines.join('\n'));
      } else {
        setExperiencesText('');
      }
      setCompanyName((profile as any).companyName || '');
      setHiringRole((profile as any).hiringRole || '');
      setRecruiterTitle((profile as any).recruiterTitle || '');
      const hx = (profile as any).hiringExperience;
      setHiringExperience(Array.isArray(hx) ? hx.join('\n') : (typeof hx === 'string' ? hx : ''));
    }
  }, [profile]);

  const save = async () => {
    setIsSaving(true);
    try {
      let payload: any;
      if (user?.role === 'candidate') {
        payload = {
          title,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          yoe: Number(yoe),
          location,
          expectedCTC: Number(expectedCTC),
          achievements: achievements
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean),
          experiences: String(experiencesText || '')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {
              const [company = '', role = '', start = '', end = '', skillsCSV = '', description = ''] = line.split('|');
              const expSkills = String(skillsCSV)
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
              return {
                company: company.trim(),
                role: role.trim(),
                startDate: start ? new Date(start) : undefined,
                endDate: end ? new Date(end) : undefined,
                description: description.trim() || undefined,
                skills: expSkills,
              } as any;
            }),
          about: about || undefined,
          avatarUrl: avatarUrl || undefined,
          resumeUrl: resumeUrl || undefined,
        };
      } else {
        payload = {
          companyName,
          hiringRole,
          recruiterTitle: recruiterTitle || undefined,
          hiringExperience: String(hiringExperience || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean),
          avatarUrl: avatarUrl || undefined,
        };
      }
      await api.put('/me', payload);
      alert('Profile saved');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Your Profile</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">
          {user?.role === 'candidate' 
            ? 'Tell recruiters what you are open to.' 
            : 'Tell candidates about your company and hiring needs.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-body space-y-4">
            {user?.role === 'candidate' ? (
              <>
                <Input label="Headline (Open to...)" value={title} onChange={e => setTitle(e.target.value)} placeholder="Open to frontend roles, React/Next.js" />
                <Input label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Years of Experience" type="number" value={yoe} onChange={e => setYoe(Number(e.target.value))} />
                  <Input label="Expected CTC" type="number" value={expectedCTC} onChange={e => setExpectedCTC(Number(e.target.value))} />
                </div>
                <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} />
                <div>
                  <label className="form-label">About</label>
                  <textarea className="form-textarea" rows={4} value={about} onChange={e => setAbout(e.target.value)} placeholder="Tell recruiters about yourself..." />
                </div>
                <div>
                  <label className="form-label">Experiences (one per line)</label>
                  <p className="text-xs text-gray-500 mb-2">Format: Company|Role|Start(YYYY-MM-DD)|End(YYYY-MM-DD)|Skills(comma)|Description</p>
                  <textarea className="form-textarea" rows={4} value={experiencesText} onChange={e => setExperiencesText(e.target.value)} placeholder={"Acme Corp|Frontend Engineer|2022-01-01|2023-02-01|React,TypeScript|Built dashboards"} />
                </div>
                <div>
                  <label className="form-label">Achievements (one per line)</label>
                  <textarea className="form-textarea" rows={4} value={achievements} onChange={e => setAchievements(e.target.value)} placeholder={"Hackathon winner\nBuilt internal tooling"} />
                </div>
              </>
            ) : (
              <>
                <Input label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Company Inc." />
                <Input label="Your Role" value={recruiterTitle} onChange={e => setRecruiterTitle(e.target.value)} placeholder="Talent Acquisition Manager" />
                <Input label="Hiring Role" value={hiringRole} onChange={e => setHiringRole(e.target.value)} placeholder="Senior Frontend Engineer" />
                <div>
                  <label className="form-label">Hiring Experience Requirements (one per line)</label>
                  <textarea className="form-textarea" rows={4} value={hiringExperience} onChange={e => setHiringExperience(e.target.value)} placeholder={"3+ years React experience\nExperience with TypeScript\nTeam collaboration skills"} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-body space-y-4">
              <Input label="Profile Picture URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://.../avatar.png" />
              {user?.role === 'candidate' && (
                <Input label="Resume URL (PDF)" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://.../resume.pdf" />
              )}
              <Button onClick={save} disabled={isSaving} className="w-full">{isSaving ? 'Saving...' : 'Save Profile'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


