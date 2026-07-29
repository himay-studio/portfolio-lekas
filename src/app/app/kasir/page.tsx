import type { Metadata } from 'next';
import { KasirClient } from '@/components/kasir/KasirClient';

export const metadata: Metadata = {
  title: 'Kasir, Lekas',
  description: 'Layar kasir Lekas: grid produk, keranjang, diskon, tahan pesanan, dan pembayaran.',
};

/**
 * Layar Kasir memakai kerangka yang lebih lebar.
 *
 * `AppShell` mengenali rute ini lewat `usePathname()` dan memasang
 * `data-mode="kasir"`, yang memaksa sidebar jadi rail ikon 64px dan mengunci
 * tinggi kerangka ke 100dvh. Alasan lengkapnya ada di `AppShell.tsx` dan di
 * LAYOUT-ARCHITECTURE.md, ringkasnya: layar ini dipakai sambil berdiri dan
 * setiap piksel horizontal adalah satu ubin produk lagi yang muat.
 */
export default function HalamanKasir() {
  return <KasirClient />;
}
