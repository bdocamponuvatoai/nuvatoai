import {siteConfig} from './site-config';
/** `secure` is false only for local http:// previews, where WebKit would otherwise upgrade every asset to an https:// URL that doesn't exist. */
export function securityPolicy(nonce:string,secure=true){return `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com${secure?'; upgrade-insecure-requests':''}`;}
/** Headers every response gets, on Cloudflare (build/sites-worker.ts) and on Vercel (proxy.ts). */
export function securityHeaderEntries(nonce:string,secure=true):[string,string][]{
 return [
  ['Content-Security-Policy',securityPolicy(nonce,secure)],
  ['Strict-Transport-Security','max-age=31536000; includeSubDomains'],
  ['X-Content-Type-Options','nosniff'],
  ['Cross-Origin-Opener-Policy','same-origin'],
  ['Referrer-Policy','strict-origin-when-cross-origin'],
  ['Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()'],
 ];
}
export function applySecurityHeaders(response:Response,nonce:string,secure=true){
 const headers=new Headers(response.headers);
 for(const [name,value] of securityHeaderEntries(nonce,secure))headers.set(name,value);
 if(!siteConfig.indexable&&headers.get('content-type')?.includes('text/html'))headers.set('X-Robots-Tag','noindex, nofollow');
 if(headers.get('content-type')?.includes('text/html')||headers.get('content-type')?.includes('application/json'))headers.set('Cache-Control','private, no-store');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
