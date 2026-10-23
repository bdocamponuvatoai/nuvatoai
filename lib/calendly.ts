/**
 * Calendly scheduling, embedded as a plain iframe. Calendly's widget.js is deliberately
 * not used: loading third-party script would require loosening the CSP's script-src.
 * The iframe needs only `frame-src https://calendly.com` (see lib/security.ts).
 *
 * Docs: https://developer.calendly.com/api-docs/overview/embedding/getting-started
 */
export const CALENDLY_ORIGIN = 'https://calendly.com';

/** Matches the site's design tokens (`--navy`, `--blue`, and the dialog's white). */
const APPEARANCE = {
  background_color: 'ffffff',
  text_color: '0a1230',
  primary_color: '1a56f0',
};

export type SchedulingDetails = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
};

/**
 * Builds the iframe URL, pre-filling everything the visitor already entered so they only
 * pick a time. `a1`–`a3` map to the event type's custom questions, in order:
 * 1. Company, 2. Services of interest, 3. Project details. Unknown answers are ignored.
 */
export function calendlyEmbedUrl(
  schedulingUrl: string,
  details: SchedulingDetails,
  embedDomain: string,
) {
  const url = new URL(schedulingUrl);
  if (url.origin !== CALENDLY_ORIGIN) throw new Error('Scheduling URL must be on calendly.com');

  const params: Record<string, string> = {
    // Calendly posts scheduling events to the parent window only for embeds.
    embed_type: 'Inline',
    embed_domain: embedDomain,
    // The booking dialog already shows the event name and duration.
    hide_event_type_details: '1',
    ...APPEARANCE,
    name: details.name,
    email: details.email,
    a1: details.company,
    a2: details.service,
    a3: details.message,
  };
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.href;
}

export type CalendlyEvent =
  | {
      event: 'calendly.event_scheduled';
      payload: { event: { uri: string }; invitee: { uri: string } };
    }
  | { event: 'calendly.page_height'; payload: { height: string } }
  | { event: `calendly.${string}`; payload?: unknown };

/**
 * Returns the Calendly event carried by a `message` event, or null. Messages from any
 * origin other than calendly.com are ignored, so another frame or window can't fake a
 * confirmed booking.
 */
export function readCalendlyEvent(message: Pick<MessageEvent, 'origin' | 'data'>) {
  if (message.origin !== CALENDLY_ORIGIN) return null;
  const data = message.data as { event?: unknown } | null;
  if (typeof data?.event !== 'string' || !data.event.startsWith('calendly.')) return null;
  return data as CalendlyEvent;
}

/** Pixel height from a `calendly.page_height` payload such as `"1012px"`, or null. */
export function parseCalendlyHeight(height: unknown) {
  const pixels = Number.parseInt(String(height), 10);
  return Number.isFinite(pixels) && pixels > 0 ? pixels : null;
}
