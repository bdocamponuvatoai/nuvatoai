/**
 * Deployment settings read from environment variables (see `.env.example`).
 * Used on the server only: none of these values are exposed to the browser.
 */
type Env = Record<string, string | undefined>;

function originOf(value: string) {
  return new URL(value).origin;
}

/** Canonical origin for metadata, the sitemap, and structured data. No trailing slash. */
function resolveOrigin(env: Env) {
  if (env.SITE_URL?.trim()) return originOf(env.SITE_URL.trim());
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export function readSiteEnv(env: Env = process.env) {
  return {
    origin: resolveOrigin(env),
    /**
     * Search engines may index the site only when SITE_INDEXABLE=true, and never on
     * Vercel preview deployments, so a shared variable can't expose a preview URL.
     */
    indexable:
      env.SITE_INDEXABLE === 'true' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production'),
    /** Upstream booking service that owns availability, hosts, and calendar invitations. */
    bookingServiceOrigin: originOf(env.BOOKING_SERVICE_ORIGIN?.trim() || 'https://nuvato.ai'),
  };
}

export const siteEnv = readSiteEnv();
