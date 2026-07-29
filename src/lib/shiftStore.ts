'use client';

/**
 * Lapisan timpa untuk Shift, pola yang sama dengan `produkStore.ts` dan
 * `transaksiStore.ts`. `shift-timpa` menimpa shift yang sudah ada (tutup
 * shift dengan kas fisik dari penghitung pecahan uang), `shift-baru`
 * menampung shift yang dibuka lewat tombol Buka shift.
 */

import { useCallback, useEffect, useState } from 'react';
import { SHIFT } from '@/data/transaksi';
import type { Shift } from '@/data/types';
import { baca, tulis } from './storage';

const KUNCI_TIMPA = 'shift-timpa';
const KUNCI_BARU = 'shift-baru';

type TimpaShift = Partial<Omit<Shift, 'id'>>;
type PetaTimpa = Record<string, TimpaShift>;

let penghitung = 0;

export interface InputBukaShift {
  kasirId: string;
  outletId: string;
  kasAwal: number;
}

export interface InputTutupShift {
  kasFisik: number;
  catatan?: string;
}

function idBaru(waktu: Date, outletId: string): string {
  penghitung += 1;
  const y = waktu.getFullYear();
  const m = String(waktu.getMonth() + 1).padStart(2, '0');
  const d = String(waktu.getDate()).padStart(2, '0');
  const kode = outletId.slice(-1).toUpperCase();
  return `SH-${y}${m}${d}-B${penghitung}${kode}`;
}

export function useShiftStore() {
  const [timpa, setTimpaState] = useState<PetaTimpa>({});
  const [shiftBaru, setShiftBaruState] = useState<Shift[]>([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setTimpaState(baca<PetaTimpa>(KUNCI_TIMPA, {}));
    setShiftBaruState(baca<Shift[]>(KUNCI_BARU, []));
    setSiap(true);
  }, []);

  const simpanTimpa = useCallback((n: PetaTimpa) => {
    setTimpaState(n);
    tulis(KUNCI_TIMPA, n);
  }, []);

  const simpanShiftBaru = useCallback((n: Shift[]) => {
    setShiftBaruState(n);
    tulis(KUNCI_BARU, n);
  }, []);

  const terapkan = useCallback(
    (s: Shift): Shift => {
      const p = timpa[s.id];
      return p ? { ...s, ...p } : s;
    },
    [timpa],
  );

  const shift: Shift[] = [...SHIFT.map(terapkan), ...shiftBaru.map(terapkan)]
    .sort((a, b) => b.buka.localeCompare(a.buka));

  const patch = useCallback(
    (id: string, p: TimpaShift) => {
      if (SHIFT.some((s) => s.id === id)) {
        simpanTimpa({ ...timpa, [id]: { ...timpa[id], ...p } });
      } else {
        simpanShiftBaru(shiftBaru.map((s) => (s.id === id ? { ...s, ...p } : s)));
      }
    },
    [timpa, simpanTimpa, shiftBaru, simpanShiftBaru],
  );

  const bukaShift = useCallback(
    (input: InputBukaShift): Shift => {
      const waktu = new Date();
      const s: Shift = {
        id: idBaru(waktu, input.outletId),
        kasirId: input.kasirId,
        outletId: input.outletId,
        buka: waktu.toISOString().slice(0, 19),
        tutup: null,
        kasAwal: input.kasAwal,
        kasSistem: input.kasAwal,
        kasFisik: null,
        jumlahTransaksi: 0,
        penjualanTunai: 0,
        penjualanNonTunai: 0,
        status: 'terbuka',
      };
      simpanShiftBaru([...shiftBaru, s]);
      return s;
    },
    [shiftBaru, simpanShiftBaru],
  );

  const tutupShift = useCallback(
    (id: string, input: InputTutupShift) => {
      const skrg = shift.find((s) => s.id === id);
      if (!skrg) return;
      patch(id, {
        status: 'tertutup',
        tutup: new Date().toISOString().slice(0, 19),
        kasFisik: input.kasFisik,
        catatan: input.catatan || (
          input.kasFisik === skrg.kasSistem
            ? undefined
            : `Selisih ${input.kasFisik > skrg.kasSistem ? 'lebih' : 'kurang'} ${Math.abs(input.kasFisik - skrg.kasSistem).toLocaleString('id-ID')}, dicatat otomatis dari penghitung pecahan uang.`
        ),
      });
    },
    [shift, patch],
  );

  /** Dipakai layar Kasir tiap transaksi lunas: menambah rekap shift berjalan. */
  const catatPenjualan = useCallback(
    (id: string, tunai: number, nonTunai: number) => {
      const skrg = shift.find((s) => s.id === id);
      if (!skrg) return;
      patch(id, {
        jumlahTransaksi: skrg.jumlahTransaksi + 1,
        penjualanTunai: skrg.penjualanTunai + tunai,
        penjualanNonTunai: skrg.penjualanNonTunai + nonTunai,
        kasSistem: skrg.kasSistem + tunai,
      });
    },
    [shift, patch],
  );

  const kembalikanDemo = useCallback(() => {
    simpanTimpa({});
    simpanShiftBaru([]);
  }, [simpanTimpa, simpanShiftBaru]);

  return { shift, siap, bukaShift, tutupShift, catatPenjualan, kembalikanDemo };
}
