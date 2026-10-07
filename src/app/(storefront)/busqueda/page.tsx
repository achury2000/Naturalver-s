import { redirect } from 'next/navigation';

export default async function BusquedaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/catalogo?search=${encodeURIComponent(q)}` : '/catalogo');
}
