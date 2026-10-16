const WINDOW=15*60;
async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function checkBookingLimit(db:D1Database,email:string,ip:string|null,now=Math.floor(Date.now()/1000)){
 const window=Math.floor(now/WINDOW),expires=(window+1)*WINDOW;
 const identifiers=[`email:${email.trim().toLowerCase()}`,...(ip?[`ip:${ip}`]:[])];
 const keys=await Promise.all(identifiers.map(id=>digest(`booking:${window}:${id}`)));
 const results=await db.batch([
  db.prepare('DELETE FROM booking_limits WHERE expires_at <= ?').bind(now),
  ...keys.map(key=>db.prepare('INSERT INTO booking_limits (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=booking_limits.attempts+1 RETURNING attempts').bind(key,expires)),
 ]);
 const blocked=results.slice(1).some((r,i)=>Number((r.results?.[0] as {attempts?:number})?.attempts||0)>(i===0?5:10));
 return {allowed:!blocked,retryAfter:Math.max(1,expires-now)};
}
export async function bookingRateLimit(request:Request,email:string){const {env}=await import('cloudflare:workers');if(!env.DB)throw new Error('Rate-limit storage unavailable');return checkBookingLimit(env.DB,email,request.headers.get('cf-connecting-ip'));}
