'use client';

/**
 * Lapisan timpa untuk Produk, pola yang sama dengan Jaring dan Derap: data
 * dasar tetap statis di `data/katalog.ts`, dan setiap perubahan pengunjung
 * (tambah produk, impor CSV, aksi massal, sesuaikan stok, ubah produk) tersimpan
 * sebagai timpaan di localStorage, bukan menulis ulang data dasarnya. Render
 * pertama SELALU memakai data dasar sehingga tidak ada ketidakcocokan hidrasi;
 * timpaan baru dipasang setelah mount.
 *
 * "Hapus produk" TIDAK pernah menghapus baris. Produk yang sudah pernah masuk
 * transaksi tidak boleh lenyap dari riwayat, jadi hapus berarti `aktif: false`,
 * persis seperti tombol nonaktifkan.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRODUK } from '@/data/katalog';
import type { DimensiVarian, Produk } from '@/data/types';
import { baca, tulis } from './storage';

const KUNCI_TIMPA = 'produk-timpa';
const KUNCI_BARU = 'produk-baru';
const KUNCI_LOG = 'produk-log-stok';

type TimpaProduk = Partial<Omit<Produk, 'id'>>;
type PetaTimpa = Record<string, TimpaProduk>;

export interface LogStok {
  id: string;
  produkId: string;
  waktu: string;
  delta: number;
  stokSesudah: number;
  alasan: string;
}

let penghitung = 0;

export type InputProdukBaru = Omit<Produk, 'id' | 'aktif' | 'favorit'> & {
  aktif?: boolean;
  favorit?: boolean;
};

function buatId(sku: string): string {
  penghitung += 1;
  return `p-baru-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${penghitung}`;
}

export function produkBaruDariInput(input: InputProdukBaru): Produk {
  return {
    id: buatId(input.sku),
    sku: input.sku,
    barcode: input.barcode,
    nama: input.nama,
    kategoriId: input.kategoriId,
    hargaDasar: input.hargaDasar,
    hargaModal: input.hargaModal,
    stok: input.stok,
    stokMinimum: input.stokMinimum,
    satuan: input.satuan,
    dimensi: input.dimensi,
    aktif: input.aktif ?? true,
    favorit: input.favorit ?? false,
    deskripsi: input.deskripsi,
  };
}

export function useProdukStore() {
  const [timpa, setTimpaState] = useState<PetaTimpa>({});
  const [produkBaru, setProdukBaruState] = useState<Produk[]>([]);
  const [log, setLogState] = useState<LogStok[]>([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setTimpaState(baca<PetaTimpa>(KUNCI_TIMPA, {}));
    setProdukBaruState(baca<Produk[]>(KUNCI_BARU, []));
    setLogState(baca<LogStok[]>(KUNCI_LOG, []));
    setSiap(true);
  }, []);

  const simpanTimpa = useCallback((n: PetaTimpa) => {
    setTimpaState(n);
    tulis(KUNCI_TIMPA, n);
  }, []);

  const simpanProdukBaru = useCallback((n: Produk[]) => {
    setProdukBaruState(n);
    tulis(KUNCI_BARU, n);
  }, []);

  const simpanLog = useCallback((n: LogStok[]) => {
    setLogState(n);
    tulis(KUNCI_LOG, n);
  }, []);

  const terapkan = useCallback(
    (p: Produk): Produk => {
      const t = timpa[p.id];
      return t ? { ...p, ...t } : p;
    },
    [timpa],
  );

  const produk = useMemo<Produk[]>(
    () => [...PRODUK.map(terapkan), ...produkBaru.map(terapkan)],
    [terapkan, produkBaru],
  );

  const ubahProduk = useCallback(
    (id: string, patch: TimpaProduk) => {
      if (PRODUK.some((p) => p.id === id)) {
        simpanTimpa({ ...timpa, [id]: { ...timpa[id], ...patch } });
      } else {
        simpanProdukBaru(produkBaru.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      }
    },
    [timpa, simpanTimpa, produkBaru, simpanProdukBaru],
  );

  const aksiMassal = useCallback(
    (ids: string[], patch: TimpaProduk) => {
      const set = new Set(ids);
      const idBaru = ids.filter((id) => !PRODUK.some((p) => p.id === id));
      if (idBaru.length > 0) {
        simpanProdukBaru(produkBaru.map((p) => (set.has(p.id) ? { ...p, ...patch } : p)));
      }
      const idDasar = ids.filter((id) => PRODUK.some((p) => p.id === id));
      if (idDasar.length > 0) {
        const baru: PetaTimpa = { ...timpa };
        for (const id of idDasar) baru[id] = { ...baru[id], ...patch };
        simpanTimpa(baru);
      }
    },
    [timpa, simpanTimpa, produkBaru, simpanProdukBaru],
  );

  const tambahProduk = useCallback(
    (input: InputProdukBaru): string => {
      const p = produkBaruDariInput(input);
      simpanProdukBaru([...produkBaru, p]);
      return p.id;
    },
    [produkBaru, simpanProdukBaru],
  );

  /** Impor CSV: satu baris CSV per produk baru, dimensi kosong (varian tetap bisa ditambah lewat ubah produk). */
  const importCsv = useCallback(
    (baris: InputProdukBaru[]) => {
      simpanProdukBaru([...produkBaru, ...baris.map(produkBaruDariInput)]);
    },
    [produkBaru, simpanProdukBaru],
  );

  const sesuaikanStok = useCallback(
    (id: string, delta: number, alasan: string) => {
      const skrg = produk.find((p) => p.id === id);
      if (!skrg) return;
      const stokSesudah = Math.max(0, skrg.stok + delta);
      ubahProduk(id, { stok: stokSesudah });
      penghitung += 1;
      const entri: LogStok = {
        id: `LOG-${penghitung}`,
        produkId: id,
        waktu: new Date().toISOString(),
        delta,
        stokSesudah,
        alasan,
      };
      simpanLog([entri, ...log]);
    },
    [produk, ubahProduk, log, simpanLog],
  );

  /** Dipakai layar Kasir: kurangi stok setelah transaksi selesai dibayar. */
  const kurangiStokTerjual = useCallback(
    (baris: { produkId: string; qty: number }[]) => {
      for (const b of baris) {
        const p = produk.find((x) => x.id === b.produkId);
        if (!p) continue;
        ubahProduk(p.id, { stok: Math.max(0, p.stok - b.qty) });
      }
    },
    [produk, ubahProduk],
  );

  const riwayatStok = useCallback((id: string) => log.filter((l) => l.produkId === id), [log]);

  const ubahDimensi = useCallback(
    (id: string, dimensi: DimensiVarian[]) => ubahProduk(id, { dimensi }),
    [ubahProduk],
  );

  const kembalikanDemo = useCallback(() => {
    simpanTimpa({});
    simpanProdukBaru([]);
    simpanLog([]);
  }, [simpanTimpa, simpanProdukBaru, simpanLog]);

  return {
    produk,
    siap,
    ubahProduk,
    aksiMassal,
    tambahProduk,
    importCsv,
    sesuaikanStok,
    kurangiStokTerjual,
    riwayatStok,
    ubahDimensi,
    kembalikanDemo,
    jumlahPerubahan: Object.keys(timpa).length + produkBaru.length,
  };
}
