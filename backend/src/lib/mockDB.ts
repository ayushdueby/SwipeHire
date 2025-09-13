import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

interface MockUser {
  _id: string;
  email: string;
  password: string;
  role: 'candidate' | 'recruiter';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCandidateProfile {
  userId: string;
  title: string;
  skills: string[];
  yoe: number;
  location: string;
  expectedCTC: number;
  about?: string;
  experiences?: Array<{
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;
  achievements?: string[];
  avatarUrl?: string | undefined;
  resumeUrl?: string | undefined;
  links?: {
    github?: string;
    linkedin?: string;
  } | undefined;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MockRecruiterProfile {
  userId: string;
  contact?: string;
  companyName: string;
  companyDomain?: string;
  recruiterTitle?: string;
  hiringRole: string;
  hiringExperience?: string[];
  avatarUrl?: string | undefined;
  seatCount?: number;
  bookingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockSwipe {
  id: string;
  fromUserId: string;
  targetType: 'candidate' | 'job';
  targetId: string;
  dir: 'left' | 'right';
  ts: Date;
}

interface MockMatch {
  id: string;
  candidateUserId: string;
  recruiterUserId: string;
  jobId?: string;
  ts: Date;
}

interface MockMessage {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  ts: Date;
}

// v2.0 additions
interface Organization { id: string; name: string; slug: string; createdAt: Date }
interface OrgMember { id: string; orgId: string; userId: string; role: 'owner'|'recruiter'|'viewer' }
interface MockJobV2 { id: string; orgId: string; title: string; location: string; minYOE: number; maxYOE: number; skills: string[]; description: string; active: boolean; createdAt: Date }
interface Interview { id: string; matchId: string; whenISO: string; location?: string; notes?: string; createdBy: string }
interface AuditLog { id: string; actorUserId: string; action: string; entityType: string; entityId: string; meta?: any; ts: Date }

class MockDatabase {
  private users: MockUser[] = [];
  private idCounter = 1;
  private candidateProfiles: MockCandidateProfile[] = [];
  private recruiterProfiles: MockRecruiterProfile[] = [];
  private swipes: MockSwipe[] = [];
  private matches: MockMatch[] = [];
  private messages: MockMessage[] = [];
  private unmatches: Array<{ id: string; candidateUserId: string; recruiterUserId: string; ts: Date; cooldownDays?: number }> = [];
  private recruiterSettings: Record<string, { cooldownDays: number }> = {};
  private organizations: Organization[] = [];
  private orgMembers: OrgMember[] = [];
  private jobsV2: MockJobV2[] = [];
  private interviews: Interview[] = [];
  private auditLogs: AuditLog[] = [];
  private userActiveOrg: Record<string,string> = {};
  private recruiterFilters: Record<string, { skills?: string[]; location?: string; minYOE?: number; maxYOE?: number }> = {};
  private dataFile: string;

  constructor() {
    this.dataFile = path.join(process.cwd(), 'mock-data.json');
    this.loadFromDisk();
    // No auto-seeding - only real user profiles
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        if (raw) {
          const parsed = JSON.parse(raw);
          this.users = (parsed.users || []).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          }));
          this.candidateProfiles = (parsed.candidateProfiles || []).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            lastActive: p.lastActive ? new Date(p.lastActive) : undefined,
            experiences: (p.experiences || []).map((e: any) => ({
              ...e,
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : undefined,
            }))
          }));
          this.recruiterProfiles = (parsed.recruiterProfiles || []).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          this.swipes = (parsed.swipes || []).map((s: any) => ({ ...s, ts: new Date(s.ts) }));
          this.matches = (parsed.matches || []).map((m: any) => ({ ...m, ts: new Date(m.ts) }));
          this.messages = (parsed.messages || []).map((m: any) => ({ ...m, ts: new Date(m.ts) }));
          this.unmatches = (parsed.unmatches || []).map((u: any) => ({ ...u, ts: new Date(u.ts) }));
          this.recruiterSettings = parsed.recruiterSettings || {};
          this.organizations = (parsed.organizations || []).map((o: any) => ({ ...o, createdAt: new Date(o.createdAt) }));
          this.orgMembers = parsed.orgMembers || [];
          this.jobsV2 = (parsed.jobsV2 || []).map((j: any) => ({ ...j, createdAt: new Date(j.createdAt) }));
          this.interviews = parsed.interviews || [];
          this.auditLogs = (parsed.auditLogs || []).map((a: any) => ({ ...a, ts: new Date(a.ts) }));
          this.userActiveOrg = parsed.userActiveOrg || {};
          this.recruiterFilters = parsed.recruiterFilters || {};
          const maxId = this.users.reduce((m, u) => Math.max(m, Number(u._id) || 0), 0);
          this.idCounter = Math.max(1, maxId + 1);
        }
      }
    } catch (err) {
      console.warn('Failed to load mock data:', err);
    }
  }

  private saveToDisk() {
    try {
      const payload = JSON.stringify({
        users: this.users,
        candidateProfiles: this.candidateProfiles,
        recruiterProfiles: this.recruiterProfiles,
        swipes: this.swipes,
        matches: this.matches,
        messages: this.messages,
        unmatches: this.unmatches,
        recruiterSettings: this.recruiterSettings,
        organizations: this.organizations,
        orgMembers: this.orgMembers,
        jobsV2: this.jobsV2,
        interviews: this.interviews,
        auditLogs: this.auditLogs,
        userActiveOrg: this.userActiveOrg,
        recruiterFilters: this.recruiterFilters,
      }, null, 2);
      fs.writeFileSync(this.dataFile, payload, 'utf-8');
    } catch (err) {
      console.warn('Failed to save mock data:', err);
    }
  }

  // Lightweight user accessor for display (sync)
  getUserBasicById(id: string): Pick<MockUser, '_id'|'email'|'role'|'firstName'|'lastName'> | null {
    const u = this.users.find(u => u._id === id);
    if (!u) return null;
    const { _id, email, role, firstName = '', lastName = '' } = u;
    return { _id, email, role, firstName, lastName } as any;
  }

  // Get swipes for a user
  getSwipesForUser(userId: string): MockSwipe[] {
    return this.swipes.filter(s => s.fromUserId === userId);
  }

  async createUser(userData: {
    email: string;
    password: string;
    role: 'candidate' | 'recruiter';
    firstName?: string;
    lastName?: string;
  }): Promise<MockUser> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user: MockUser = {
      _id: this.idCounter.toString(),
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    this.saveToDisk();
    return user;
  }

  async findUserByEmail(email: string, includePassword = false): Promise<MockUser | null> {
    const user = this.users.find(u => u.email === email.toLowerCase());
    if (!user) return null;

    if (includePassword) {
      return user;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as MockUser;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    const user = this.users.find(u => u._id === id);
    if (!user) return null;

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as MockUser;
  }

  async comparePassword(user: MockUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  }

  // Transform user for API response
  transformUser(user: MockUser) {
    const { password, _id, ...rest } = user;
    return { id: _id, ...rest };
  }

  // Get all users (for debugging)
  getAllUsers(): MockUser[] {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as MockUser;
    });
  }

  // Candidate profiles (mock)
  getCandidateProfile(userId: string): MockCandidateProfile | null {
    const p = this.candidateProfiles.find(p => p.userId === userId) || null;
    return p ? { ...p } : null;
  }

  upsertCandidateProfile(userId: string, data: Partial<MockCandidateProfile>): MockCandidateProfile {
    const existing = this.candidateProfiles.find(p => p.userId === userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      this.saveToDisk();
      return { ...existing };
    }
    const created: MockCandidateProfile = {
      userId,
      title: data.title || '',
      skills: data.skills || [],
      yoe: data.yoe || 0,
      location: data.location || '',
      expectedCTC: data.expectedCTC || 0,
      about: data.about || '',
      experiences: data.experiences || [],
      achievements: data.achievements || [],
      avatarUrl: data.avatarUrl,
      resumeUrl: data.resumeUrl,
      links: data.links,
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.candidateProfiles.push(created);
    this.saveToDisk();
    return { ...created };
  }

  // Recruiter profiles (mock)
  getRecruiterProfile(userId: string): MockRecruiterProfile | null {
    const p = this.recruiterProfiles.find(p => p.userId === userId) || null;
    return p ? { ...p } : null;
  }

  upsertRecruiterProfile(userId: string, data: Partial<MockRecruiterProfile>): MockRecruiterProfile {
    const existing = this.recruiterProfiles.find(p => p.userId === userId);
    if (existing) {
      const clean: Partial<MockRecruiterProfile> = {};
      if (typeof data.companyName === 'string') clean.companyName = data.companyName;
      if (typeof data.hiringRole === 'string') clean.hiringRole = data.hiringRole;
      if (typeof data.recruiterTitle === 'string') clean.recruiterTitle = data.recruiterTitle;
      if (Array.isArray(data.hiringExperience)) clean.hiringExperience = data.hiringExperience;
      if (typeof data.contact === 'string') clean.contact = data.contact;
      if (typeof data.avatarUrl === 'string') clean.avatarUrl = data.avatarUrl;
      Object.assign(existing, clean, { updatedAt: new Date() });
      this.saveToDisk();
      return { ...existing };
    }
    const created: MockRecruiterProfile = {
      userId,
      companyName: data.companyName || '',
      hiringRole: data.hiringRole || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (typeof data.recruiterTitle === 'string') created.recruiterTitle = data.recruiterTitle;
    if (typeof data.contact === 'string') created.contact = data.contact;
    if (Array.isArray(data.hiringExperience)) created.hiringExperience = data.hiringExperience;
    if (typeof data.avatarUrl === 'string') created.avatarUrl = data.avatarUrl;
    this.recruiterProfiles.push(created);
    this.saveToDisk();
    return { ...created };
  }

  // For updates
  private commit() {
    this.saveToDisk();
  }

  // Feed for recruiters (basic list)
  listCandidateProfiles(limit = 20): MockCandidateProfile[] {
    return this.candidateProfiles.slice(0, limit).map(p => ({ ...p }));
  }

  // Swipes
  createSwipe(fromUserId: string, targetType: 'candidate' | 'job', targetId: string, dir: 'left' | 'right'): { swipe: MockSwipe; match?: MockMatch | undefined } {
    const swipe: MockSwipe = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fromUserId,
      targetType,
      targetId,
      dir,
      ts: new Date(),
    };
    this.swipes.push(swipe);

    let newMatch: MockMatch | undefined = undefined;
    if (dir === 'right' && targetType === 'candidate') {
      // Recruiter liked a candidate → create or reuse match
      const candidateProfile = this.candidateProfiles.find(c => c.userId === targetId) || null;
      const recruiterUserId = fromUserId;
      const candidateUserId = candidateProfile ? candidateProfile.userId : targetId;

      // De‑dupe existing match
      const existing = this.matches.find(m => m.candidateUserId === candidateUserId && m.recruiterUserId === recruiterUserId);
      if (existing) {
        newMatch = { ...existing };
      } else {
        newMatch = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          candidateUserId,
          recruiterUserId,
          ts: new Date(),
        };
        this.matches.push(newMatch);
      }
    }

    this.saveToDisk();
    return { swipe, match: newMatch };
  }

  listMatchesForUser(userId: string, role: 'candidate' | 'recruiter'): MockMatch[] {
    const list = this.matches.filter(m => (role === 'recruiter' ? m.recruiterUserId === userId : m.candidateUserId === userId));
    return list.map(m => ({ ...m }));
  }

  // Unmatch & cooldown
  unmatchById(matchId: string) {
    const m = this.matches.find(x => x.id === matchId);
    if (!m) return false;
    this.matches = this.matches.filter(x => x.id !== matchId);
    const cooldownDays = this.getRecruiterCooldownDays(m.recruiterUserId);
    this.unmatches.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, candidateUserId: m.candidateUserId, recruiterUserId: m.recruiterUserId, ts: new Date(), cooldownDays } as any);
    this.saveToDisk();
    return true;
  }

  private isUnderCooldown(candidateUserId: string, recruiterUserId: string): boolean {
    const now = Date.now();
    const last = this.unmatches
      .filter((u: any) => u.candidateUserId === candidateUserId && u.recruiterUserId === recruiterUserId)
      .sort((a: any,b: any) => b.ts.getTime() - a.ts.getTime())[0];
    if (!last) return false;
    const days = Number((last as any).cooldownDays || 30);
    const ms = days * 24 * 60 * 60 * 1000;
    return now - last.ts.getTime() < ms;
  }

  // Public helper for cooldown checks
  isCandidateUnderCooldown(candidateUserId: string, recruiterUserId: string): boolean {
    return this.isUnderCooldown(candidateUserId, recruiterUserId);
  }

  listCandidateProfilesForRecruiter(recruiterUserId: string, limit = 50): MockCandidateProfile[] {
    const matched = new Set(
      this.matches.filter(m => m.recruiterUserId === recruiterUserId).map(m => m.candidateUserId)
    );
    const filtered = this.candidateProfiles.filter(p => {
      if (matched.has(p.userId)) return false;
      if (this.isUnderCooldown(p.userId, recruiterUserId)) return false;
      return true;
    });
    return filtered.slice(0, limit).map(p => ({ ...p }));
  }

  // Messages
  listMessages(matchId: string, limit = 50): MockMessage[] {
    const list = this.messages.filter(m => m.matchId === matchId).slice(-limit);
    return list.map(m => ({ ...m }));
  }

  createMessage(matchId: string, senderId: string, body: string): MockMessage {
    const msg: MockMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      matchId,
      senderId,
      body,
      ts: new Date(),
    };
    this.messages.push(msg);
    this.saveToDisk();
    return { ...msg };
  }

  // Stats helpers (mock mode)
  getSwipeStatsForUser(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const list = this.swipes.filter(s => s.fromUserId === userId);
    const total = list.length;
    const todayCount = list.filter(s => s.ts >= today).length;
    const rightSwipes = list.filter(s => s.dir === 'right').length;
    const leftSwipes = list.filter(s => s.dir === 'left').length;
    const dailyLimit = 100;
    return { total, today: todayCount, rightSwipes, leftSwipes, dailyLimit, remainingToday: Math.max(0, dailyLimit - todayCount) };
  }

  getMatchStatsForUser(userId: string, role: 'candidate'|'recruiter') {
    const today = new Date();
    today.setHours(0,0,0,0);
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const list = this.matches.filter(m => (role === 'recruiter' ? m.recruiterUserId === userId : m.candidateUserId === userId));
    const total = list.length;
    const todayCount = list.filter(m => m.ts >= today).length;
    const thisWeek = list.filter(m => m.ts >= week).length;
    return { total, today: todayCount, thisWeek };
  }

  getMessageStatsForUser(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const total = this.messages.filter(m => m.senderId === userId).length;
    const todayCount = this.messages.filter(m => m.senderId === userId && m.ts >= today).length;
    const dailyLimit = 1000;
    return { total, today: todayCount, dailyLimit, remainingToday: Math.max(0, dailyLimit - todayCount) };
  }

  // Recruiter settings
  getRecruiterCooldownDays(recruiterUserId: string): number {
    return this.recruiterSettings[recruiterUserId]?.cooldownDays ?? 30;
  }

  setRecruiterCooldownDays(recruiterUserId: string, cooldownDays: number) {
    this.recruiterSettings[recruiterUserId] = { cooldownDays };
    this.saveToDisk();
  }

  // --- v2.0 orgs/jobs/search helpers ---
  private slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
  }

  createOrganization(name: string, ownerUserId: string): Organization {
    const org: Organization = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, name: name.trim(), slug: this.slugify(name), createdAt: new Date() };
    this.organizations.push(org);
    const member: OrgMember = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, orgId: org.id, userId: ownerUserId, role: 'owner' };
    this.orgMembers.push(member);
    this.userActiveOrg[ownerUserId] = org.id;
    this.audit('system', 'org.create', 'organization', org.id, { name });
    this.saveToDisk();
    return { ...org };
  }

  listUserOrganizations(userId: string): Organization[] {
    const orgIds = new Set(this.orgMembers.filter(m => m.userId === userId).map(m => m.orgId));
    return this.organizations.filter(o => orgIds.has(o.id)).map(o => ({ ...o }));
  }

  listOrgMembers(orgId: string): OrgMember[] {
    return this.orgMembers.filter(m => m.orgId === orgId).map(m => ({ ...m }));
  }

  setActiveOrg(userId: string, orgId: string) {
    const isMember = this.orgMembers.some(m => m.userId === userId && m.orgId === orgId);
    if (!isMember) throw new Error('Not a member of organization');
    this.userActiveOrg[userId] = orgId;
    this.saveToDisk();
  }

  getActiveOrg(userId: string): string | undefined {
    return this.userActiveOrg[userId];
  }

  createJobV2(orgId: string, data: Omit<MockJobV2,'id'|'orgId'|'createdAt'|'active'>): MockJobV2 {
    const job: MockJobV2 = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, orgId, createdAt: new Date(), active: true, ...data };
    this.jobsV2.push(job);
    this.audit('system', 'job.create', 'job', job.id, { orgId });
    this.saveToDisk();
    return { ...job };
  }

  listJobsV2(orgId: string): MockJobV2[] {
    return this.jobsV2.filter(j => j.orgId === orgId).map(j => ({ ...j }));
  }

  updateJobV2(id: string, data: Partial<MockJobV2>): MockJobV2 | null {
    const j = this.jobsV2.find(x => x.id === id);
    if (!j) return null;
    Object.assign(j, data);
    this.audit('system', 'job.update', 'job', id, { data });
    this.saveToDisk();
    return { ...j };
  }

  closeJobV2(id: string): boolean {
    const j = this.jobsV2.find(x => x.id === id);
    if (!j) return false;
    j.active = false;
    this.audit('system', 'job.close', 'job', id, {});
    this.saveToDisk();
    return true;
  }

  // Candidate search with scoring
  searchCandidates(filters: { skills?: string[]; location?: string; minYOE?: number; maxYOE?: number; visibleOnly?: boolean }): Array<{ profile: MockCandidateProfile; score: number }> {
    const skills = (filters.skills || []).map(s => s.toLowerCase().trim());
    const loc = (filters.location || '').toLowerCase();
    const minY = filters.minYOE ?? 0;
    const maxY = filters.maxYOE ?? 99;

    const scoreOf = (p: MockCandidateProfile) => {
      let score = 0;
      // Jaccard on skills
      if (skills.length > 0) {
        const a = new Set(p.skills.map(s => s.toLowerCase()));
        const b = new Set(skills);
        const inter = [...a].filter(x => b.has(x)).length;
        const union = new Set([...a, ...b]).size || 1;
        score += 4 * (inter / union);
      }
      // Location match (exact substring)
      if (loc) {
        const match = (p.location || '').toLowerCase().includes(loc) ? 1 : 0;
        score += 2 * match;
      }
      // YOE band
      const y = p.yoe || 0;
      const yMatch = y >= minY && y <= maxY ? 1 : 0;
      score += 1 * yMatch;
      // Recency boost (lastActive within 14 days)
      const last = p.lastActive ? (Date.now() - p.lastActive.getTime()) / (1000*60*60*24) : 999;
      const recency = last <= 14 ? 1 : last <= 30 ? 0.5 : 0;
      score += 0.5 * recency;
      return score;
    };

    const items = this.candidateProfiles
      .filter(p => (filters.visibleOnly ? true : true))
      .map(p => ({ profile: p, score: scoreOf(p) }))
      .sort((a, b) => b.score - a.score);

    return items;
  }

  // Audit
  audit(actorUserId: string, action: string, entityType: string, entityId: string, meta?: any) {
    const log: AuditLog = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, actorUserId, action, entityType, entityId, meta, ts: new Date() };
    this.auditLogs.push(log);
    this.saveToDisk();
  }

  // Recruiter saved filters
  getRecruiterFilters(userId: string) {
    return this.recruiterFilters[userId] || { };
  }
  setRecruiterFilters(userId: string, filters: { skills?: string[]; location?: string; minYOE?: number; maxYOE?: number }) {
    const clean = {
      skills: Array.isArray(filters.skills) ? filters.skills.filter(Boolean) : undefined,
      location: typeof filters.location === 'string' ? filters.location : undefined,
      minYOE: typeof filters.minYOE === 'number' && !Number.isNaN(filters.minYOE) ? filters.minYOE : undefined,
      maxYOE: typeof filters.maxYOE === 'number' && !Number.isNaN(filters.maxYOE) ? filters.maxYOE : undefined,
    } as any;
    this.recruiterFilters[userId] = { ...this.recruiterFilters[userId], ...clean };
    this.saveToDisk();
    return { ...this.recruiterFilters[userId] };
  }
}

export const mockDB = new MockDatabase();
