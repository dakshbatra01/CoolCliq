'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { generateRandomAlias, getAvatarUrl } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const GENDERS = [
  { value: 'MALE', label: 'Man', emoji: '👨' },
  { value: 'FEMALE', label: 'Woman', emoji: '👩' },
  { value: 'OTHER', label: 'Non-binary', emoji: '🧑' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say', emoji: '🔒' },
] as const;

const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah'] as const;

export default function ProfileSetupPage() {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';

  const [alias, setAlias] = useState(user.alias || generateRandomAlias());
  const [gender, setGender] = useState<string>(user.gender || 'PREFER_NOT_TO_SAY');
  const [avatarSeed, setAvatarSeed] = useState(user.avatarSeed || user.id || 'default');
  const [avatarStyle, setAvatarStyle] = useState<string>('bottts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=6C63FF,A78BFA`;

  const handleRandomAlias = () => setAlias(generateRandomAlias());
  const handleRandomAvatar = () => setAvatarSeed(Math.random().toString(36).slice(2, 10));

  const handleSave = async () => {
    if (!alias || alias.length < 3) {
      setError('Alias must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(alias)) {
      setError('Only letters, numbers, and underscores allowed');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.patch(
        `${API}/users/profile`,
        { alias, gender, avatarSeed: `${avatarStyle}:${avatarSeed}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('cc_user', JSON.stringify({ ...user, ...res.data.data }));
      router.replace('/map');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <div className="animate-fade-in mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Set Up Your Profile</h1>
        <p className="text-text-muted text-base">This is how others will see you — anonymously.</p>
      </div>

      <div className="animate-slide-up flex-1">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-accent-blue/50 bg-dark-surface shadow-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="Avatar" className="w-full h-full" />
            </div>
            <button
              id="btn-randomize-avatar"
              onClick={handleRandomAvatar}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-brand"
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  avatarStyle === style
                    ? 'bg-accent-blue text-white'
                    : 'bg-dark-surface text-text-muted border border-dark-border'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Alias */}
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-medium mb-2">Your Anonymous Alias</label>
          <div className="flex gap-2">
            <input
              id="alias-input"
              type="text"
              value={alias}
              onChange={(e) => { setAlias(e.target.value); setError(''); }}
              placeholder="SilentFox42"
              className="input-field flex-1"
              maxLength={30}
            />
            <button
              id="btn-random-alias"
              onClick={handleRandomAlias}
              className="btn-icon shrink-0 w-12"
              title="Random alias"
            >
              🎲
            </button>
          </div>
          {error && <p className="text-accent-red text-sm mt-1">⚠️ {error}</p>}
        </div>

        {/* Gender */}
        <div className="mb-8">
          <label className="block text-text-secondary text-sm font-medium mb-3">I identify as</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map(({ value, label, emoji }) => (
              <button
                key={value}
                id={`gender-${value.toLowerCase()}`}
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

        <button
          id="btn-save-profile"
          onClick={handleSave}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Enter CoolCliq →'}
        </button>
      </div>
    </div>
  );
}
