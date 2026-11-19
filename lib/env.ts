import type { NextConfig } from 'next';
import { siteConfig } from './site-config';

/**
 * Deployment settings read from environment variables (see `.env.example`).
 * Used on the server only: none of these values are exposed to the browser.
 */
type Env = Record<string, string | undefined>;
type HeaderRule = Awaited<ReturnType<NonNullable<NextConfig['headers']>>>[number];

function originOf(value: string) {
  return new URL(value).origin;
}

/**
 * Canonical origin for metadata, the sitemap, and structured data. No trailing slash.
 * Every Vercel deployment, previews included, names the public site and never its own
 * *.vercel.app address, so search engines only ever see nuvato.ai as the original.
 */
function resolveOrigin(env: Env) {
  if (env.SITE_URL?.trim()) return originOf(env.SITE_URL.trim());
  if (env.VERCEL_ENV) return siteConfig.business.publicUrl;
  return 'http://localhost:3000';
}

/**
 * Production is open to search engines and AI crawlers; SITE_INDEXABLE=false closes it.
 * Preview deployments never are. A local build is only with SITE_INDEXABLE=true, for testing.
 */
function resolveIndexable(env: Env) {
  if (env.VERCEL_ENV === 'production') return env.SITE_INDEXABLE !== 'false';
  if (env.VERCEL_ENV) return false;
  return env.SITE_INDEXABLE === 'true';
}

export function readSiteEnv(env: Env = process.env) {
  return {
    origin: resolveOrigin(env),
    indexable: resolveIndexable(env),
    /**
     * Offer analytics (and its consent banner) on production deployments only, so
     * previews and local development never send data. ENABLE_ANALYTICS=true turns it on
     * elsewhere for testing.
     */
    analyticsEnabled: env.VERCEL_ENV === 'production' || env.ENABLE_ANALYTICS === 'true',
  };
}

export const siteEnv = readSiteEnv();

/**
 * X-Robots-Tag rules for next.config.ts. Even when the site is indexable, every host other
 * than the canonical one (such as the production deployment's own *.vercel.app address)
 * sends noindex, so a copy of the site never competes with the real one.
 */
export function robotsHeaders({ origin, indexable }: ReturnType<typeof readSiteEnv>) {
  const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
  if (!indexable) return [{ source: '/:path*', headers: noindex }] satisfies HeaderRule[];

  // Next.js and Vercel match a host condition against the whole hostname, as a regex.
  const host = new URL(origin).hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    { source: '/:path*', missing: [{ type: 'host', value: host }], headers: noindex },
  ] satisfies HeaderRule[];
}
