'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
};

const STATS: Stat[] = [
  {
    value: 100,
    suffix: '%',
    label: 'Ingredientes naturales',
    detail: 'Sin colorantes ni conservantes artificiales',
  },
  {
    value: 4,
    label: 'Categorías',
    detail: 'Suplementos, cosmética, alimentos y bebidas',
  },
  {
    value: 100000,
    prefix: '$',
    label: 'Envío gratis desde',
    detail: 'En compras superiores a $100.000 COP',
  },
];

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {new Intl.NumberFormat('es-CO').format(display)}
      {suffix}
    </span>
  );
}

export function AboutStats() {
  return (
    <section className="bg-brand-dark py-12 md:py-16" aria-label="NATURALVER'S en cifras">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <p className="font-heading text-4xl font-bold text-white md:text-5xl">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="mt-2 font-semibold text-white">{stat.label}</p>
              <p className="mt-1 max-w-xs text-sm text-white/75">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}