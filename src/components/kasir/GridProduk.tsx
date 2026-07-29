'use client';

import { Search } from 'lucide-react';
import { forwardRef } from 'react';
import { KATEGORI, statusStok } from '@/data/katalog';
import type { Produk } from '@/data/types';
import { rupiah } from '@/lib/format';
import { Badge, Kosong } from '@/components/ui/Primitives';
import { inisialProduk, warnaProduk } from './ubin';

/**
 * Grid produk layar Kasir.
 *
 * Bergulir DI DALAM kotaknya sendiri, tidak pernah membuat halaman ikut
 * bergulir. Itu syaratnya supaya keranjang tetap terlihat sementara kasir
 * menelusuri katalog; kalau keduanya berbagi satu wilayah gulir, tombol Bayar
 * hilang dari layar tepat saat dibutuhkan.
 *
 * Kolom pencarian dobel fungsi sebagai jalur pemindaian barcode: pemindai
 * genggam sungguhan mengetik kodenya lalu mengirim Enter, jadi Enter pada teks
 * yang cocok persis dengan barcode produk langsung memasukkannya ke
 * keranjang, sama seperti mengetuk ubinnya.
 */
export const GridProduk = forwardRef<HTMLInputElement, {
  produk: Produk[];
  kategori: string;
  onKategori: (k: string) => void;
  cari: string;
  onCari: (c: string) => void;
  onPilih: (p: Produk) => void;
  onPindai: (kode: string) => void;
  barcodeSalah?: boolean;
}>(function GridProduk({
  produk,
  kategori,
  onKategori,
  cari,
  onCari,
  onPilih,
  onPindai,
  barcodeSalah = false,
}, ref) {
  return (
    <>
      <div className="kasir-cari">
        <Search className="lucide" size={18} aria-hidden="true" style={{ color: 'var(--text-muted)', flex: '0 0 auto' }} />
        <label className="sr" htmlFor="kasir-cari">Cari produk, SKU, atau barcode. Tekan F2 untuk fokus, Enter memindai barcode</label>
        <input
          ref={ref}
          id="kasir-cari"
          className="input"
          type="search"
          value={cari}
          onChange={(e) => onCari(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && cari.trim() !== '') {
              e.preventDefault();
              onPindai(cari);
            }
          }}
          placeholder="Nama produk, SKU, atau barcode, lalu Enter untuk memindai"
          style={{ border: 0, height: 32, padding: 0 }}
        />
        {barcodeSalah ? <Badge tone="danger">Barcode tidak ditemukan</Badge> : null}
      </div>

      {/* Chip kategori horizontal, pengganti rel kiri di bawah 1280px. */}
      <div className="kasir-chip-baris" role="group" aria-label="Saring kategori">
        <button
          type="button"
          className="kasir-chip"
          aria-pressed={kategori === 'semua'}
          onClick={() => onKategori('semua')}
        >
          Semua
        </button>
        {KATEGORI.map((k) => (
          <button
            key={k.id}
            type="button"
            className="kasir-chip"
            aria-pressed={kategori === k.id}
            onClick={() => onKategori(k.id)}
          >
            {k.nama}
          </button>
        ))}
      </div>

      <div className="kasir-grid-bungkus">
        {produk.length === 0 ? (
          <Kosong
            judul="Tidak ada produk yang cocok"
            ket="Ubah kata kunci atau pilih kategori lain. Produk nonaktif tidak pernah muncul di layar Kasir."
          />
        ) : (
          <div className="kasir-grid">
            {produk.map((p) => {
              const stok = statusStok(p);
              return (
                <div key={p.id} className="ubin-bungkus">
                  <button
                    type="button"
                    className="ubin"
                    onClick={() => onPilih(p)}
                    disabled={stok === 'habis'}
                  >
                    <span className={`ubin-muka ubin-muka-${warnaProduk(p)}`} aria-hidden="true">
                      {inisialProduk(p.nama)}
                    </span>
                    <span className="ubin-isi">
                      {/* Nama dan harga adalah blok terpisah (R50). Dua simpul
                          inline akan terbaca `Kopi SusuRp 22.000`. */}
                      <span className="ubin-nama">{p.nama}</span>
                      <span className="ubin-harga">{rupiah(p.hargaDasar)}</span>
                    </span>
                  </button>
                  {stok !== 'aman' ? (
                    <span className="ubin-tanda">
                      <Badge tone={stok === 'habis' ? 'danger' : 'warning'}>
                        {stok === 'habis' ? 'Habis' : 'Menipis'}
                      </Badge>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
});

/** Rel kategori kolom kiri, hanya tampil di 1280px ke atas. */
export function RelKategori({
  kategori,
  onKategori,
  jumlah,
}: {
  kategori: string;
  onKategori: (k: string) => void;
  jumlah: Map<string, number>;
}) {
  return (
    <nav className="kasir-rel" aria-label="Kategori produk">
      <button
        type="button"
        className="kasir-rel-btn"
        aria-pressed={kategori === 'semua'}
        onClick={() => onKategori('semua')}
      >
        <span>Semua</span>
        <span className="num" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          {[...jumlah.values()].reduce((a, b) => a + b, 0)}
        </span>
      </button>
      {KATEGORI.map((k) => (
        <button
          key={k.id}
          type="button"
          className="kasir-rel-btn"
          aria-pressed={kategori === k.id}
          onClick={() => onKategori(k.id)}
        >
          <span className="kasir-rel-titik" style={{ background: `var(--chart-${k.warna})` }} aria-hidden="true" />
          <span>{k.nama}</span>
          <span className="num" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
            {jumlah.get(k.id) ?? 0}
          </span>
        </button>
      ))}
    </nav>
  );
}
