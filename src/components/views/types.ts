import type { ReactNode } from 'react';
import type { Tone, WarnaDeret } from '@/data/types';

/**
 * Lapisan view bersama.
 *
 * SATU sumber data, beberapa cara memandang. Tabel, Kartu, Kanban, dan
 * Kalender TIDAK boleh jadi empat implementasi terpisah yang kebetulan mirip,
 * karena begitu bercabang, urutan dan penyaring akan berbeda beda per view dan
 * tidak ada satu pun yang bisa dipercaya. Pengguna melihat sepuluh produk di
 * Tabel dan delapan di Kartu, lalu berhenti mempercayai dua duanya.
 *
 * Kontraknya: tiap modul menyediakan satu `AdapterView` yang menerjemahkan
 * barisnya sendiri jadi `ViewItem` netral, ditambah definisi kolom tabel dan
 * definisi grup Kanban. Keempat renderer hanya tahu `ViewItem`, tidak pernah
 * tahu bentuk asli produk, transaksi, atau shift.
 */

export type JenisView = 'tabel' | 'kartu' | 'kanban' | 'kalender';

export interface ViewItem {
  id: string;
  /** SKU atau nomor transaksi. Dirender mono. Boleh kosong. */
  kode?: string;
  judul: string;
  /** Label sekunder. SELALU dirender sebagai blok terpisah (R50). */
  keterangan?: string;
  /** Kunci kolom Kanban. */
  grup: string;
  /** ISO. Dipakai Kalender. */
  tanggal: string;
  href: string;
  badge?: { teks: string; tone: Tone; pekat?: boolean };
  /** Nominal utama, dirender rata kanan dengan tabular-nums. */
  nilai?: string;
  metrik?: { label: string; nilai: string }[];
  /** Ubin inisial, dipakai kartu produk dan kartu transaksi. */
  inisial?: string;
  warna?: WarnaDeret;
}

export interface KolomTabel<T> {
  id: string;
  judul: string;
  lebar?: number;
  rata?: 'kiri' | 'kanan';
  /** Disembunyikan di bawah 1280px supaya tabel tidak meluap di 1025px. */
  opsional?: boolean;
  render: (baris: T) => ReactNode;
  nilaiUrut?: (baris: T) => string | number;
}

export interface GrupView {
  id: string;
  nama: string;
  tone: Tone;
}

export interface AdapterView<T> {
  /** Ruang nama localStorage untuk pilihan view. */
  modul: string;
  /** Kata benda tunggal untuk keadaan kosong dan pengumuman pembaca layar. */
  labelItem: string;
  kunci: (baris: T) => string;
  keItem: (baris: T) => ViewItem;
  kolom: KolomTabel<T>[];
  grup: GrupView[];
  viewTersedia: JenisView[];
  viewBawaan: JenisView;
}

export const LABEL_VIEW: Record<JenisView, string> = {
  tabel: 'Tabel',
  kartu: 'Kartu',
  kanban: 'Kanban',
  kalender: 'Kalender',
};
