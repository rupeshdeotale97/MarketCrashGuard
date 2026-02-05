import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CrashGuard Risk Manager',
    short_name: 'CrashGuard',
    description: 'Professional-grade global market risk monitoring and capital protection. Track US, India, and Crypto systemic risk in real-time.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#3b3164',
    icons: [
      {
        src: 'https://picsum.photos/seed/crashguard/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://picsum.photos/seed/crashguard/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['finance', 'productivity', 'utilities'],
    orientation: 'portrait',
    scope: '/',
  }
}
