import { PropsWithChildren } from 'react';

export function Section({ children, className, background = 'white' }: PropsWithChildren & { className?: string; background?: 'white' | 'gray' | 'dark' }) {
  const bg = background === 'gray' ? 'bg-gray-50' : background === 'dark' ? 'bg-brand-dark text-white' : 'bg-white';
  return (
    <section className={`py-12 md:py-16 ${bg} ${className || ''}`}>
      {children}
    </section>
  );
}