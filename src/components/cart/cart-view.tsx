'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/Button';

const CTA_CLASS =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-dark px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2';

export function CartView() {
  const { items, hydrated, removeItem, updateQuantity, clearCart, totalPrice, shipping, total } = useCart();

  if (!hydrated) {
    return <div className="mt-8 h-40 animate-pulse rounded-xl bg-white shadow-sm" aria-hidden="true" />;
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

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl bg-white px-6 shadow-sm">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={removeItem}
              onUpdate={updateQuantity}
            />
          ))}
        </div>

        <Link
          href="/catalogo"
          className="mt-6 inline-block text-sm font-medium text-brand-dark hover:underline"
        >
          ← Seguir comprando
        </Link>
      </div>

      <div className="lg:col-span-1">
        <CartSummary subtotal={totalPrice} shipping={shipping} total={total}>
          <div className="space-y-3">
            <Link href="/pago" className={CTA_CLASS}>
              Continuar al pago
            </Link>
            <Button variant="ghost" className="w-full" onClick={clearCart}>
              Vaciar carrito
            </Button>
          </div>
        </CartSummary>
      </div>
    </div>
  );
}