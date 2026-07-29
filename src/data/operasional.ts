import type {
  Meja,
  Outlet,
  PengaturanPajak,
  PengaturanPrinter,
  PengaturanToko,
  Pengguna,
} from './types';

/**
 * Tanggal jangkar data demo.
 *
 * Semua tanggal di data demo ditulis sebagai string tetap terhadap jangkar ini,
 * TIDAK pernah dihitung dari `new Date()` saat modul dimuat. Alasannya bukan
 * gaya: static export merender di waktu build sedangkan browser merender di
 * waktu kunjung, jadi tanggal yang dihitung saat impor akan berbeda antara
 * keduanya dan React melaporkannya sebagai ketidakcocokan hidrasi.
 */
export const HARI_INI = '2026-07-29';

export const OUTLET: Outlet[] = [
  { id: 'o-pusat', nama: 'Lekas Pusat, Tebet', alamat: 'Jalan Tebet Raya 44, Jakarta Selatan', tipe: 'fnb' },
  { id: 'o-bintaro', nama: 'Lekas Bintaro', alamat: 'Bintaro Sektor 9 Blok C2, Tangerang Selatan', tipe: 'retail' },
];

export const PENGGUNA: Pengguna[] = [
  {
    id: 'u-1',
    nama: 'Ratna Kusumaningrum',
    inisial: 'RK',
    peran: 'pemilik',
    warna: 1,
    email: 'ratna@lekas.demo',
    aktif: true,
    terakhirMasuk: '2026-07-29T07:12:00',
  },
  {
    id: 'u-2',
    nama: 'Bagas Prasetyo',
    inisial: 'BP',
    peran: 'manajer',
    warna: 4,
    email: 'bagas@lekas.demo',
    aktif: true,
    terakhirMasuk: '2026-07-29T08:02:00',
  },
  {
    id: 'u-3',
    nama: 'Sari Wulandari',
    inisial: 'SW',
    peran: 'kasir',
    warna: 2,
    email: 'sari@lekas.demo',
    aktif: true,
    terakhirMasuk: '2026-07-29T08:58:00',
  },
  {
    id: 'u-4',
    nama: 'Dimas Anggara',
    inisial: 'DA',
    peran: 'kasir',
    warna: 3,
    email: 'dimas@lekas.demo',
    aktif: true,
    terakhirMasuk: '2026-07-28T15:41:00',
  },
  {
    id: 'u-5',
    nama: 'Nurul Hidayah',
    inisial: 'NH',
    peran: 'kasir',
    warna: 5,
    email: 'nurul@lekas.demo',
    aktif: true,
    terakhirMasuk: '2026-07-27T16:20:00',
  },
  {
    id: 'u-6',
    nama: 'Yoga Pratama',
    inisial: 'YP',
    peran: 'kasir',
    warna: 6,
    email: 'yoga@lekas.demo',
    aktif: false,
    terakhirMasuk: '2026-07-11T14:03:00',
  },
];

export const petaPengguna = new Map(PENGGUNA.map((u) => [u.id, u]));

export const LABEL_PERAN: Record<Pengguna['peran'], string> = {
  pemilik: 'Pemilik',
  manajer: 'Manajer',
  kasir: 'Kasir',
};

/** Hak akses per peran. Dipakai halaman Pengaturan dan penjelasan demo. */
export const HAK_AKSES: { id: string; label: string; pemilik: boolean; manajer: boolean; kasir: boolean }[] = [
  { id: 'kasir', label: 'Buka layar Kasir dan proses pembayaran', pemilik: true, manajer: true, kasir: true },
  { id: 'tahan', label: 'Tahan dan lanjutkan transaksi', pemilik: true, manajer: true, kasir: true },
  { id: 'diskon-item', label: 'Beri diskon per item', pemilik: true, manajer: true, kasir: true },
  { id: 'diskon-transaksi', label: 'Beri diskon per transaksi', pemilik: true, manajer: true, kasir: false },
  { id: 'void', label: 'Void dan refund transaksi', pemilik: true, manajer: true, kasir: false },
  { id: 'produk', label: 'Ubah produk, harga, dan stok', pemilik: true, manajer: true, kasir: false },
  { id: 'shift', label: 'Tutup shift kasir lain', pemilik: true, manajer: true, kasir: false },
  { id: 'laporan', label: 'Lihat laporan penjualan dan laba', pemilik: true, manajer: true, kasir: false },
  { id: 'pengguna', label: 'Kelola pengguna dan peran', pemilik: true, manajer: false, kasir: false },
];

export const MEJA: Meja[] = [
  { id: 'm-01', nama: 'A1', area: 'Dalam', kursi: 2, status: 'terisi' },
  { id: 'm-02', nama: 'A2', area: 'Dalam', kursi: 2, status: 'kosong' },
  { id: 'm-03', nama: 'A3', area: 'Dalam', kursi: 4, status: 'terisi' },
  { id: 'm-04', nama: 'A4', area: 'Dalam', kursi: 4, status: 'kosong' },
  { id: 'm-05', nama: 'B1', area: 'Teras', kursi: 4, status: 'dipesan' },
  { id: 'm-06', nama: 'B2', area: 'Teras', kursi: 6, status: 'kosong' },
  { id: 'm-07', nama: 'B3', area: 'Teras', kursi: 2, status: 'terisi' },
  { id: 'm-08', nama: 'C1', area: 'Lantai 2', kursi: 8, status: 'kosong' },
  { id: 'm-09', nama: 'C2', area: 'Lantai 2', kursi: 4, status: 'kosong' },
  { id: 'm-10', nama: 'C3', area: 'Lantai 2', kursi: 4, status: 'dipesan' },
];

export const petaMeja = new Map(MEJA.map((m) => [m.id, m]));

export const PENGATURAN_TOKO: PengaturanToko = {
  nama: 'Kopi Lekas Tebet',
  slogan: 'Cepat di kasir, pas di laci',
  alamat: 'Jalan Tebet Raya 44, Jakarta Selatan 12810',
  telepon: '021 8371 2200',
  npwp: '01.234.567.8 015.000',
  mataUang: 'IDR',
  zonaWaktu: 'Asia/Jakarta',
};

export const PENGATURAN_PAJAK: PengaturanPajak = {
  pajakPersen: 11,
  pajakAktif: true,
  hargaSudahTermasukPajak: false,
  servicePersen: 5,
  serviceAktif: true,
  pembulatan: 100,
};

export const PENGATURAN_PRINTER: PengaturanPrinter = {
  nama: 'Epson TM-T82 (USB)',
  lebarKertas: 80,
  cetakOtomatis: true,
  salinan: 1,
  kepalaStruk: 'Kopi Lekas Tebet\nJalan Tebet Raya 44\n021 8371 2200',
  kakiStruk: 'Terima kasih sudah mampir.\nBarang yang sudah dibeli tidak dapat ditukar.',
};
