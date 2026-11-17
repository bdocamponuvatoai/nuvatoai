import { isValidElement, type ReactNode } from 'react';
import type { MDXComponents, MDXContent } from 'mdx/types';

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

/**
 * How blog posts render. Sections (`##`) get an id from their words, so the
 * "On this page" list and shared links can point at them.
 */
export const blogMdxComponents: MDXComponents = {
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
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
