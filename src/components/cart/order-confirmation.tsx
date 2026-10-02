'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipping: 'En envío',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-xl bg-white shadow-sm" />}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orden');

  if (!orderNumber) {
    return (
      <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">No hay ningún pedido que confirmar.</p>
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
    <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
      <h2 className="font-heading text-xl font-semibold text-gray-900">
        ¡Gracias por tu compra!
      </h2>
      <p className="mt-3 text-gray-600">
        Tu pedido ha sido recibido. Te contactaremos por WhatsApp para confirmar el pago y la
        entrega.
      </p>

      <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 text-left">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Número de pedido</dt>
          <dd className="mt-1 font-heading font-semibold text-gray-900">{orderNumber}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Estado</dt>
          <dd className="mt-1 font-heading font-semibold text-brand-dark">
            {STATUS_LABELS.pending}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-gray-500">
        Guarda este número para cualquier consulta sobre tu pedido.
      </p>

      <Link
        href="/catalogo"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-dark px-6 text-sm font-semibold text-white hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
      >
        Seguir comprando
      </Link>
    </div>
  );
}