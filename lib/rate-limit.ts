const WINDOW_SECONDS = 15 * 60;
/** Attempts allowed per window: [per email address, per client IP]. */
const LIMITS = [5, 10] as const;

export type LimitResult = { allowed: boolean; retryAfter: number };
export type RedisConfig = { url: string; token: string };

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Windowed, hashed counter keys: no raw email address or IP is ever stored. */
async function windowKeys(email: string, ip: string | null, now: number) {
  const window = Math.floor(now / WINDOW_SECONDS);
  const expires = (window + 1) * WINDOW_SECONDS;
  const identifiers = [`email:${email.trim().toLowerCase()}`, ...(ip ? [`ip:${ip}`] : [])];
  const keys = await Promise.all(identifiers.map((id) => sha256(`booking:${window}:${id}`)));
  return { keys, expires, retryAfter: Math.max(1, expires - now) };
}

const exceeded = (counts: number[]) => counts.some((count, i) => count > LIMITS[i]);
const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** Upstash Redis REST credentials, as injected by the Vercel Marketplace integration. */
export function redisConfig(
  env: Record<string, string | undefined> = process.env,
): RedisConfig | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

/** Production store: one pipelined round trip that increments each key and sets its expiry once. */
export async function checkBookingLimitRedis(
  redis: RedisConfig,
  email: string,
  ip: string | null,
  now = nowInSeconds(),
): Promise<LimitResult> {
  const { keys, retryAfter } = await windowKeys(email, ip, now);
  const commands = keys.flatMap((key) => [
    ['INCR', `booking:${key}`],
    ['EXPIRE', `booking:${key}`, String(retryAfter), 'NX'],
  ]);

  const response = await fetch(`${redis.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Rate-limit storage responded ${response.status}`);

  const replies = (await response.json()) as { result?: unknown; error?: string }[];
  if (!Array.isArray(replies) || replies.some((reply) => reply.error)) {
    throw new Error('Rate-limit storage error');
  }
  const counts = keys.map((_, i) => Number(replies[i * 2]?.result));
  if (counts.some((count) => !Number.isFinite(count))) {
    throw new Error('Rate-limit storage returned an invalid count');
  }
  return { allowed: !exceeded(counts), retryAfter };
}

const memoryCounters = new Map<string, { attempts: number; expires: number }>();

/** Local development store. Not shared between server instances, so never used in production. */
export async function checkBookingLimitMemory(
  email: string,
  ip: string | null,
  now = nowInSeconds(),
): Promise<LimitResult> {
  const { keys, expires, retryAfter } = await windowKeys(email, ip, now);
  for (const [key, counter] of memoryCounters) {
    if (counter.expires <= now) memoryCounters.delete(key);
  }
  const counts = keys.map((key) => {
    const counter = memoryCounters.get(key) ?? { attempts: 0, expires };
    counter.attempts += 1;
    memoryCounters.set(key, counter);
    return counter.attempts;
  });
  return { allowed: !exceeded(counts), retryAfter };
}

/** On Vercel the platform sets these headers and overwrites any client-sent values. */
function clientIp(request: Request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}

/**
 * Counts a booking attempt. Throws when no store is available in production, and the
 * booking route fails closed (503) rather than accepting unlimited attempts.
 */
export async function bookingRateLimit(request: Request, email: string): Promise<LimitResult> {
  const redis = redisConfig();
  if (redis) return checkBookingLimitRedis(redis, email, clientIp(request));
  if (process.env.NODE_ENV !== 'production')
    return checkBookingLimitMemory(email, clientIp(request));
  throw new Error(
    'Rate-limit storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.',
  );
}
