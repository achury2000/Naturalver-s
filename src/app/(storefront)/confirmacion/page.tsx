import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { OrderConfirmation } from '@/components/cart/order-confirmation';

export const metadata: Metadata = {
  title: 'Confirmación - NATURALVER\'S',
};

export default function ConfirmacionPage() {
  return (
    <Layout>
      <section className="py-12">
        <Container>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Confirmación</h1>
          <OrderConfirmation />
        </Container>
      </section>
    </Layout>
  );
}