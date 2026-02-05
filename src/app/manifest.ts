import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CrashGuard Risk Manager',
    short_name: 'CrashGuard',
    description: 'Professional market risk monitoring and capital protection.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#24305E',
    icons: [
      {
        src: 'https://picsum.photos/seed/crashguard/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/crashguard/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}