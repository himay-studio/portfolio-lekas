import type { Metadata } from 'next';
import { ShiftClient } from './ShiftClient';

export const metadata: Metadata = {
  title: 'Shift Kasir, Lekas',
  description: 'Buka shift, kas awal, tutup shift, selisih kas, dan rekap per kasir.',
};

export default function HalamanShift() {
  return <ShiftClient />;
}
