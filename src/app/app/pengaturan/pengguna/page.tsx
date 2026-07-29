import type { Metadata } from 'next';
import { PenggunaClient } from './PenggunaClient';

export const metadata: Metadata = {
  title: 'Pengguna dan peran, Lekas',
  description: 'Daftar pengguna, peran pemilik, manajer, dan kasir, beserta hak aksesnya.',
};

export default function HalamanPengguna() {
  return <PenggunaClient />;
}
