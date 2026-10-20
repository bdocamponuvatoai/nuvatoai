import { NextResponse, type NextRequest } from 'next/server';
import { imageKitEndpoint } from './lib/assets';
import { contentSecurityPolicy } from './lib/security';

// A trailing slash makes the CSP source match everything under the folder, and nothing else.
const imageSources = [`${imageKitEndpoint}/`];

/** Generates a fresh CSP nonce for every page request. Static security headers live in next.config.ts. */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = contentSecurityPolicy(nonce, {
    secure: request.nextUrl.protocol === 'https:',
    development: process.env.NODE_ENV === 'development',
    imageSources,
  });

  // Next.js extracts the nonce from the request's CSP header during rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API routes return JSON, and static assets need no nonce.
      source:
        '/((?!api/|_next/static|_next/image|favicon.ico|icon1.png|icon2.png|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
