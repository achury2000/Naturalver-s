const PLACEHOLDER = '/placeholder-product.jpg';

export function getImageUrl(image: any): string {
  if (!image) return PLACEHOLDER;
  if (typeof image === 'string') return image;
  return image?.url || PLACEHOLDER;
}