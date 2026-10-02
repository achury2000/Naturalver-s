import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

export const metadata: Metadata = {
  title: 'Principal - NATURALVER\'S',
  description: 'NATURALVER\'S - Por un mundo mejor. Productos naturales para tu bienestar.',
};

export default function HomePage() {
  return (
    <Layout>
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand-dark to-brand-dark/80">
        <Container className="flex flex-col items-center text-center text-white">
          <h1 className="font-heading text-5xl font-bold leading-tight md:text-7xl">
            Por un mundo <span className="text-brand-light">mejor</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            NATURALVER'S — productos naturales para tu bienestar y el de tu familia.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/catalogo" className="rounded-lg bg-brand-light px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light/90">
              Ver catálogo
            </a>
            <a href="/nosotros" className="rounded-lg border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Conócenos
            </a>
          </div>
        </Container>
      </section>

      <Section background="gray">
        <Container>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-gray-900">Categorías</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Suplementos', icon: '🌿' },
                { name: 'Cosmética', icon: '✨' },
                { name: 'Alimentos', icon: '🍎' },
                { name: 'Bebidas', icon: '🍵' },
              ].map((cat) => (
                <a key={cat.name} href="/catalogo" className="group rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
                  <div className="text-4xl">{cat.icon}</div>
                  <h3 className="mt-3 font-heading font-semibold text-gray-900 group-hover:text-brand-dark">{cat.name}</h3>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-gray-900">¿Por qué elegirnos?</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { title: '100% Natural', desc: 'Ingredientes certificados sin aditivos' },
                { title: 'Sostenibilidad', desc: 'Compromiso con el medio ambiente' },
                { title: 'Bienestar', desc: 'Para ti y tu familia' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="font-heading text-xl font-semibold text-brand-dark">{item.title}</h3>
                  <p className="mt-2 text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}