export const DEFAULT_CONTACT_MESSAGE =
  'Hola, quiero hacer una consulta sobre sus productos.';

export interface WhatsAppOrderLine {
  name: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrder {
  orderNumber: string;
  items: WhatsAppOrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function getWhatsappNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!raw) return null;

  const digits = raw.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsappUrl(number: string, message: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatOrderMessage(order: WhatsAppOrder): string {
  const lines = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n');

  return [
    `Hola, quiero confirmar mi pedido ${order.orderNumber}.`,
    '',
    lines,
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Envío: ${order.shipping === 0 ? 'Gratuito' : formatPrice(order.shipping)}`,
    `Total: ${formatPrice(order.total)}`,
  ].join('\n');
}