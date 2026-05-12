'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { GenderFilter, GENDER_FILTER_OPTIONS, formatTimestamp } from '@coolcliq/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface VenueUser {
  sessionId: string;
  userId: string;
  alias: string;
  avatarSeed: string;
  gender: string;
  checkedInAt: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  category: string;
  tables: { id: string; label: string }[];
}

export default function VenueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';

  const [venue, setVenue] = useState<Venue | null>(null);
  const [users, setUsers] = useState<VenueUser[]>([]);
  const [filter, setFilter] = useState<GenderFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, usersRes] = await Promise.all([
          axios.get(`${API}/venues/${venueId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/venues/${venueId}/active-users`, {
            params: { gender: filter !== 'ALL' ? filter : undefined },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setVenue(venueRes.data.data);
        setUsers(usersRes.data.data);
      } catch {
        // Mock data for demo
        setVenue({ id: venueId, name: 'The Blue Brew Café', address: '12 MG Road, Bengaluru', category: 'CAFE', tables: [{ id: 't1', label: 'Table 1' }] });
        setUsers([
          { sessionId: 's1', userId: 'u1', alias: 'SilentFox', avatarSeed: 'fox42', gender: 'MALE', checkedInAt: new Date().toISOString() },
          { sessionId: 's2', userId: 'u2', alias: 'NeonWolf', avatarSeed: 'wolf7', gender: 'FEMALE', checkedInAt: new Date().toISOString() },
          { sessionId: 's3', userId: 'u3', alias: 'CrystalHawk', avatarSeed: 'hawk9', gender: 'FEMALE', checkedInAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [venueId, filter, token]);

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const res = await axios.post(
        `${API}/conversations`,
        { targetUserId: userId, venueId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/chat/${res.data.data.id}`);
    } catch {
      setStartingChat(null);
    }
  };

  const filteredUsers = filter === 'ALL' ? users : users.filter((u) => u.gender === filter);
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_user') || '{}') : {};

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="font-heading text-base font-bold text-white truncate max-w-[160px]">
            {venue?.name || 'Loading...'}
          </h1>
          <p className="text-text-muted text-xs">{users.length} people here now</p>
        </div>
        {/* Panic button */}
        <button
          id="btn-panic"
          onClick={() => router.push('/safety')}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.3)' }}
        >
          <span className="text-lg">🚨</span>
        </button>
      </div>

      {/* Venue info card */}
      {venue && (
        <div className="px-4 mb-3">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(167,139,250,0.1) 100%)', border: '1px solid rgba(108,99,255,0.2)' }}
          >
            <div className="pulse-dot shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-muted text-xs truncate">{venue.address}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-accent-green font-bold text-lg">{users.length}</span>
              <span className="text-text-muted text-xs">active</span>
            </div>
          </div>
        </div>
      )}

      {/* Gender filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {GENDER_FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              id={`filter-${value.toLowerCase()}`}
              onClick={() => setFilter(value as GenderFilter)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === value
                  ? 'text-white shadow-brand-sm'
                  : 'bg-dark-surface border border-dark-border text-text-muted'
              }`}
              style={filter === value ? { background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 mb-3 rounded-2xl" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">👀</span>
            <h3 className="font-heading font-semibold text-white mb-1">No one here yet</h3>
            <p className="text-text-muted text-sm">Be the first to connect!</p>
          </div>
        ) : (
          filteredUsers.map((user, i) => (
            <div
              key={user.sessionId}
              className="card mb-3 flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Avatar */}
              <div className="avatar w-12 h-12 shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.avatarSeed)}&backgroundColor=6C63FF`}
                  alt={user.alias}
                  className="w-full h-full"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-white text-sm">{user.alias}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge ${user.gender === 'FEMALE' ? 'badge-blue' : 'bg-accent-purple/20 text-accent-purple'} text-xs`}>
                    {user.gender === 'MALE' ? '👨 Man' : user.gender === 'FEMALE' ? '👩 Woman' : '🧑 Non-binary'}
                  </span>
                  <span className="text-text-muted text-xs">{formatTimestamp(user.checkedInAt)}</span>
                </div>
              </div>

              {/* Chat button */}
              {user.userId !== currentUser.id && (
                <button
                  id={`btn-chat-${user.userId}`}
                  onClick={() => handleStartChat(user.userId)}
                  disabled={startingChat === user.userId}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
                >
                  {startingChat === user.userId ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
