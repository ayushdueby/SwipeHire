'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Footer } from './Footer';
import { 
  HeartIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    name: 'Skills-First Matching',
    description: 'Match based on actual skills and experience, not just keywords or demographics.',
    icon: BoltIcon,
  },
  {
    name: 'Swipe to Connect',
    description: 'Simple, intuitive swiping interface that makes job searching and hiring fun.',
    icon: HeartIcon,
  },
  {
    name: 'Instant Chat',
    description: 'Connect instantly with matches through real-time messaging.',
    icon: UserGroupIcon,
  },
  {
    name: 'Smart Analytics',
    description: 'Get insights into your job search or recruitment performance.',
    icon: ChartBarIcon,
  },
  {
    name: 'Bias-Free Process',
    description: 'Reduce unconscious bias with skills-focused profiles.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Fast Placement',
    description: 'Get hired faster with our streamlined matching process.',
    icon: RocketLaunchIcon,
  },
];

const testimonials = [
  {
    content: "SwipeHire helped me find my dream job in just 2 weeks. The skills-first approach meant I was matched with roles that truly fit my expertise.",
    author: "Sarah Chen",
    role: "Full Stack Developer",
    company: "TechStart Inc.",
  },
  {
    content: "As a recruiter, I love how SwipeHire focuses on skills over everything else. I've found amazing candidates I would have missed otherwise.",
    author: "Michael Rodriguez",
    role: "Senior Recruiter",
    company: "InnovateCorp",
  },
  {
    content: "The interface is so intuitive and fun to use. It doesn't feel like traditional job hunting - it's actually enjoyable!",
    author: "Priya Patel",
    role: "UX Designer",
    company: "DesignHub",
  },
];

export function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      {!isAuthenticated && (
        <header className="relative bg-gray-950/80 backdrop-blur border-b border-gray-900">
          <div className="container">
            <div className="flex justify-between items-center py-6">
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <span className="text-2xl font-bold text-gradient">SwipeHire</span>
              </div>
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                <Button 
                  variant="ghost" 
                  size="md"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => router.push('/register')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Find your perfect</span>{' '}
                  <span className="block text-gradient xl:inline">job match</span>
                </h1>
                <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  SwipeHire is the skills-first hiring platform that connects talent with opportunities through intelligent matching. Swipe right on your next career move.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      fullWidth 
                      className="sm:w-auto"
                      onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
                    >
                      Start Swiping
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        {/* removed right-side art box for a cleaner hero */}
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-950">
        <div className="container">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-400 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-100 sm:text-4xl">
              A better way to hire and get hired
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">
              Our platform eliminates bias and focuses on what matters most - skills and mutual fit.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white shadow-lg shadow-primary-900/30">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-100">{feature.name}</p>
                  <dd className="mt-2 ml-16 text-base text-gray-400">{feature.description}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-950 border-t border-gray-900">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-100">10,000+</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BoltIcon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Matches Made</dt>
                      <dd className="text-lg font-medium text-gray-100">50,000+</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <RocketLaunchIcon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Jobs Filled</dt>
                      <dd className="text-lg font-medium text-gray-100">5,000+</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Success Rate</dt>
                      <dd className="text-lg font-medium text-gray-100">85%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-950 py-12">
        <div className="container">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-400 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-100 sm:text-4xl">
              What our users say
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <blockquote className="text-gray-300">
                  "{testimonial.content}"
                </blockquote>
                <div className="mt-4">
                  <p className="font-medium text-gray-100">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary-600">
          <div className="container py-12">
            <div className="lg:flex lg:items-center lg:justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to find your match?</span>
                <span className="block text-primary-200">Start swiping today.</span>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => router.push('/register')}
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
