import {siteOrigin} from '../lib/seo';
export function GET(){return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/privacy/','/terms/','/sms-terms/'].map(p=>`<url><loc>${siteOrigin}${p}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});}
