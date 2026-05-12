'use client';

import { useRouter } from 'next/navigation';

const privacyFeatures = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#priv-grad-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="priv-grad-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6C63FF" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient></defs>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Truly Anonymous',
    desc: 'Only your chosen alias and avatar are visible. Your real name and phone stay private.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#priv-grad-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="priv-grad-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6C63FF" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Mutual Consent',
    desc: 'Table location is only revealed when both people agree. You\'re always in control.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#priv-grad-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="priv-grad-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6C63FF" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient></defs>
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    title: 'Instant Exit',
    desc: 'Tap Panic Exit anytime to instantly disappear from the venue and end all chats.',
  },
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="btn-icon w-10 h-10 mb-8 self-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <div className="animate-slide-up">
        <div className="mb-8">
          <span className="badge badge-blue mb-3">Our Priority</span>
          <h1 className="font-heading text-3xl font-bold text-white mb-3">
            Privacy &<br />Anonymity First
          </h1>
          <p className="text-text-secondary text-base leading-relaxed">
            CoolCliq is built on the belief that real connections shouldn't require revealing your identity.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-4 mb-10">
          {privacyFeatures.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="card flex gap-4 items-start animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(167,139,250,0.15) 100%)',
                  border: '1px solid rgba(108,99,255,0.2)',
                }}
              >
                {icon}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white mb-1">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button id="btn-get-started" onClick={() => router.push('/auth/login')} className="btn-primary mb-3">
          Get Started
        </button>
        <button onClick={() => router.push('/onboarding/community')} className="btn-ghost w-full text-center text-text-muted text-sm">
          Read Community Guidelines
        </button>
      </div>
    </div>
  );
}
