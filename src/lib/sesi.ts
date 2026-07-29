'use client';

import { HAK_AKSES, PENGGUNA, petaPengguna } from '@/data/operasional';
import type { Pengguna } from '@/data/types';
import { usePreferensi } from './storage';

/**
 * Pengguna demo yang sedang "masuk".
 *
 * Layar masuk (`/login/`) menulis id pilihannya ke kunci ini. Kalau belum
 * pernah masuk (kunjungan langsung ke `/app/...`), bawaannya kasir pertama,
 * karena itu peran yang paling sering dipakai demo layar Kasir.
 */
const KUNCI_SESI = 'sesi-pengguna';

export function useSesi(): [Pengguna, (id: string) => void] {
  const [id, setId] = usePreferensi<string>(KUNCI_SESI, PENGGUNA[2].id);
  const pengguna = petaPengguna.get(id) ?? PENGGUNA[2];
  return [pengguna, setId];
}

/** Dipakai di luar komponen React, misalnya penulisan langsung ke localStorage. */
export function tulisSesi(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('lekas:' + KUNCI_SESI, JSON.stringify(id));
  } catch {
    /* diabaikan dengan sengaja, sama seperti lib/storage.ts */
  }
}

export type IdHakAkses = (typeof HAK_AKSES)[number]['id'];

/**
 * Cek hak akses satu peran terhadap satu kemampuan, dibaca dari matriks
 * `HAK_AKSES` di `data/operasional.ts` sehingga halaman Pengaturan > Pengguna
 * dan seluruh UI yang menggating tombol memakai SATU sumber kebenaran yang
 * sama. Kalau matriksnya berubah, gating ikut berubah tanpa disunting dua
 * tempat.
 */
export function bisa(peran: Pengguna['peran'], id: IdHakAkses): boolean {
  const baris = HAK_AKSES.find((h) => h.id === id);
  if (!baris) return false;
  return baris[peran];
}
