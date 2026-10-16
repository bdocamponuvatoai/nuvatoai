const WINDOW=15*60;
/** Attempts allowed per window, per email address and per client IP. */
const LIMITS=[5,10] as const;
type LimitResult={allowed:boolean;retryAfter:number};

async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}

/** Windowed, hashed counter keys: no raw email address or IP is ever stored. */
async function windowKeys(email:string,ip:string|null,now:number){
 const window=Math.floor(now/WINDOW),expires=(window+1)*WINDOW;
 const identifiers=[`email:${email.trim().toLowerCase()}`,...(ip?[`ip:${ip}`]:[])];
 const keys=await Promise.all(identifiers.map(id=>digest(`booking:${window}:${id}`)));
 return {keys,expires,retryAfter:Math.max(1,expires-now)};
}
const exceeded=(counts:number[])=>counts.some((count,i)=>count>LIMITS[i]);

/** Cloudflare D1 backend (Workers deployment). */
export async function checkBookingLimit(db:D1Database,email:string,ip:string|null,now=Math.floor(Date.now()/1000)):Promise<LimitResult>{
 const {keys,expires,retryAfter}=await windowKeys(email,ip,now);
 const results=await db.batch([
  db.prepare('DELETE FROM booking_limits WHERE expires_at <= ?').bind(now),
  ...keys.map(key=>db.prepare('INSERT INTO booking_limits (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=booking_limits.attempts+1 RETURNING attempts').bind(key,expires)),
 ]);
 const counts=results.slice(1).map(r=>Number((r.results?.[0] as {attempts?:number})?.attempts||0));
 return {allowed:!exceeded(counts),retryAfter};
}

type RedisConfig={url:string;token:string};
/** Upstash Redis REST credentials, as injected by the Vercel Marketplace integration. */
export function redisConfig(env:Record<string,string|undefined>=process.env):RedisConfig|null{
 const url=env.KV_REST_API_URL||env.UPSTASH_REDIS_REST_URL;
 const token=env.KV_REST_API_TOKEN||env.UPSTASH_REDIS_REST_TOKEN;
 return url&&token?{url:url.replace(/\/$/,''),token}:null;
}

/** Upstash Redis backend (Vercel deployment). One pipelined round trip: INCR each key, set its expiry once. */
export async function checkBookingLimitRedis(redis:RedisConfig,email:string,ip:string|null,now=Math.floor(Date.now()/1000)):Promise<LimitResult>{
 const {keys,retryAfter}=await windowKeys(email,ip,now);
 const commands=keys.flatMap(key=>[['INCR',`booking:${key}`],['EXPIRE',`booking:${key}`,String(retryAfter),'NX']]);
 const response=await fetch(`${redis.url}/pipeline`,{method:'POST',headers:{Authorization:`Bearer ${redis.token}`,'Content-Type':'application/json'},body:JSON.stringify(commands),signal:AbortSignal.timeout(5000),cache:'no-store'});
 if(!response.ok)throw new Error(`Rate-limit storage responded ${response.status}`);
 const replies=await response.json() as {result?:unknown;error?:string}[];
 if(!Array.isArray(replies)||replies.some(reply=>reply.error))throw new Error('Rate-limit storage error');
 const counts=keys.map((_,i)=>Number(replies[i*2]?.result));
 if(counts.some(count=>!Number.isFinite(count)))throw new Error('Rate-limit storage returned an invalid count');
 return {allowed:!exceeded(counts),retryAfter};
}

/**
 * Chooses the store for the current platform. Any failure throws, and the booking
 * route fails closed (503) rather than accepting unlimited attempts.
 */
export async function bookingRateLimit(request:Request,email:string):Promise<LimitResult>{
 const redis=redisConfig();
 if(redis){
  // On Vercel the platform sets x-real-ip / x-forwarded-for; client-sent values are overwritten.
  const ip=request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||null;
  return checkBookingLimitRedis(redis,email,ip);
 }
 const {env}=await import('cloudflare:workers');
 if(!env.DB)throw new Error('Rate-limit storage unavailable');
 return checkBookingLimit(env.DB,email,request.headers.get('cf-connecting-ip'));
}
