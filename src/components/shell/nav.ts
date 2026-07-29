import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  ScanLine,
  Settings,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface ItemNav {
  href: string;
  label: string;
  ikon: ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  /** Judul yang tampil di topbar saat rute ini aktif. */
  judul: string;
}

export interface GrupNav {
  id: string;
  label: string;
  item: ItemNav[];
}

/**
 * Struktur sidebar.
 *
 * Delapan tujuan, jadi dikelompokkan. Di bawah sekitar tujuh item pengelompokan
 * cuma menambah baris yang harus dilewati mata; di atas itu, daftar rata mulai
 * terbaca sebagai satu tumpukan tanpa bentuk.
 *
 * Urutannya mengikuti alur kerja hari kerja sungguhan, bukan abjad: buka toko,
 * jualan, terima uang, baru urus katalog dan laporan.
 */
export const NAV: GrupNav[] = [
  {
    id: 'operasional',
    label: 'Operasional',
    item: [
      { href: '/app/', label: 'Beranda', judul: 'Beranda', ikon: LayoutDashboard },
      { href: '/app/kasir/', label: 'Kasir', judul: 'Kasir', ikon: ScanLine },
      { href: '/app/pembayaran/', label: 'Pembayaran', judul: 'Pembayaran', ikon: CreditCard },
    ],
  },
  {
    id: 'katalog',
    label: 'Katalog',
    item: [{ href: '/app/produk/', label: 'Produk', judul: 'Produk', ikon: Package }],
  },
  {
    id: 'riwayat',
    label: 'Riwayat',
    item: [
      { href: '/app/transaksi/', label: 'Transaksi', judul: 'Transaksi', ikon: Receipt },
      { href: '/app/shift/', label: 'Shift Kasir', judul: 'Shift Kasir', ikon: Wallet },
    ],
  },
  {
    id: 'analisis',
    label: 'Analisis',
    item: [{ href: '/app/laporan/', label: 'Laporan', judul: 'Laporan', ikon: BarChart3 }],
  },
  {
    id: 'sistem',
    label: 'Sistem',
    item: [{ href: '/app/pengaturan/', label: 'Pengaturan', judul: 'Pengaturan', ikon: Settings }],
  },
];

export const SEMUA_NAV = NAV.flatMap((g) => g.item);

/**
 * Item mana yang sedang aktif.
 *
 * Dicocokkan dengan awalan jalur, supaya `/app/produk/p-kopi-susu/` tetap
 * menyorot Produk. `/app/` diperlakukan khusus karena setiap rute lain juga
 * berawalan itu, jadi tanpa pengecualian ini Beranda akan selalu ikut aktif.
 */
export function itemAktif(jalur: string): ItemNav | undefined {
  const cocok = SEMUA_NAV
    .filter((i) => (i.href === '/app/' ? jalur === '/app/' : jalur.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length);
  return cocok[0];
}
