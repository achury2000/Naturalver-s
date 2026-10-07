'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from './container';
import { Logo } from './logo';
import { HeaderSearch } from './header-search';
import { useCart } from '@/contexts/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Productos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export function Header() {
  const { totalItems, hydrated, isOpen, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-40 w-full bg-white border-b border-gray-100">
      <Container>
        <div className="flex h-[57px] items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="-ml-1 flex h-8 w-8 items-center justify-center text-brand-dark md:hidden"
          >
            {menuOpen ? (
              <svg
                className="h-[16px] w-[16px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-[16px] w-[16px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="NATURALVER'S - Inicio">
            <Logo priority />
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter font-normal text-[12px] leading-[16px] text-[#6B7A6E] transition-colors hover:text-brand-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <HeaderSearch className="hidden w-56 md:block lg:w-64" />

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buscar"
              className="flex items-center justify-center text-brand-dark md:hidden"
            >
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
            </button>
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

      {menuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navegación móvil"
          className="absolute left-0 right-0 top-full border-b border-gray-100 bg-white shadow-lg md:hidden"
        >
          <Container>
            <div className="flex flex-col gap-1 py-3">
              <HeaderSearch
                className="mb-1"
                onSearch={() => setMenuOpen(false)}
              />
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-2 py-2 text-[13px] leading-[18px] text-[#6B7A6E] transition-colors hover:bg-gray-50 hover:text-brand-dark"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
