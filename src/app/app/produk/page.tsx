import type { Metadata } from 'next';
import { ProdukClient } from './ProdukClient';

export const metadata: Metadata = {
  title: 'Produk, Lekas',
  description: 'Katalog produk dengan varian, kategori, harga, stok, dan SKU.',
};

export default function HalamanProduk() {
  return <ProdukClient />;
}
