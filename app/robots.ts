import type { MetadataRoute } from 'next';
import { siteEnv } from '@/lib/env';
import { siteOrigin } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteEnv.indexable
      ? { userAgent: '*', allow: '/', disallow: '/api/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
