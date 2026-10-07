const PLACEHOLDER = '/placeholder-product.jpg';

// Payload builds absolute media URLs from `serverURL`, which often points at a
// different origin than the page rendering the image (e.g. dev on :3005 with
// NEXT_PUBLIC_SITE_URL=:3000). Serving same-origin keeps next/image working
// regardless of that mismatch; external hosts (cloudinary, placehold.co) are
// left untouched.
function toSameOrigin(url: string): string {
  if (!url.startsWith('http')) return url;
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/api/')
      ? `${parsed.pathname}${parsed.search}`
      : url;
  } catch {
    return url;
  }
}

export function getImageUrl(image: any): string {
  if (!image) return PLACEHOLDER;
  if (typeof image === 'string') return toSameOrigin(image);
  return toSameOrigin(image?.url || PLACEHOLDER);
}