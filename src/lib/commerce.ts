export const FREE_SHIPPING_THRESHOLD = 100000;
export const SHIPPING_COST = 15000;

export interface PricedLine {
  price: number;
  quantity: number;
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function calculateTotals<T extends PricedLine>(items: T[]): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal);

  return { subtotal, shipping, total: subtotal + shipping };
}