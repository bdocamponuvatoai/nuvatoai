import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import BlogArticle from '@/components/blog/BlogArticle';
import BlogIndex from '@/components/blog/BlogIndex';
import { headingsOf, slugify, type Heading } from '@/components/blog/mdx';
import { blogImage } from '@/lib/assets';
import {
  blogIndex,
  blogPostMetadata,
  blogPostStructuredData,
  blogPosts,
  formatPostDate,
  getBlogPost,
} from '@/lib/blog';
import { siteOrigin } from '@/lib/seo';

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Text as React writes it into HTML. */
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');

/** The words of some HTML, without its tags. */
const plain = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, '')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

/** Inner HTML of every element with this tag. */
const contentsOf = (markup: string, tag: string) =>
  [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(
    (match) => match[1],
  );

describe.each(blogPosts)('blog post $slug', (post) => {
  const html = renderToStaticMarkup(<BlogArticle post={post} />);
  // What a reader sees, without the JSON-LD (which repeats much of the copy).
  const visible = html.replace(/<script\b[\s\S]*?<\/script>/g, '');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const jsonLd = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1],
  ) as Node;
  const pageUrl = siteOrigin + post.path;

  it('has one h1, the post title, with the brand emphasis on its last words', () => {
    const [h1] = contentsOf(visible, 'h1');
    expect(visible.match(/<h1\b/g)).toHaveLength(1);
    expect(plain(h1)).toBe(post.title);
    expect(h1).toContain(`<em>${escape(post.title.split(' ').slice(-2).join(' '))}</em>`);
  });

  it('gives every section an id and lists them all under "On this page"', () => {
    const body = visible.slice(
      visible.indexOf('class="blog-copy"'),
      visible.indexOf('class="blog-post-end"'),
    );
    const headings = headingsOf(post.Content);
    const listed = (list: Heading[]) => list.map(({ text }) => text);

    expect(contentsOf(body, 'h2').map(plain)).toEqual(listed(headings));
    for (const { id, text } of headings) {
      expect(visible).toContain(`<h2 id="${id}">${escape(text)}</h2>`);
      // Desktop list and the collapsible list on smaller screens.
      expect(visible.match(new RegExp(`href="#${id}"`, 'g'))).toHaveLength(2);
    }
    expect(visible).toContain(`--blog-sections:&#x27;${String(headings.length).padStart(2, '0')}`);
  });

  it('keeps the approved word count', async () => {
    const source = await readFile(`content/blog/${post.slug}.mdx`, 'utf8');
    const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
    // Counted like the content team's tool: runs of letters and digits.
    expect(body.match(/[\p{L}\p{N}]+/gu)).toHaveLength(post.wordCount);
  });

  it('shows the header image as the exact uploaded file, with its caption and AI note', () => {
    const images = [...visible.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
    const header = images.find((tag) => tag.includes(`src="${escape(post.image.url)}"`));
    expect(header).toBeDefined();
    expect(header).toContain(`alt="${escape(post.image.alt)}"`);
    expect(header).toContain(`width="${post.image.width}"`);
    expect(header).toContain(`height="${post.image.height}"`);
    expect(post.image.url).toBe(`${post.image.url.split('?')[0]}?tr=orig-true`);
    expect(visible).toContain(escape(post.image.caption));
    if (post.image.aiDisclosure) expect(visible).toContain(escape(post.image.aiDisclosure));
  });

  it('shows every FAQ question as a heading, with its answer', () => {
    const headings = contentsOf(visible, 'h2').map(plain);
    for (const { question, answer } of post.faq) {
      expect(headings).toContain(question);
      expect(visible).toContain(escape(answer));
    }
  });

  it('shows the author, date, and reading time', () => {
    expect(plain(visible)).toContain(`By ${post.author}`);
    expect(visible).toContain(`<time dateTime="${post.date}">${formatPostDate(post.date)}</time>`);
    expect(visible).toContain(`${post.readingTime} min read`);
  });

  it('ends with sharing and the consultation invitation', () => {
    expect(visible).toContain(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    );
    expect(plain(visible)).toContain('Tell us what needs to work better.');
    expect(visible).toMatch(/<a [^>]*href="\/#contact"[^>]*>Book a consultation/);
  });

  it('has unique ids and working in-page links', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(id);
  });

  it('embeds the delivered JSON-LD, adding only the page and image addresses', () => {
    expect(jsonLd).toEqual(blogPostStructuredData(post));
    expect(jsonLd).toMatchObject(post.schema);

    const posting = jsonLd['@graph'].find((node: Node) => node['@type'] === 'BlogPosting');
    expect(posting.url).toBe(pageUrl);
    expect(posting.mainEntityOfPage).toBe(pageUrl);
    expect(posting.image.contentUrl).toBe(post.image.url);
    expect(posting.image.url).toBe(post.image.url);
  });

  it('keeps the JSON-LD consistent with the visible post', () => {
    const graph = jsonLd['@graph'] as Node[];
    const posting = graph.find((node) => node['@type'] === 'BlogPosting')!;
    expect(posting.headline).toBe(post.title);
    expect(posting.description).toBe(post.description);
    expect(posting.datePublished).toBe(post.date);
    expect(posting.dateModified).toBe(post.dateModified);
    expect(posting.wordCount).toBe(post.wordCount);
    expect(posting.image.description).toBe(post.image.alt);

    const faqPage = graph.find((node) => node['@type'] === 'FAQPage');
    if (faqPage) {
      expect(
        faqPage.mainEntity.map((entry: Node) => ({
          question: entry.name,
          answer: entry.acceptedAnswer.text,
        })),
      ).toEqual(post.faq);
    }
  });

  it('has article metadata for search and social cards', () => {
    const metadata = blogPostMetadata(post);
    const openGraph = metadata.openGraph as Node;
    const twitter = metadata.twitter as Node;

    expect(metadata.title).toBe(post.seoTitle);
    expect(metadata.description).toBe(post.description);
    expect(metadata.alternates?.canonical).toBe(post.path);
    expect(openGraph).toMatchObject({
      type: 'article',
      title: post.seoTitle,
      description: post.description,
      url: pageUrl,
      publishedTime: post.date,
      modifiedTime: post.dateModified,
    });
    expect(openGraph.images).toEqual([
      {
        url: post.image.url,
        width: post.image.width,
        height: post.image.height,
        alt: post.image.alt,
        type: post.image.type,
      },
    ]);
    expect(twitter).toMatchObject({ card: 'summary_large_image', title: post.seoTitle });
    expect(twitter.images).toEqual([{ url: post.image.url, alt: post.image.alt }]);
  });

  it('is in the sitemap and on the blog index', () => {
    expect(sitemap()).toContainEqual({ url: pageUrl, lastModified: post.dateModified });
    // Outside the Next.js runtime, next/link drops the trailing slash `trailingSlash` adds.
    expect(renderToStaticMarkup(<BlogIndex />)).toContain(
      `<a href="${post.path.replace(/\/$/, '')}">${escape(post.title)}</a>`,
    );
  });
});

