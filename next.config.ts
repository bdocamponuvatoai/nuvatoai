import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { securityHeaders } from './lib/security';
import { siteEnv } from './lib/env';

/**
 * Blog posts are MDX files in content/blog/ (see lib/blog.ts). Their YAML frontmatter is
 * exported as `frontmatter`. Plugins are named as strings because Turbopack can't receive
 * functions; tests compile MDX with the same plugins in vitest.config.ts.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', ['remark-mdx-frontmatter', { name: 'frontmatter' }]],
  },
});

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // ImageKit resizes and converts images; see lib/assets.ts.
  images: {
    loader: 'custom',
    loaderFile: './lib/imagekit-loader.ts',
  },

  experimental: {
    // Remind coding agents during `next dev`/`next build` when a security advisory
    // affects the installed Next.js, and set the policy for `next upgrade --agent`.
    agentUpgrade: 'security',
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

export default withMDX(nextConfig);
