import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Nosotros - NATURALVER\'S',
  description: 'Conoce la historia de NATURALVER\'S',
};

export default function NosotrosPage() {
  return (
    <Layout>
      <Section background="gray">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">
              Nosotros
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              NATURALVER'S nace con la convicción de que los productos naturales son el futuro del bienestar.
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">Nuestra misión</h2>
              <p className="mt-4 text-gray-600">
                Por un mundo mejor. Creemos que el acceso a productos naturales y sostenibles es un derecho, no un privilegio.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">Nuestros valores</h2>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Calidad natural certificada</li>
                <li>• Sostenibilidad ambiental</li>
                <li>• Transparencia en cada proceso</li>
                <li>• Bienestar integral</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}