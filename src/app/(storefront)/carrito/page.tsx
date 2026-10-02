import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { CartView } from '@/components/cart/cart-view';

export const metadata: Metadata = {
  title: 'Carrito - NATURALVER\'S',
};

export default function CarritoPage() {
  return (
    <Layout>
      <section className="py-12">
        <Container>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Tu carrito</h1>
          <CartView />
        </Container>
      </section>
    </Layout>
  );
}