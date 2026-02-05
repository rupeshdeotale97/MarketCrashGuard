"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MobileNav } from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/toaster';

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
      </body>
    </html>
  );
}
