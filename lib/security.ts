import { CALENDLY_ORIGIN } from './calendly';

type PolicyOptions = {
  /** False only for local http:// servers, where WebKit would upgrade every asset to a missing https:// URL. */
  secure?: boolean;
  /** React needs `eval` in development to rebuild server error stacks in the browser. */
  development?: boolean;
  /** Extra image sources, such as the ImageKit endpoint. Paths limit them to one folder. */
  imageSources?: string[];
};

/** Per-request Content-Security-Policy. Next.js reads the nonce from it and applies it to its own scripts. */
export function contentSecurityPolicy(
  nonce: string,
  { secure = true, development = false, imageSources = [] }: PolicyOptions = {},
) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${development ? " 'unsafe-eval'" : ''}`,
    // Inline style attributes drive the hero animation delays and the navigation indicator.
    "style-src 'self' 'unsafe-inline'",
    ["img-src 'self' data:", ...imageSources].join(' '),
    "font-src 'self'",
    // The booking dialog embeds Calendly's scheduler. No Calendly script runs on our pages.
    `frame-src ${CALENDLY_ORIGIN}`,
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(secure ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

/** Static headers for every response, applied in next.config.ts. */
export const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];
