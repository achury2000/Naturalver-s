'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/media';
import { StarRating } from './star-rating';

export function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();

  const images = product.images || [];
  const image = getImageUrl(images[0]?.image);
  const alt = images[0]?.alt || product.name;
  const discount = product.compareAtPrice && product.price < product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image,
      maxStock: product.stock ?? 0,
    });
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <Link href={`/${product.slug}`} className="block" aria-label={product.name}>
          <Image
            src={image}
            alt={alt}
            width={400}
            height={400}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.newArrival && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-dark px-2 py-1 text-xs font-bold text-white">
            Nuevo
          </span>
        )}
        {product.stock > 0 && (
          <div className="absolute bottom-3 right-3 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Agregar ${product.name} al carrito`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark shadow-lg hover:bg-brand-dark hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.29 2.29c-.63.63-.17 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-heading font-semibold text-gray-900 transition-colors group-hover:text-brand-dark">
          <Link href={`/${product.slug}`} className="focus:outline-none focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <StarRating rating={product.rating || 4.5} size="sm" />
          <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-brand-dark">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}