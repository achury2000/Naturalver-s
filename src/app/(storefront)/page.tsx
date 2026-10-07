import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { HeroSlider } from '@/components/home/hero-slider';

export const metadata: Metadata = {
  title: 'Principal - NATURALVER\'S',
  description: 'NATURALVER\'S - Por un mundo mejor. Productos naturales para tu bienestar.',
};

// La portada consulta productos destacados del CMS en tiempo de request:
// sin esto, `next build` intenta pre-renderizarla y la consulta falla porque
// no hay API disponible durante el build.
export const dynamic = 'force-dynamic';

const LEAF_ICON = (
  <>
    <path d="M5 19C5 9 11 5 19 5c0 8-6 14-14 14z" />
    <path d="M5 19L19 5" />
  </>
);

const GLOBE_ICON = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.7 3 2.7 15 0 18" />
    <path d="M12 3c-2.7 3-2.7 15 0 18" />
  </>
);

const HEART_ICON = (
  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
);

const WHY_US = [
  { title: '100% Natural', desc: 'Ingredientes certificados sin aditivos', icon: LEAF_ICON },
  { title: 'Sostenibilidad', desc: 'Compromiso con el medio ambiente', icon: GLOBE_ICON },
  { title: 'Bienestar', desc: 'Para ti y tu familia', icon: HEART_ICON },
];

export default async function HomePage() {
  return (
    <Layout>
      <HeroSlider />

      <FeaturedProducts />

      <Section background="dark">
        <Container>
          <h2 className="text-center font-heading text-3xl font-bold">¿Por qué elegirnos?</h2>
          <div className="mt-10 grid gap-10 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/15">
            {WHY_US.map((item) => (
              <div key={item.title} className="flex flex-col items-center px-4 md:px-8">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </span>
                <h3 className="font-heading text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 max-w-xs text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
