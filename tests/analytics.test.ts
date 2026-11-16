import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAnalyticsCookies, GTM_ID_PATTERN, trackEvent } from '@/lib/analytics';
import {
  CONSENT_STORAGE_KEY,
  effectiveConsent,
  saveConsent,
  storedConsent,
  subscribeToConsent,
} from '@/lib/consent';
import { readSiteEnv } from '@/lib/env';
import { getLegalDocument } from '@/lib/legal-content';
import { contentSecurityPolicy } from '@/lib/security';
import { siteConfig } from '@/lib/site-config';

/** A minimal browser: an EventTarget window with localStorage, and a navigator. */
function stubBrowser({ gpc = false, storageFails = false } = {}) {
  const store = new Map<string, string>();
  const target = new EventTarget();
  const localStorage = {
    getItem: (key: string) => {
      if (storageFails) throw new Error('SecurityError');
      return store.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (storageFails) throw new Error('SecurityError');
      store.set(key, value);
    },
  };
  vi.stubGlobal('window', Object.assign(target, { localStorage }));
  vi.stubGlobal('navigator', { globalPrivacyControl: gpc });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe('analytics configuration', () => {
  it('uses a valid Google Tag Manager container ID', () => {
    expect(siteConfig.analytics.gtmId).toMatch(GTM_ID_PATTERN);
    expect(GTM_ID_PATTERN.test('GTM-TFHD8F5M"><script>')).toBe(false);
  });

  it('is enabled on production deployments only, unless explicitly turned on', () => {
    expect(readSiteEnv({}).analyticsEnabled).toBe(false);
    expect(readSiteEnv({ VERCEL_ENV: 'preview' }).analyticsEnabled).toBe(false);
    expect(readSiteEnv({ VERCEL_ENV: 'production' }).analyticsEnabled).toBe(true);
    expect(readSiteEnv({ ENABLE_ANALYTICS: 'true' }).analyticsEnabled).toBe(true);
  });
});

describe('CSP for analytics', () => {
  const directive = (policy: string, name: string) =>
    policy
      .split('; ')
      .find((entry) => entry.startsWith(`${name} `))
      ?.split(' ')
      .slice(1) ?? [];

  it('allows no Google sources unless analytics is enabled', () => {
    expect(contentSecurityPolicy('n')).not.toContain('google');
  });

  it('allows exactly the Google tag and GA4 sources when enabled', () => {
    const policy = contentSecurityPolicy('n', { analytics: true });
    expect(directive(policy, 'script-src')).toEqual([
      "'self'",
      "'nonce-n'",
      'https://*.googletagmanager.com',
    ]);
    expect(directive(policy, 'img-src')).toEqual(
      expect.arrayContaining(['https://*.google-analytics.com', 'https://*.googletagmanager.com']),
    );
    expect(directive(policy, 'connect-src')).toEqual([
      "'self'",
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
    ]);
  });

  it('still never allows inline scripts, eval, or framing of this site', () => {
    const policy = contentSecurityPolicy('n', { analytics: true });
    expect(directive(policy, 'script-src')).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain('unsafe-eval');
    expect(policy).toContain("frame-ancestors 'none'");
  });
});

describe('consent store', () => {
  beforeEach(() => stubBrowser());

  it('is unknown until the visitor chooses', () => {
    expect(storedConsent()).toBeNull();
    expect(effectiveConsent()).toBeNull();
  });

  it('saves the choice and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsent(listener);
    saveConsent('granted');
    expect(effectiveConsent()).toBe('granted');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    saveConsent('denied');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(effectiveConsent()).toBe('denied');
  });

  it('ignores unexpected stored values', () => {
    const store = stubBrowser();
    store.set(CONSENT_STORAGE_KEY, 'yes');
    expect(storedConsent()).toBeNull();
  });

  it('treats Global Privacy Control as declining, unless the visitor accepts', () => {
    stubBrowser({ gpc: true });
    expect(effectiveConsent()).toBe('denied');
    saveConsent('granted');
    expect(effectiveConsent()).toBe('granted');
  });

  it('asks again when storage is unavailable, without throwing', () => {
    stubBrowser({ storageFails: true });
    expect(effectiveConsent()).toBeNull();
    expect(() => saveConsent('denied')).not.toThrow();
  });
});

describe('Google tag helpers', () => {
  it('sends events only once the Google tag has loaded', () => {
    stubBrowser();
    expect(() => trackEvent('generate_lead')).not.toThrow();
    const gtag = vi.fn();
    Object.assign(window, { gtag });
    trackEvent('generate_lead', { lead_source: 'consultation_booking' });
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      lead_source: 'consultation_booking',
    });
  });

  it('deletes only Google Analytics cookies, on the host and parent domains', () => {
    const written: string[] = [];
    vi.stubGlobal('document', {
      get cookie() {
        return '_ga=GA1.1.1; _ga_ABC123=GS1.1; session=keep; other_ga=keep';
      },
      set cookie(value: string) {
        written.push(value);
      },
    });
    expect(clearAnalyticsCookies('www.nuvato.ai')).toEqual(['_ga', '_ga_ABC123']);
    expect(written).toContain('_ga=; Max-Age=0; path=/; domain=.nuvato.ai');
    expect(written).toContain('_ga_ABC123=; Max-Age=0; path=/; domain=.www.nuvato.ai');
    expect(written.some((cookie) => cookie.startsWith('session='))).toBe(false);
    expect(written.some((cookie) => cookie.includes('domain=.ai'))).toBe(false);
  });
});

describe('Privacy Policy describes analytics accurately', () => {
  const text = JSON.stringify(getLegalDocument('privacy'));

  it.each([
    'Only if you accept analytics cookies',
    'Nothing from Google loads until you choose Accept',
    'Cookie settings',
    'the analytics cookies are deleted',
    'Global Privacy Control are honored',
    'Advertising features are switched off',
    'no longer than 14 months',
  ])('says "%s"', (phrase) => {
    expect(text).toContain(phrase);
  });

  it('no longer claims the site uses no analytics', () => {
    expect(text).not.toContain('analytics trackers');
    expect(text).not.toContain('it shows no cookie banner');
  });
});
