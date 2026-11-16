import { CALENDLY_ORIGIN } from './calendly';

type PolicyOptions = {
  /** False only for local http:// servers, where WebKit would upgrade every asset to a missing https:// URL. */
  secure?: boolean;
  /** React needs `eval` in development to rebuild server error stacks in the browser. */
  development?: boolean;
  /** Extra image sources, such as the ImageKit endpoint. Paths limit them to one folder. */
  imageSources?: string[];
  /** Allow Google Tag Manager and Google Analytics 4 (see components/analytics/). */
  analytics?: boolean;
};

/**
 * Sources the Google tag and Google Analytics 4 need, as documented by Google:
 * https://developers.google.com/tag-platform/security/guides/csp
 * The container (GTM-TFHD8F5M) holds only a GA4 tag; add a vendor's sources here only
 * when a tag for it is added to the container.
 */
const GOOGLE_ANALYTICS_SOURCES = {
  script: ['https://*.googletagmanager.com'],
  img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com'],
  connect: [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
  ],
};

/** Per-request Content-Security-Policy. Next.js reads the nonce from it and applies it to its own scripts. */
export function contentSecurityPolicy(
  nonce: string,
  { secure = true, development = false, imageSources = [], analytics = false }: PolicyOptions = {},
) {
  const google = analytics ? GOOGLE_ANALYTICS_SOURCES : { script: [], img: [], connect: [] };
  const directive = (name: string, ...sources: string[]) => [name, ...sources].join(' ');

  return [
    "default-src 'self'",
    directive(
      'script-src',
      "'self'",
      `'nonce-${nonce}'`,
      ...(development ? ["'unsafe-eval'"] : []),
      ...google.script,
    ),
    // Inline style attributes drive the hero animation delays and the navigation indicator.
    "style-src 'self' 'unsafe-inline'",
    directive('img-src', "'self'", 'data:', ...imageSources, ...google.img),
    "font-src 'self'",
    // The booking dialog embeds Calendly's scheduler. No Calendly script runs on our pages.
    `frame-src ${CALENDLY_ORIGIN}`,
    directive('connect-src', "'self'", ...google.connect),
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
