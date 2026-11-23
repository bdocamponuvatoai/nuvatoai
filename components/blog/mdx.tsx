import { isValidElement, type ReactNode } from 'react';
import Link from 'next/link';
import type { MDXComponents, MDXContent } from 'mdx/types';
import { siteConfig } from '@/lib/site-config';

export type Heading = { id: string; text: string };

/** Plain text of rendered children, e.g. a heading's words. */
export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** "What is an SOP not?" → "what-is-an-sop-not". Apostrophes are dropped, not split on. */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const siteHost = new URL(siteConfig.business.publicUrl).hostname;

/**
 * The path a link points to on this site, or null for other sites, in-page anchors, and
 * email links. Posts link to nuvato.ai pages by their full address, usually without the
 * trailing slash the site uses, so "https://nuvato.ai/blog/what-is-an-sop" becomes
 * "/blog/what-is-an-sop/": readers skip a redirect, and previews stay on the preview.
 */
export function sitePath(href: string): string | null {
  if (href.startsWith('#')) return null;
  const url = new URL(href, siteConfig.business.publicUrl);
  if (!url.protocol.startsWith('http') || url.hostname.replace(/^www\./, '') !== siteHost) {
    return null;
  }
  // Pages end in a slash (`trailingSlash: true`); files such as images don't.
  const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
  const path = url.pathname.endsWith('/') || isFile ? url.pathname : `${url.pathname}/`;
  return path + url.search + url.hash;
}

/**
 * How blog posts render. Sections (`##`) get an id from their words, so the
 * "On this page" list and shared links can point at them. Links to this site use
 * next/link and the page's own path. Tables sit in a card, like "The short answer".
 */
export const blogMdxComponents: MDXComponents = {
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  a: ({ href = '', ...props }) => {
    const path = sitePath(href);
    return path ? <Link href={path} {...props} /> : <a href={href} {...props} />;
  },
  table: (props) => (
    <div className="blog-table">
      <table {...props} />
    </div>
  ),
  // Markdown tables have one header row, so every header cell labels a column.
  th: (props) => <th scope="col" {...props} />,
};

const HeadingProbe = () => null;

/**
 * A post's sections, in order, read from its compiled MDX without rendering it.
 * MDX returns the post's top-level elements, so each `##` is an element of type `h2`.
 */
export function headingsOf(Content: MDXContent): Heading[] {
  const headings: Heading[] = [];
  const visit = (node: ReactNode) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!isValidElement<{ children?: ReactNode }>(node)) return;
    if (node.type === HeadingProbe) {
      const text = textOf(node.props.children);
      headings.push({ id: slugify(text), text });
      return;
    }
    visit(node.props.children);
  };
  visit(Content({ components: { h2: HeadingProbe } }));
  return headings;
}
