import type { Metadata } from 'next';
import { PembayaranClient } from './PembayaranClient';

export const metadata: Metadata = {
  title: 'Pembayaran, Lekas',
  description: 'Tunai dengan hitung kembalian, kartu, QRIS, split payment, dan pratinjau struk.',
};

export default function HalamanPembayaran() {
  return <PembayaranClient />;
}
