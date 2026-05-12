import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoolCliq — Connect Instantly, Right Where You Are',
  description:
    'CoolCliq is an anonymous social discovery platform for real-world venues. Scan a QR code, discover who\'s nearby, and connect in real-time.',
  keywords: ['social discovery', 'anonymous chat', 'venue connect', 'QR code', 'real-world social'],
  authors: [{ name: 'CoolCliq' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CoolCliq',
  },
  openGraph: {
    title: 'CoolCliq — Connect Instantly, Right Where You Are',
    description: 'Anonymous social discovery at your favorite venues.',
    type: 'website',
    siteName: 'CoolCliq',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D14',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-dark antialiased overscroll-none">
        <main className="mobile-container">
          {children}
        </main>
      </body>
    </html>
  );
}
