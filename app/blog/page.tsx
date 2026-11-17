import type { Metadata } from 'next';
import BlogIndex from '@/components/blog/BlogIndex';
import { blogIndex } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata(
  blogIndex.path,
  blogIndex.title,
  blogIndex.description,
);

export default function BlogPage() {
  return <BlogIndex />;
}
