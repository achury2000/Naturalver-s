import Link from 'next/link';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { ProductGrid } from '@/components/catalog/product-grid';
import { ProductCard } from '@/components/catalog/product-card';
import { CategoryFilter } from '@/components/catalog/category-filter';
import { ProductSort } from '@/components/catalog/product-sort';
import { Pagination } from '@/components/ui/Pagination';
import { Section } from '@/components/layout/section';
import { SearchBar } from '@/components/catalog/search-bar';
import { queryProducts, queryCategories } from '@/lib/payload';

const PRODUCTS_PER_PAGE = 12;

const sortMapping: Record<string, string> = {
  popular: '-createdAt',
  newest: '-createdAt',
  name_asc: 'name',
  name_desc: '-name',
  price_asc: 'price',
  price_desc: '-price',
};

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const searchQuery = params.search || '';
  const selectedCategory = params.category || '';
  const sortBy = params.sort || 'popular';
  const currentPage = parseInt(params.page || '1', 10);

  const [productsResult, categories] = await Promise.all([
    queryProducts({
      where: {
        ...(selectedCategory && { category: { equals: selectedCategory } }),
        ...(searchQuery && { name: { like: searchQuery } }),
      },
      sort: sortMapping[sortBy] || '-createdAt',
      limit: PRODUCTS_PER_PAGE,
      page: currentPage,
      depth: 2,
    }),
    queryCategories(0),
  ]);

  return (
    <Layout>
      <Section background="gray">
        <Container>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
              Catálogo
            </h1>
            <p className="mt-2 text-gray-500">
              Encuentra los productos naturales que mejor se adapten a tus necesidades
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md flex-1">
              <SearchBar placeholder="Busca productos..." />
            </div>
            <ProductSort value={sortBy} />
          </div>

          <div className="mb-6">
            <CategoryFilter
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              active={selectedCategory}
            />
          </div>

          {productsResult.docs.length > 0 ? (
            <>
              <ProductGrid>
                {productsResult.docs.map((product: any) => (
                  <Link key={product.id} href={`/${product.slug}`} style={{ display: 'contents' }}>
                    <ProductCard product={product} />
                  </Link>
                ))}
              </ProductGrid>
              {productsResult.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    total={productsResult.totalDocs}
                    page={productsResult.page}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No se encontraron productos para &ldquo;{searchQuery}&rdquo;</p>
              <Link
                href="/catalogo"
                className="mt-4 inline-block text-sm font-medium text-brand-dark hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  );
}