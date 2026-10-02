'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const CTA_CLASS =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-dark px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, shipping, total } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 id="cart-drawer-title" className="font-heading text-lg font-semibold text-gray-900">
            Tu carrito
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-gray-500">Tu carrito está vacío.</p>
            <Link
              href="/catalogo"
              onClick={close}
              className="mt-4 text-sm font-medium text-brand-dark hover:underline"
            >
              Ver productos →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdate={updateQuantity}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 p-4">
              <CartSummary subtotal={totalPrice} shipping={shipping} total={total}>
                <div className="space-y-3">
                  <Link href="/pago" onClick={close} className={CTA_CLASS}>
                    Continuar al pago
                  </Link>
                  <Link
                    href="/carrito"
                    onClick={close}
                    className="block text-center text-sm font-medium text-brand-dark hover:underline"
                  >
                    Ver carrito completo
                  </Link>
                </div>
              </CartSummary>
            </div>
          </>
        )}
      </div>
    </div>
  );
}