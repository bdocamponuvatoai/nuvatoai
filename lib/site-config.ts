/**
 * Fixed business facts shared by pages, legal copy, and structured data.
 * Deployment-specific settings (canonical URL, indexing, booking upstream) live in `lib/env.ts`.
 */
export const siteConfig = {
  /** Existing client portal. */
  loginUrl: 'https://nuvato.ai/login',
  parentOrganizationUrl: 'https://isakglobalventures.com/',
  /** Business identity used in legal pages and structured data. */
  business: {
    name: 'Nuvato AI',
    locality: 'Chicago',
    region: 'Illinois',
    regionCode: 'IL',
    country: 'United States',
    countryCode: 'US',
    /** Published contact for legal, privacy, accessibility, and SMS help requests. Must be a monitored mailbox. */
    legalEmail: 'legal@nuvato.ai',
    /** Public website named in the SMS terms and carrier registration. No trailing slash. */
    publicUrl: 'https://www.nuvato.ai',
  },
} as const;
