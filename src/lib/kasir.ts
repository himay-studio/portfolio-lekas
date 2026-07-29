import type {
  BarisTransaksi,
  DiskonNilai,
  MetodeBayar,
  OpsiTerpilih,
  PengaturanPajak,
  Produk,
  Transaksi,
} from '@/data/types';

/**
 * Mesin uang layar Kasir.
 *
 * Ini satu satunya tempat aritmetika keranjang boleh hidup. Alasannya bukan
 * kerapian: ubah qty, diskon per item, dan diskon per transaksi punya URUTAN
 * yang mengikat, dan begitu ketiganya dihitung di dalam komponen yang berbeda
 * beda, urutan pajak dan service charge tidak bisa lagi dipastikan. Yang
 * terjadi adalah dua layar melaporkan total berbeda untuk keranjang yang sama,
 * dan tidak ada satu pun yang jelas salah.
 *
 * URUTAN YANG MENGIKAT, tidak boleh ditukar:
 *
 *   1. hargaSatuan  = hargaDasar + seluruh delta opsi varian terpilih
 *   2. brutoItem    = Sigma (qty * hargaSatuan)
 *   3. diskonItem   = Sigma diskon pada tiap baris, dihitung dari bruto BARIS itu
 *   4. subtotal     = brutoItem - diskonItem
 *   5. diskonTrx    = diskon tingkat transaksi, dihitung dari SUBTOTAL
 *   6. dasarKena    = subtotal - diskonTrx
 *   7. service      = servicePersen dari dasarKena
 *   8. pajak        = pajakPersen dari (dasarKena + service)
 *   9. pembulatan   = penyesuaian total ke kelipatan terdekat
 *  10. total        = dasarKena + service + pajak + pembulatan
 *
 * Poin 5 adalah yang paling sering dibalik. Diskon transaksi WAJIB dihitung
 * dari subtotal setelah diskon item, bukan dari bruto. Kalau dibalik, dua
 * diskon 10 persen yang bertumpuk menghasilkan potongan lebih besar daripada
 * yang disepakati kasir, dan selisihnya baru ketahuan saat tutup shift.
 *
 * Poin 8 juga mengikat: pajak dikenakan SETELAH service charge, karena service
 * charge adalah bagian dari nilai yang dikenai pajak.
 */

export interface BarisKeranjang {
  /**
   * Identitas baris keranjang, bukan identitas produk.
   *
   * Disusun dari produkId ditambah seluruh opsi terpilih yang sudah diurutkan,
   * supaya "Kopi Susu besar dingin" yang dipindai dua kali menyatu jadi satu
   * baris qty 2, sedangkan "Kopi Susu besar panas" tetap baris tersendiri.
   */
  key: string;
  produkId: string;
  nama: string;
  sku: string;
  opsi: OpsiTerpilih[];
  qty: number;
  hargaSatuan: number;
  diskonItem: DiskonNilai | null;
  catatan: string;
}

export interface RingkasanUang {
  brutoItem: number;
  diskonItem: number;
  subtotal: number;
  diskonTransaksi: number;
  dasarKena: number;
  service: number;
  pajak: number;
  pembulatan: number;
  total: number;
  jumlahItem: number;
  jumlahBaris: number;
}

/** Nilai diskon dalam rupiah, dihitung dari dasar yang diberikan. */
export function nilaiDiskon(diskon: DiskonNilai | null, dasar: number): number {
  if (!diskon || diskon.nilai <= 0) return 0;
  const nilai = diskon.tipe === 'persen' ? (dasar * diskon.nilai) / 100 : diskon.nilai;
  // Diskon tidak pernah boleh melebihi dasarnya, kalau tidak total jadi negatif.
  return Math.min(Math.round(nilai), Math.max(0, Math.round(dasar)));
}

export function brutoBaris(b: Pick<BarisKeranjang, 'qty' | 'hargaSatuan'>): number {
  return b.qty * b.hargaSatuan;
}

export function nettoBaris(b: Pick<BarisKeranjang, 'qty' | 'hargaSatuan' | 'diskonItem'>): number {
  const bruto = brutoBaris(b);
  return bruto - nilaiDiskon(b.diskonItem, bruto);
}

export interface KonteksHitung {
  diskonTransaksi: DiskonNilai | null;
  servicePersen: number;
  pajakPersen: number;
  pembulatan: number;
}

export function hitung(
  baris: Pick<BarisKeranjang, 'qty' | 'hargaSatuan' | 'diskonItem'>[],
  ctx: KonteksHitung,
): RingkasanUang {
  const brutoItem = baris.reduce((a, b) => a + brutoBaris(b), 0);
  const diskonItem = baris.reduce((a, b) => a + nilaiDiskon(b.diskonItem, brutoBaris(b)), 0);
  const subtotal = brutoItem - diskonItem;

  const diskonTransaksi = nilaiDiskon(ctx.diskonTransaksi, subtotal);
  const dasarKena = subtotal - diskonTransaksi;

  const service = Math.round((dasarKena * ctx.servicePersen) / 100);
  const pajak = Math.round(((dasarKena + service) * ctx.pajakPersen) / 100);

  const sebelumBulat = dasarKena + service + pajak;
  const total = ctx.pembulatan > 0
    ? Math.round(sebelumBulat / ctx.pembulatan) * ctx.pembulatan
    : sebelumBulat;

  return {
    brutoItem,
    diskonItem,
    subtotal,
    diskonTransaksi,
    dasarKena,
    service,
    pajak,
    pembulatan: total - sebelumBulat,
    total,
    jumlahItem: baris.reduce((a, b) => a + b.qty, 0),
    jumlahBaris: baris.length,
  };
}

