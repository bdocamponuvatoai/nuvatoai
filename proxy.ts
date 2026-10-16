import {NextResponse, type NextRequest} from 'next/server';
import {securityHeaderEntries, securityPolicy} from './app/lib/security';
import {siteConfig} from './app/lib/site-config';

/**
 * Per-request CSP nonce and security headers for the Vercel deployment.
 *
 * On Cloudflare, build/sites-worker.ts already does this before Vinext runs. Vinext
 * also executes proxy.ts, and a second nonce would not match the worker's CSP, so
 * this only acts where Vercel sets VERCEL=1.
 */
export function proxy(request: NextRequest) {
  if (process.env.VERCEL !== '1') return NextResponse.next();

  const nonce = btoa(crypto.randomUUID());
  const secure = request.nextUrl.protocol === 'https:';
  const requestHeaders = new Headers(request.headers);
  // Next.js reads the nonce from the request CSP and applies it to its own scripts;
  // layout.tsx reads x-nonce for the JSON-LD block and x-site-path to scope it to the homepage.
  requestHeaders.set('Content-Security-Policy', securityPolicy(nonce, secure));
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-site-path', request.nextUrl.pathname);

  const response = NextResponse.next({request: {headers: requestHeaders}});
  for (const [name, value] of securityHeaderEntries(nonce, secure)) response.headers.set(name, value);
  if (!siteConfig.indexable) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  // Pages and API routes; static assets don't need a nonce.
  matcher: ['/((?!_next/static|_next/image|brand/|fonts/|tools/|favicon.ico|manifest.webmanifest).*)'],
};
