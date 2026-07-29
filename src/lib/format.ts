/**
 * Pemformat bersama.
 *
 * Semuanya memakai locale `id-ID` yang ditulis eksplisit, tidak pernah locale
 * bawaan mesin. Static export dirender di mesin build lalu dihidrasi di mesin
 * pengunjung, dan kalau locale-nya diserahkan ke mesin, kedua sisi bisa
 * menghasilkan string berbeda untuk angka yang sama.
 */

const RUPIAH = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** `Rp 128.500`. Ada spasi setelah Rp, pemisah ribuan titik (DESIGN.md 4.2). */
export function rupiah(n: number): string {
  const nilai = Math.round(n);
  return nilai < 0 ? `-Rp ${RUPIAH.format(Math.abs(nilai))}` : `Rp ${RUPIAH.format(nilai)}`;
}

/** Tanpa awalan Rp, untuk kolom tabel yang judulnya sudah menyebut satuan. */
export function angka(n: number): string {
  return RUPIAH.format(Math.round(n));
}

export function persen(n: number): string {
  return `${RUPIAH.format(n)}%`;
}

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Mengurai `2026-07-29T09:14:00` menjadi Date lokal.
 *
 * `new Date(string)` pada bentuk tanggal saja (`2026-07-29`) diperlakukan
 * sebagai UTC oleh spesifikasi, jadi di zona waktu Indonesia tanggalnya bisa
 * mundur sehari. Diurai per komponen supaya selalu waktu lokal.
 */
export function keTanggal(iso: string): Date {
  const [tgl, jam = '00:00:00'] = iso.split('T');
  const [y, m, d] = tgl.split('-').map(Number);
  const [h, mi, s = 0] = jam.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi, s);
}

/** `29 Juli 2026`. */
export function tanggalPanjang(iso: string): string {
  const d = keTanggal(iso);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** `29 Jul 2026`. */
export function tanggalPendek(iso: string): string {
  const d = keTanggal(iso);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

/** `09:14`. */
export function jam(iso: string): string {
  const d = keTanggal(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function namaBulan(index: number): string {
  return BULAN[index];
}

/** `2026-07-29`, bentuk kunci yang dipakai kalender dan penyaring rentang. */
export function kunciTanggal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** `2026-07-29` ditambah/dikurangi `n` hari, tetap dalam bentuk kunci tanggal. */
export function tambahHari(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return kunciTanggal(new Date(y, m - 1, d + n));
}

/** Jumlah hari dari `a` ke `b` (positif kalau `b` lebih baru). */
export function selisihHari(a: string, b: string): number {
  return Math.round((keTanggal(b).getTime() - keTanggal(a).getTime()) / 86400000);
}

/** Senin di minggu yang sama dengan `iso`, dalam bentuk kunci tanggal. */
export function awalMinggu(iso: string): string {
  const d = keTanggal(iso);
  const hari = d.getDay();
  const geser = hari === 0 ? -6 : 1 - hari;
  return kunciTanggal(new Date(d.getFullYear(), d.getMonth(), d.getDate() + geser));
}

/** Durasi antar dua waktu dalam bentuk `4j 12m`. */
export function durasi(mulai: string, selesai: string): string {
  const menit = Math.max(0, Math.round((keTanggal(selesai).getTime() - keTanggal(mulai).getTime()) / 60000));
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  return j > 0 ? `${j}j ${m}m` : `${m}m`;
}
