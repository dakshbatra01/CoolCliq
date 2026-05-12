'use client';

import { useRouter } from 'next/navigation';

const rules = [
  { emoji: '🤝', title: 'Respect Everyone', desc: 'Treat all users with kindness. Harassment, bullying, or discrimination of any kind is not tolerated.' },
  { emoji: '🔒', title: 'Protect Privacy', desc: 'Never attempt to identify or dox another user. Anonymity is a right, not a privilege.' },
  { emoji: '💬', title: 'Keep it Appropriate', desc: 'No explicit content, hate speech, or harmful messages. Keep conversations respectful and fun.' },
  { emoji: '🚫', title: 'No Spam', desc: 'Don\'t send repetitive messages or use CoolCliq for commercial promotion.' },
  { emoji: '🛡️', title: 'Report Violations', desc: 'If you see something, say something. Use the report button to flag inappropriate behavior.' },
  { emoji: '⚡', title: 'Be Authentic', desc: 'Don\'t create fake check-ins. Venue presence verification ensures a genuine experience.' },
];

export default function CommunityGuidelinesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="font-heading text-xl font-bold text-white">The Clique Code</h1>
        <div className="w-10" />
      </div>

      {/* Subtitle */}
      <div className="px-5 mb-4">
        <p className="text-text-muted text-sm leading-relaxed">
          Our community thrives when everyone plays by the rules. By joining CoolCliq, you agree to these guidelines.
        </p>
      </div>

      {/* Scrollable rules */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 space-y-3 pb-32">
        {rules.map(({ emoji, title, desc }, i) => (
          <div
            key={title}
            className="card animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex gap-3 items-start">
              <span className="text-2xl">{emoji}</span>
              <div>
                <h3 className="font-heading font-semibold text-white mb-1">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Zero-tolerance box */}
        <div
          className="rounded-2xl p-4 mt-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,109,0.1) 0%, rgba(255,107,53,0.1) 100%)',
            border: '1px solid rgba(255,77,109,0.3)',
          }}
        >
          <div className="flex gap-3 items-start">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-heading font-semibold text-accent-red mb-1">Zero Tolerance</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Any sexual harassment, threats of violence, or predatory behavior will result in an immediate and permanent ban.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-5 py-5 bg-gradient-to-t from-dark via-dark/95 to-transparent z-10" style={{ maxWidth: '430px' }}>
        <button
          id="btn-agree-guidelines"
          onClick={() => router.push('/auth/login')}
          className="btn-primary"
        >
          I Agree to the Clique Code
        </button>
      </div>
    </div>
  );
}
