import { describe, expect, it } from 'vitest';
import {
  CALENDLY_ORIGIN,
  calendlyEmbedUrl,
  parseCalendlyHeight,
  readCalendlyEvent,
} from '@/lib/calendly';
import { contentSecurityPolicy } from '@/lib/security';
import { siteConfig } from '@/lib/site-config';

const details = {
  name: 'Test User',
  email: 'test@example.com',
  company: 'Example & Co',
  service: 'AI agents, Automation',
  message: 'Timeline: Within 1–3 months. We need help with lead routing.',
};

describe('Calendly embed URL', () => {
  const url = new URL(
    calendlyEmbedUrl(siteConfig.consultation.calendlyUrl, details, 'www.nuvato.ai'),
  );
  const param = (name: string) => url.searchParams.get(name);

  it('points at the configured Calendly event', () => {
    expect(url.origin).toBe(CALENDLY_ORIGIN);
    expect(url.pathname).toBe('/nuvato-ai/30min');
  });

  it('embeds inline for this site so Calendly posts booking events back', () => {
    expect(param('embed_type')).toBe('Inline');
    expect(param('embed_domain')).toBe('www.nuvato.ai');
  });

  it('pre-fills every answer from the consultation form', () => {
    expect(param('name')).toBe(details.name);
    expect(param('email')).toBe(details.email);
    expect(param('a1')).toBe(details.company);
    expect(param('a2')).toBe(details.service);
    expect(param('a3')).toBe(details.message);
  });

  it('matches the site design and hides details the dialog already shows', () => {
    expect(param('hide_event_type_details')).toBe('1');
    expect(param('text_color')).toBe('0a1230');
    expect(param('primary_color')).toBe('1a56f0');
    expect(param('background_color')).toBe('ffffff');
  });

  it('keeps Calendly’s cookie consent banner', () => {
    expect(url.searchParams.has('hide_gdpr_banner')).toBe(false);
  });

  it('refuses a scheduling URL outside calendly.com', () => {
    expect(() => calendlyEmbedUrl('https://evil.example/30min', details, 'x')).toThrow();
  });
});

describe('Calendly messages', () => {
  const scheduled = {
    event: 'calendly.event_scheduled',
    payload: { event: { uri: 'e' }, invitee: { uri: 'i' } },
  };

  it('accepts events from calendly.com', () => {
    expect(readCalendlyEvent({ origin: CALENDLY_ORIGIN, data: scheduled })).toEqual(scheduled);
  });

  it('ignores the same event from any other origin, so a booking cannot be faked', () => {
    for (const origin of ['https://evil.example', 'https://calendly.com.evil.example', 'null']) {
      expect(readCalendlyEvent({ origin, data: scheduled })).toBeNull();
    }
  });

  it('ignores messages that are not Calendly events', () => {
    for (const data of [null, 'calendly.event_scheduled', { event: 42 }, { event: 'other' }]) {
      expect(readCalendlyEvent({ origin: CALENDLY_ORIGIN, data })).toBeNull();
    }
  });

  it('reads the reported page height', () => {
    expect(parseCalendlyHeight('1012px')).toBe(1012);
    expect(parseCalendlyHeight('auto')).toBeNull();
    expect(parseCalendlyHeight(undefined)).toBeNull();
  });
});

describe('CSP for the scheduler', () => {
  it('allows frames from calendly.com only, and no Calendly scripts', () => {
    const policy = contentSecurityPolicy('n');
    expect(policy).toContain(`frame-src ${CALENDLY_ORIGIN};`);
    expect(policy).not.toContain('assets.calendly.com');
    expect(policy).toMatch(/script-src 'self' 'nonce-n';/);
  });
});
