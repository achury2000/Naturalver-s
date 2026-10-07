'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ValueItem = {
  id: string;
  title: string;
  tagline: string;
  body: string;
  detail: string;
  icon: React.ReactNode;
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Icon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      {children}
    </svg>
  );
}

const VALUES: ValueItem[] = [
  {
    id: 'calidad',
    title: 'Calidad natural certificada',
    tagline: 'Solo lo que pasaría en nuestra propia casa',
    body: 'Cada producto entra al catálogo después de revisar su composición, su origen y sus certificaciones. Si un ingrediente no nos convence, no llega a la tienda.',
    detail: 'Probamos y verificamos antes de vender.',
    icon: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
        <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
      </>
    ),
  },
  {
    id: 'sostenibilidad',
    title: 'Sostenibilidad ambiental',
    tagline: 'Cuidar la salud sin descuidar el planeta',
    body: 'Priorizamos proveedores y envases responsables, y evitamos productos con exceso de empaque. Creemos que el bienestar incluye a la naturaleza de la que nacen nuestros productos.',
    detail: 'Menos empaque, más responsabilidad.',
    icon: (
      <>
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" />
      </>
    ),
  },
  {
    id: 'transparencia',
    title: 'Transparencia en cada proceso',
    tagline: 'Información clara antes y después de comprar',
    body: 'Te contamos qué contiene cada producto, de dónde viene y cómo usarlo. Sin promesas exageradas ni letra pequeña: si algo no sabemos, te lo decimos.',
    detail: 'Sin letra pequeña ni promesas vacías.',
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    id: 'bienestar',
    title: 'Bienestar integral',
    tagline: 'Hábitos sencillos, no soluciones milagro',
    body: 'No vendemos atajos. Acompañamos decisiones cotidianas más sanas para ti y tu familia, con productos que se integran de verdad a tu rutina.',
    detail: 'Para ti y para los tuyos.',
    icon: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.7Z" />
    ),
  },
  {
    id: 'cercania',
    title: 'Cercanía con cada cliente',
    tagline: 'Atención humana, principalmente por WhatsApp',
    body: 'Antes y después de tu compra estás hablando con personas. Resolvemos dudas, damos recomendaciones y coordinamos cada pedido contigo, sin respuestas automáticas.',
    detail: 'Siempre hay alguien al otro lado.',
    icon: (
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
    ),
  },
];

export function ValuesExplorer() {
  const [activeId, setActiveId] = useState(VALUES[0].id);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = VALUES.find((value) => value.id === activeId) ?? VALUES[0];

  const handleSelect = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div role="group" aria-label="Valores de NATURALVER'S" className="flex flex-col gap-3">
        {VALUES.map((value) => {
          const isActive = value.id === activeId;
          return (
            <button
              key={value.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(value.id)}
              className={cn(
                'flex items-start gap-4 rounded-xl border p-4 text-left transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2',
                isActive
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-brand-dark/40 hover:bg-brand-dark/[0.04]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  isActive ? 'bg-white/15 text-white' : 'bg-brand-dark/10 text-brand-dark'
                )}
              >
                <Icon className="h-5 w-5">{value.icon}</Icon>
              </span>
              <span className="min-w-0">
                <span className="block font-heading font-semibold">{value.title}</span>
                <span className={cn('mt-0.5 block text-sm', isActive ? 'text-white/80' : 'text-gray-500')}>
                  {value.tagline}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={panelRef}
        aria-live="polite"
        className="self-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-24"
      >
        <div key={active.id} className="animate-fade-in motion-reduce:animate-none">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark">
            <Icon className="h-6 w-6">{active.icon}</Icon>
          </span>
          <h3 className="mt-4 font-heading text-2xl font-bold text-gray-900">{active.title}</h3>
          <p className="mt-3 leading-relaxed text-gray-600">{active.body}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-dark/5 px-4 py-2 text-sm font-medium text-brand-dark">
            {active.detail}
          </p>
        </div>
      </div>
    </div>
  );
}