'use client';

/**
 * Lapisan timpa untuk Transaksi. Sama polanya dengan `produkStore.ts`:
 * `transaksi-timpa` menimpa FIELD pada transaksi yang sudah ada di data dasar
 * (menyelesaikan pembayaran tertahan, refund, void), `transaksi-baru`
 * menampung transaksi yang benar benar baru dibuat lewat layar Kasir.
 *
 * Refund dan void WAJIB membawa alasan. Aturan itu ditegakkan di sini, bukan
 * di komponen, supaya tidak ada satu jalur UI pun, termasuk aksi massal di
 * masa depan, yang bisa menghasilkan void tanpa alasan.
 */

import { useCallback, useEffect, useState } from 'react';
import { petaProduk } from '@/data/katalog';
import { PENGATURAN_PAJAK } from '@/data/operasional';
import { TRANSAKSI } from '@/data/transaksi';
import type { BarisBayar, BarisTransaksi, DiskonNilai, StatusTransaksi, Transaksi } from '@/data/types';
import { hitung } from './kasir';
import { baca, tulis } from './storage';

const KUNCI_TIMPA = 'transaksi-timpa';
const KUNCI_BARU = 'transaksi-baru';

type TimpaTransaksi = Partial<Omit<Transaksi, 'id'>>;
type PetaTimpa = Record<string, TimpaTransaksi>;

let penghitungBaru = 0;

export interface InputTransaksiBaru {
  kasirId: string;
  shiftId: string;
  outletId: string;
  mejaId: string | null;
  tipe: 'retail' | 'fnb';
  baris: BarisTransaksi[];
  diskonTransaksi: DiskonNilai | null;
  servicePersen: number;
  pajakPersen: number;
  pembayaran: BarisBayar[];
}

function nomorBaru(waktu: Date): string {
  penghitungBaru += 1;
  const y = waktu.getFullYear();
  const m = String(waktu.getMonth() + 1).padStart(2, '0');
  const d = String(waktu.getDate()).padStart(2, '0');
  const urut = String(1000 + penghitungBaru).slice(1);
  return `TRX-${y}${m}${d}-B${urut}`;
}

export function useTransaksiStore() {
  const [timpa, setTimpaState] = useState<PetaTimpa>({});
  const [transaksiBaru, setTransaksiBaruState] = useState<Transaksi[]>([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setTimpaState(baca<PetaTimpa>(KUNCI_TIMPA, {}));
    setTransaksiBaruState(baca<Transaksi[]>(KUNCI_BARU, []));
    setSiap(true);
  }, []);

  const simpanTimpa = useCallback((n: PetaTimpa) => {
    setTimpaState(n);
    tulis(KUNCI_TIMPA, n);
  }, []);

  const simpanTransaksiBaru = useCallback((n: Transaksi[]) => {
    setTransaksiBaruState(n);
    tulis(KUNCI_BARU, n);
  }, []);

  const terapkan = useCallback(
    (t: Transaksi): Transaksi => {
      const p = timpa[t.id];
      return p ? { ...t, ...p } : t;
    },
    [timpa],
  );

  const transaksi: Transaksi[] = [...TRANSAKSI.map(terapkan), ...transaksiBaru.map(terapkan)]
    .sort((a, b) => b.waktu.localeCompare(a.waktu));

  const patch = useCallback(
    (id: string, p: TimpaTransaksi) => {
      if (TRANSAKSI.some((t) => t.id === id)) {
        simpanTimpa({ ...timpa, [id]: { ...timpa[id], ...p } });
      } else {
        simpanTransaksiBaru(transaksiBaru.map((t) => (t.id === id ? { ...t, ...p } : t)));
      }
    },
    [timpa, simpanTimpa, transaksiBaru, simpanTransaksiBaru],
  );

  /** Layar Kasir dan Pembayaran: tutup tagihan tertahan atau checkout baru. */
  const selesaikanPembayaran = useCallback(
    (id: string, pembayaran: BarisBayar[]) => {
      patch(id, { pembayaran, status: 'lunas' });
    },
    [patch],
  );

  const refundTransaksi = useCallback(
    (id: string, alasan: string) => {
      if (!alasan.trim()) return { ok: false as const, alasanTolak: 'Refund wajib menyertakan alasan.' };
      patch(id, { status: 'refund' as StatusTransaksi, alasanStatus: alasan.trim() });
      return { ok: true as const };
    },
    [patch],
  );

  const voidTransaksi = useCallback(
    (id: string, alasan: string) => {
      if (!alasan.trim()) return { ok: false as const, alasanTolak: 'Void wajib menyertakan alasan.' };
      patch(id, { status: 'void' as StatusTransaksi, alasanStatus: alasan.trim() });
      return { ok: true as const };
    },
    [patch],
  );

  /** Dipakai layar Kasir saat tombol Bayar benar benar diselesaikan. */
  const buatTransaksiSelesai = useCallback(
    (input: InputTransaksiBaru): Transaksi => {
      const waktu = new Date();
      const t: Transaksi = {
        id: nomorBaru(waktu),
        waktu: waktu.toISOString().slice(0, 19),
        kasirId: input.kasirId,
        shiftId: input.shiftId,
        outletId: input.outletId,
        mejaId: input.mejaId,
        tipe: input.tipe,
        baris: input.baris,
        diskonTransaksi: input.diskonTransaksi,
        servicePersen: input.servicePersen,
        pajakPersen: input.pajakPersen,
        pembayaran: input.pembayaran,
        status: 'lunas',
      };
      simpanTransaksiBaru([...transaksiBaru, t]);
      return t;
    },
    [transaksiBaru, simpanTransaksiBaru],
  );

  /** Tahan pesanan sebagai transaksi berstatus `ditahan`, dipakai kalau kasir menutup shift dengan tagihan yang belum dibayar. */
  const buatTransaksiTertahan = useCallback(
    (input: Omit<InputTransaksiBaru, 'pembayaran'>): Transaksi => {
      const waktu = new Date();
      const t: Transaksi = {
        id: nomorBaru(waktu),
        waktu: waktu.toISOString().slice(0, 19),
        kasirId: input.kasirId,
        shiftId: input.shiftId,
        outletId: input.outletId,
        mejaId: input.mejaId,
        tipe: input.tipe,
        baris: input.baris,
        diskonTransaksi: input.diskonTransaksi,
        servicePersen: input.servicePersen,
        pajakPersen: input.pajakPersen,
        pembayaran: [],
        status: 'ditahan',
      };
      simpanTransaksiBaru([...transaksiBaru, t]);
      return t;
    },
    [transaksiBaru, simpanTransaksiBaru],
  );

  const kembalikanDemo = useCallback(() => {
    simpanTimpa({});
    simpanTransaksiBaru([]);
  }, [simpanTimpa, simpanTransaksiBaru]);

  return {
    transaksi,
    siap,
    selesaikanPembayaran,
    refundTransaksi,
    voidTransaksi,
    buatTransaksiSelesai,
    buatTransaksiTertahan,
    kembalikanDemo,
  };
}

/** Ringkasan uang pakai mesin `lib/kasir.ts` yang sama, dengan pengaturan pajak dasar. */
export function ringkasTransaksi(t: Transaksi) {
  return hitung(t.baris, {
    diskonTransaksi: t.diskonTransaksi,
    servicePersen: t.servicePersen,
    pajakPersen: t.pajakPersen,
    pembulatan: PENGATURAN_PAJAK.pembulatan,
  });
}

export function labelProduk(id: string): string {
  return petaProduk.get(id)?.nama ?? id;
}
