/**
 * Deployment-level settings in one place. Everything that changes between the
 * private review host and the public launch lives here — see README "Launch checklist".
 */
export const siteConfig = {
  /** Canonical origin used for metadata, sitemap, and structured data. No trailing slash. */
  origin: 'https://nuvato-ai-modern.arkostechnol-7313.chatgpt.site',
  /**
   * Whether search engines may index the site. Keep `false` on the review host;
   * set to `true` only when `origin` is the public production domain.
   */
  indexable: false,
  /** Upstream booking service that owns availability, hosts, and calendar invitations. */
  bookingServiceOrigin: 'https://nuvato.ai',
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
  },
} as const;
