import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuvato AI',
    short_name: 'Nuvato',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F7FC',
    theme_color: '#0A1230',
    // Served from app/icon1.png and app/icon2.png.
    icons: [
      { src: '/icon1.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon2.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
