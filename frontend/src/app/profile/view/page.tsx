'use client';

import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function ProfileViewPage() {
  const { user, profile, loading, error } = useAuth();
  const { user: profileUser, profile: profileData, loading: profileLoading, error: profileError } = useProfile();

  const achievements: string[] = Array.isArray((profileData as any)?.achievements)
    ? ((profileData as any)?.achievements as string[])
    : [];

  const experiences: Array<any> = Array.isArray((profileData as any)?.experiences)
    ? ((profileData as any)?.experiences as Array<any>)
    : [];

  const skills: string[] = Array.isArray((profileData as any)?.skills)
    ? ((profileData as any)?.skills as string[])
    : [];

  const hiringExperience: string[] = Array.isArray((profileData as any)?.hiringExperience)
    ? ((profileData as any)?.hiringExperience as string[])
    : [];

  if (profileLoading || loading) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body">
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || error) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body">
            <p className="text-danger-500">{profileError || error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="container py-8">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">My Profile</h1>
          <BackButton />
        </div>
        <p className="page-subtitle">
          {isRecruiter 
            ? 'This is the read-only view candidates will see.' 
            : 'This is the read-only view recruiters will see.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  {((profileData as any)?.avatarUrl) ? (
                    <img src={(profileData as any)?.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-gray-300">
                      {(profileUser?.firstName?.[0] || profileUser?.email?.[0] || '').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-100 truncate">{profileUser?.firstName || profileUser?.email}</h2>
                  <p className="text-sm text-gray-400 truncate">{profileUser?.email}</p>
                  {isRecruiter ? (
                    <p className="mt-2 text-gray-200">{(profileData as any)?.recruiterTitle || 'Talent Acquisition Manager'}</p>
                  ) : (
                    profileData?.title && (
                      <p className="mt-2 text-gray-200">{profileData.title}</p>
                    )
                  )}
                </div>
                <div className="shrink-0">
                  <Link href="/profile" className="btn-secondary btn-sm">Edit Profile</Link>
                </div>
              </div>

              {isRecruiter ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Company</p>
                    <p className="text-gray-100">{(profileData as any)?.companyName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Hiring Role</p>
                    <p className="text-gray-100">{(profileData as any)?.hiringRole || '—'}</p>
                  </div>
                </div>
              ) : (
                <>
                  {(profileData as any)?.about && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">About</p>
                      <p className="text-gray-200 whitespace-pre-wrap">{(profileData as any).about}</p>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-gray-100">{profileData?.location || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Years of Experience</p>
                      <p className="text-gray-100">{profileData?.yoe ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expected CTC</p>
                      <p className="text-gray-100">{profileData?.expectedCTC ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Resume</p>
                      {(profileData as any)?.resumeUrl ? (
                        <a href={(profileData as any).resumeUrl} target="_blank" className="text-primary-400 hover:text-primary-300">View PDF</a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.length > 0 ? skills.map((s, i) => (
                        <span key={`${s}-${i}`} className="px-3 py-1 rounded-full bg-gray-800 text-gray-100 text-xs">{s}</span>
                      )) : <span className="text-gray-500">—</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isRecruiter ? (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-100">Hiring Requirements</h3>
              </div>
              <div className="card-body">
                {hiringExperience.length === 0 ? (
                  <p className="text-gray-500">No requirements added.</p>
                ) : (
                  <ul className="list-disc pl-6 space-y-2 text-gray-100">
                    {hiringExperience.map((req, i) => (
                      <li key={`${req}-${i}`}>{req}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-100">Experience</h3>
                </div>
                <div className="card-body">
                  {experiences.length === 0 ? (
                    <p className="text-gray-500">No experience added.</p>
                  ) : (
                    <div className="space-y-4">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="border border-gray-800 rounded-lg p-4">
                          <p className="text-gray-100 font-medium">{exp.role} @ {exp.company}</p>
                          <p className="text-gray-500 text-sm">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''}
                            {exp.endDate ? ` – ${new Date(exp.endDate).toLocaleDateString()}` : ' – Present'}
                          </p>
                          {exp.description && <p className="text-gray-300 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-100">Achievements</h3>
                </div>
                <div className="card-body">
                  {achievements.length === 0 ? (
                    <p className="text-gray-500">No achievements added.</p>
                  ) : (
                    <ul className="list-disc pl-6 space-y-2 text-gray-100">
                      {achievements.map((a, i) => (
                        <li key={`${a}-${i}`}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


