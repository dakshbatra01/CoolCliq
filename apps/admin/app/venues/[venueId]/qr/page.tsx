'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function QRGenerationPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId as string;
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [venueName, setVenueName] = useState('Venue');
  const [generating, setGenerating] = useState(false);
  const [tables, setTables] = useState<{ id: string; label: string; qrCode?: string }[]>([]);

  useEffect(() => {
    const generateInitialQR = async () => {
      setGenerating(true);
      try {
        const res = await axios.post(`${API}/admin/venues/${venueId}/qr`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setQrCode(res.data.data.qrCode);
      } catch {
        // Generate client-side mock QR
        const mockData = JSON.stringify({ type: 'venue', venueId, venueName: 'The Blue Brew Café', t: Date.now() });
        const QRCode = await import('qrcode');
        const url = await QRCode.default.toDataURL(mockData, { width: 400, margin: 2 });
        setQrCode(url);
        setVenueName('The Blue Brew Café');
        setTables([
          { id: 't1', label: 'Table 1' },
          { id: 't2', label: 'Table 2' },
          { id: 't3', label: 'Table 3' },
          { id: 't4', label: 'Bar Seat 1' },
          { id: 't5', label: 'Bar Seat 2' },
        ]);
      } finally {
        setGenerating(false);
      }
    };
    generateInitialQR();
  }, [venueId, token]);

  const generateTableQR = async (tableId: string, label: string) => {
    try {
      const QRCode = await import('qrcode');
      const data = JSON.stringify({ type: 'table', venueId, tableId, tableLabel: label, venueName, t: Date.now() });
      const url = await QRCode.default.toDataURL(data, { width: 300, margin: 2 });
      setTables((t) => t.map((tbl) => tbl.id === tableId ? { ...tbl, qrCode: url } : tbl));
    } catch {}
  };

  const downloadQR = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const printQR = () => window.print();

  return (
    <div className="min-h-screen bg-[#0D0D14]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#13131F] border-r border-[#2A2A40] fixed left-0 top-0 z-20 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A40]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}>
              <svg width="18" height="18" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="16" stroke="white" strokeWidth="4" fill="none" /><circle cx="28" cy="28" r="4" fill="white" /><line x1="40" y1="40" x2="52" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" /></svg>
            </div>
            <div><p className="font-heading font-bold text-white text-sm">CoolCliq</p><p className="text-[#6B6B8A] text-xs">Admin Portal</p></div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[{ icon: '📊', label: 'Analytics', href: '/admin' }, { icon: '🏠', label: 'Venues', href: '/admin/venues' }].map(({ icon, label, href }) => (
              <button key={label} onClick={() => router.push(href)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-[#9CA3AF] hover:bg-[#1A1A2E] hover:text-white transition-all">
                <span className="text-lg">{icon}</span>{label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="ml-64 flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => router.back()} className="p-2 rounded-xl bg-[#13131F] border border-[#2A2A40] hover:border-[#6C63FF] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              </button>
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">QR Code Generation</h1>
                <p className="text-[#6B6B8A] text-sm">{venueName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Venue QR */}
              <div className="bg-[#13131F] border border-[#2A2A40] rounded-2xl p-6">
                <h2 className="font-heading text-lg font-bold text-white mb-4">Venue QR Code</h2>
                <p className="text-[#6B6B8A] text-sm mb-5">Place at venue entrance for check-ins without specific table assignment.</p>

                {generating ? (
                  <div className="w-full aspect-square rounded-2xl bg-[#1A1A2E] flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-[#6C63FF]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : qrCode ? (
                  <div>
                    {/* QR Code display */}
                    <div className="w-full bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCode} alt="Venue QR Code" className="w-full max-w-[200px]" />
                    </div>
                    <div
                      className="text-center py-2 px-4 rounded-xl mb-4 text-sm font-medium"
                      style={{ background: 'rgba(108,99,255,0.1)', color: '#A78BFA' }}
                    >
                      {venueName}
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="btn-download-venue-qr"
                        onClick={() => downloadQR(qrCode, `${venueName}-venue-qr.png`)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
                      >
                        Download PNG
                      </button>
                      <button
                        id="btn-print-venue-qr"
                        onClick={printQR}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] border border-[#2A2A40] hover:border-[#6C63FF] transition-all"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Table QRs */}
              <div className="bg-[#13131F] border border-[#2A2A40] rounded-2xl p-6">
                <h2 className="font-heading text-lg font-bold text-white mb-4">Table QR Codes</h2>
                <p className="text-[#6B6B8A] text-sm mb-5">Generate individual QR codes for each table.</p>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#1A1A2E] border border-[#2A2A40]">
                      <span className="text-white text-sm font-medium">{table.label}</span>
                      <div className="flex gap-2">
                        {table.qrCode ? (
                          <>
                            <button
                              onClick={() => downloadQR(table.qrCode!, `${table.label}-qr.png`)}
                              className="text-xs px-3 py-1.5 rounded-lg text-[#6C63FF] border border-[#6C63FF]/30 hover:bg-[#6C63FF]/10 transition-all"
                            >
                              Download
                            </button>
                            <div className="w-8 h-8 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={table.qrCode} alt={table.label} className="w-6 h-6" />
                            </div>
                          </>
                        ) : (
                          <button
                            id={`btn-gen-table-qr-${table.id}`}
                            onClick={() => generateTableQR(table.id, table.label)}
                            className="text-xs px-3 py-1.5 rounded-lg text-white transition-all"
                            style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tables.length === 0 && (
                    <p className="text-[#6B6B8A] text-sm text-center py-8">No tables configured</p>
                  )}
                </div>
              </div>
            </div>

            {/* Usage instructions */}
            <div className="mt-6 bg-[#13131F] border border-[#2A2A40] rounded-2xl p-5">
              <h3 className="font-heading font-semibold text-white mb-3">📋 Deployment Instructions</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { step: '1', title: 'Print QR Codes', desc: 'Print venue QR at the entrance and table QRs at each table.' },
                  { step: '2', title: 'Laminate & Place', desc: 'Use table tents or acrylic stands. Replace after 30 days for security.' },
                  { step: '3', title: 'Test Scan', desc: 'Use the CoolCliq app to verify each QR code works before your soft launch.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)' }}>
                      {step}
                    </div>
                    <p className="text-white font-medium text-sm mb-1">{title}</p>
                    <p className="text-[#6B6B8A] text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
