'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Kontrak buka tutup bersama untuk dropdown, pemilih tanggal, dan popover.
 *
 * R60 diselesaikan di sini, bukan di tiap komponen. Aturannya: SATU keadaan
 * React menentukan apakah panel terbuka, dan `aria-expanded` dibaca dari
 * keadaan yang SAMA dengan yang memutuskan panel dirender. Kalau CSS `:hover`
 * atau `:focus-within` boleh membuka panel sendiri, dua sumber kebenaran itu
 * akan berselisih: pengguna melihat menu terbuka, pembaca layar diberi tahu
 * menu tertutup.
 *
 * Yang juga sengaja TIDAK ada di sini: pembuka `onFocus`. Klik nyata memicu
 * fokus lebih dulu lalu klik, jadi memasang pembuka `onFocus` bersama toggler
 * `onClick` membuat keduanya saling meniadakan, dan panel berkedip lalu
 * tertutup lagi. Yang benar adalah `onClick` untuk toggle plus `onKeyDown`
 * untuk papan ketik.
 */
export function useDisclosure() {
  const [buka, setBuka] = useState(false);
  const id = useId();
  const idPanel = `panel-${id.replace(/:/g, '')}`;
  const refPemicu = useRef<HTMLButtonElement | null>(null);
  const refPanel = useRef<HTMLDivElement | null>(null);

  const tutup = useCallback((kembalikanFokus = true) => {
    setBuka(false);
    if (kembalikanFokus) refPemicu.current?.focus();
  }, []);

  const toggle = useCallback(() => setBuka((b) => !b), []);

  useEffect(() => {
    if (!buka) return undefined;

    const padaTombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        tutup();
      }
    };
    const padaKlik = (e: MouseEvent) => {
      const t = e.target as Node;
      if (refPanel.current?.contains(t) || refPemicu.current?.contains(t)) return;
      // Klik di luar tidak mengembalikan fokus ke pemicu: pengguna sedang
      // menuju elemen lain, dan merebut fokus balik akan melompatinya.
      setBuka(false);
    };

    document.addEventListener('keydown', padaTombol);
    document.addEventListener('mousedown', padaKlik);
    return () => {
      document.removeEventListener('keydown', padaTombol);
      document.removeEventListener('mousedown', padaKlik);
    };
  }, [buka, tutup]);

  return { buka, setBuka, toggle, tutup, idPanel, refPemicu, refPanel };
}

/**
 * Sisi mana panel harus menempel supaya tidak menembus tepi viewport.
 *
 * R16.1 dan R57. Panel yang selalu dipusatkan ke pemicunya akan keluar jendela
 * di 1025px, lebar paling sempit yang masih memakai tata letak desktop, dan
 * luapan itu ikut menaikkan `scrollWidth` dokumen. Pemicu di paruh kanan layar
 * menumbuhkan panelnya ke KIRI, sisanya ke kanan.
 */
export function sisiPanel(el: HTMLElement | null): 'kiri' | 'kanan' {
  if (!el || typeof window === 'undefined') return 'kiri';
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2 > window.innerWidth / 2 ? 'kanan' : 'kiri';
}
