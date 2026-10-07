'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function HeaderSearch({
  className,
  onSearch,
}: {
  className?: string;
  onSearch?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?search=${encodeURIComponent(q)}` : '/catalogo');
    onSearch?.();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('relative', className)}
    >
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7A6E]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <input
        type="text"
        name="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar"
        aria-label="Buscar productos"
        autoComplete="off"
        className="h-8 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-xs text-brand-dark placeholder:text-[#9AA69E] focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-[#9AA69E] hover:text-brand-dark"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
