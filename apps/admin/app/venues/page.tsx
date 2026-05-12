'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

interface Venue {
  id: string;
  name: string;
  address: string;
  category: string;
  isActive: boolean;
  sessions: { id: string }[];
  _count: { sessions: number };
  qrCode?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  CAFE: '', BAR: '', RESTAURANT: '', LOUNGE: '', OTHER: ''
};

const MOCK_VENUES: Venue[] = [
  { id: 'venue_1', name: 'The Blue Brew Café', address: '12 MG Road, Bengaluru', category: 'CAFE', isActive: true, sessions: Array(7).fill({ id: '1' }), _count: { sessions: 47 } },
  { id: 'venue_2', name: 'Neon Lounge', address: '45 Indiranagar, Bengaluru', category: 'LOUNGE', isActive: true, sessions: Array(12).fill({ id: '1' }), _count: { sessions: 89 } },
  { id: 'venue_3', name: 'Ember & Co.', address: '8 Koramangala, Bengaluru', category: 'BAR', isActive: false, sessions: Array(0).fill({ id: '1' }), _count: { sessions: 23 } },
];

export default function AdminVenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', address: '', lat: '', lng: '', category: 'CAFE' });
  const [adding, setAdding] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || ADMIN_TOKEN : ADMIN_TOKEN;

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await axios.get(`${API}/admin/venues`, { headers: { Authorization: `Bearer ${token}` } });
        setVenues(res.data.data);
      } catch { /* use mock */ }
    };
    fetchVenues();
  }, [token]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await axios.patch(`${API}/admin/venues/${id}`, { isActive: !current }, { headers: { Authorization: `Bearer ${token}` } });
      setVenues((v) => v.map((venue) => venue.id === id ? { ...venue, isActive: !current } : venue));
    } catch {
      setVenues((v) => v.map((venue) => venue.id === id ? { ...venue, isActive: !current } : venue));
    }
  };

  const generateQR = async (id: string) => {
    try {
      const res = await axios.post(`${API}/admin/venues/${id}/qr`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setVenues((v) => v.map((venue) => venue.id === id ? { ...venue, qrCode: res.data.data.qrCode } : venue));
      router.push(`/admin/venues/${id}/qr`);
    } catch {
      router.push(`/admin/venues/${id}/qr`);
    }
  };

  const handleAddVenue = async () => {
    if (!addForm.name || !addForm.address) return;
    setAdding(true);
    try {
      const res = await axios.post(`${API}/admin/venues`, {
        name: addForm.name,
        address: addForm.address,
        lat: parseFloat(addForm.lat) || 12.9716,
        lng: parseFloat(addForm.lng) || 77.5946,
        category: addForm.category,
        tables: ['Table 1', 'Table 2', 'Table 3'],
      }, { headers: { Authorization: `Bearer ${token}` } });
      setVenues((v) => [res.data.data, ...v]);
      setShowAddModal(false);
      setAddForm({ name: '', address: '', lat: '', lng: '', category: 'CAFE' });
    } catch {
      // Mock add
      setVenues((v) => [{
        id: `venue_${Date.now()}`,
        name: addForm.name,
        address: addForm.address,
        category: addForm.category,
        isActive: true,
        sessions: [],
        _count: { sessions: 0 },
      }, ...v]);
      setShowAddModal(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D14]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#13131F] border-r border-[#2A2A40] flex flex-col fixed left-0 top-0 z-20">
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
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { label: 'Analytics', href: '/' },
              { label: 'Venues', href: '/venues', active: true },
            ].map(({ label, href, active }) => (
              <button key={label} onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${active ? 'bg-[#6C63FF]/20 text-white' : 'text-[#9CA3AF] hover:bg-[#1A1A2E] hover:text-white'}`}>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="ml-64 flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">Venue Management</h1>
                <p className="text-[#6B6B8A] text-sm mt-1">{venues.length} venues registered</p>
              </div>
              <button
                id="btn-add-venue"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Venue
              </button>
            </div>

            {/* Venue table */}
            <div className="bg-[#13131F] border border-[#2A2A40] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A40]">
                    <th className="text-left px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Venue</th>
                    <th className="text-left px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Category</th>
                    <th className="text-center px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Active Now</th>
                    <th className="text-center px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Total Sessions</th>
                    <th className="text-center px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-4 text-[#6B6B8A] text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue, i) => (
                    <tr key={venue.id} className="border-b border-[#2A2A40] last:border-0 hover:bg-[#1A1A2E] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white text-sm">{venue.name}</p>
                        <p className="text-[#6B6B8A] text-xs mt-0.5 truncate max-w-[200px]">{venue.address}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm">{venue.category}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-[#34D399]">{venue.sessions.length}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-[#9CA3AF] text-sm">{venue._count.sessions}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          id={`toggle-venue-${venue.id}`}
                          onClick={() => toggleActive(venue.id, venue.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            venue.isActive
                              ? 'bg-[#34D399]/20 text-[#34D399]'
                              : 'bg-[#FF4D6D]/20 text-[#FF4D6D]'
                          }`}
                        >
                          {venue.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-gen-qr-${venue.id}`}
                            onClick={() => generateQR(venue.id)}
                            className="p-1.5 rounded-lg bg-[#1A1A2E] border border-[#2A2A40] hover:border-[#6C63FF] transition-all text-xs text-[#9CA3AF] hover:text-white px-3"
                          >
                            QR Code
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add venue modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13131F] border border-[#2A2A40] rounded-3xl p-6 w-full max-w-md">
            <h2 className="font-heading text-xl font-bold text-white mb-5">Add New Venue</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[#9CA3AF] text-sm mb-1 block">Venue Name *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-[#1A1A2E] border border-[#2A2A40] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6C63FF] text-sm" placeholder="The Blue Brew Café" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-sm mb-1 block">Address *</label>
                <input type="text" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  className="w-full bg-[#1A1A2E] border border-[#2A2A40] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6C63FF] text-sm" placeholder="12 MG Road, Bengaluru" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] text-sm mb-1 block">Latitude</label>
                  <input type="number" value={addForm.lat} onChange={(e) => setAddForm({ ...addForm, lat: e.target.value })}
                    className="w-full bg-[#1A1A2E] border border-[#2A2A40] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6C63FF] text-sm" placeholder="12.9716" />
                </div>
                <div>
                  <label className="text-[#9CA3AF] text-sm mb-1 block">Longitude</label>
                  <input type="number" value={addForm.lng} onChange={(e) => setAddForm({ ...addForm, lng: e.target.value })}
                    className="w-full bg-[#1A1A2E] border border-[#2A2A40] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6C63FF] text-sm" placeholder="77.5946" />
                </div>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-sm mb-1 block">Category</label>
                <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full bg-[#1A1A2E] border border-[#2A2A40] rounded-xl px-4 py-3 text-white outline-none text-sm">
                  {['CAFE', 'BAR', 'RESTAURANT', 'LOUNGE', 'OTHER'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-[#2A2A40] text-[#9CA3AF] text-sm font-medium hover:border-[#6C63FF] transition-all">
                Cancel
              </button>
              <button
                id="btn-confirm-add-venue"
                onClick={handleAddVenue}
                disabled={adding}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
              >
                {adding ? 'Adding...' : 'Add Venue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
