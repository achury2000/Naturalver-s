import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'No encontrado - NATURALVER\'S',
};

export default function NotFound() {
  return (
    <Layout>
      <section className="py-20">
        <Container>
          <div className="text-center">
            <h1 className="font-heading text-6xl font-bold text-brand-dark">404</h1>
            <p className="mt-4 text-gray-500">Página no encontrada</p>
            <a href="/" className="mt-6 inline-block rounded-lg bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark/90">
              Volver al inicio
            </a>
          </div>
        </Container>
      </section>
    </Layout>
  );
}