'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      console.log('Login successful, redirecting to dashboard...');
      
      // Verify localStorage before navigation
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      console.log('✅ Pre-navigation verification:', {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
        userEmail: user.email
      });
      
      // Add a small delay to verify localStorage persists
      setTimeout(() => {
        const verifyToken = localStorage.getItem('auth_token');
        const verifyUser = localStorage.getItem('user');
        console.log('🔍 Final verification before navigation:', {
          hasToken: !!verifyToken,
          hasUser: !!verifyUser,
          allKeys: Object.keys(localStorage)
        });
        router.push('/dashboard');
      }, 200);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">
        Sign In to SwipeHire
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your.email@example.com"
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}
