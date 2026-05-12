'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

const MOCK_ANALYTICS = {
  totalUsers: 1247,
  activeSessions: 34,
  totalCheckIns: 189,
  unresolvedReports: 3,
  mostActiveVenue: 'Neon Lounge',
  dailyStats: [
    { date: '2026-05-06', checkIns: 42 },
    { date: '2026-05-07', checkIns: 67 },
    { date: '2026-05-08', checkIns: 55 },
    { date: '2026-05-09', checkIns: 89 },
    { date: '2026-05-10', checkIns: 112 },
    { date: '2026-05-11', checkIns: 134 },
    { date: '2026-05-12', checkIns: 189 },
  ],
  venueActivity: [
    { name: 'Neon Lounge', count: 12 },
    { name: 'Blue Brew Café', count: 7 },
    { name: 'Ember & Co.', count: 5 },
  ],
};

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  delta?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<typeof MOCK_ANALYTICS>(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ADMIN_TOKEN;
        const res = await axios.get(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics({ ...MOCK_ANALYTICS, ...res.data.data });
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats: StatCard[] = [
    { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: '', color: '#6C63FF', delta: '+12% this week' },
    { label: 'Active Now', value: analytics.activeSessions, icon: '', color: '#34D399', delta: 'Live' },
    { label: 'Check-ins Today', value: analytics.totalCheckIns, icon: '', color: '#22D3EE', delta: '+31% vs yesterday' },
    { label: 'Open Reports', value: analytics.unresolvedReports, icon: '', color: '#FBBF24', delta: analytics.unresolvedReports > 0 ? 'Needs review' : 'All clear' },
  ];

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0D0D14]">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 min-h-screen bg-[#13131F] border-r border-[#2A2A40] flex flex-col fixed left-0 top-0 z-20">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A40]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}>
              <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
                <circle cx="28" cy="28" r="16" stroke="white" strokeWidth="4" fill="none" />
                <circle cx="28" cy="28" r="4" fill="white" />
                <line x1="40" y1="40" x2="52" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm">CoolCliq</p>
              <p className="text-[#6B6B8A] text-xs">Admin Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { id: 'nav-analytics', label: 'Analytics', href: '/' },
              { id: 'nav-venues', label: 'Venues', href: '/venues' },
              { id: 'nav-qr', label: 'QR Codes', href: '/venues' },
              { id: 'nav-reports', label: 'Reports', href: '/' },
            ].map(({ id, label, href }) => (
              <button
                key={id}
                id={id}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm text-[#9CA3AF] hover:bg-[#1A1A2E] hover:text-white"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="px-3 pb-4">
            <div className="px-3 py-2 rounded-xl bg-[#1A1A2E] text-xs text-[#6B6B8A]">
              Logged in as <span className="text-white">Admin</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">Analytics Overview</h1>
                <p className="text-[#6B6B8A] text-sm mt-1">
                  {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#13131F] border border-[#2A2A40]">
                <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="text-[#34D399] text-sm font-medium">Live</span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {stats.map(({ label, value, icon, color, delta }) => (
                <div key={label} className="bg-[#13131F] border border-[#2A2A40] rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${color}20`, color }}>
                      {delta}
                    </span>
                  </div>
                  <p className="font-heading text-3xl font-bold text-white mb-1">{value}</p>
                  <p className="text-[#6B6B8A] text-sm">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Daily check-ins line chart */}
              <div className="col-span-2 bg-[#13131F] border border-[#2A2A40] rounded-2xl p-5">
                <h3 className="font-heading font-semibold text-white mb-4">Daily Check-ins (7 days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6B6B8A" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6B6B8A" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A40', borderRadius: '12px', color: '#fff' }}
                      labelFormatter={formatDate}
                    />
                    <Line type="monotone" dataKey="checkIns" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Venue activity bar chart */}
              <div className="bg-[#13131F] border border-[#2A2A40] rounded-2xl p-5">
                <h3 className="font-heading font-semibold text-white mb-4">Active by Venue</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.venueActivity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" horizontal={false} />
                    <XAxis type="number" stroke="#6B6B8A" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#6B6B8A" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A40', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {analytics.venueActivity.map((_, i) => (
                        <Cell key={i} fill={['#6C63FF', '#A78BFA', '#22D3EE'][i % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most active venue highlight */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(167,139,250,0.1) 100%)', border: '1px solid rgba(108,99,255,0.2)' }}
            >
              <div>
                <p className="text-[#6B6B8A] text-sm">Most Active Venue Today</p>
                <p className="font-heading text-xl font-bold text-white">{analytics.mostActiveVenue}</p>
              </div>
              <button
                id="btn-view-venues"
                onClick={() => router.push('/venues')}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
              >
                Manage Venues
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
