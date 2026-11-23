import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SocialLinks from '@/components/SocialLinks';
import SiteFooter from '@/components/home/SiteFooter';
import { siteConfig } from '@/lib/site-config';
import { structuredData } from '@/lib/seo';

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const PROFILES = [
  ['LinkedIn', 'https://www.linkedin.com/company/nuvatoai/'],
  ['Facebook', 'https://www.facebook.com/people/Nuvato-AI/61596739970237/'],
  ['Instagram', 'https://www.instagram.com/nuvatoai/'],
  ['TikTok', 'https://www.tiktok.com/@nuvatoai'],
];

describe('social media profiles', () => {
  const html = renderToStaticMarkup(<SocialLinks />);
  const links = [...html.matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)];

  it('links to each profile, in order, by its exact address', () => {
    expect(siteConfig.social.map(({ network, url }) => [network, url])).toEqual(PROFILES);
    expect(links.map(([, attributes]) => attributes.match(/href="([^"]+)"/)![1])).toEqual(
      PROFILES.map(([, url]) => url),
    );
    for (const [, url] of PROFILES) {
      expect(new URL(url).protocol).toBe('https:');
      expect(url).not.toContain('#');
    }
  });

  it('names each link for screen readers and hides the icon itself', () => {
    expect(html).toContain('aria-label="Nuvato AI on social media"');
    links.forEach(([, attributes, icon], index) => {
      expect(attributes).toContain(`aria-label="Nuvato AI on ${PROFILES[index][0]}"`);
      expect(attributes).toContain('rel="me external"');
      expect(icon).toMatch(/^<svg [^>]*aria-hidden="true"/);
      expect(icon).toMatch(/<path d="M[^"]+"><\/path><\/svg>$/);
    });
  });

  it('appears in the site footer, on the homepage and every blog page', () => {
    expect(renderToStaticMarkup(<SiteFooter />)).toContain(html);
    expect(renderToStaticMarkup(<SiteFooter hrefBase="/" />)).toContain(html);
  });

  it('lists every profile as the organization’s sameAs in structured data', () => {
    const graph = structuredData['@graph'] as Node[];
    const organization = graph.find((node) => node['@type'] === 'Organization')!;
    expect(organization.sameAs).toEqual(PROFILES.map(([, url]) => url));
  });
});
