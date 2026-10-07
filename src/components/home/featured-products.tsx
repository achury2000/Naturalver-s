import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { ProductGrid } from '@/components/catalog/product-grid';
import { ProductCard } from '@/components/catalog/product-card';
import { queryFeaturedProducts } from '@/lib/payload';
import Link from 'next/link';

export async function FeaturedProducts() {
  const products = await queryFeaturedProducts();

  if (products.length === 0) {
    return (
      <Section background="gray">
        <Container>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Próximamente más productos</p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark hover:underline"
            >
              Ver catálogo completo
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="gray">
      <Container>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-heading text-3xl font-bold text-gray-900">Productos Destacados</h2>
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-medium text-brand-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 sm:self-auto"
          >
            Ver todo el catálogo
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
        <ProductGrid className="lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </Container>
    </Section>
  );
}