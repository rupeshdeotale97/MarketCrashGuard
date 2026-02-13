 "use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MobileNav } from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/toaster';
import { AppOnboarding } from '@/components/app-onboarding';
import { siteMetadata } from './site-metadata';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Basic automatic page tracking
    const pageLabel = pathname === '/' ? 'Dashboard' : pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);
    trackEvent('page_view', pageLabel);
  }, [pathname]);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230f4c81'/><stop offset='100%25' stop-color='%231bb5fd'/></linearGradient></defs><path fill='url(%23grad1)' d='M32 2L6 12v12c0 18 12 31 26 36 14-5 26-18 26-36V12L32 2z'/><polyline fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' points='18 36 26 28 32 32 42 20 46 24'/></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground select-none">
        <main className="flex-1 overflow-y-auto pb-24 safe-area-top">
          {children}
        </main>
        <MobileNav />
        <Toaster />
        <AppOnboarding />
        <footer className="w-full text-center text-[11px] text-muted-foreground py-3 px-4 border-t border-border/40">
          <div className="max-w-4xl mx-auto">
            <div className="font-semibold text-white">{siteMetadata.authors[0].name}</div>
            <div className="mt-1">{siteMetadata.description}</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
