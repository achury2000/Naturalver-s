import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

export const metadata: Metadata = {
  title: 'Blog - NATURALVER\'S',
  description: 'Artículos sobre bienestar natural',
};

export default function BlogPage() {
  return (
    <Layout>
      <Section background="gray">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">
              Blog
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Artículos, tips y consejos sobre bienestar natural.
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="py-12 text-center">
            <p className="text-gray-500">Próximamente más contenido.</p>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}