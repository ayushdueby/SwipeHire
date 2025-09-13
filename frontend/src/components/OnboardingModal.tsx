'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useProfile } from '@/hooks/useProfile';
import { analytics } from '@/lib/analytics';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingForm {
  // Common fields
  role: 'candidate' | 'recruiter';
  
  // Candidate fields
  title?: string;
  skills?: string;
  yoe?: number;
  location?: string;
  expectedCTC?: number;
  github?: string;
  linkedin?: string;
  
  // Recruiter fields
  companyName?: string;
  companyDomain?: string;
  seatCount?: number;
  bookingUrl?: string;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | null>(null);
  const { updateProfile } = useProfile();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<OnboardingForm>();

  const role = watch('role') || selectedRole;

  const handleRoleSelect = (roleType: 'candidate' | 'recruiter') => {
    setSelectedRole(roleType);
    analytics.onboardingStep('role_selected', true);
    setStep(2);
  };

  const onSubmit = async (data: OnboardingForm) => {
    try {
      let profileData: any;

      if (role === 'candidate') {
        profileData = {
          title: data.title,
          skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
          yoe: Number(data.yoe),
          location: data.location,
          expectedCTC: Number(data.expectedCTC),
          links: {
            ...(data.github && { github: data.github }),
            ...(data.linkedin && { linkedin: data.linkedin }),
          }
        };
      } else {
        profileData = {
          company: {
            name: data.companyName,
            domain: data.companyDomain,
          },
          seatCount: Number(data.seatCount),
          ...(data.bookingUrl && { bookingUrl: data.bookingUrl }),
        };
      }

      await updateProfile(profileData);
      
      analytics.onboardingCompleted(role, Date.now());
      toast.success('Profile created successfully! Welcome to SwipeHire! 🎉');
      onComplete();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Welcome to SwipeHire!"
      size="lg"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {step === 1 && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Let's get you set up
              </h3>
              <p className="text-gray-600">
                First, tell us what brings you to SwipeHire
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect('candidate')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="text-4xl mb-3">👩‍💻</div>
                <h4 className="font-semibold text-gray-900 mb-2">I'm looking for a job</h4>
                <p className="text-sm text-gray-600">
                  Find opportunities that match your skills and experience
                </p>
              </button>
              
              <button
                onClick={() => handleRoleSelect('recruiter')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="text-4xl mb-3">🏢</div>
                <h4 className="font-semibold text-gray-900 mb-2">I'm hiring talent</h4>
                <p className="text-sm text-gray-600">
                  Discover skilled candidates for your open positions
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {role === 'candidate' ? 'Tell us about yourself' : 'Tell us about your company'}
              </h3>
              <p className="text-gray-600">
                {role === 'candidate' 
                  ? 'Help us match you with the right opportunities'
                  : 'Help us connect you with the right talent'
                }
              </p>
            </div>

            {role === 'candidate' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  placeholder="e.g., Frontend Developer"
                  {...register('title', { required: 'Title is required' })}
                  error={errors.title?.message}
                />
                
                <Input
                  label="Years of Experience"
                  type="number"
                  placeholder="3"
                  {...register('yoe', { 
                    required: 'Experience is required',
                    min: { value: 0, message: 'Experience cannot be negative' }
                  })}
                  error={errors.yoe?.message}
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Skills"
                    placeholder="JavaScript, React, Node.js, Python (comma-separated)"
                    {...register('skills', { required: 'At least one skill is required' })}
                    error={errors.skills?.message}
                    helpText="List your key skills separated by commas"
                  />
                </div>
                
                <Input
                  label="Location"
                  placeholder="Bangalore, India"
                  {...register('location', { required: 'Location is required' })}
                  error={errors.location?.message}
                />
                
                <Input
                  label="Expected CTC (₹)"
                  type="number"
                  placeholder="1200000"
                  {...register('expectedCTC', { 
                    required: 'Expected CTC is required',
                    min: { value: 0, message: 'CTC cannot be negative' }
                  })}
                  error={errors.expectedCTC?.message}
                />
                
                <Input
                  label="GitHub Profile (Optional)"
                  placeholder="https://github.com/username"
                  {...register('github')}
                  error={errors.github?.message}
                />
                
                <Input
                  label="LinkedIn Profile (Optional)"
                  placeholder="https://linkedin.com/in/username"
                  {...register('linkedin')}
                  error={errors.linkedin?.message}
                />
              </div>
            )}

            {role === 'recruiter' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="TechCorp Solutions"
                  {...register('companyName', { required: 'Company name is required' })}
                  error={errors.companyName?.message}
                />
                
                <Input
                  label="Company Domain"
                  placeholder="techcorp.com"
                  {...register('companyDomain', { required: 'Company domain is required' })}
                  error={errors.companyDomain?.message}
                />
                
                <Input
                  label="Team Size"
                  type="number"
                  placeholder="50"
                  {...register('seatCount', { 
                    required: 'Team size is required',
                    min: { value: 1, message: 'Team size must be at least 1' }
                  })}
                  error={errors.seatCount?.message}
                />
                
                <Input
                  label="Booking URL (Optional)"
                  placeholder="https://calendly.com/your-link"
                  {...register('bookingUrl')}
                  error={errors.bookingUrl?.message}
                  helpText="Link for candidates to schedule interviews"
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
              >
                Complete Setup
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
