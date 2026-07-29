/**
 * Bentuk data Lekas.
 *
 * Stage 3 menetapkan BENTUKNYA, Stage 5 yang menggemukkan isinya jadi puluhan
 * baris. Jadi yang penting di berkas ini adalah tipe yang benar, bukan jumlah
 * barisnya.
 *
 * Keputusan paling mahal ada di `Produk`. Lihat catatan R42 di sana sebelum
 * menambah apa pun, karena kalau bentuk itu salah, setiap baris struk dan
 * setiap laporan produk terlaris ikut salah dan tidak bisa ditambal di Stage 5.
 */

export type Tone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

/** Indeks deret grafik `--chart-1` sampai `--chart-6` di DESIGN.md 3.6. */
export type WarnaDeret = 1 | 2 | 3 | 4 | 5 | 6;

/* -------------------------------------------------------------------------- */
/* Katalog                                                                     */
/* -------------------------------------------------------------------------- */

export type TipeUsaha = 'retail' | 'fnb';

export interface Kategori {
  id: string;
  nama: string;
  tipe: TipeUsaha;
  warna: WarnaDeret;
  /** Urutan tampil di rel kategori layar Kasir. */
  urutan: number;
}

export interface OpsiVarian {
  id: string;
  nama: string;
  /** Selisih rupiah terhadap `hargaDasar`. Boleh 0, boleh negatif. */
  deltaHarga: number;
  /** null berarti ikut stok induk. Dipakai kalau varian punya stok sendiri. */
  stok: number | null;
  bawaan?: boolean;
}

/**
 * Satu dimensi varian, misalnya Ukuran, Topping, atau Warna.
 *
 * `ganda: true` berarti pembeli boleh memilih lebih dari satu opsi sekaligus,
 * yang benar untuk topping dan salah untuk ukuran.
 */
export interface DimensiVarian {
  id: string;
  nama: string;
  wajib: boolean;
  ganda: boolean;
  opsi: OpsiVarian[];
}

/**
 * R42 dalam bentuk POS.
 *
 * `nama` adalah nama MODEL, misalnya "Kopi Susu" atau "Kaus Polos". Ukuran,
 * topping, dan warna adalah DIMENSI pada satu produk, BUKAN produk terpisah.
 *
 * Katalog yang menjadikan tiap warna sebagai produk sendiri punya dua akibat
 * yang langsung terlihat: penyaring warna jadi mengganti nama produk, dan
 * laporan produk terlaris memecah satu produk jadi enam baris kecil sehingga
 * tidak ada satu pun yang naik ke puncak. Agregasi laporan memakai `id`
 * produk, jadi selama bentuk ini dipatuhi, laporan otomatis benar.
 */
export interface Produk {
  id: string;
  sku: string;
  barcode: string;
  nama: string;
  kategoriId: string;
  hargaDasar: number;
  hargaModal: number;
  stok: number;
  stokMinimum: number;
  satuan: string;
  dimensi: DimensiVarian[];
  aktif: boolean;
  /** Tampil di rel favorit layar Kasir. */
  favorit: boolean;
  deskripsi: string;
}

/* -------------------------------------------------------------------------- */
/* Orang, outlet, meja                                                         */
/* -------------------------------------------------------------------------- */

export type Peran = 'pemilik' | 'manajer' | 'kasir';

export interface Pengguna {
  id: string;
  nama: string;
  inisial: string;
  peran: Peran;
  warna: WarnaDeret;
  email: string;
  aktif: boolean;
  terakhirMasuk: string;
}

export interface Outlet {
  id: string;
  nama: string;
  alamat: string;
  tipe: TipeUsaha;
}

export type StatusMeja = 'kosong' | 'terisi' | 'dipesan';

export interface Meja {
  id: string;
  nama: string;
  area: string;
  kursi: number;
  status: StatusMeja;
}

/* -------------------------------------------------------------------------- */
/* Uang                                                                        */
/* -------------------------------------------------------------------------- */

export type MetodeBayar = 'tunai' | 'debit' | 'kredit' | 'qris' | 'transfer';

export interface BarisBayar {
  metode: MetodeBayar;
  jumlah: number;
  /** Empat digit terakhir kartu, atau nomor referensi QRIS. */
  referensi?: string;
}

export interface DiskonNilai {
  tipe: 'persen' | 'nominal';
  nilai: number;
  alasan?: string;
}

export interface OpsiTerpilih {
  dimensiId: string;
  opsiId: string;
  nama: string;
  delta: number;
}

export interface BarisTransaksi {
  produkId: string;
  nama: string;
  sku: string;
  opsi: OpsiTerpilih[];
  qty: number;
  /** `hargaDasar` produk ditambah seluruh `deltaHarga` opsi terpilih. */
  hargaSatuan: number;
  diskonItem: DiskonNilai | null;
  catatan?: string;
}

export type StatusTransaksi = 'lunas' | 'ditahan' | 'void' | 'refund';

export interface Transaksi {
  id: string;
  waktu: string;
  kasirId: string;
  shiftId: string;
  outletId: string;
  mejaId: string | null;
  tipe: TipeUsaha;
  baris: BarisTransaksi[];
  diskonTransaksi: DiskonNilai | null;
  servicePersen: number;
  pajakPersen: number;
  pembayaran: BarisBayar[];
  status: StatusTransaksi;
  alasanStatus?: string;
  catatan?: string;
}

export type StatusShift = 'terbuka' | 'tertutup';

export interface Shift {
  id: string;
  kasirId: string;
  outletId: string;
  buka: string;
  tutup: string | null;
  kasAwal: number;
  /** Kas yang seharusnya ada menurut sistem saat tutup. */
  kasSistem: number;
  /** Kas yang benar benar dihitung kasir. null selama shift masih terbuka. */
  kasFisik: number | null;
  jumlahTransaksi: number;
  penjualanTunai: number;
  penjualanNonTunai: number;
  status: StatusShift;
  catatan?: string;
}

/* -------------------------------------------------------------------------- */
/* Pengaturan                                                                  */
/* -------------------------------------------------------------------------- */

export interface PengaturanPajak {
  pajakPersen: number;
  pajakAktif: boolean;
  /** Harga yang ditampilkan sudah termasuk pajak atau belum. */
  hargaSudahTermasukPajak: boolean;
  servicePersen: number;
  serviceAktif: boolean;
  /** Pembulatan total ke kelipatan rupiah terdekat. 0 berarti tanpa pembulatan. */
  pembulatan: number;
}

export interface PengaturanPrinter {
  nama: string;
  lebarKertas: 58 | 80;
  cetakOtomatis: boolean;
  salinan: number;
  kepalaStruk: string;
  kakiStruk: string;
}

export interface PengaturanToko {
  nama: string;
  slogan: string;
  alamat: string;
  telepon: string;
  npwp: string;
  mataUang: string;
  zonaWaktu: string;
}
