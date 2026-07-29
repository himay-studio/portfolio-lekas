'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * R53. Setiap overlay layar penuh WAJIB lewat sini.
 *
 * Elemen yang memasang `backdrop-filter`, `filter`, `transform`, `perspective`,
 * `contain: paint`, atau `will-change` pada salah satu properti itu menjadi
 * containing block bagi seluruh keturunan `position: fixed`. Overlay yang
 * bersarang di dalamnya akan kolaps setinggi elemen itu, bukan setinggi
 * viewport, dan CSS-nya terbaca persis sama di kasus rusak maupun benar. Jadi
 * membaca stylesheet tidak akan pernah membedakannya, hanya mengukur kotaknya
 * yang bisa. Memindahkan overlay ke `document.body` adalah satu satunya
 * perbaikan yang menyentuh sebabnya.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [siap, setSiap] = useState(false);

  /**
   * `useLayoutEffect`, bukan `useEffect`, dan bedanya nyata.
   *
   * Dengan `useEffect`, isi portal baru terpasang SETELAH cat, jadi saat jerat
   * fokus milik modal berjalan, ref-nya masih null dan fokus tidak pernah
   * pindah ke dalam dialog. Cacat itu tidak terlihat sama sekali dengan mata,
   * karena modalnya tampil normal.
   *
   * Komponen ini hanya dirender saat overlay-nya terbuka, dan overlay selalu
   * mulai tertutup, jadi ia tidak pernah ikut pohon render server.
   */
  useLayoutEffect(() => setSiap(true), []);

  if (!siap) return null;
  return createPortal(children, document.body);
}
