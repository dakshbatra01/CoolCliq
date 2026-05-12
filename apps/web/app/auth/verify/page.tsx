'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phone = typeof window !== 'undefined' ? localStorage.getItem('cc_pending_phone') || '' : '';

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(Boolean)) verifyOTP(newOtp.join(''));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const arr = paste.split('');
      setOtp(arr);
      inputRefs.current[5]?.focus();
      verifyOTP(paste);
    }
  };

  const verifyOTP = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { phone, code });
      const { token, user, isNewUser } = res.data.data;
      localStorage.setItem('cc_token', token);
      localStorage.setItem('cc_user', JSON.stringify(user));
      localStorage.removeItem('cc_pending_phone');
      router.replace(isNewUser ? '/auth/profile' : '/map');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { phone });
      setResendTimer(30);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : '...';

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="btn-icon w-10 h-10 mb-8 self-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <div className="animate-slide-up flex-1">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(167,139,250,0.2) 100%)', border: '1px solid rgba(108,99,255,0.3)' }}
        >
          <span className="text-3xl">📱</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-2">Verify OTP</h1>
        <p className="text-text-muted text-base mb-8">
          We sent a 6-digit code to <span className="text-text-secondary font-medium">{maskedPhone}</span>
        </p>

        {/* OTP boxes */}
        <div className="flex gap-2 justify-between mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              id={`otp-box-${i}`}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="otp-box flex-1"
              disabled={loading}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-accent-red text-sm mb-4 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-3 mb-4 text-text-muted text-sm">
            <svg className="animate-spin h-4 w-4 text-accent-blue" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying...
          </div>
        )}

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-text-muted text-sm">Didn't receive it?</span>
          <button
            id="btn-resend-otp"
            onClick={handleResend}
            disabled={resendTimer > 0 || resending}
            className={`text-sm font-medium transition-colors ${
              resendTimer > 0 ? 'text-text-muted cursor-default' : 'text-accent-blue'
            }`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>

        {/* Dev hint */}
        {process.env.NODE_ENV !== 'production' && (
          <div
            className="rounded-xl p-3 mt-6 text-center"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            <p className="text-xs text-amber-400">
              🛠️ Dev mode — Enter <strong>000000</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
