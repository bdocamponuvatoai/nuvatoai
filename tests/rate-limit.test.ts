import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bookingRateLimit,
  checkBookingLimitMemory,
  checkBookingLimitRedis,
  redisConfig,
} from '@/lib/rate-limit';

const IP = '192.0.2.1';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('in-memory limiter (local development)', () => {
  it('allows five attempts per email per window, then blocks until the next window', async () => {
    const email = 'memory@example.com';
    for (let i = 0; i < 5; i++) {
      expect((await checkBookingLimitMemory(email, IP, 1000)).allowed).toBe(true);
    }
    expect((await checkBookingLimitMemory(email, IP, 1000)).allowed).toBe(false);
    expect((await checkBookingLimitMemory(email, IP, 1801)).allowed).toBe(true);
  });
});

describe('Upstash Redis limiter (production)', () => {
  const redis = { url: 'https://r.example', token: 'secret-token' };

  function stubRedis() {
    const counters = new Map<string, number>();
    const calls: { target: string; auth: string; body: string }[] = [];
    vi.stubGlobal('fetch', async (target: string, init: RequestInit) => {
      const body = String(init.body);
      calls.push({ target, auth: (init.headers as Record<string, string>).Authorization, body });
      const replies = (JSON.parse(body) as string[][]).map(([command, key]) => {
        if (command !== 'INCR') return { result: 1 };
        counters.set(key, (counters.get(key) ?? 0) + 1);
        return { result: counters.get(key) };
      });
      return Response.json(replies);
    });
    return calls;
  }

  it('reads credentials from the Vercel Marketplace variables', () => {
    expect(redisConfig({ KV_REST_API_URL: 'https://r.example/', KV_REST_API_TOKEN: 't' })).toEqual({
      url: 'https://r.example',
      token: 't',
    });
    expect(redisConfig({})).toBeNull();
  });

  it('allows five attempts, blocks the sixth, and resets in the next window', async () => {
    stubRedis();
    const email = 'redis@example.com';
    for (let i = 0; i < 5; i++) {
      expect((await checkBookingLimitRedis(redis, email, IP, 1000)).allowed).toBe(true);
    }
    expect((await checkBookingLimitRedis(redis, email, IP, 1000)).allowed).toBe(false);
    expect((await checkBookingLimitRedis(redis, email, IP, 1801)).allowed).toBe(true);
  });

  it('sends authenticated pipelines with expiring, hashed keys only', async () => {
    const calls = stubRedis();
    await checkBookingLimitRedis(redis, 'test@example.com', IP, 1000);

    for (const call of calls) {
      expect(call.target).toBe('https://r.example/pipeline');
      expect(call.auth).toBe('Bearer secret-token');
      expect(call.body).not.toContain('test@example.com');
      expect(call.body).not.toContain(IP);
    }
    const expire = (JSON.parse(calls[0].body) as string[][]).find(
      ([command]) => command === 'EXPIRE',
    );
    expect(Number(expire?.[2])).toBeGreaterThan(0);
    expect(expire?.[3]).toBe('NX');
  });

  it('throws on a storage outage so booking fails closed', async () => {
    vi.stubGlobal('fetch', async () => new Response('unavailable', { status: 503 }));
    await expect(checkBookingLimitRedis(redis, 'a@example.com', null, 1000)).rejects.toThrow();
  });
});

describe('bookingRateLimit', () => {
  const request = new Request('https://test.example/api/bookings', {
    headers: { 'x-real-ip': IP },
  });

  it('refuses to run without storage in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    await expect(bookingRateLimit(request, 'prod@example.com')).rejects.toThrow(/not configured/);
  });

  it('uses the in-memory limiter in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    expect((await bookingRateLimit(request, 'dev@example.com')).allowed).toBe(true);
  });
});
