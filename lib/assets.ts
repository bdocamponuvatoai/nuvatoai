/**
 * Images are stored in and served by ImageKit, the single source of truth for site
 * imagery. Favicons, app icons, and fonts live in `app/` because browsers fetch them
 * from the site's own domain.
 *
 * NEXT_PUBLIC_ variables are inlined at build time, so this module is safe on the client.
 */
export const imageKitEndpoint = (
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim() ||
  'https://ik.imagekit.io/isakglobalventures/nuvato'
).replace(/\/+$/, '');

/** Every ImageKit asset the site uses, by its path inside the endpoint folder. */
export const images = {
  brandMark: '/brand/nuvato-integration-mark.webp',
  logo: '/brand/nuvato-logo.png',
  socialCard: '/brand/nuvato-social.png',
  parentLogo: '/brand/igv-family-original.png',
} as const;

/** Tool logos are named after the tool, e.g. `/tools/hubspot.svg`. */
export const toolLogo = (tool: string) => `/tools/${tool.toLowerCase()}.svg`;

/**
 * URL for the exact uploaded file. `orig-true` opts out of ImageKit's automatic format
 * conversion, which would otherwise rasterize SVGs and drop the transparency of PNGs
 * served as JPEG.
 */
export function assetUrl(path: string, endpoint = imageKitEndpoint) {
  return `${endpoint}${path}?tr=orig-true`;
}

/**
 * Resized and compressed URL, used by the next/image loader. ImageKit picks WebP or AVIF
 * for browsers that accept it; `c-at_max` never upscales past the original width.
 */
export function imageKitUrl(
  path: string,
  width: number,
  quality = 80,
  endpoint = imageKitEndpoint,
) {
  return `${endpoint}${path}?tr=w-${width},c-at_max,q-${quality}`;
}
