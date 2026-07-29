import type { Metadata } from 'next';
import { TransaksiClient } from './TransaksiClient';

export const metadata: Metadata = {
  title: 'Transaksi, Lekas',
  description: 'Riwayat penjualan, detail struk, refund dan void beserta alasannya.',
};

export default function HalamanTransaksi() {
  return <TransaksiClient />;
}
