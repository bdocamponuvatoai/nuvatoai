import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from '@/lib/security';

const directive = (policy: string, name: string) =>
  policy
    .split('; ')
    .find((entry) => entry.startsWith(`${name} `))
    ?.slice(name.length + 1);

describe('content security policy', () => {
  const policy = contentSecurityPolicy('test-nonce');

  it('allows scripts only from self and the request nonce', () => {
    expect(directive(policy, 'script-src')).toBe("'self' 'nonce-test-nonce'");
  });

  it('forbids framing, plugins, and foreign form targets', () => {
    expect(directive(policy, 'frame-ancestors')).toBe("'none'");
    expect(directive(policy, 'object-src')).toBe("'none'");
    expect(directive(policy, 'form-action')).toBe("'self'");
  });

  it('upgrades insecure requests over HTTPS only', () => {
    expect(policy).toContain('upgrade-insecure-requests');
    expect(contentSecurityPolicy('n', { secure: false })).not.toContain(
      'upgrade-insecure-requests',
    );
  });

  it('allows eval only in development', () => {
    expect(policy).not.toContain('unsafe-eval');
    expect(directive(contentSecurityPolicy('n', { development: true }), 'script-src')).toContain(
      "'unsafe-eval'",
    );
  });
});

describe('static security headers', () => {
  const names = securityHeaders.map((header) => header.key.toLowerCase());

  it.each([
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
  ])('includes %s', (name) => {
    expect(names).toContain(name);
  });
});

describe('accessibility CSS', () => {
  it('supports reduced motion and visible focus', async () => {
    const css = await readFile('app/styles/globals.css', 'utf8');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toContain(':focus-visible');
  });
});
