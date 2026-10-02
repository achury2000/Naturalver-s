import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Mi cuenta - NATURALVER\'S',
};

export default function CuentaPage() {
  return (
    <Layout>
      <section className="py-12">
        <Container>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Mi cuenta</h1>
          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm text-center">
            <p className="text-gray-500">Inicia sesión para acceder a tu cuenta.</p>
          </div>
        </Container>
      </section>
    </Layout>
  );
}