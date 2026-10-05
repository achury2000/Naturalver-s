'use client';

import Link from 'next/link';
import { Container } from './container';
import { Logo } from './Logo';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const { totalItems, hydrated, isOpen, setIsOpen } = useCart();

  return (
    <header className="fixed top-0 z-40 w-full bg-white border-b border-gray-100">
      <Container>
        <div className="flex h-[57px] items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center" aria-label="NATURALVER'S - Inicio">
            <Logo priority />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
            <Link href="/" className="font-inter font-normal text-[12px] leading-[16px] text-[#6B7A6E] transition-colors hover:text-brand-dark">
              Inicio
            </Link>
            <Link href="/catalogo" className="font-inter font-normal text-[12px] leading-[16px] text-[#6B7A6E] transition-colors hover:text-brand-dark">
              Productos
            </Link>
            <Link href="/nosotros" className="font-inter font-normal text-[12px] leading-[16px] text-[#6B7A6E] transition-colors hover:text-brand-dark">
              Nosotros
            </Link>
            <Link href="/contacto" className="font-inter font-normal text-[12px] leading-[16px] text-[#6B7A6E] transition-colors hover:text-brand-dark">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/busqueda" className="flex items-center justify-center text-brand-dark" aria-label="Buscar">
              <svg
                className="h-[14.5px] w-[14.5px]"
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
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={hydrated && totalItems > 0 ? `Carrito, ${totalItems} productos` : 'Carrito'}
              className="relative flex items-center justify-center text-brand-dark"
            >
              <svg
                className="h-[14.5px] w-[16px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.29 2.29c-.63.63-.17 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {hydrated && totalItems > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand-dark px-1 text-[10px] font-bold leading-none text-white"
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}