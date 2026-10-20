import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/components/home/HomePage';
import { imageKitEndpoint, images, toolLogo } from '@/lib/assets';
import { agentFragment, agents, faqs, services, toolNames } from '@/lib/content';
import { legalDocuments } from '@/lib/legal-content';

const html = renderToStaticMarkup(<HomePage />);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const escape = (text: string) => text.replaceAll('&', '&amp;');

/**
 * Asset path of every rendered image, relative to the ImageKit folder. Outside the Next.js
 * runtime, next/image uses its default loader (/_next/image?url=...) instead of the
 * ImageKit loader, which tests/assets.test.ts covers.
 */
const imagePaths = [...html.matchAll(/\bsrc="([^"]+)"/g)].map(([, src]) => {
  const url = new URL(src.replaceAll('&amp;', '&'), 'http://localhost');
  if (url.pathname === '/_next/image') return url.searchParams.get('url')!;
  return (url.origin + url.pathname).replace(imageKitEndpoint, '');
});

describe('homepage server render', () => {
  it('has the required content inventory', () => {
    expect(services).toHaveLength(5);
    expect(agents).toHaveLength(12);
    expect(faqs).toHaveLength(6);
  });

  it('has exactly one h1 and unique ids', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every in-page anchor', () => {
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(id);
  });

  it('renders sections in order', () => {
    const order = [
      'top',
      'problems',
      'services',
      'why',
      'agents',
      'process',
      'overview',
      'security',
      'faq',
      'contact',
    ];
    const offsets = order.map((id) => html.indexOf(`id="${id}"`));
    expect(offsets.every((offset) => offset >= 0)).toBe(true);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });

  it('server-renders every service, agent, and FAQ answer', () => {
    for (const service of services) {
      expect(html).toContain(escape(service.title));
      for (const item of service.items) expect(html).toContain(escape(item));
      expect(ids).toContain(`panel-${service.id}`);
    }
    for (const agent of agents) expect(html).toContain(agent.name);
    for (const faq of faqs) expect(html).toContain(escape(faq.answer));
  });

  it('keeps inactive service panels in the HTML, hidden', () => {
    expect(html.match(/role="tabpanel" id="panel-[^>]*hidden=""/g)).toHaveLength(4);
  });

  it('keeps the full agent catalog in the HTML', () => {
    expect(html.match(/data-agent-name=/g)).toHaveLength(12);
    for (const agent of agents) expect(ids).toContain(agentFragment(agent.name));
    expect(html).toContain('Search agents by name, task, or tool');
    for (const i of [0, 1, 2]) expect(ids).toContain(`workflow-scene-${i}`);
  });

  it('has navigation, skip link, login, and labelled mockups', () => {
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain('Skip to content');
    expect(html).toContain('https://nuvato.ai/login');
    expect(html).toContain('ILLUSTRATIVE');
  });

  it('links the parent company with its local logo', () => {
    expect(html).toContain('href="https://isakglobalventures.com/"');
    expect(html).toContain('alt="IGV"');
    expect(imagePaths).toContain(images.parentLogo);
    expect(html).toContain('Part of <strong>Isak Global Ventures</strong></span>');
  });

  it('collects email but never a phone number or SMS consent', () => {
    expect(html).toContain('type="email"');
    expect(html).toMatch(/autocomplete="email"/i);
    expect(html).not.toContain('type="tel"');
    expect(html).toContain('This does not enroll you in SMS');
  });

  it('links every legal page', () => {
    // Outside the Next.js runtime, <Link> doesn't apply `trailingSlash`, so accept both forms.
    for (const document of legalDocuments) {
      expect(html).toMatch(new RegExp(`href="/${document.slug}/?"`));
    }
  });

  it('renders only registered ImageKit assets', () => {
    const registered = new Set<string>([...Object.values(images), ...toolNames.map(toolLogo)]);
    expect(imagePaths.length).toBeGreaterThan(0);
    for (const src of imagePaths) expect(registered).toContain(src);
  });
});
