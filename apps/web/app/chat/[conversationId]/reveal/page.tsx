'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function RevealTableModal() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';

  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const handleConsent = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/reveal/consent`,
        { conversationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reveal = res.data.data;
      setConsented(true);

      if (reveal.user1Consented && reveal.user2Consented && reveal.revealedAt) {
        // Both consented — redirect back to chat
        router.replace(`/chat/${conversationId}`);
      } else {
        setWaiting(true);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="font-heading text-lg font-bold text-white">Reveal Table</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-scale-in">
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(167,139,250,0.2) 100%)',
            border: '1px solid rgba(108,99,255,0.3)',
          }}
        >
          <span className="text-5xl">🍽️</span>
        </div>

        {waiting ? (
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              <svg className="animate-spin h-8 w-8 text-amber-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-3">Waiting for them...</h1>
            <p className="text-text-muted text-base leading-relaxed max-w-xs">
              You've consented to reveal your table. Waiting for the other person to agree.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" /></svg>
              </div>
              <div className="w-16 h-0.5 bg-dark-border" />
              <div className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center animate-pulse">
                <span className="text-text-muted text-xs">?</span>
              </div>
            </div>
            <p className="text-text-muted text-sm mt-4">You • Waiting for them</p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold text-white mb-3">
              Ready to Meet?
            </h1>
            <p className="text-text-muted text-base leading-relaxed max-w-xs mb-8">
              Reveal your table number so you can meet in person. <span className="text-white font-medium">Both of you must agree</span> — your location stays private until then.
            </p>

            {/* Consent steps */}
            <div className="w-full space-y-3 mb-10">
              {[
                { icon: '🔒', text: 'Only shared if both consent' },
                { icon: '❌', text: 'Either can cancel anytime' },
                { icon: '📍', text: 'Table label only — not GPS' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-left">
                  <span className="text-xl">{icon}</span>
                  <span className="text-text-secondary text-sm">{text}</span>
                </div>
              ))}
            </div>

            <button
              id="btn-consent-reveal"
              onClick={handleConsent}
              disabled={loading}
              className="btn-primary mb-3"
            >
              {loading ? 'Processing...' : '✓ I agree to reveal my table'}
            </button>
            <button
              id="btn-cancel-reveal"
              onClick={() => router.back()}
              className="btn-ghost text-text-muted text-sm"
            >
              Not yet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
