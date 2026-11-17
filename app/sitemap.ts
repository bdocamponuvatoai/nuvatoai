import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog';
import { siteOrigin, sitePaths } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...sitePaths.map((path) => ({ url: siteOrigin + path })),
    ...blogPosts.map((post) => ({ url: siteOrigin + post.path, lastModified: post.dateModified })),
  ];
}
