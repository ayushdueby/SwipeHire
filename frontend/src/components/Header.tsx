'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { useState } from 'react';
import { Nav } from './Nav';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/lib/api';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const api = useApi();
  const [cooldown, setCooldown] = useState<string>('30');
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [activeOrg, setActiveOrg] = useState<string>('');

  return (
    <>
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gradient">SwipeHire</h1>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="!p-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </Button>
            </div>

            {/* Desktop user menu */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.role === 'recruiter' && (
                    <div className="flex items-center gap-2 mr-2">
                      <label className="text-xs text-gray-400">Org</label>
                      <select
                        className="form-input !py-1 !px-2 !h-8 text-xs"
                        value={activeOrg}
                        onFocus={async () => {
                          try {
                            const res = await api.get('/orgs');
                            setOrgs(res.data.organizations || []);
                          } catch {}
                        }}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setActiveOrg(val);
                          try {
                            await api.put('/me/active-org', { orgId: val });
                          } catch {}
                        }}
                      >
                        <option value="">Select</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                      <button
                        className="btn-primary btn-xs"
                        onClick={async () => {
                          const name = prompt('Organization name');
                          if (!name) return;
                          try {
                            const res = await api.post('/orgs', { name });
                            const newOrg = res.data.org;
                            setOrgs(prev => [newOrg, ...prev]);
                            setActiveOrg(newOrg.id);
                            await api.put('/me/active-org', { orgId: newOrg.id });
                          } catch {}
                        }}
                      >
                        New
                      </button>
                    </div>
                  )}
                  {user.role === 'recruiter' && (
                    <div className="flex items-center gap-2 mr-2">
                      <label className="text-xs text-gray-400">Cooldown</label>
                      <select
                        className="form-input !py-1 !px-2 !h-8 text-xs"
                        value={cooldown}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setCooldown(val);
                          try {
                            await api.put('/me/cooldown', { cooldownDays: Number(val) });
                          } catch {}
                        }}
                      >
                        <option value="10">10d</option>
                        <option value="15">15d</option>
                        <option value="30">30d</option>
                        <option value="45">45d</option>
                        <option value="60">60d</option>
                      </select>
                    </div>
                  )}
                  <span className="text-sm text-gray-300">
                    Hi, {user.firstName || user.email}!
                  </span>
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(user.firstName?.[0] || user.email[0] || '').toUpperCase()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                  <Button size="sm">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-60" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-gray-100">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="!p-2"
              >
                ✕
              </Button>
            </div>
            <div className="px-4 py-4">
              <Nav mobile onNavigate={() => setMobileMenuOpen(false)} />
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(user.firstName?.[0] || user.email[0] || '').toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300">
                      Hi, {user.firstName || user.email}!
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="mt-3 w-full justify-start text-gray-400 hover:text-gray-200"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
