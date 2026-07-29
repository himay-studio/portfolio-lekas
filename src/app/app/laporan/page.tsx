import type { Metadata } from 'next';
import { LaporanClient } from './LaporanClient';

export const metadata: Metadata = {
  title: 'Laporan, Lekas',
  description: 'Penjualan harian, produk terlaris, per metode bayar, per kasir, dan jam sibuk.',
};

export default function HalamanLaporan() {
  return <LaporanClient />;
}
