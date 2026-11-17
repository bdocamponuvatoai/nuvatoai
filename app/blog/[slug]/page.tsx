import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticle from '@/components/blog/BlogArticle';
import { blogPostMetadata, blogPosts, getBlogPost } from '@/lib/blog';

type Props = { params: Promise<{ slug: string }> };

/** Only posts registered in lib/blog.ts exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  return post ? blogPostMetadata(post) : {};
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
