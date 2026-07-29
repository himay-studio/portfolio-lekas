import { petaKategori } from '@/data/katalog';
import type { Produk, WarnaDeret } from '@/data/types';

/**
 * Muka ubin produk: inisial di atas blok warna kategori.
 *
 * Ini BUKAN placeholder yang menunggu foto. Aplikasi kasir sungguhan pun
 * menampilkan ubin berhuruf untuk SKU yang belum difoto, dan sebagian besar
 * toko memang tidak pernah memotret setiap SKU. Jadi bentuk ini justru lebih
 * jujur untuk demo POS daripada dua puluh empat foto studio yang tidak akan
 * pernah dimiliki toko mana pun. Lihat MEDIA.md untuk keputusan lengkapnya.
 *
 * Kontras putih di atas keenam warna deret ada di antara 5.08 dan 8.34, jadi
 * hurufnya lolos ambang teks normal di semua kategori.
 */
export function inisialProduk(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return '?';
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[1][0]).toUpperCase();
}

export function warnaProduk(p: Produk): WarnaDeret {
  return petaKategori.get(p.kategoriId)?.warna ?? 1;
}
