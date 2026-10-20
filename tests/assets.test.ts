import { describe, expect, it } from 'vitest';
import { assetUrl, imageKitEndpoint, imageKitUrl, images, toolLogo } from '@/lib/assets';
import { toolNames } from '@/lib/content';
import { contentSecurityPolicy } from '@/lib/security';

const ENDPOINT = 'https://ik.imagekit.io/isakglobalventures/nuvato';

/** Every asset the site expects to find in ImageKit. */
const registeredPaths = [...Object.values(images), ...toolNames.map(toolLogo)];

describe('ImageKit asset URLs', () => {
  it('defaults to the Nuvato folder in the Isak Global Ventures account', () => {
    expect(imageKitEndpoint).toBe(ENDPOINT);
  });

  it('serves the exact uploaded file', () => {
    expect(assetUrl(images.logo, ENDPOINT)).toBe(`${ENDPOINT}/brand/nuvato-logo.png?tr=orig-true`);
    expect(toolLogo('HubSpot')).toBe('/tools/hubspot.svg');
  });

  it('requests a resized, compressed image that is never upscaled', () => {
    expect(imageKitUrl(images.brandMark, 96, 75, ENDPOINT)).toBe(
      `${ENDPOINT}/brand/nuvato-integration-mark.webp?tr=w-96,c-at_max,q-75`,
    );
  });

  it('allows images only from the ImageKit folder', () => {
    const policy = contentSecurityPolicy('n', { imageSources: [`${ENDPOINT}/`] });
    expect(policy).toContain(`img-src 'self' data: ${ENDPOINT}/;`);
  });
});

/**
 * Network check that every registered asset exists in ImageKit with the expected type.
 * Run with `pnpm test:assets` (CI runs it too); skipped in the regular unit suite.
 */
describe.runIf(import.meta.env.MODE === 'remote-assets')('ImageKit library', () => {
  const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  it.each(registeredPaths)('has %s', async (path) => {
    const response = await fetch(assetUrl(path), { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      contentTypes[path.slice(path.lastIndexOf('.'))],
    );
  });
});
