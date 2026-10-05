import Link from 'next/link';
import { Logo } from './Logo';
import { getWhatsappNumber } from '@/lib/whatsapp';

function formatWhatsappDisplay(number: string | null): string {
  if (!number) return 'No disponible';
  const local = number.startsWith('57') ? number.slice(2) : number;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function Footer() {
  const whatsappNumber = getWhatsappNumber();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-gray-500">
              Por un mundo mejor. Productos naturales para tu bienestar.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold text-gray-900">Catálogo</h3>
            <ul className="space-y-2">
              <li><Link href="/catalogo" className="text-sm text-gray-500 hover:text-brand-dark">Todos los productos</Link></li>
              <li><Link href="/catalogo" className="text-sm text-gray-500 hover:text-brand-dark">Suplementos</Link></li>
              <li><Link href="/catalogo" className="text-sm text-gray-500 hover:text-brand-dark">Cosmética</Link></li>
              <li><Link href="/catalogo" className="text-sm text-gray-500 hover:text-brand-dark">Alimentos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold text-gray-900">Empresa</h3>
            <ul className="space-y-2">
              <li><Link href="/nosotros" className="text-sm text-gray-500 hover:text-brand-dark">Nosotros</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-brand-dark">Blog</Link></li>
              <li><Link href="/contacto" className="text-sm text-gray-500 hover:text-brand-dark">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold text-gray-900">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.89 1.27l.83 2.07a2 2 0 01-.45 2.11l-1.5 1.5a11.04 11.04 0 005.5 5.5l1.5-1.5a2 2 0 012.11-.45l2.07.83a2 2 0 011.27 1.89V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 5z" /></svg>
                {formatWhatsappDisplay(whatsappNumber)}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8-5 8 5-8 5-8-5z" /></svg>
                info@naturalvers.com
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NATURALVER'S. Por un mundo mejor.
          </p>
        </div>
      </div>
    </footer>
  );
}