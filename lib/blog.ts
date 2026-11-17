import type { Metadata } from 'next';
import type { MDXContent } from 'mdx/types';
import WhatIsAnSop, { frontmatter as whatIsAnSop } from '@/content/blog/what-is-an-sop.mdx';
import whatIsAnSopSchema from '@/content/blog/what-is-an-sop.schema.json';
import { assetUrl, blogImage } from './assets';
import { siteOrigin } from './seo';

/**
 * Blog posts arrive from the content team as an approved MDX file and a JSON-LD file
 * (content/blog/<slug>.mdx and <slug>.schema.json). Both are used exactly as delivered:
 * the page shows the MDX, and the JSON-LD only gains the page and image addresses.
 */

type JsonLdNode = Record<string, unknown>;
type JsonLd = { '@context': string; '@graph': JsonLdNode[] };

export type BlogPost = {
  title: string;
  seoTitle: string;
  description: string;
  slug: string;
  author: string;
  date: string;
  dateModified: string;
  category: string;
  tags: string[];
  summary: string;
  readingTime: number;
  wordCount: number;
  faq: { question: string; answer: string }[];
  image: {
    /** Path in the ImageKit folder. */
    path: string;
    /** The exact uploaded file, with its embedded metadata (see `assetUrl`). */
    url: string;
    alt: string;
    title: string;
    caption: string;
    width: number;
    height: number;
    type: string;
    aiDisclosure?: string;
    digitalSourceType?: string;
  };
  /** Path on this site, with the trailing slash `trailingSlash: true` expects. */
  path: string;
  Content: MDXContent;
  schema: JsonLd;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Reads a post's frontmatter, failing the build with the field name if one is missing. */
function readPost(file: string, frontmatter: unknown, Content: MDXContent, schema: unknown) {
  const fail = (problem: string): never => {
    throw new Error(`content/blog/${file}: ${problem}`);
  };
  if (!isRecord(frontmatter)) return fail('missing frontmatter');
  const fm = frontmatter;

  const text = (record: Record<string, unknown>, key: string) => {
    const value = record[key];
    return typeof value === 'string' && value ? value : fail(`"${key}" must be text`);
  };
  const number = (record: Record<string, unknown>, key: string) => {
    const value = record[key];
    return typeof value === 'number' ? value : fail(`"${key}" must be a number`);
  };
  const optionalText = (record: Record<string, unknown>, key: string) =>
    record[key] === undefined ? undefined : text(record, key);

  const author = isRecord(fm.author) ? fm.author : fail('"author" is missing');
  const imageMeta = isRecord(fm.imageMeta) ? fm.imageMeta : fail('"imageMeta" is missing');
  const faq = Array.isArray(fm.faq) ? fm.faq : fail('"faq" must be a list');
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
  if (!isRecord(schema) || !Array.isArray(schema['@graph'])) fail('JSON-LD has no @graph');
  const slug = text(fm, 'slug');
  if (`${slug}.mdx` !== file) fail(`slug "${slug}" doesn't match the file name`);
  const imagePath = blogImage(text(imageMeta, 'src'));

  return {
    title: text(fm, 'title'),
    seoTitle: text(fm, 'seoTitle'),
    description: text(fm, 'description'),
    slug,
    author: text(author, 'name'),
    date: text(fm, 'date'),
    dateModified: text(fm, 'dateModified'),
    category: text(fm, 'category'),
    tags,
    summary: text(fm, 'summary'),
    readingTime: number(fm, 'readingTime'),
    wordCount: number(fm, 'wordCount'),
    faq: faq.map((entry) =>
      isRecord(entry)
        ? { question: text(entry, 'question'), answer: text(entry, 'answer') }
        : fail('"faq" entries need a question and an answer'),
    ),
    image: {
      path: imagePath,
      url: assetUrl(imagePath),
      alt: text(imageMeta, 'alt'),
      title: text(imageMeta, 'title'),
      caption: text(imageMeta, 'caption'),
      width: number(imageMeta, 'width'),
      height: number(imageMeta, 'height'),
      type: text(imageMeta, 'type'),
      aiDisclosure: optionalText(imageMeta, 'aiDisclosure'),
      digitalSourceType: optionalText(imageMeta, 'digitalSourceType'),
    },
    path: `/blog/${slug}/`,
    Content,
    schema: schema as JsonLd,
  } satisfies BlogPost;
}

/** Every published post, newest first. Add new posts here. */
export const blogPosts: BlogPost[] = [
  readPost('what-is-an-sop.mdx', whatIsAnSop, WhatIsAnSop, whatIsAnSopSchema),
].sort((a, b) => b.date.localeCompare(a.date));

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);

/**
 * The blog index page. The heading echoes the homepage's "the systems your business runs on";
 * the description reuses the approved post's audience line.
 */
export const blogIndex = {
  path: '/blog/',
  title: 'Blog | Nuvato AI',
  heading: 'Plain guides to the systems your business',
  emphasis: 'runs on.',
  description:
    'Plain guides from Nuvato AI for owners of ten to twenty person businesses in the US, Canada and Argentina.',
};

/** Categories with at least one post, in order of first appearance. */
export const blogCategories = [...new Set(blogPosts.map((post) => post.category))];

/** Splits a title so its last two words can carry the brand's blue emphasis. */
export function emphasizeEnd(title: string) {
  const words = title.split(' ');
  const split = Math.max(0, words.length - 2);
  return { lead: words.slice(0, split).join(' '), emphasis: words.slice(split).join(' ') };
}

/** "2026-11-16" → "November 16, 2026". Dates are calendar days, so they're read as UTC. */
export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const { image } = post;
  return {
    title: post.seoTitle,
    description: post.description,
    alternates: { canonical: post.path },
    openGraph: {
      type: 'article',
      title: post.seoTitle,
      description: post.description,
      url: siteOrigin + post.path,
      siteName: 'Nuvato AI',
      locale: 'en_US',
      publishedTime: post.date,
      modifiedTime: post.dateModified,
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
          type: image.type,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle,
      description: post.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

/** The delivered JSON-LD, plus the page address and the image address it can't know. */
export function blogPostStructuredData(post: BlogPost): JsonLd {
  const pageUrl = siteOrigin + post.path;
  return {
    ...post.schema,
    '@graph': post.schema['@graph'].map((node) =>
      node['@type'] === 'BlogPosting'
        ? {
            ...node,
            url: pageUrl,
            mainEntityOfPage: pageUrl,
            image: {
              ...(isRecord(node.image) ? node.image : {}),
              url: post.image.url,
              contentUrl: post.image.url,
            },
          }
        : node,
    ),
  };
}
