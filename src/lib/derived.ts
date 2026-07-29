import { petaKategori, petaProduk } from '@/data/katalog';
import { PENGATURAN_PAJAK, petaPengguna } from '@/data/operasional';
import { TRANSAKSI } from '@/data/transaksi';
import type { MetodeBayar, Transaksi, WarnaDeret } from '@/data/types';
import { hitungTransaksi } from './kasir';
import { keTanggal } from './format';

/**
 * Turunan laporan.
 *
 * Semuanya dihitung dari `TRANSAKSI` lewat `hitungTransaksi`, tidak pernah
 * dari angka yang ditulis ulang di tempat lain. Begitu sebuah laporan menyimpan
 * totalnya sendiri, laporan itu akan berselisih dengan struk pada perubahan
 * pertama, dan yang berselisih di sini adalah uang.
 *
 * Transaksi `void` dan `refund` DIKELUARKAN dari seluruh angka penjualan.
 * Void artinya penjualan itu tidak pernah terjadi, refund artinya uangnya sudah
 * dikembalikan. Memasukkannya ke penjualan akan membuat laporan tampak lebih
 * bagus daripada isi laci, dan itu persis kesalahan yang paling merugikan
 * pemilik toko.
 */

export const TRANSAKSI_SAH = TRANSAKSI.filter((t) => t.status === 'lunas');

export function totalTransaksi(t: Transaksi): number {
  return hitungTransaksi(t, PENGATURAN_PAJAK).total;
}

export function omzet(daftar: Transaksi[] = TRANSAKSI_SAH): number {
  return daftar.reduce((a, t) => a + totalTransaksi(t), 0);
}

export function labaKotor(daftar: Transaksi[] = TRANSAKSI_SAH): number {
  return daftar.reduce((a, t) => {
    const modal = t.baris.reduce((s, b) => s + (petaProduk.get(b.produkId)?.hargaModal ?? 0) * b.qty, 0);
    const bersih = hitungTransaksi(t, PENGATURAN_PAJAK).dasarKena;
    return a + (bersih - modal);
  }, 0);
}

export function padaTanggal(tanggal: string, daftar: Transaksi[] = TRANSAKSI_SAH): Transaksi[] {
  return daftar.filter((t) => t.waktu.slice(0, 10) === tanggal);
}

/**
 * Produk terlaris, diagregasi per ID PRODUK.
 *
 * Ini buah langsung dari R42. Karena varian adalah dimensi pada satu produk dan
 * bukan produk terpisah, "Kopi Susu besar dingin" dan "Kopi Susu reguler panas"
 * jatuh ke baris yang sama. Katalog yang menjadikan tiap varian sebagai produk
 * sendiri akan memecah satu produk laris jadi enam baris kecil, dan tidak ada
 * satu pun yang naik ke puncak.
 */
export function produkTerlaris(daftar: Transaksi[] = TRANSAKSI_SAH, batas = 6) {
  const per = new Map<string, { qty: number; nilai: number }>();
  for (const t of daftar) {
    for (const b of t.baris) {
      const lama = per.get(b.produkId) ?? { qty: 0, nilai: 0 };
      per.set(b.produkId, { qty: lama.qty + b.qty, nilai: lama.nilai + b.qty * b.hargaSatuan });
    }
  }
  return [...per.entries()]
    .map(([id, v]) => {
      const p = petaProduk.get(id);
      return {
        id,
        nama: p?.nama ?? id,
        kategori: p ? petaKategori.get(p.kategoriId)?.nama ?? '' : '',
        warna: (p ? petaKategori.get(p.kategoriId)?.warna ?? 1 : 1) as WarnaDeret,
        qty: v.qty,
        nilai: v.nilai,
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, batas);
}

const WARNA_METODE: Record<MetodeBayar, WarnaDeret> = {
  tunai: 2,
  debit: 4,
  kredit: 5,
  qris: 1,
  transfer: 6,
};

export function perMetodeBayar(daftar: Transaksi[] = TRANSAKSI_SAH) {
  const per = new Map<MetodeBayar, number>();
  for (const t of daftar) {
    for (const p of t.pembayaran) per.set(p.metode, (per.get(p.metode) ?? 0) + p.jumlah);
  }
  return [...per.entries()]
    .map(([metode, nilai]) => ({ metode, nilai, warna: WARNA_METODE[metode] }))
    .sort((a, b) => b.nilai - a.nilai);
}

export function perKasir(daftar: Transaksi[] = TRANSAKSI_SAH) {
  const per = new Map<string, { nilai: number; jumlah: number }>();
  for (const t of daftar) {
    const lama = per.get(t.kasirId) ?? { nilai: 0, jumlah: 0 };
    per.set(t.kasirId, { nilai: lama.nilai + totalTransaksi(t), jumlah: lama.jumlah + 1 });
  }
  return [...per.entries()]
    .map(([id, v]) => ({
      id,
      nama: petaPengguna.get(id)?.nama ?? id,
      warna: (petaPengguna.get(id)?.warna ?? 1) as WarnaDeret,
      ...v,
    }))
    .sort((a, b) => b.nilai - a.nilai);
}

/** Penjualan per jam. Dipakai grafik jam sibuk. */
export function perJam(daftar: Transaksi[] = TRANSAKSI_SAH) {
  const per = new Map<number, number>();
  for (const t of daftar) per.set(keTanggal(t.waktu).getHours(), (per.get(keTanggal(t.waktu).getHours()) ?? 0) + totalTransaksi(t));
  const jam = [...per.keys()].sort((a, b) => a - b);
  const dari = Math.min(...jam, 8);
  const sampai = Math.max(...jam, 20);
  return Array.from({ length: sampai - dari + 1 }, (_, i) => {
    const j = dari + i;
    return { jam: j, label: `${String(j).padStart(2, '0')}`, nilai: per.get(j) ?? 0 };
  });
}

/** Penjualan per hari, urut dari yang paling lama. */
export function perHari(daftar: Transaksi[] = TRANSAKSI_SAH) {
  const per = new Map<string, number>();
  for (const t of daftar) {
    const k = t.waktu.slice(0, 10);
    per.set(k, (per.get(k) ?? 0) + totalTransaksi(t));
  }
  return [...per.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([tanggal, nilai]) => ({ tanggal, nilai }));
}
