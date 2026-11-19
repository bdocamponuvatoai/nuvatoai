import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { blogPosts } from '@/lib/blog';
import { faqs } from '@/lib/content';
import { readSiteEnv, robotsHeaders, siteEnv } from '@/lib/env';
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

  it('lists the homepage, the blog, the three legal pages, and every blog post', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual(
      [
        '/',
        '/blog/',
        '/privacy/',
        '/terms/',
        '/sms-terms/',
        ...blogPosts.map((post) => post.path),
      ].map((path) => siteOrigin + path),
    );
  });
});

describe('deployment environment', () => {
  it('prefers SITE_URL, normalized to an origin', () => {
    expect(readSiteEnv({ SITE_URL: 'https://nuvato.ai/blog/' }).origin).toBe('https://nuvato.ai');
  });

  it('names nuvato.ai on every Vercel deployment, never its vercel.app address', () => {
    const vercel = { VERCEL_PROJECT_PRODUCTION_URL: 'nuvatoai-zeta.vercel.app' };
    expect(readSiteEnv({ ...vercel, VERCEL_ENV: 'production' }).origin).toBe('https://nuvato.ai');
    expect(readSiteEnv({ ...vercel, VERCEL_ENV: 'preview' }).origin).toBe('https://nuvato.ai');
  });

  it('uses localhost off Vercel', () => {
    expect(readSiteEnv({}).origin).toBe('http://localhost:3000');
  });

  it('rejects an invalid SITE_URL at startup', () => {
    expect(() => readSiteEnv({ SITE_URL: 'not a url' })).toThrow();
  });

  it('indexes production unless SITE_INDEXABLE=false, and never previews', () => {
    expect(readSiteEnv({ VERCEL_ENV: 'production' }).indexable).toBe(true);
    expect(readSiteEnv({ VERCEL_ENV: 'production', SITE_INDEXABLE: 'false' }).indexable).toBe(
      false,
    );
    expect(readSiteEnv({ VERCEL_ENV: 'preview' }).indexable).toBe(false);
    expect(readSiteEnv({ VERCEL_ENV: 'preview', SITE_INDEXABLE: 'true' }).indexable).toBe(false);
  });

  it('indexes a local build only with SITE_INDEXABLE=true, for testing', () => {
    expect(readSiteEnv({}).indexable).toBe(false);
    expect(readSiteEnv({ SITE_INDEXABLE: 'true' }).indexable).toBe(true);
  });
});

describe('X-Robots-Tag', () => {
  type Condition = { type: string; key?: string; value?: string };
  type Rule = { source: string; has?: Condition[]; missing?: Condition[]; headers: Node[] };

  /** Matches a host condition the way Next.js and Vercel do: the whole hostname, as a regex. */
  const matches = (condition: Condition, host: string) =>
    condition.type === 'host' && new RegExp(`^${condition.value}$`).test(host);

  /** The X-Robots-Tag a page on this host is served with. */
  const robotsTag = (rules: Rule[], host: string) =>
    rules
      .filter(
        (rule) =>
          rule.source === '/:path*' &&
          (rule.has ?? []).every((condition) => matches(condition, host)) &&
          !(rule.missing ?? []).some((condition) => matches(condition, host)),
      )
      .flatMap((rule) => rule.headers)
      .find((header) => header.key === 'X-Robots-Tag')?.value;

  it('is absent on nuvato.ai in production, and noindex on every other host', () => {
    const rules = robotsHeaders(readSiteEnv({ VERCEL_ENV: 'production' }));
    expect(robotsTag(rules, 'nuvato.ai')).toBeUndefined();
    for (const host of ['nuvatoai-zeta.vercel.app', 'nuvatoai-git-main.vercel.app', 'nuvatoxai'])
      expect(robotsTag(rules, host)).toBe('noindex, nofollow');
  });

  it('is noindex on every host of a preview deployment', () => {
    const rules = robotsHeaders(readSiteEnv({ VERCEL_ENV: 'preview' }));
    for (const host of ['nuvato.ai', 'nuvatoai-git-feature.vercel.app'])
      expect(robotsTag(rules, host)).toBe('noindex, nofollow');
  });
});

describe('on the production deployment', () => {
  // Load the site fresh with the environment Vercel's production build has.
  const load = async () => {
    vi.resetModules();
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'nuvatoai-zeta.vercel.app');
    vi.stubEnv('SITE_URL', '');
    vi.stubEnv('SITE_INDEXABLE', '');
    return {
      robots: (await import('@/app/robots')).default,
      sitemap: (await import('@/app/sitemap')).default,
      blog: await import('@/lib/blog'),
    };
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('serves a robots.txt that lets every crawler in and names the real sitemap', async () => {
    const { robots } = await load();
    // One rule for every user agent: AI crawlers (GPTBot, ClaudeBot, PerplexityBot…) included.
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://nuvato.ai/sitemap.xml',
    });
  });

  it('lists only nuvato.ai addresses in the sitemap', async () => {
    const { sitemap } = await load();
    for (const { url } of sitemap()) expect(url).toMatch(/^https:\/\/nuvato\.ai\//);
  });

  it('gives each blog post its nuvato.ai address in og:url and the BlogPosting', async () => {
    const { blog } = await load();
    for (const post of blog.blogPosts) {
      const pageUrl = `https://nuvato.ai/blog/${post.slug}/`;
      const metadata = blog.blogPostMetadata(post);
      expect(metadata.alternates?.canonical).toBe(`/blog/${post.slug}/`);
      expect((metadata.openGraph as Node).url).toBe(pageUrl);
      const posting = blog
        .blogPostStructuredData(post)
        ['@graph'].find((node) => node['@type'] === 'BlogPosting')!;
      expect(posting.url).toBe(pageUrl);
      expect(posting.mainEntityOfPage).toBe(pageUrl);
    }
  });
});
