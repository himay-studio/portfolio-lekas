'use client';

/**
 * Lapisan timpa untuk tiga form Pengaturan (profil toko, pajak dan service,
 * printer dan struk). Tiap form punya kunci overlay sendiri supaya menyimpan
 * satu form tidak menyentuh dua form lainnya, dan dibaca gabungan dengan data
 * dasar di `data/operasional.ts` supaya render pertama tetap identik dengan
 * hasil build (tidak ada `new Date()` atau localStorage yang dibaca sebelum
 * mount).
 */

import { useCallback, useEffect, useState } from 'react';
import { PENGATURAN_PAJAK, PENGATURAN_PRINTER, PENGATURAN_TOKO } from '@/data/operasional';
import type { PengaturanPajak, PengaturanPrinter, PengaturanToko } from '@/data/types';
import { baca, tulis } from './storage';

function useTimpaPengaturan<T>(kunci: string, dasar: T): [T, (patch: Partial<T>) => void, boolean] {
  const [nilai, setNilai] = useState<T>(dasar);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setNilai({ ...dasar, ...baca<Partial<T>>(kunci, {}) });
    setSiap(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  const simpan = useCallback(
    (patch: Partial<T>) => {
      setNilai((prev) => {
        const berikutnya = { ...prev, ...patch };
        tulis(kunci, berikutnya);
        return berikutnya;
      });
    },
    [kunci],
  );

  return [nilai, simpan, siap];
}

export function useTokoStore() {
  const [toko, simpan, siap] = useTimpaPengaturan<PengaturanToko>('pengaturan-toko', PENGATURAN_TOKO);
  return { toko, simpanToko: simpan, siap };
}

export function usePajakStore() {
  const [pajak, simpan, siap] = useTimpaPengaturan<PengaturanPajak>('pengaturan-pajak', PENGATURAN_PAJAK);
  return { pajak, simpanPajak: simpan, siap };
}

export function usePrinterStore() {
  const [printer, simpan, siap] = useTimpaPengaturan<PengaturanPrinter>('pengaturan-printer', PENGATURAN_PRINTER);
  return { printer, simpanPrinter: simpan, siap };
}
