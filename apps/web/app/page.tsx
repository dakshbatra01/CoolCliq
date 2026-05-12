'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // We only run this on the client to avoid hydration mismatch
    const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') : null;
    
    const timer = setTimeout(() => {
      if (token) {
        router.replace('/map');
      } else {
        router.replace('/onboarding/age');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full opacity-10 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)' }}
        />
      </div>

      {/* Logo */}
      <div className="animate-float mb-6 relative">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-brand"
          style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
        >
          {/* CoolCliq icon — stylized Q with signal waves */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="16" stroke="white" strokeWidth="3" fill="none" />
            <circle cx="28" cy="28" r="8" fill="white" fillOpacity="0.3" />
            <circle cx="28" cy="28" r="3" fill="white" />
            <line x1="40" y1="40" x2="52" y2="52" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            {/* Signal arcs */}
            <path d="M44 16 Q50 24 44 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M49 11 Q58 24 49 37" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Brand name */}
      <h1 className="font-heading text-4xl font-bold text-white mb-2 animate-fade-in">
        CoolCliq
      </h1>

      {/* Tagline */}
      <p
        className="text-center text-lg font-medium animate-slide-up"
        style={{
          background: 'linear-gradient(135deg, #C4C4D4 0%, #6B6B8A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animationDelay: '0.2s',
        }}
      >
        Connect instantly,<br />right where you are.
      </p>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-2" style={{ animation: 'fadeIn 1s ease 1s both' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
