import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoolCliq Admin Dashboard',
  description: 'CoolCliq venue and analytics management portal.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0D0D14] antialiased">
        {children}
      </body>
    </html>
  );
}
