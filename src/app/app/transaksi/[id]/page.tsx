import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRANSAKSI } from '@/data/transaksi';
import { DetailTransaksi } from './DetailTransaksi';

export function generateStaticParams() {
  return TRANSAKSI.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id}, Lekas` };
}

export default async function DetailTransaksiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TRANSAKSI.find((x) => x.id === id);
  if (!t) notFound();
  return <DetailTransaksi dasar={t} />;
}
