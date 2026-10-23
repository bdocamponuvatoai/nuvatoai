import type { MetadataRoute } from 'next';
import { siteEnv } from '@/lib/env';
import { siteOrigin } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteEnv.indexable ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
