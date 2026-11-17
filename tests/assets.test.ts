import { describe, expect, it } from 'vitest';
import { assetUrl, imageKitEndpoint, imageKitUrl, images, toolLogo } from '@/lib/assets';
import { blogPosts } from '@/lib/blog';
import { toolNames } from '@/lib/content';
import { contentSecurityPolicy } from '@/lib/security';

const ENDPOINT = 'https://ik.imagekit.io/isakglobalventures/nuvato';

/** Every asset the site expects to find in ImageKit. */
const registeredPaths = [
  ...Object.values(images),
  ...toolNames.map(toolLogo),
  ...blogPosts.map((post) => post.image.path),
];

/** Blog images whose files declare how they were made (for example, AI-generated). */
const markedBlogImages = blogPosts.filter((post) => post.image.digitalSourceType);

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
// A cold CDN cache can make the first request slow. Retries absorb that; a missing
// file still fails, because a 404 fails every attempt.
const network = { timeout: 15_000, retry: 2 };

describe.runIf(import.meta.env.MODE === 'remote-assets')('ImageKit library', network, () => {
  const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
  };

  it.each(registeredPaths)('has %s', async (path) => {
    const response = await fetch(assetUrl(path), { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      contentTypes[path.slice(path.lastIndexOf('.'))],
    );
  });

  // The page serves the original file because ImageKit strips metadata from resized images.
  it.each(markedBlogImages)(
    'serves $image.path with its embedded AI-generated marker',
    async ({ image }) => {
      const response = await fetch(image.url);
      const bytes = Buffer.from(await response.arrayBuffer()).toString('latin1');
      expect(bytes).toContain(image.digitalSourceType);
    },
  );
});
