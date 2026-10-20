import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as getAvailability } from '@/app/api/availability/route';
import { createBookingHandler } from '@/lib/booking';
import type { LimitResult } from '@/lib/rate-limit';

const URL_BASE = 'https://test.example';
const payload = {
  type: 'MT-1',
  date: '2026-11-09',
  time: '09:00',
  name: 'Test User',
  email: 'test@example.com',
  company: 'Example',
  notes: 'Mock test only',
};

function bookingRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${URL_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: URL_BASE, ...headers },
    body: JSON.stringify(body),
  });
}

const allow = async (): Promise<LimitResult> => ({ allowed: true, retryAfter: 1 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/bookings — request validation', () => {
  const upstream = vi.fn();
  const limiter = vi.fn(allow);
  const POST = createBookingHandler(limiter);

  it.each([
    ['invalid data', bookingRequest({ email: 'broken' }), 400],
    ['a cross-origin request', bookingRequest(payload, { Origin: 'https://other.example' }), 403],
    [
      'a cross-origin request with a spoofed Host',
      bookingRequest(payload, { Origin: 'https://other.example', Host: 'test.example' }),
      403,
    ],
    ['cross-site fetch metadata', bookingRequest(payload, { 'Sec-Fetch-Site': 'cross-site' }), 403],
    ['a non-JSON body', bookingRequest(payload, { 'Content-Type': 'text/plain' }), 415],
    ['a filled honeypot', bookingRequest({ ...payload, website: 'bot' }), 400],
    ['an oversized body', bookingRequest({ ...payload, notes: 'x'.repeat(13_000) }), 413],
  ])('rejects %s', async (_, request, status) => {
    vi.stubGlobal('fetch', upstream);
    expect((await POST(request)).status).toBe(status);
  });

  it('accepts a same-origin request behind a proxy (reaches validation)', async () => {
    const request = new Request('http://internal:3000/api/bookings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://site.example',
        'X-Forwarded-Host': 'site.example',
        'X-Forwarded-Proto': 'https',
      },
      body: JSON.stringify({ email: 'broken' }),
    });
    expect((await POST(request)).status).toBe(400);
  });

  it('never lets an invalid request reach storage or the booking service', () => {
    expect(upstream).not.toHaveBeenCalled();
    expect(limiter).not.toHaveBeenCalled();
  });
});

describe('POST /api/bookings — rate limiting', () => {
  it('returns 429 with Retry-After when the limit is reached', async () => {
    const POST = createBookingHandler(async () => ({ allowed: false, retryAfter: 42 }));
    const response = await POST(bookingRequest(payload));
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('42');
  });

  it('fails closed when rate-limit storage is unavailable', async () => {
    const POST = createBookingHandler(async () => {
      throw new Error('Storage unavailable');
    });
    expect((await POST(bookingRequest(payload))).status).toBe(503);
  });
});

describe('POST /api/bookings — upstream outcomes', () => {
  const POST = createBookingHandler(allow);

  it('forwards an allowlist of fields and recognizes a confirmed booking', async () => {
    const upstream = vi.fn<(target: string, init: RequestInit) => Promise<Response>>(async () =>
      Response.json({ ok: true, eventId: 'mock-event' }),
    );
    vi.stubGlobal('fetch', upstream);

    const response = await POST(bookingRequest(payload));
    expect(await response.json()).toMatchObject({ ok: true, eventId: 'mock-event' });

    const [target, init] = upstream.mock.calls[0];
    expect(target).toBe('https://nuvato.ai/api/bookings');
    expect(JSON.parse(String(init.body))).not.toHaveProperty('website');
  });

  it('preserves a slot conflict', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ ok: false }, { status: 409 }));
    expect((await POST(bookingRequest(payload))).status).toBe(409);
  });

  it('never retries an uncertain write or claims success', async () => {
    const upstream = vi.fn(async () => {
      throw new Error('Network interrupted');
    });
    vi.stubGlobal('fetch', upstream);

    const response = await POST(bookingRequest(payload));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ uncertain: true });
    expect(upstream).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/availability', () => {
  it('rejects an unknown meeting type', async () => {
    const response = await getAvailability(
      new Request(`${URL_BASE}/api/availability?type=INVALID`),
    );
    expect(response.status).toBe(400);
  });

  it('returns live availability without caching', async () => {
    vi.stubGlobal('fetch', async () =>
      Response.json({
        ok: true,
        timezone: 'America/Chicago',
        days: [{ date: '2026-11-09', slots: [{ time: '09:00' }] }],
      }),
    );
    const response = await getAvailability(new Request(`${URL_BASE}/api/availability?type=MT-1`));
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('never invents availability when the service is down', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('Offline');
    });
    const response = await getAvailability(new Request(`${URL_BASE}/api/availability`));
    expect(response.status).toBe(503);
  });
});
