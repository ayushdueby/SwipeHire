'use client';

import { useState, useEffect } from 'react';
import { authService, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🚀 useAuth hook initializing...');
    
    // Check if localStorage is even working
    try {
      localStorage.setItem('test', 'test');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
      console.log('✅ LocalStorage test successful:', testValue === 'test');
    } catch (error) {
      console.error('❌ LocalStorage test failed:', error);
    }
    
    checkAuthStatus();
    
    // Add storage event listener to catch localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📦 LocalStorage change detected:', {
        key: e.key,
        oldValue: e.oldValue,
        newValue: e.newValue,
        url: e.url
      });
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check localStorage for token and user
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const authStorage = localStorage.getItem('auth-storage');
      
      console.log('🔍 Checking auth status:', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasStoredUser: !!storedUser,
        storedUserLength: storedUser?.length,
        hasAuthStorage: !!authStorage,
        allLocalStorageKeys: Object.keys(localStorage),
        timestamp: new Date().toISOString()
      });
      
      // Log the complete localStorage content separately for better visibility
      console.log('📦 Complete localStorage content:', Object.fromEntries(Object.entries(localStorage)));
      
      // Let's see what's in that auth-storage key
      if (authStorage) {
        try {
          const authStorageData = JSON.parse(authStorage);
          console.log('🔍 Auth-storage content:', authStorageData);
          console.log('🔍 Auth-storage state:', authStorageData.state);
          
          // Try to use the auth-storage data if our regular keys are missing
          if (!token && !storedUser && authStorageData.state?.user && authStorageData.state?.isAuthenticated) {
            console.log('✅ Found auth data in auth-storage! Using it...');
            setUser(authStorageData.state.user);
            setIsAuthenticated(authStorageData.state.isAuthenticated);
            console.log('✅ Auth restored from auth-storage:', authStorageData.state.user);
            
            // Repopulate regular localStorage keys so API client picks up the token
            try {
              const restoredToken = authStorageData.state.token;
              if (restoredToken) {
                localStorage.setItem('auth_token', restoredToken as string);
              }
              localStorage.setItem('user', JSON.stringify(authStorageData.state.user));
              console.log('✅ Repopulated auth_token/user from auth-storage');
            } catch {}
            
            // DISABLE FORCE REDIRECT TO STOP INFINITE LOOP
            // if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            //   console.log('🚀 Force redirecting to dashboard since auth is restored!');
            //   window.location.href = '/dashboard';
            // }
            
            return; // Exit early since we found auth data
          }
        } catch (e) {
          console.log('❌ Failed to parse auth-storage:', e);
        }
      }
      
      // Try regular auth first
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Auth restored from regular localStorage:', userData);
        } catch (error) {
          console.error('❌ Failed to parse stored user:', error);
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('❌ No regular auth data found - token:', !!token, 'user:', !!storedUser);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setIsAuthenticated(true);
    console.log('Login completed, auth state updated:', { user: result.user, isAuthenticated: true });
    return result;
  };

  const register = async (userData: Parameters<typeof authService.register>[0]) => {
    const result = await authService.register(userData);
    setUser(result.user);
    setIsAuthenticated(true);
    console.log('Registration completed, auth state updated:', { user: result.user, isAuthenticated: true });
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };
}
