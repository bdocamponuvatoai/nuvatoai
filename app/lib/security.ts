import {siteConfig} from './site-config';
/** `secure` is false only for local http:// previews, where WebKit would otherwise upgrade every asset to an https:// URL that doesn't exist. */
export function securityPolicy(nonce:string,secure=true){return `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com${secure?'; upgrade-insecure-requests':''}`;}
export function applySecurityHeaders(response:Response,nonce:string,secure=true){
 const headers=new Headers(response.headers);
 headers.set('Content-Security-Policy',securityPolicy(nonce,secure));
 headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
 headers.set('X-Content-Type-Options','nosniff');
 if(!siteConfig.indexable&&headers.get('content-type')?.includes('text/html'))headers.set('X-Robots-Tag','noindex, nofollow');
 headers.set('Cross-Origin-Opener-Policy','same-origin');
 headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 if(headers.get('content-type')?.includes('text/html')||headers.get('content-type')?.includes('application/json'))headers.set('Cache-Control','private, no-store');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
