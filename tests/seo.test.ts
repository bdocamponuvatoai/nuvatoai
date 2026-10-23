import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { faqs } from '@/lib/content';
import { readSiteEnv, siteEnv } from '@/lib/env';
import { description, pageMetadata, siteOrigin, structuredData } from '@/lib/seo';

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const graph = structuredData['@graph'] as Node[];
const nodeOfType = (type: string) => graph.find((node) => node['@type'] === type)!;

describe('metadata', () => {
  it('has a meta description of 140–160 characters', () => {
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('gives legal pages their own canonical and social metadata', () => {
    const metadata = pageMetadata('/privacy/', 'Privacy Policy | Nuvato AI', 'Privacy');
    expect(metadata.alternates?.canonical).toBe('/privacy/');
    expect(String((metadata.openGraph as Node).url)).toBe(`${siteOrigin}/privacy/`);
    expect((metadata.twitter as Node).title).toBe('Privacy Policy | Nuvato AI');
  });
});

describe('structured data', () => {
  it('matches the visible FAQ copy', () => {
    const faqPage = nodeOfType('FAQPage');
    expect(faqPage.mainEntity).toHaveLength(faqs.length);
    faqPage.mainEntity.forEach((question: Node, i: number) => {
      expect(question.name).toBe(faqs[i].question);
      expect(question.acceptedAnswer.text).toBe(faqs[i].answer);
    });
  });

  it('contains no fabricated ratings', () => {
    expect(JSON.stringify(structuredData)).not.toContain('AggregateRating');
  });

  it('lists the agent catalog, with only approved descriptions', () => {
    const catalog = nodeOfType('ItemList');
    expect(catalog.numberOfItems).toBe(12);
    expect(catalog.itemListElement).toHaveLength(12);
    const described = catalog.itemListElement.filter((entry: Node) => entry.item.description);
    expect(described).toHaveLength(3);
  });

  it('describes the organization, its parent, and five services', () => {
    const organization = nodeOfType('Organization');
    expect(organization.parentOrganization.url).toBe('https://isakglobalventures.com/');
    expect(organization.hasOfferCatalog.itemListElement).toHaveLength(5);
  });
});

describe('robots and sitemap', () => {
  it('matches the indexing setting', () => {
    const rules = robots().rules as Node;
    if (siteEnv.indexable) expect(rules.allow).toBe('/');
    else expect(rules.disallow).toBe('/');
    expect(robots().sitemap).toBe(`${siteOrigin}/sitemap.xml`);
  });

  it('lists the homepage and the three legal pages', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual(
      ['/', '/privacy/', '/terms/', '/sms-terms/'].map((path) => siteOrigin + path),
    );
  });
});

describe('deployment environment', () => {
  it('prefers SITE_URL, normalized to an origin', () => {
    expect(readSiteEnv({ SITE_URL: 'https://www.nuvato.ai/' }).origin).toBe(
      'https://www.nuvato.ai',
    );
  });

  it('falls back to the Vercel production domain, then localhost', () => {
    expect(readSiteEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'nuvato.vercel.app' }).origin).toBe(
      'https://nuvato.vercel.app',
    );
    expect(readSiteEnv({}).origin).toBe('http://localhost:3000');
  });

  it('rejects an invalid SITE_URL at startup', () => {
    expect(() => readSiteEnv({ SITE_URL: 'not a url' })).toThrow();
  });

  it('is indexable only when enabled, and never on preview deployments', () => {
    expect(readSiteEnv({}).indexable).toBe(false);
    expect(readSiteEnv({ SITE_INDEXABLE: 'true' }).indexable).toBe(true);
    expect(readSiteEnv({ SITE_INDEXABLE: 'true', VERCEL_ENV: 'production' }).indexable).toBe(true);
    expect(readSiteEnv({ SITE_INDEXABLE: 'true', VERCEL_ENV: 'preview' }).indexable).toBe(false);
  });
});