describe('What is an SOP (web handoff, 16 November 2026)', () => {
  const post = getBlogPost('what-is-an-sop')!;

  it('uses the approved page values', () => {
    expect(post.path).toBe('/blog/what-is-an-sop/');
    expect(post.title).toBe('What is an SOP, and when does a small business need one?');
    expect(post.seoTitle).toBe(post.title);
    expect(post.description).toBe(
      'What an SOP is, what it is not, and the one sign a 10 to 20 person business needs one. A plain guide from Nuvato AI.',
    );
    expect([post.date, post.dateModified]).toEqual(['2026-11-16', '2026-11-16']);
  });

  it('keeps the approved image alt text and AI disclosure', () => {
    expect(post.image.path).toBe('/blog/what-is-an-sop.jpg');
    expect([post.image.width, post.image.height, post.image.type]).toEqual([
      1600,
      900,
      'image/jpeg',
    ]);
    expect(post.image.alt).toBe(
      "AI-generated photo of tidy stockroom shelving with plain boxes in low light, behind the post's headline",
    );
    expect(post.image.aiDisclosure).toBe(
      'Background image generated with Higgsfield Soul Location on 12 Nov 2026; not a real site, person or client.',
    );
  });
});

describe('blog', () => {
  it('lists posts newest first, each with a unique slug', () => {
    const dates = blogPosts.map((post) => post.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(blogPosts.map((post) => post.slug)).size).toBe(blogPosts.length);
  });

  it('has an index page with one h1', () => {
    const html = renderToStaticMarkup(<BlogIndex />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it('formats dates as calendar days in any time zone', () => {
    expect(formatPostDate('2026-11-16')).toBe('November 16, 2026');
  });

  it('stores blog images in the blog folder', () => {
    expect(blogImage('./what-is-an-sop.jpg')).toBe('/blog/what-is-an-sop.jpg');
  });

  it('turns section headings into readable ids', () => {
    expect(slugify('What is an SOP not?')).toBe('what-is-an-sop-not');
    expect(slugify("How does Nuvato AI's SOPs work?")).toBe('how-does-nuvato-ais-sops-work');
  });

  it('finds every section of the SOP guide', () => {
    expect(headingsOf(getBlogPost('what-is-an-sop')!.Content).map(({ id }) => id)).toEqual([
      'what-is-an-sop',
      'what-is-an-sop-not',
      'how-do-you-know-a-small-business-needs-an-sop',
      'what-does-a-good-sop-contain',
      'which-process-should-you-write-down-first',
      'how-do-you-keep-an-sop-from-going-stale',
      'what-happens-once-a-process-is-written-down',
      'how-does-nuvato-ais-sops-and-process-improvement-service-work',
      'what-to-do-next',
    ]);
  });

  it('links the index headline and featured guide', () => {
    const html = renderToStaticMarkup(<BlogIndex />);
    expect(plain(contentsOf(html, 'h1')[0])).toBe(`${blogIndex.heading} ${blogIndex.emphasis}`);
    expect(html).toContain('Latest guide');
  });
});
