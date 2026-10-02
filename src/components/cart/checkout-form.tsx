'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { calculateTotals, FREE_SHIPPING_THRESHOLD } from '@/lib/commerce';
import { submitCheckout } from '@/lib/order-actions';
import {
  buildWhatsappUrl,
  formatOrderMessage,
  formatPrice,
  getWhatsappNumber,
} from '@/lib/whatsapp';
import { CartSummary } from '@/components/cart/cart-summary';

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre completo',
  phone: 'Teléfono',
  address: 'Dirección',
  city: 'Ciudad',
  department: 'Departamento',
};

const REQUIRED_FIELDS = ['name', 'phone', 'address', 'city', 'department'] as const;

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark';

const CTA_CLASS =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-dark px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export function CheckoutForm() {
  const router = useRouter();
  const { items, hydrated, clearCart, totalItems } = useCart();

  const [values, setValues] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    zip: '',
    notes: '',
  });
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [catalogPrices, setCatalogPrices] = useState<Record<string, number>>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    const ids = items.map((item) => item.id);
    const query = ids.map((id) => `where[id][in][]=${encodeURIComponent(id)}`).join('&');
    const base = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || '/api';
    const controller = new AbortController();

    fetch(`${base}/products?${query}&limit=${ids.length}&depth=0`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.docs) return;
        const prices: Record<string, number> = {};
        for (const doc of data.docs) {
          prices[String(doc.id)] = Number(doc.price);
        }
        setCatalogPrices(prices);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [hydrated, items]);

  const pricedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        price: catalogPrices[item.id] ?? item.price,
      })),
    [items, catalogPrices]
  );

  const { subtotal, shipping, total } = useMemo(() => calculateTotals(pricedItems), [pricedItems]);

  const setField = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting || submittedRef.current) return;

    const missing = REQUIRED_FIELDS.filter((field) => values[field].trim() === '');
    if (missing.length > 0) {
      setInvalidFields([...missing]);
      setError('Completa los campos obligatorios para continuar.');
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);
    setInvalidFields([]);
    setError(null);

    const whatsappNumber = getWhatsappNumber();
    const pendingTab = whatsappNumber ? window.open('', '_blank') : null;

    const result = await submitCheckout({
      name: values.name,
      phone: values.phone,
      address: values.address,
      city: values.city,
      department: values.department,
      zip: values.zip,
      notes: values.notes,
      lines: pricedItems.map((item) => ({ id: item.id, quantity: item.quantity })),
    });

    if (!result.ok) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(result.error);
      if (result.invalidFields) setInvalidFields(result.invalidFields);
      pendingTab?.close();
      return;
    }

    clearCart();
    router.push(`/confirmacion?orden=${encodeURIComponent(result.order.orderNumber)}`);

    if (whatsappNumber) {
      const url = buildWhatsappUrl(whatsappNumber, formatOrderMessage(result.order));
      if (pendingTab) {
        pendingTab.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      pendingTab?.close();
      setError(
        'Tu pedido quedó registrado, pero el contacto por WhatsApp no está disponible en este momento.'
      );
    }

    setSubmitting(false);
  };

  if (!hydrated) {
    return <div className="mt-8 h-96 animate-pulse rounded-xl bg-white shadow-sm" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand-dark px-6 text-sm font-semibold text-white hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const freeShippingMissing = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
          aria-describedby={error ? 'checkout-error' : undefined}
        >
          <h2 className="font-heading text-lg font-semibold text-gray-900">
            Datos de entrega
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.
          </p>

          {error && (
            <div
              id="checkout-error"
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="checkout-name"
              label={FIELD_LABELS.name}
              required
              invalid={invalidFields.includes('name')}
              value={values.name}
              onChange={(value) => setField('name', value)}
              className="sm:col-span-2"
            />
            <Field
              id="checkout-phone"
              label={FIELD_LABELS.phone}
              required
              type="tel"
              inputMode="tel"
              invalid={invalidFields.includes('phone')}
              value={values.phone}
              onChange={(value) => setField('phone', value)}
            />
            <Field
              id="checkout-zip"
              label="Código postal"
              value={values.zip}
              onChange={(value) => setField('zip', value)}
            />
            <Field
              id="checkout-address"
              label={FIELD_LABELS.address}
              required
              invalid={invalidFields.includes('address')}
              value={values.address}
              onChange={(value) => setField('address', value)}
              className="sm:col-span-2"
            />
            <Field
              id="checkout-city"
              label={FIELD_LABELS.city}
              required
              invalid={invalidFields.includes('city')}
              value={values.city}
              onChange={(value) => setField('city', value)}
            />
            <Field
              id="checkout-department"
              label={FIELD_LABELS.department}
              required
              invalid={invalidFields.includes('department')}
              value={values.department}
              onChange={(value) => setField('department', value)}
            />
            <div className="sm:col-span-2">
              <label htmlFor="checkout-notes" className="block text-sm font-medium text-gray-700">
                Notas del pedido
              </label>
              <textarea
                id="checkout-notes"
                rows={3}
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Direcciones de entrega, indicaciones especiales..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className={`${CTA_CLASS} mt-6`}>
            {submitting ? 'Enviando pedido...' : 'Finalizar pedido por WhatsApp'}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            {totalItems} producto{totalItems === 1 ? '' : 's'} en el carrito. Te contactaremos por
            WhatsApp para confirmar el pago y la entrega.
          </p>
        </form>
      </div>

      <div className="lg:col-span-1">
        <CartSummary subtotal={subtotal} shipping={shipping} total={total}>
          <ul className="space-y-2">
            {pricedItems.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-600">
                  {item.name} <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {freeShippingMissing > 0 && (
            <p className="mt-4 text-xs text-gray-500">
              Te faltan {formatPrice(freeShippingMissing)} para envío gratuito.
            </p>
          )}
        </CartSummary>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required = false,
  invalid = false,
  type = 'text',
  inputMode,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  type?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
  className?: string;
}) {
  const invalidId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only">(obligatorio)</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        required={required}
        aria-required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? invalidId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 ${INPUT_CLASS} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
      />
      {invalid && (
        <p id={invalidId} className="mt-1 text-xs text-red-600">
          {label} es obligatorio.
        </p>
      )}
    </div>
  );
}