import { meetingTypes } from '@/lib/booking';
import { siteEnv } from '@/lib/env';

type UpstreamAvailability = { ok?: boolean; days?: unknown[]; timezone?: string };

const unavailable = () =>
  Response.json(
    { ok: false, error: 'The calendar is temporarily unavailable.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );

/** Read-only bridge to the public booking service already used by nuvato.ai. */
export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') || 'MT-1';
  if (!(meetingTypes as readonly string[]).includes(type)) {
    return Response.json({ ok: false, error: 'Invalid meeting type.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${siteEnv.bookingServiceOrigin}/api/availability?days=14&type=${type}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
        cache: 'no-store',
      },
    );
    const data = (await upstream.json()) as UpstreamAvailability;
    if (!upstream.ok || !data.ok || !Array.isArray(data.days)) return unavailable();

    return Response.json(
      { ok: true, days: data.days, timezone: data.timezone || 'America/Chicago' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return unavailable();
  }
}
