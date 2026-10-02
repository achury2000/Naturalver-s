'use server';

import { calculateTotals } from '@/lib/commerce';
import { createOrder, queryProducts, type OrderDraft } from '@/lib/payload';

const REQUIRED_ADDRESS_FIELDS = ['name', 'phone', 'address', 'city', 'department'] as const;

const ORDER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ORDER_NUMBER_ATTEMPTS = 3;

export interface CheckoutLineInput {
  id: string;
  quantity: number;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  zip: string;
  notes?: string;
  lines: CheckoutLineInput[];
}

export interface CheckoutOrderSummary {
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  total: number;
}

export type CheckoutResult =
  | { ok: true; order: CheckoutOrderSummary }
  | { ok: false; error: string; invalidFields?: string[] };

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');

  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += ORDER_ALPHABET[Math.floor(Math.random() * ORDER_ALPHABET.length)];
  }

  return `NV-${datePart}-${suffix}`;
}

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const shippingAddress = {
    name: (input.name ?? '').trim(),
    phone: (input.phone ?? '').trim(),
    address: (input.address ?? '').trim(),
    city: (input.city ?? '').trim(),
    department: (input.department ?? '').trim(),
    zip: (input.zip ?? '').trim(),
  };

  const invalidFields = REQUIRED_ADDRESS_FIELDS.filter((field) => shippingAddress[field] === '');

  if (invalidFields.length > 0) {
    return {
      ok: false,
      error: 'Completa los campos obligatorios para continuar.',
      invalidFields: [...invalidFields],
    };
  }

  const requestedLines = (input.lines ?? []).filter((line) => line && typeof line.id === 'string');

  if (requestedLines.length === 0) {
    return { ok: false, error: 'Tu carrito está vacío.' };
  }

  const productIds = [...new Set(requestedLines.map((line) => line.id))];

  let catalog: any[];
  try {
    const response = await queryProducts({
      where: { id: { in: productIds } },
      limit: productIds.length,
      depth: 0,
    });
    catalog = response.docs;
  } catch {
    return {
      ok: false,
      error: 'No pudimos verificar los productos del carrito. Inténtalo de nuevo.',
    };
  }

  const catalogById = new Map(catalog.map((product) => [String(product.id), product]));
  const missing = productIds.filter((id) => !catalogById.has(id));

  if (missing.length > 0) {
    return {
      ok: false,
      error: 'Uno o más productos del carrito ya no están disponibles.',
    };
  }

  const items = requestedLines.map((line) => {
    const product = catalogById.get(line.id)!;
    const stock = Number(product.stock) || 0;
    const requested = Math.floor(Number(line.quantity));
    const quantity = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 1, stock));

    return {
      product: line.id,
      quantity,
      price: Number(product.price),
      name: product.name,
    };
  });

  const { subtotal, shipping, total } = calculateTotals(items);

  const draft: OrderDraft = {
    orderNumber: '',
    items,
    subtotal,
    shipping,
    total,
    shippingAddress,
    status: 'pending',
    paymentMethod: 'whatsapp',
    ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
  };

  let lastError: unknown = null;

  for (let attempt = 0; attempt < ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    draft.orderNumber = generateOrderNumber();
    try {
      const created = await createOrder(draft);
      return {
        ok: true,
        order: {
          orderNumber: created.orderNumber,
          items: items.map(({ name, quantity, price }) => ({ name, quantity, price })),
          subtotal: created.subtotal,
          shipping: created.shipping,
          total: created.total,
        },
      };
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Order creation failed after retries', lastError);

  return {
    ok: false,
    error: 'No pudimos registrar tu pedido. Inténtalo de nuevo en unos momentos.',
  };
}