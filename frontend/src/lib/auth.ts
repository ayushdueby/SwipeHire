import { api } from './api';

export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('AuthService: Attempting login for:', email);
    const response = await api.post('/auth/login', { email, password });
    console.log('AuthService: Login response:', response.data);
    
    const { user, token } = response.data.data;
    console.log('AuthService: Extracted user and token:', { user, token: token?.substring(0, 20) + '...' });
    
    this.setAuth(token, user);
    return { user, token };
  }

  async register(userData: {
    email: string;
    password: string;
    role: 'candidate' | 'recruiter';
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    console.log('AuthService: Attempting registration for:', userData.email);
    const response = await api.post('/auth/register', userData);
    console.log('AuthService: Registration response:', response.data);
    
    const { user, token } = response.data.data;
    console.log('AuthService: Extracted user and token:', { user, token: token?.substring(0, 20) + '...' });
    
    this.setAuth(token, user);
    return { user, token };
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with client-side logout even if server fails
      console.error('Server logout failed:', error);
    } finally {
      this.clearAuth();
      if (typeof window !== 'undefined') {
        // Best-effort cookie cleanup for any auth/session cookies
        try {
          const cookieNames = ['auth_token','token','refreshToken','session','sid'];
          cookieNames.forEach((name) => {
            document.cookie = `${name}=; Max-Age=0; path=/;`;
            document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
          });
        } catch {}

        // Redirect to login after logout
        window.location.href = '/login';
      }
    }
  }

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    const user = response.data.data.user;
    this.user = user;
    return user;
  }

  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Auth data stored:', { token: token.substring(0, 20) + '...', user });
      
      // ALSO store in the auth-storage format that something is expecting
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: user,
          isAuthenticated: true
        },
        version: 0
      }));
      console.log('✅ Also stored in auth-storage format for compatibility');
    }
  }

  private clearAuth(): void {
    console.log('🔥 CLEARING AUTH DATA - this should only happen during logout!');
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      console.log('🔥 LocalStorage cleared (including auth-storage)');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    if (!this.user && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          this.clearAuth();
        }
      }
    }
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  isRole(role: 'candidate' | 'recruiter'): boolean {
    return this.user?.role === role;
  }
}

export const authService = new AuthService();
