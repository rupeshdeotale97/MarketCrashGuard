import type {Metadata} from 'next';
import './globals.css';
import {MobileNav} from '@/components/mobile-nav';

export const metadata: Metadata = {
  title: 'CrashGuard',
  description: 'Track global market crash risk with rule-based indicators.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
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
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}