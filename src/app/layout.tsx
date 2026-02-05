import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.guardmarketcrash.com/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
