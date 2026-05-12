'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { REPORT_REASONS } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function SafetyPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';

  const [panicLoading, setPanicLoading] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  const [panicDone, setPanicDone] = useState(false);

  const handlePanicExit = async () => {
    setPanicLoading(true);
    try {
      await axios.post(`${API}/safety/panic`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPanicDone(true);
      setTimeout(() => {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        router.replace('/');
      }, 2000);
    } catch {
      setPanicLoading(false);
    }
  };

  if (panicDone) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 text-center bg-dark">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 animate-scale-in"
          style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
            <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-white mb-2">You're safe</h1>
        <p className="text-text-muted">You've been removed from the venue. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="font-heading text-lg font-bold text-white">Safety & Exit</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {/* PANIC EXIT — primary action */}
        <div
          className="rounded-3xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,109,0.15) 0%, rgba(255,107,53,0.15) 100%)',
            border: '1px solid rgba(255,77,109,0.4)',
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <span className="text-4xl">🚨</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Panic Exit</h2>
          <p className="text-text-muted text-sm mb-5 leading-relaxed">
            Instantly disappear from the venue, end all chats, and sign out. Use this if you feel unsafe.
          </p>

          {!showPanicConfirm ? (
            <button
              id="btn-panic-exit"
              onClick={() => setShowPanicConfirm(true)}
              className="btn-danger w-full"
            >
              PANIC EXIT
            </button>
          ) : (
            <div className="space-y-3 animate-scale-in">
              <p className="text-accent-red font-semibold text-sm">Are you sure? This will end your session immediately.</p>
              <button
                id="btn-confirm-panic"
                onClick={handlePanicExit}
                disabled={panicLoading}
                className="btn-danger w-full"
              >
                {panicLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exiting...
                  </span>
                ) : (
                  'Yes, Exit Now'
                )}
              </button>
              <button onClick={() => setShowPanicConfirm(false)} className="btn-ghost w-full text-text-muted">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Other safety options */}
        <div className="card space-y-4">
          <h3 className="font-heading font-semibold text-white">Other Options</h3>

          <button
            id="btn-block-someone"
            onClick={() => router.push('/map')}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Block a User</p>
              <p className="text-text-muted text-xs">They won't be able to see or message you</p>
            </div>
          </button>

          <div className="divider" />

          <button
            id="btn-report-someone"
            onClick={() => router.push('/map')}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Report Inappropriate Behavior</p>
              <p className="text-text-muted text-xs">Our team will review within 24 hours</p>
            </div>
          </button>

          <div className="divider" />

          <button
            id="btn-normal-exit"
            onClick={async () => {
              try {
                await axios.delete(`${API}/sessions/exit`, { headers: { Authorization: `Bearer ${token}` } });
              } catch {}
              router.replace('/map');
            }}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Leave Venue</p>
              <p className="text-text-muted text-xs">Normal exit — keeps your account active</p>
            </div>
          </button>
        </div>

        {/* Emergency resources */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)' }}
        >
          <p className="text-text-muted text-xs text-center">
            In an emergency, call <span className="text-white font-bold">112</span> (India) or your local emergency number.
          </p>
        </div>
      </div>
    </div>
  );
}
