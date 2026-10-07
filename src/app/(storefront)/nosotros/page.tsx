import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { AboutStats } from '@/components/about/about-stats';
import { ValuesExplorer } from '@/components/about/values-explorer';

export const metadata: Metadata = {
  title: 'Nosotros - NATURALVER\'S',
  description:
    'Conoce la historia, la misión y los valores de NATURALVER\'S: productos naturales seleccionados para el bienestar de tu familia.',
};

const MISION_POINTS = [
  'Ingredientes que puedes pronunciar',
  'Información clara antes de comprar',
  'Atención humana en cada pedido',
];

const PROCESS_STEPS = [
  {
    title: 'Selección',
    description:
      'Investigamos cada producto: composición, origen y certificaciones. Solo lo que convence entra al catálogo.',
  },
  {
    title: 'Pedido',
    description:
      'Armas tu pedido en la tienda y lo confirmas por WhatsApp. Coordinamos contigo el pago y la entrega.',
  },
  {
    title: 'Preparación',
    description:
      'Revisamos y empacamos cada producto con cuidado para que llegue en perfectas condiciones a tu hogar.',
  },
  {
    title: 'Entrega',
    description:
      'Te damos seguimiento hasta tu puerta. Envío gratis en compras superiores a $100.000 COP.',
  },
];

export default function NosotrosPage() {
  return (
    <Layout>
      <section className="relative overflow-hidden bg-white">
        <div aria-hidden="true" className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-light/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-brand-dark/5 blur-3xl" />
        <Container className="relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <h1 className="font-heading text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              Nuestra historia
            </h1>
            <p className="mt-6 text-lg text-gray-600 md:text-xl">
              NATURALVER'S nació de una convicción sencilla: los productos naturales son el
              futuro del bienestar y deberían estar al alcance de cada familia.
            </p>
            <p className="mt-4 text-gray-600">
              Por eso seleccionamos suplementos, cosmética, alimentos y bebidas con ingredientes
              honestos, probados por nosotros antes de llegar a tus manos.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="rounded-lg bg-brand-dark px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
              >
                Ver catálogo
              </Link>
              <a
                href="#valores"
                className="rounded-lg border-2 border-gray-300 px-8 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-brand-dark hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
              >
                Conocer nuestros valores
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/nosotros.jpeg"
                alt="Algunos de los productos naturales de NATURALVER'S"
                width={1122}
                height={1402}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">100% ingredientes naturales</p>
                <p className="text-xs text-gray-500">Sin aditivos artificiales</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <AboutStats />

      <section className="bg-gray-50 py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-heading text-3xl font-bold text-gray-900">Lo que nos mueve</h2>
            <blockquote className="mt-6 border-l-4 border-brand-dark pl-5 font-heading text-xl italic leading-relaxed text-gray-800 md:text-2xl">
              «Lo natural no es una tendencia: es la forma más honesta de cuidarnos.»
              <footer className="mt-3 font-body text-sm not-italic text-gray-500">
                — Equipo NATURALVER'S
              </footer>
            </blockquote>
          </div>
          <div className="space-y-5 leading-relaxed text-gray-600 lg:col-span-7">
            <p>
              Comenzamos buscando para nosotros lo que luego quisimos ofrecer a otros: productos
              naturales de verdad, con listas de ingredientes que se entienden y orígenes que se
              pueden rastrear. Cuando encontramos artículos que cumplían esa promesa, entendimos
              que podíamos compartirlos.
            </p>
            <p>
              Así nació NATURALVER'S, una tienda hecha por gente que usa lo que vende. Cada
              producto pasa por una revisión cuidadosa: composición, proveedor, sostenibilidad y,
              sobre todo, si nosotros lo llevaríamos a nuestra propia casa.
            </p>
            <p>
              Hoy seguimos creciendo sin perder la cercanía: preferimos conversar contigo por
              WhatsApp antes que automatizarlo todo, responder tus dudas antes de la compra y
              acompañarte después, porque un buen bienestar se construye con confianza.
            </p>
          </div>
        </Container>
      </section>

      <section id="mision" className="scroll-mt-24 bg-white py-12 md:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl bg-brand-dark p-8 text-white md:p-10 lg:col-span-3">
              <p className="font-script text-3xl text-brand-light">Por un mundo mejor</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">Nuestra misión</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/85">
                Ofrecer productos naturales seleccionados, con calidad, transparencia y precio
                justos, para que cada hogar pueda cuidarse sin complicaciones. Creemos que el
                acceso a lo natural es un derecho, no un privilegio.
              </p>
              <ul className="mt-6 space-y-3">
                {MISION_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-white/90">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light/20 text-brand-light">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 lg:col-span-2">
              <h2 className="font-heading text-3xl font-bold text-gray-900">Nuestra visión</h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                Ser la tienda de productos naturales en la que las familias confían: un lugar al
                que se vuelve no por costumbre, sino porque cada producto cumple lo que promete.
              </p>
              <Link
                href="/catalogo"
                className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-brand-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
                aria-label="Ver catálogo de productos naturales"
              >
                Ver catálogo
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="valores" className="scroll-mt-24 bg-gray-50 py-12 md:py-16">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-bold text-gray-900">Nuestros valores</h2>
            <p className="mt-4 text-gray-600">
              Son los criterios con los que elegimos cada producto y la forma en que te atendemos.
              Tócalos para conocer cómo los aplicamos.
            </p>
          </div>
          <div className="mt-8">
            <ValuesExplorer />
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-bold text-gray-900">Del origen a tu puerta</h2>
            <p className="mt-4 text-gray-600">
              Así trabajamos cada pedido, de principio a fin.
            </p>
          </div>
          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-dark/30 hover:shadow-md motion-reduce:transform-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark font-heading text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-brand-dark py-16 md:py-20">
        <Container className="text-center">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Descubre la diferencia natural
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Explora el catálogo y prueba productos seleccionados uno a uno. Si tienes dudas,
            escríbenos: con gusto te ayudamos a elegir.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-lg border-2 border-white/40 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
            >
              Contáctanos
            </Link>
          </div>
        </Container>
      </section>
    </Layout>
  );
}