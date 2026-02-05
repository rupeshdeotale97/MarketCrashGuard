import type {Metadata, Viewport} from 'next';
import './globals.css';
import {MobileNav} from '@/components/mobile-nav';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CrashGuard',
  description: 'Track global market crash risk with rule-based indicators.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CrashGuard',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground select-none">
        <main className="flex-1 overflow-y-auto pb-24 safe-area-top">
          {children}
        </main>
        <MobileNav />
        <Toaster />
      </body>
    </html>
  );
}
