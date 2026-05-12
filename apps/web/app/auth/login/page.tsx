'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { isValidPhone, normalizePhone } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
];

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = `${countryCode}${phone.replace(/^0/, '')}`;

  const handleSendOTP = async () => {
    setError('');
    if (!phone || !isValidPhone(fullPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { phone: normalizePhone(fullPhone) });
      localStorage.setItem('cc_pending_phone', normalizePhone(fullPhone));
      router.push('/auth/verify');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="btn-icon w-10 h-10 mb-8 self-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <div className="animate-slide-up flex-1">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-text-muted text-base">Enter your phone number to get started.</p>
        </div>

        {/* Phone input with country code */}
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-medium mb-2">Phone Number</label>
          <div className="flex gap-2">
            {/* Country selector */}
            <select
              id="country-code-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="input-field w-28 shrink-0 bg-dark-surface"
              style={{ paddingRight: '8px' }}
            >
              {COUNTRY_CODES.map(({ code, flag, label }) => (
                <option key={code} value={code} className="bg-dark-surface">
                  {flag} {code}
                </option>
              ))}
            </select>

            {/* Phone number */}
            <input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="98765 43210"
              className="input-field flex-1"
              maxLength={12}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-accent-red text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>

        {/* Dev hint */}
        {process.env.NODE_ENV !== 'production' && (
          <div
            className="rounded-xl p-3 mb-6 flex items-start gap-2"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            <span>🛠️</span>
            <p className="text-xs text-amber-400">
              <strong>Dev mode:</strong> Use any phone number. OTP code is <strong>000000</strong>
            </p>
          </div>
        )}

        <button
          id="btn-send-otp"
          onClick={handleSendOTP}
          disabled={loading || !phone}
          className="btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending OTP...
            </span>
          ) : (
            'Send OTP →'
          )}
        </button>

        <p className="text-center text-text-muted text-sm">
          By continuing, you agree to our{' '}
          <button onClick={() => router.push('/onboarding/community')} className="text-accent-blue underline">
            Community Guidelines
          </button>
        </p>
      </div>
    </div>
  );
}
