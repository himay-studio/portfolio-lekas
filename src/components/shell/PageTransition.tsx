'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * R46. Setiap perpindahan rute beranimasi, bukan potong keras.
 *
 * `key` pada pathname memaksa React membongkar dan memasang ulang pembungkusnya
 * di setiap navigasi, sehingga animasi masuk benar benar berjalan lagi. Tanpa
 * key itu, React memakai ulang simpul yang sama dan animasinya hanya jalan
 * sekali seumur sesi, yaitu pada muat pertama.
 *
 * Durasinya 220ms lewat `--dur-page`, di dalam jendela 150 sampai 300ms yang
 * disyaratkan, dan tidak menunda cat pertama karena elemennya sudah ada di
 * HTML hasil ekspor statis, hanya opacity-nya yang dianimasikan. Di
 * `prefers-reduced-motion` animasinya dimatikan sementara keadaan akhirnya
 * tetap terlihat, jadi konten tidak pernah tersangkut di opacity 0.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const jalur = usePathname();
  return (
    <div key={jalur} className="page-enter">
      {children}
    </div>
  );
}
