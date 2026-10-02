import { Metadata } from 'next';
import { Layout } from '@/components/layout/site-layout';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { buildWhatsappUrl, DEFAULT_CONTACT_MESSAGE, getWhatsappNumber } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contacto - NATURALVER\'S',
  description: 'Contáctanos con WhatsApp o Instagram',
};

function formatWhatsappDisplay(number: string | null): string {
  if (!number) return 'No disponible';
  const local = number.startsWith('57') ? number.slice(2) : number;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export default function ContactoPage() {
  const whatsappNumber = getWhatsappNumber();

  return (
    <Layout>
      <Section background="gray">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">
              Contacto
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Estamos aquí para atenderte. Contáctanos por cualquiera de estos canales.
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.89 1.27l.83 2.07a2 2 0 01-.45 2.11l-1.5 1.5a11.04 11.04 0 005.5 5.5l1.5-1.5a2 2 0 012.11-.45l2.07.83a2 2 0 011.27 1.89V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 5z" /></svg>
              </div>
              <h3 className="font-heading font-semibold text-gray-900">WhatsApp</h3>
              <p className="mt-2 text-gray-600">{formatWhatsappDisplay(whatsappNumber)}</p>
              {whatsappNumber ? (
                <a href={buildWhatsappUrl(whatsappNumber, DEFAULT_CONTACT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-brand-dark hover:underline">
                  Escribir mensaje →
                </a>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Contacto no disponible por ahora.</p>
              )}
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-heading font-semibold text-gray-900">Instagram</h3>
              <p className="mt-2 text-gray-600">@naturalvers_21</p>
              <a href="https://instagram.com/naturalvers_21" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-brand-dark hover:underline">
                Seguirnos →
              </a>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8-5 8 5-8 5-8-5z" /></svg>
              </div>
              <h3 className="font-heading font-semibold text-gray-900">Email</h3>
              <p className="mt-2 text-gray-600">info@naturalvers.com</p>
              <a href="mailto:info@naturalvers.com" className="mt-3 inline-block text-sm font-medium text-brand-dark hover:underline">
                Enviar email →
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}