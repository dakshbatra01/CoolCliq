'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  activeUserCount: number;
  distanceMeters: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  CAFE: '☕',
  BAR: '🍸',
  RESTAURANT: '🍽️',
  LOUNGE: '🛋️',
  OTHER: '📍',
};

export default function LiveVenueMapPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [view, setView] = useState<'map' | 'list'>('list');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const token = mounted ? localStorage.getItem('cc_token') || '' : '';

  const fetchVenues = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`${API}/venues/nearby`, {
        params: { lat, lng, radius: 100000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenues(res.data.data);
    } catch {
      // Fallback mock venues for demo
      setVenues([
        { id: 'venue_1', name: 'The Blue Brew Café', address: '12 MG Road, Bengaluru', lat: lat + 0.001, lng: lng + 0.001, category: 'CAFE', activeUserCount: 7, distanceMeters: 120 },
        { id: 'venue_2', name: 'Neon Lounge', address: '45 Indiranagar, Bengaluru', lat: lat + 0.003, lng: lng - 0.002, category: 'LOUNGE', activeUserCount: 12, distanceMeters: 350 },
        { id: 'venue_3', name: 'Ember & Co.', address: '8 Koramangala 5th Block', lat: lat - 0.002, lng: lng + 0.003, category: 'BAR', activeUserCount: 5, distanceMeters: 680 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          fetchVenues(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default to Bengaluru city center for demo
          const defaultLat = 12.9716;
          const defaultLng = 77.5946;
          setUserLat(defaultLat);
          setUserLng(defaultLng);
          fetchVenues(defaultLat, defaultLng);
        }
      );
    }
  }, [fetchVenues]);

  const formatDistance = (m: number) =>
    m < 1000 ? `${m}m away` : `${(m / 1000).toFixed(1)}km away`;

  const user = mounted ? JSON.parse(localStorage.getItem('cc_user') || '{}') : {};

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="screen-header">
        <div>
          <h1 className="font-heading text-xl font-bold text-white">Nearby Venues</h1>
          <p className="text-text-muted text-xs">
            {loading ? 'Finding venues...' : `${venues.length} active venue${venues.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            id="btn-toggle-view"
            onClick={() => setView(view === 'list' ? 'map' : 'list')}
            className="btn-icon"
          >
            {view === 'list' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            )}
          </button>
          {/* Profile avatar */}
          <button id="btn-profile" onClick={() => router.push('/profile/edit')} className="avatar w-9 h-9">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.avatarSeed || 'default')}&backgroundColor=6C63FF`}
              alt="Profile"
              className="w-full h-full"
            />
          </button>
        </div>
      </div>

      {/* Map view / List view */}
      {view === 'map' ? (
        <div className="flex-1 relative bg-dark-surface z-0 min-h-[500px] h-full w-full">
          {userLat && userLng ? (
            <MapComponent venues={venues} userLat={userLat} userLng={userLng} />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-text-muted text-sm">
              Waiting for location...
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32">
          {/* Live banner */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(34,211,238,0.1) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            <div className="pulse-dot" />
            <span className="text-accent-green text-sm font-medium">Live — Updated just now</span>
          </div>

          {/* Venue cards */}
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-24 mb-3 rounded-2xl" />
              ))
            : venues.map((venue, i) => (
                <button
                  key={venue.id}
                  id={`venue-card-${venue.id}`}
                  onClick={() => router.push(`/venue/${venue.id}`)}
                  className="w-full card mb-3 text-left hover:border-accent-blue/40 transition-all animate-slide-up active:scale-[0.98]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(167,139,250,0.15) 100%)' }}
                    >
                      {CATEGORY_EMOJI[venue.category] || '📍'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-white text-sm truncate">{venue.name}</h3>
                        {/* Active user badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                          <span className="text-accent-green text-xs font-bold">{venue.activeUserCount}</span>
                        </div>
                      </div>
                      <p className="text-text-muted text-xs truncate mb-2">{venue.address}</p>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-blue text-xs">{venue.category}</span>
                        <span className="text-text-muted text-xs">{formatDistance(venue.distanceMeters)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
        </div>
      )}

      {/* FAB: Scan QR */}
      <button
        id="fab-scan-qr"
        onClick={() => router.push('/scan')}
        className="fab"
        style={{ bottom: '80px' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" /><rect x="3" y="16" width="5" height="5" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
        </svg>
      </button>

      {/* Bottom tab bar */}
      <nav className="tab-bar">
        <button id="tab-map" onClick={() => {}} className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-xs text-accent-blue font-medium">Venues</span>
        </button>
        <button id="tab-scan" onClick={() => router.push('/scan')} className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B8A" strokeWidth="2">
            <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" /><rect x="3" y="16" width="5" height="5" rx="1" />
          </svg>
          <span className="text-xs text-text-muted">Scan</span>
        </button>
        <button id="tab-profile" onClick={() => router.push('/profile/edit')} className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B8A" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-xs text-text-muted">Profile</span>
        </button>
      </nav>
    </div>
  );
}
