/** Shared image constants and utilities for product components */

export const PLACEHOLDER = "/imgs/placeholder.jpg";

/** Resolve image source: Cloudinary (absolute), local path, or placeholder */
export function resolveImageSrc(image: string | undefined): string {
  if (!image) return PLACEHOLDER;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/products/${image}`;
}
