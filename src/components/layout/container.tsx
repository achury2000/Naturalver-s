import { PropsWithChildren } from 'react';

export function Container({ children, className }: PropsWithChildren & { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      {children}
    </div>
  );
}