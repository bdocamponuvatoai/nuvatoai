/**
 * Fixed business facts shared by pages, legal copy, and structured data.
 * Deployment-specific settings (indexing, a SITE_URL override) live in `lib/env.ts`.
 */
export const siteConfig = {
  /** Existing client portal. */
  loginUrl: 'https://nuvato.ai/login',
  parentOrganizationUrl: 'https://isakglobalventures.com/',
  /**
   * Nuvato AI's own social media profiles, in display order. Linked from the footer
   * (components/SocialLinks.tsx) and listed as the organization's `sameAs` in structured
   * data, so search engines and AI tools connect them to the site.
   */
  social: [
    { network: 'LinkedIn', url: 'https://www.linkedin.com/company/nuvatoai/' },
    { network: 'Facebook', url: 'https://www.facebook.com/people/Nuvato-AI/61596739970237/' },
    { network: 'Instagram', url: 'https://www.instagram.com/nuvatoai/' },
    { network: 'TikTok', url: 'https://www.tiktok.com/@nuvatoai' },
  ],
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
