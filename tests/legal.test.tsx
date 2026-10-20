import { access } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LegalPage from '@/components/legal/LegalPage';
import { getLegalDocument, legalDocuments, legalMeta } from '@/lib/legal-content';

describe('legal documents', () => {
  it('publishes Privacy, Terms, and SMS Terms, with website SMS enrollment disabled', () => {
    expect(legalDocuments.map((document) => document.slug)).toEqual([
      'privacy',
      'terms',
      'sms-terms',
    ]);
    expect(legalMeta.smsEnrollmentEnabled).toBe(false);
  });

  it('throws for an unknown document', () => {
    expect(() => getLegalDocument('nope')).toThrow();
  });

  describe.each(legalDocuments)('$title', (document) => {
    const markup = renderToStaticMarkup(<LegalPage document={document} />);
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

    it('has a route', async () => {
      await access(`app/${document.slug}/page.tsx`);
    });

    it('shows effective and updated dates', () => {
      expect(markup).toContain(`Effective ${document.effective ?? legalMeta.effective}`);
      expect(markup).toContain('Last updated');
    });

    it('links the legal contact email', () => {
      expect(markup).toContain('href="mailto:legal@nuvato.ai"');
    });

    it('contains no draft or placeholder language', () => {
      expect(markup).not.toMatch(/pending confirmation|review draft/i);
    });

    it('has one h1, unique section ids, and a working table of contents', () => {
      expect(markup.match(/<h1\b/g)).toHaveLength(1);
      expect(new Set(ids).size).toBe(ids.length);
      for (const [, id] of markup.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(id);
    });
  });
});

describe('privacy policy', () => {
  const privacy = getLegalDocument('privacy');
  const text = JSON.stringify(privacy);

  it('keeps the mobile and SMS consent non-sharing statements', () => {
    expect(text).toContain('Mobile information will not be sold or shared');
    expect(text).toContain('SMS consent is not shared with third parties or affiliates');
    expect(text).toContain('opt-in data and consent');
  });

  it.each(['information', 'use', 'sharing'])('has the %s section', (id) => {
    expect(privacy.sections.some((section) => section.id === id)).toBe(true);
  });
});

describe('SMS terms (carrier registration requirements)', () => {
  const text = JSON.stringify(getLegalDocument('sms-terms'));

  it.each([
    'Messaging frequency may vary',
    'Message and data rates may apply',
    'To opt out at any time, text STOP',
    'For assistance, text HELP or visit our website at',
    'https://www.nuvato.ai/privacy/',
    'https://www.nuvato.ai/terms/',
    'By opting into SMS from a web form or other medium',
    'Reply STOP to any message to opt out',
    'SMS consent is not shared with third parties or affiliates',
    'Consent is not a condition of purchasing',
    'appointment confirmations and reminders',
    'not liable for delayed or undelivered messages',
  ])('includes "%s"', (phrase) => {
    expect(text).toContain(phrase);
  });

  it('uses the live nuvato.ai domain for help links', () => {
    expect(text).not.toContain('nuvatoai.ai');
  });
});
