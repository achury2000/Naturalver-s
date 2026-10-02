import { Metadata } from 'next';
import { queryProducts } from '@/lib/payload';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { ProductGrid } from '@/components/catalog/product-grid';
import { ProductCard } from '@/components/catalog/product-card';

export const metadata: Metadata = {
  title: 'Búsqueda - NATURALVER\'S',
};

export default async function BusquedaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const result = query
    ? await queryProducts({ where: { name: { like: query } }, limit: 12 })
    : { docs: [], totalDocs: 0 };

  return (
    <Layout>
      <section className="py-12 bg-gray-50">
        <Container>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Resultados de búsqueda
          </h1>
          {query && (
            <p className="mt-2 text-gray-500">
              {result.totalDocs} resultados para &ldquo;{query}&rdquo;
            </p>
          )}
          <div className="mt-8">
            {result.docs.length > 0 ? (
              <ProductGrid>
                {result.docs.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No se encontraron productos para &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}