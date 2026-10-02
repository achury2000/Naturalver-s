import { Metadata } from 'next';
import { queryPageBySlug } from '@/lib/payload';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

export const metadata: Metadata = {
  title: 'Devolver - NATURALVER\'S',
};

export default async function DevolverPage() {
  const page = await queryPageBySlug('devolver');
  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="font-heading text-4xl font-bold text-gray-900">
            {page?.title || 'Política de devolución'}
          </h1>
          <div className="mt-6 text-gray-600">
            {(page as any)?.content || 'Contenido no disponible'}
          </div>
        </Container>
      </Section>
    </Layout>
  );
}