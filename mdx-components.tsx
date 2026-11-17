import type { MDXComponents } from 'mdx/types';
import { blogMdxComponents } from '@/components/blog/mdx';

/**
 * Required by @next/mdx in the App Router. Blog posts render as plain HTML elements,
 * styled by `.blog-copy` in app/styles/blog.css; sections get ids for the table of contents.
 */
export function useMDXComponents(): MDXComponents {
  return blogMdxComponents;
}
