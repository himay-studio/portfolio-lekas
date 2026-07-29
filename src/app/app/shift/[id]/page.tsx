import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SHIFT } from '@/data/transaksi';
import { DetailShift } from './DetailShift';

export function generateStaticParams() {
  return SHIFT.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id}, Lekas` };
}

export default async function DetailShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = SHIFT.find((x) => x.id === id);
  if (!s) notFound();
  return <DetailShift dasar={s} />;
}
