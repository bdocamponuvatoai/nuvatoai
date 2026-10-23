import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { connection } from 'next/server';
import { description, siteOrigin, socialImage, title } from '@/lib/seo';
import { siteEnv } from '@/lib/env';
import './styles/globals.css';
import './styles/agents.css';
import './styles/tools.css';
import './styles/navigation.css';
import './styles/directory.css';
import './styles/booking.css';
import './styles/polish.css';

const inter = localFont({
  src: './fonts/inter.woff2',
  weight: '400 800',
  variable: '--font-inter',
  display: 'swap',
});
const sora = localFont({
  src: './fonts/sora.woff2',
  weight: '400 700',
  variable: '--font-sora',
  display: 'swap',
});
const plexMono = localFont({
  src: './fonts/ibm-plex-mono.woff2',
  weight: '400',
  variable: '--font-plex-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  alternates: { canonical: '/' },
  robots: { index: siteEnv.indexable, follow: siteEnv.indexable },
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Nuvato AI',
    locale: 'en_US',
    url: `${siteOrigin}/`,
    images: [{ ...socialImage, alt: 'Nuvato AI — We build the systems your business runs on.' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [socialImage.url] },
};

export const viewport: Viewport = {
  themeColor: '#0A1230',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Every page carries a per-request CSP nonce (see proxy.ts), which requires dynamic rendering.
  await connection();

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
