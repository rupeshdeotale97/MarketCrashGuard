import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guard Market Crash',
    short_name: 'GMC',
    description: 'Institutional grade data and analysis to protect you from market crashes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000',
    theme_color: '#000',
    icons: [
      {
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230f4c81'/><stop offset='100%25' stop-color='%231bb5fd'/></linearGradient></defs><path fill='url(%23grad1)' d='M32 2L6 12v12c0 18 12 31 26 36 14-5 26-18 26-36V12L32 2z'/><polyline fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' points='18 36 26 28 32 32 42 20 46 24'/></svg>",
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
