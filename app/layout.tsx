import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'GeoFredE-Terra State | Rwanda Real Estate & Survey Management',
    template: '%s | GeoFredE-Terra State',
  },
  description:
    "Rwanda's premier real estate and land survey management platform. Buy, sell, rent properties, and access professional survey services across all provinces.",
  keywords: ['Rwanda real estate', 'land survey Rwanda', 'property Rwanda', 'GeoFredE', 'topographic survey'],
  authors: [{ name: 'GeoFredE-Terra State' }],
  openGraph: {
    type: 'website',
    locale: 'en_RW',
    url: 'https://geofred.com',
    siteName: 'GeoFredE-Terra State',
    title: 'GeoFredE-Terra State | Rwanda Real Estate & Survey Management',
    description: "Rwanda's premier real estate and land survey management platform.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
