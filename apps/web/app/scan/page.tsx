'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function QRScannerPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const scannerRef = useRef<any>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') || '' : '';

  useEffect(() => {
    let scanner: any;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            handleScan(decodedText);
            scanner.stop();
            setScanning(false);
          },
          () => {}
        );
        setScanning(true);
      } catch (err) {
        setError('Camera access denied. Please allow camera access to scan QR codes.');
      }
    };

    startScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      setScannedData(parsed);
    } catch {
      setError('Invalid QR code. Please scan a CoolCliq venue QR code.');
    }
  };

  const handleCheckIn = async () => {
    if (!scannedData) return;
    setProcessing(true);
    setError('');

    const doCheckIn = (lat: number, lng: number) =>
      axios.post(
        `${API}/sessions/checkin`,
        { venueId: scannedData.venueId, tableId: scannedData.tableId, lat, lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await doCheckIn(pos.coords.latitude, pos.coords.longitude);
              router.push(`/venue/${scannedData.venueId}`);
            } catch (err: any) {
              setError(err.response?.data?.error || 'Check-in failed. Make sure you\'re at the venue.');
              setProcessing(false);
            }
          },
          async () => {
            // GPS not available — try with venue coords as fallback (dev mode)
            try {
              await doCheckIn(0, 0);
              router.push(`/venue/${scannedData.venueId}`);
            } catch (err: any) {
              setError(err.response?.data?.error || 'Check-in failed.');
              setProcessing(false);
            }
          }
        );
      }
    } catch {
      setError('Check-in failed. Please try again.');
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setScannedData(null);
    setError('');
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark">
      {/* Header */}
      <div className="screen-header">
        <button onClick={() => router.back()} className="btn-icon w-10 h-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="font-heading text-lg font-bold text-white">Scan Venue QR</h1>
        <div className="w-10" />
      </div>

      {!scannedData ? (
        <>
          {/* Camera view */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative w-full max-w-xs">
              {/* QR scanner container */}
              <div id="qr-reader" className="w-full rounded-3xl overflow-hidden" />

              {/* Overlay frame (when scanning) */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner markers */}
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                    <div
                      key={pos}
                      className={`absolute w-8 h-8 border-4 border-accent-blue ${
                        pos.includes('top') ? 'top-4' : 'bottom-4'
                      } ${
                        pos.includes('left') ? 'left-4 border-r-0 border-b-0 rounded-tl-xl' : 'right-4 border-l-0 border-b-0 rounded-tr-xl'
                      } ${
                        pos.includes('bottom')
                          ? pos.includes('left')
                            ? 'border-r-0 border-t-0 rounded-bl-xl'
                            : 'border-l-0 border-t-0 rounded-br-xl'
                          : ''
                      }`}
                    />
                  ))}
                  {/* Scanning line */}
                  <div
                    className="absolute left-8 right-8 h-0.5 bg-accent-blue/70 animate-bounce"
                    style={{ top: '50%' }}
                  />
                </div>
              )}
            </div>

            {scanning && (
              <p className="text-text-muted text-sm mt-6 text-center animate-pulse">
                Point your camera at the venue QR code
              </p>
            )}

            {error && (
              <div
                className="mt-4 w-full rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)' }}
              >
                <p className="text-accent-red text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="px-5 pb-8">
            <p className="text-center text-text-muted text-sm">
              Ask venue staff for the CoolCliq QR code
            </p>
          </div>
        </>
      ) : (
        /* Venue confirmation */
        <div className="flex-1 flex flex-col items-center justify-center px-6 animate-scale-in">
          {/* Success icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(34,211,238,0.2) 100%)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-heading text-2xl font-bold text-white mb-2 text-center">QR Code Scanned!</h2>
          <p className="text-text-muted text-base mb-6 text-center">Ready to check in:</p>

          <div className="card w-full mb-8 text-center">
            <p className="text-2xl mb-2">
              {scannedData.type === 'venue' ? '🏠' : '🪑'}
            </p>
            <h3 className="font-heading text-xl font-bold text-white mb-1">
              {scannedData.venueName}
            </h3>
            {scannedData.tableLabel && (
              <p className="text-accent-blue font-medium">{scannedData.tableLabel}</p>
            )}
          </div>

          {error && (
            <div
              className="w-full rounded-2xl p-4 mb-4 text-center"
              style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)' }}
            >
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          <button
            id="btn-checkin"
            onClick={handleCheckIn}
            disabled={processing}
            className="btn-primary mb-3"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying Location...
              </span>
            ) : (
              'Check In Now ✓'
            )}
          </button>
          <button onClick={resetScan} className="btn-ghost text-text-muted text-sm">
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
