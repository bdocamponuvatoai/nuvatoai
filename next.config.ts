import type { NextConfig } from 'next';
import { securityHeaders } from './lib/security';
import { siteEnv } from './lib/env';

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // ImageKit resizes and converts images; see lib/assets.ts.
  images: {
    loader: 'custom',
    loaderFile: './lib/imagekit-loader.ts',
  },

  async headers() {
    const robotsHeader = siteEnv.indexable
      ? []
      : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

    return [
      {
        // The Content-Security-Policy needs a per-request nonce, so proxy.ts sets it.
        source: '/:path*',
        headers: [...securityHeaders, ...robotsHeader],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/privacy-policy', destination: '/privacy/', permanent: true },
      { source: '/disclaimer', destination: '/terms/#website-information', permanent: true },
      { source: '/legal', destination: '/terms/', permanent: true },
    ];
  },
};

export default nextConfig;
