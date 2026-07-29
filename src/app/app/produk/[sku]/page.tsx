import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUK } from '@/data/katalog';
import { DetailProduk } from './DetailProduk';

/**
 * Rute dinamis pada ekspor statis wajib menyebutkan seluruh parameternya di
 * waktu build. Kalau satu SKU tidak disebut di sini, halamannya tidak pernah
 * dibangun dan setiap tautan ke SKU itu jadi 404 di produksi, padahal build
 * lokalnya hijau. Itu kelas kegagalan R59 yang tidak bisa dilihat `tsc`.
 */
export function generateStaticParams() {
  return PRODUK.map((p) => ({ sku: p.sku }));
}

export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }): Promise<Metadata> {
  const { sku } = await params;
  const p = PRODUK.find((x) => x.sku === sku);
  return { title: p ? `${p.nama}, Lekas` : 'Produk, Lekas' };
}

export default async function HalamanDetailProduk({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const produk = PRODUK.find((p) => p.sku === sku);
  if (!produk) notFound();
  return <DetailProduk produk={produk} />;
}
