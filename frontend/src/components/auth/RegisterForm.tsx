'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate' as 'candidate' | 'recruiter',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      
      toast.success(`Welcome to SwipeHire, ${user.firstName || user.email}!`);
      console.log('Registration successful, redirecting to dashboard...');
      
      // Add small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">
        Join SwipeHire
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
          />
          
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
          />
        </div>
        
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your.email@example.com"
        />
        
        <Select
          label="I am a..."
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          options={[
            { value: 'candidate', label: 'Job Seeker' },
            { value: 'recruiter', label: 'Recruiter' },
          ]}
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="At least 6 characters"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
