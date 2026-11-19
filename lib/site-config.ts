/**
 * Fixed business facts shared by pages, legal copy, and structured data.
 * Deployment-specific settings (indexing, a SITE_URL override) live in `lib/env.ts`.
 */
export const siteConfig = {
  /** Existing client portal. */
  loginUrl: 'https://nuvato.ai/login',
  parentOrganizationUrl: 'https://isakglobalventures.com/',
  /**
   * Google Tag Manager container (Google Analytics 4). Public by design: it appears in every
   * page that loads it. Loaded only in production and only after a visitor accepts analytics
   * cookies; see components/analytics/.
   */
  analytics: {
    gtmId: 'GTM-TFHD8F5M',
  },
  /** The consultation booked through Calendly (see lib/calendly.ts). Must match the Calendly event type. */
  consultation: {
    name: 'Discovery call',
    minutes: 30,
    calendlyUrl: 'https://calendly.com/nuvato-ai/30min',
  },
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
    /**
     * The public website, with no trailing slash: the canonical address of every Vercel
     * deployment (see lib/env.ts), and the site named in the SMS terms and carrier
     * registration. www.nuvato.ai redirects here.
     */
    publicUrl: 'https://nuvato.ai',
  },
} as const;
