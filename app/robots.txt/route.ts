import {siteOrigin} from '../lib/seo';
import {siteConfig} from '../lib/site-config';
const policy=siteConfig.indexable?'Allow: /\nDisallow: /api/':'Disallow: /';
export function GET(){return new Response(`User-agent: *\n${policy}\nSitemap: ${siteOrigin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
