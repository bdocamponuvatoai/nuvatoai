'use client';

import type { ImageLoaderProps } from 'next/image';
import { imageKitUrl } from './assets';

/** Global next/image loader (see `images.loaderFile` in next.config.ts). */
export default function imageKitLoader({ src, width, quality }: ImageLoaderProps) {
  return imageKitUrl(src, width, quality);
}
