import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'AgriOS — The Open Intelligence Layer for Regenerative Agriculture',
  description: 'Give every farm a Digital Twin. Sense. Understand. Simulate. Act. Learn. Share. AI-powered agricultural decision platform built for BRICS cooperation.',
  keywords: 'agriculture, AI, farm digital twin, regenerative farming, crop disease, NDVI, satellite, Gemini',
  openGraph: {
    title: 'AgriOS',
    description: 'Open Intelligence Layer for Regenerative Agriculture',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
