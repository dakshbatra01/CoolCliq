'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { generateRandomAlias } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const GENDERS = [
  { value: 'MALE', label: 'Man', emoji: '👨' },
  { value: 'FEMALE', label: 'Woman', emoji: '👩' },
  { value: 'OTHER', label: 'Non-binary', emoji: '🧑' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Private', emoji: '🔒' },
] as const;

const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah'] as const;

export default function EditProfilePage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_user') || '{}') : {};

  const [alias, setAlias] = useState(storedUser.alias || '');
  const [gender, setGender] = useState<string>(storedUser.gender || 'PREFER_NOT_TO_SAY');
  const [avatarSeed, setAvatarSeed] = useState<string>(() => {
    const stored = storedUser.avatarSeed || '';
    return stored.includes(':') ? stored.split(':')[1] : stored;
  });
  const [avatarStyle, setAvatarStyle] = useState<string>(() => {
    const stored = storedUser.avatarSeed || '';
    return stored.includes(':') ? stored.split(':')[0] : 'bottts';
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=6C63FF,A78BFA`;

  const handleSave = async () => {
    if (!alias || alias.length < 3) {
      setError('Alias must be at least 3 characters');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await axios.patch(
        `${API}/users/profile`,
        { alias, gender, avatarSeed: `${avatarStyle}:${avatarSeed}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('cc_user', JSON.stringify({ ...storedUser, ...res.data.data }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    router.replace('/');
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
        <h1 className="font-heading text-lg font-bold text-white">Edit Profile</h1>
        <button
          id="btn-save-profile-header"
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-semibold text-accent-blue disabled:text-text-muted"
        >
          {saving ? 'Saving...' : success ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar pb-32">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-accent-blue/50 bg-dark-surface shadow-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="Avatar" className="w-full h-full" />
            </div>
            <button
              id="btn-random-avatar-edit"
              onClick={() => setAvatarSeed(Math.random().toString(36).slice(2, 10))}
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-brand"
              style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
            >
              🎲
            </button>
          </div>

          {/* Style selector */}
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setAvatarStyle(style)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  avatarStyle === style
                    ? 'border-accent-blue bg-accent-blue/20 text-accent-blue'
                    : 'border-dark-border bg-dark-surface text-text-muted'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Alias */}
        <div className="mb-5">
          <label className="block text-text-secondary text-sm font-medium mb-2">Anonymous Alias</label>
          <div className="flex gap-2">
            <input
              id="edit-alias-input"
              type="text"
              value={alias}
              onChange={(e) => { setAlias(e.target.value); setError(''); }}
              placeholder="SilentFox42"
              className="input-field flex-1"
              maxLength={30}
            />
            <button
              onClick={() => setAlias(generateRandomAlias())}
              className="btn-icon shrink-0 w-12"
            >
              🎲
            </button>
          </div>
          {error && <p className="text-accent-red text-xs mt-1">⚠️ {error}</p>}
        </div>

        {/* Gender */}
        <div className="mb-8">
          <label className="block text-text-secondary text-sm font-medium mb-3">I identify as</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setGender(value)}
                className={`flex items-center gap-2 py-3 px-4 rounded-2xl text-left transition-all border ${
                  gender === value
                    ? 'border-accent-blue bg-accent-blue/10 text-white'
                    : 'border-dark-border bg-dark-surface text-text-muted'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="card space-y-4">
          <h3 className="font-heading font-semibold text-white">App</h3>
          <button onClick={() => router.push('/onboarding/community')} className="flex items-center justify-between w-full">
            <span className="text-text-secondary text-sm">Community Guidelines</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B8A" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="divider" />
          <button onClick={() => router.push('/safety')} className="flex items-center justify-between w-full">
            <span className="text-text-secondary text-sm">Safety & Privacy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B8A" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="divider" />
          <button id="btn-logout" onClick={handleLogout} className="flex items-center justify-between w-full">
            <span className="text-accent-red text-sm font-medium">Log Out</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Version */}
        <p className="text-center text-text-muted text-xs mt-6">CoolCliq v1.0.0 MVP</p>
      </div>

      {/* Fixed Save button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-5 py-4 bg-gradient-to-t from-dark via-dark/95 to-transparent z-10" style={{ maxWidth: '430px' }}>
        <button
          id="btn-save-profile-bottom"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : success ? '✓ Profile Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
