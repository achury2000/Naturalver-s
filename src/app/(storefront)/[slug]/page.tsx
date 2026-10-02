import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryProductBySlug, queryPageBySlug } from '@/lib/payload';
import { queryProducts } from '@/lib/payload';
import { getImageUrl } from '@/lib/payload';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProductGrid } from '@/components/catalog/product-grid';
import { ProductCard } from '@/components/catalog/product-card';
import { AddToCartPanel } from '@/components/catalog/add-to-cart-panel';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await queryProductBySlug(slug);
  if (product) {
    return {
      title: `${product.name} - NATURALVER'S`,
      description: product.description,
    };
  }
  const page = await queryPageBySlug(slug);
  return { title: page ? `${page.title} - NATURALVER'S` : 'Página - NATURALVER\'S' };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  // Primero busca como producto
  const product = await queryProductBySlug(slug, 2);

  if (product) {
    const images = product.images || [];
    const image = getImageUrl(images[0]?.image);
    const related = await queryProducts({
      where: product.category ? { category: { equals: product.category.id } } : undefined,
      limit: 4,
      depth: 2,
    });
    const relatedProducts = related.docs.filter((p: any) => p.id !== product.id);

    return (
      <Layout>
        <Section>
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={image}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-4 text-gray-600">{product.description}</p>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-brand-dark">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <AddToCartPanel
                  product={{
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    image,
                    stock: product.stock ?? 0,
                  }}
                />
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Relacionados</h2>
                <div className="mt-6">
                  <ProductGrid>
                    {relatedProducts.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </ProductGrid>
                </div>
              </div>
            )}
          </Container>
        </Section>
      </Layout>
    );
  }

  // Si no es producto, busca como página estática
  const page = await queryPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="font-heading text-4xl font-bold text-gray-900">
            {page.title}
          </h1>
          <div className="mt-6 text-gray-600">
            {(page as any).content || 'Contenido no disponible'}
          </div>
        </Container>
      </Section>
    </Layout>
  );
}