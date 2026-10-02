import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { CheckoutForm } from '@/components/cart/checkout-form';

export const metadata: Metadata = {
  title: 'Pago - NATURALVER\'S',
  description: 'Completa tus datos de entrega y confirma tu pedido por WhatsApp',
};

export default function PagoPage() {
  return (
    <Layout>
      <section className="py-12">
        <Container>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Pago</h1>
          <p className="mt-2 text-gray-600">
            Completa tus datos y te contactamos por WhatsApp para confirmar tu pedido.
          </p>
          <CheckoutForm />
        </Container>
      </section>
    </Layout>
  );
}