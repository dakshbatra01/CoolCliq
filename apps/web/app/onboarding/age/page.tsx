'use client';

import { useRouter } from 'next/navigation';

export default function AgeGatePage() {
  const router = useRouter();

  const handleUnder18 = () => {
    // Show blocked message or redirect out
    alert('You must be 18 or older to use CoolCliq.');
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }}
        />
      </div>

      {/* Logo at top */}
      <div className="flex items-center gap-3 mb-auto animate-fade-in">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
        >
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <circle cx="28" cy="28" r="16" stroke="white" strokeWidth="4" fill="none" />
            <circle cx="28" cy="28" r="4" fill="white" />
            <line x1="40" y1="40" x2="52" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-heading text-xl font-bold text-white">CoolCliq</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center text-center py-12 animate-slide-up">
        {/* Shield icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(167,139,250,0.2) 100%)', border: '1px solid rgba(108,99,255,0.3)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#shield-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3">
          Safety First
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-xs mb-10">
          You must be at least <span className="text-white font-semibold">18 years old</span> to join the CoolCliq community.
        </p>

        {/* CTA Buttons */}
        <div className="w-full space-y-3">
          <button
            id="btn-18-or-older"
            onClick={() => router.push('/onboarding/location')}
            className="btn-primary"
          >
            I am 18 or older
          </button>
          <button
            id="btn-under-18"
            onClick={handleUnder18}
            className="btn-secondary"
          >
            I am under 18
          </button>
        </div>

        {/* Age verification note */}
        <div className="flex items-center gap-2 mt-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B8A" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-text-muted text-xs uppercase tracking-widest font-medium">
            Age Verification Required
          </span>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="pb-safe" />
    </div>
  );
}
