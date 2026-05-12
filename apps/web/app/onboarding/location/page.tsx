'use client';

import { useRouter } from 'next/navigation';

export default function LocationPermissionPage() {
  const router = useRouter();

  const requestLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          router.push('/onboarding/privacy');
        },
        () => {
          // Permission denied — still allow to proceed (GPS validated at check-in)
          router.push('/onboarding/privacy');
        }
      );
    } else {
      router.push('/onboarding/privacy');
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Back button */}
      <button onClick={() => router.back()} className="btn-icon w-10 h-10 mb-auto self-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center py-8 animate-slide-up">
        {/* Illustration */}
        <div className="relative mb-8">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(34,211,238,0.15) 100%)',
              border: '1px solid rgba(108,99,255,0.2)',
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse-slow"
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.25) 0%, rgba(34,211,238,0.25) 100%)',
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#loc-grad)" strokeWidth="1.5">
                <defs>
                  <linearGradient id="loc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border border-accent-blue/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-12px] rounded-full border border-accent-blue/10 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3">
          Find Your Crowd
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-xs mb-4">
          CoolCliq uses your location to find nearby venues and verify you're actually there. We never share your exact location.
        </p>

        {/* Privacy points */}
        <div className="w-full space-y-3 mb-10 text-left">
          {[
            { icon: '📍', text: 'Used only for venue proximity check' },
            { icon: '🔒', text: 'Never shared with other users' },
            { icon: '⚡', text: 'Only active when you check in' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-surface border border-dark-border">
              <span className="text-xl">{icon}</span>
              <span className="text-text-secondary text-sm">{text}</span>
            </div>
          ))}
        </div>

        <button id="btn-allow-location" onClick={requestLocation} className="btn-primary mb-3">
          Allow Location Access
        </button>
        <button onClick={() => router.push('/onboarding/privacy')} className="btn-ghost text-text-muted text-sm">
          Skip for now
        </button>
      </div>
    </div>
  );
}