export function hitungTransaksi(t: Transaksi, pengaturan: PengaturanPajak): RingkasanUang {
  return hitung(t.baris, {
    diskonTransaksi: t.diskonTransaksi,
    servicePersen: t.servicePersen,
    pajakPersen: t.pajakPersen,
    pembulatan: pengaturan.pembulatan,
  });
}

/** Total yang benar benar diterima dari seluruh baris pembayaran. */
export function totalDibayar(t: Transaksi): number {
  return t.pembayaran.reduce((a, p) => a + p.jumlah, 0);
}

/**
 * Kembalian.
 *
 * Hanya bagian TUNAI yang menghasilkan kembalian. Kelebihan bayar pada kartu
 * atau QRIS tidak mungkin terjadi di dunia nyata, jadi kalau angkanya muncul,
 * itu tanda datanya salah, bukan tanda kasir harus mengembalikan uang.
 */
export function kembalian(dibayar: number, total: number): number {
  return Math.max(0, dibayar - total);
}

export function kurangBayar(dibayar: number, total: number): number {
  return Math.max(0, total - dibayar);
}

/* -------------------------------------------------------------------------- */
/* Baris keranjang                                                             */
/* -------------------------------------------------------------------------- */

export function kunciBaris(produkId: string, opsi: OpsiTerpilih[]): string {
  const ekor = opsi
    .map((o) => `${o.dimensiId}:${o.opsiId}`)
    .sort()
    .join('|');
  return ekor ? `${produkId}#${ekor}` : produkId;
}

/** Opsi bawaan tiap dimensi wajib. Dipakai saat ubin produk diketuk sekali. */
export function opsiBawaan(p: Produk): OpsiTerpilih[] {
  return p.dimensi
    .filter((d) => d.wajib && !d.ganda)
    .map((d) => {
      const o = d.opsi.find((x) => x.bawaan) ?? d.opsi[0];
      return { dimensiId: d.id, opsiId: o.id, nama: o.nama, delta: o.deltaHarga };
    });
}

export function buatBaris(p: Produk, opsi: OpsiTerpilih[], qty = 1): BarisKeranjang {
  return {
    key: kunciBaris(p.id, opsi),
    produkId: p.id,
    nama: p.nama,
    sku: p.sku,
    opsi,
    qty,
    hargaSatuan: p.hargaDasar + opsi.reduce((a, o) => a + o.delta, 0),
    diskonItem: null,
    catatan: '',
  };
}

/** Ringkasan opsi untuk label sekunder, misalnya `Besar, Dingin, Boba`. */
export function ringkasOpsi(opsi: OpsiTerpilih[]): string {
  return opsi.map((o) => o.nama).join(', ');
}

export function barisKeTransaksi(b: BarisKeranjang): BarisTransaksi {
  return {
    produkId: b.produkId,
    nama: b.nama,
    sku: b.sku,
    opsi: b.opsi,
    qty: b.qty,
    hargaSatuan: b.hargaSatuan,
    diskonItem: b.diskonItem,
    catatan: b.catatan || undefined,
  };
}

export const LABEL_METODE: Record<MetodeBayar, string> = {
  tunai: 'Tunai',
  debit: 'Kartu Debit',
  kredit: 'Kartu Kredit',
  qris: 'QRIS',
  transfer: 'Transfer Bank',
};

/** Pecahan uang yang lazim disodorkan pelanggan, untuk tombol cepat tunai. */
export const PECAHAN_CEPAT = [5000, 10000, 20000, 50000, 100000];

/**
 * Nominal bulat terdekat di atas total, misalnya total 128.500 jadi 130.000.
 * Ini tombol yang paling sering dipakai kasir sungguhan sesudah uang pas.
 */
export function pembulatanCepat(total: number): number[] {
  const kandidat = new Set<number>();
  for (const kelipatan of [5000, 10000, 50000, 100000]) {
    const naik = Math.ceil(total / kelipatan) * kelipatan;
    if (naik > total) kandidat.add(naik);
  }
  return [...kandidat].sort((a, b) => a - b).slice(0, 4);
}

/* -------------------------------------------------------------------------- */
/* Transaksi tertahan                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Transaksi tertahan adalah KOLEKSI, bukan satu slot.
 *
 * Kedai yang ramai menahan tiga sampai lima pesanan sekaligus: satu tamu izin
 * ambil dompet, satu meja belum lengkap, satu pesanan antar belum dijemput.
 * Model satu slot memaksa kasir menyelesaikan atau membuang tahanan lama
 * sebelum boleh menahan yang baru, dan itu bukan kekurangan fitur, itu
 * kehilangan pesanan.
 */
export interface Tahanan {
  id: string;
  label: string;
  waktu: string;
  mejaId: string | null;
  baris: BarisKeranjang[];
  diskonTransaksi: DiskonNilai | null;
  catatan: string;
}
