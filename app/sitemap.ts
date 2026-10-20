import type { MetadataRoute } from 'next';
import { siteOrigin, sitePaths } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitePaths.map((path) => ({ url: siteOrigin + path }));
}
