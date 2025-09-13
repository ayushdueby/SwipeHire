import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '../../styles/globals.css';
import { AppTransitions } from '@/components/AppTransitions';
import { AppShell } from '@/components/AppShell';
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SwipeHire - Skills-First Job Matching',
  description: 'A skills-first, swipe-to-match hiring app. Connect with the right opportunities through intelligent matching.',
  keywords: ['jobs', 'hiring', 'recruitment', 'skills', 'matching', 'careers'],
  authors: [{ name: 'SwipeHire Team' }],
  creator: 'SwipeHire',
  publisher: 'SwipeHire',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swipehire.com',
    title: 'SwipeHire - Skills-First Job Matching',
    description: 'A skills-first, swipe-to-match hiring app. Connect with the right opportunities through intelligent matching.',
    siteName: 'SwipeHire',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SwipeHire - Skills-First Job Matching',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwipeHire - Skills-First Job Matching',
    description: 'A skills-first, swipe-to-match hiring app. Connect with the right opportunities through intelligent matching.',
    images: ['/og-image.png'],
    creator: '@swipehire',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-black`}> 
        <AnalyticsProvider>
          <div className="min-h-full">
            <AppShell>
              <AppTransitions>
                {children}
              </AppTransitions>
            </AppShell>
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#111827',
                color: '#e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
                border: '1px solid #1f2937',
                borderRadius: '0.75rem',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#111827',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#111827',
                },
              },
            }}
          />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
