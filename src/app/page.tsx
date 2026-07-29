import { BarChart3, CreditCard, Package, Receipt, ScanLine, Wallet } from 'lucide-react';
import Link from 'next/link';
import { PENGATURAN_TOKO } from '@/data/operasional';
import { rupiah } from '@/lib/format';

const FITUR = [
  {
    ikon: ScanLine,
    judul: 'Layar kasir untuk berdiri',
    teks: 'Grid produk dan keranjang bergulir terpisah, jadi tombol Bayar tidak pernah hilang dari layar saat kasir sedang mencari produk.',
  },
  {
    ikon: CreditCard,
    judul: 'Tunai, kartu, QRIS, dan split',
    teks: 'Kembalian dihitung otomatis, satu tagihan boleh dibayar beberapa metode sekaligus, dan strukturnya siap dicetak ke printer termal.',
  },
  {
    ikon: Package,
    judul: 'Varian tanpa produk kembar',
    teks: 'Ukuran, topping, dan warna adalah dimensi pada satu produk. Laporan produk terlaris tetap membaca satu nama, bukan enam pecahan.',
  },
  {
    ikon: Receipt,
    judul: 'Riwayat yang bisa ditelusuri',
    teks: 'Setiap struk tersimpan lengkap dengan diskon, pajak, kasir, dan alasan kalau transaksinya di-void atau di-refund.',
  },
  {
    ikon: Wallet,
    judul: 'Shift dan selisih kas',
    teks: 'Buka shift dengan kas awal, tutup dengan hitungan fisik, selisihnya muncul apa adanya beserta catatan kasirnya.',
  },
  {
    ikon: BarChart3,
    judul: 'Laporan yang terbaca',
    teks: 'Penjualan harian, produk terlaris, per metode bayar, per kasir, dan jam paling sibuk. Grafik sederhana, angka besar dan tegas.',
  },
];

/**
 * Halaman landing.
 *
 * Pratinjau produknya adalah KOMPOSISI DOM ASLI, bukan tangkapan layar bitmap
 * dan bukan gambar hasil generate (ART-DIRECTION bagian 8). Empat akibatnya:
 * tidak ada risiko teks berantakan seperti pada gambar hasil model, tajam di
 * setiap kepadatan piksel, selalu jujur karena memakai token yang sama dengan
 * aplikasinya, dan ikut tersapu pemeriksaan kontras serta pemeriksaan
 * `innerText` yang tidak pernah bisa menyentuh bitmap.
 *
 * Komposisi itu `aria-hidden` dan tidak bisa difokus dengan Tab, supaya tidak
 * jadi jebakan papan ketik di halaman pertama.
 */
export default function Landing() {
  return (
    <div className="luar">
      <header className="luar-head">
        <img className="luar-logo" src="/logo-lekas-primary.svg" alt="Lekas" />
        <div className="luar-aksi">
          <Link className="btn btn-sekunder" href="/login/">Masuk demo</Link>
          <Link className="btn btn-bayar" href="/app/kasir/">Coba Demo</Link>
        </div>
      </header>

      <main id="isi" className="luar-main">
        <div className="luar-wrap">
          <section className="hero">
            <div>
              <span className="hero-mata">Aplikasi kasir retail dan F&amp;B</span>
              <h1>Cepat di kasir, pas di laci.</h1>
              <p className="hero-teks">
                Lekas adalah aplikasi kasir untuk toko retail dan kedai F&amp;B skala UMKM sampai
                menengah. Semua yang ada di sini bisa langsung dicoba, tanpa daftar dan tanpa
                memasang apa pun.
              </p>
              <div className="hero-cta">
                <Link className="btn btn-bayar btn-lg" href="/app/kasir/">Coba Demo</Link>
                <Link className="btn btn-sekunder btn-lg" href="/login/">Lihat layar masuk</Link>
              </div>
            </div>

            <PratinjauKasir />
          </section>

          <section>
            <h2>Yang sudah berdiri di demo ini</h2>
            <div className="fitur-grid">
              {FITUR.map((f) => {
                const Ikon = f.ikon;
                return (
                  <article key={f.judul} className="kartu">
                    <span className="fitur-ikon">
                      <Ikon className="lucide" size={20} aria-hidden="true" />
                    </span>
                    <span className="stack">
                      <span className="t" style={{ fontSize: 17, lineHeight: '24px', fontWeight: 600 }}>
                        {f.judul}
                      </span>
                      <span className="s" style={{ lineHeight: '20px' }}>{f.teks}</span>
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <footer className="luar-foot">
        <div className="luar-foot-isi">
          <span className="stack">
            <span className="t">Lekas</span>
            <span className="s">{PENGATURAN_TOKO.slogan}</span>
          </span>
          <span>
            Dibuat oleh{' '}
            <a href="https://himaystudio.com" target="_blank" rel="noopener">
              Himay Studio
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Potongan layar Kasir sungguhan, dirender sebagai DOM. Dekoratif. */
function PratinjauKasir() {
  const ubin = [
    { nama: 'Kopi Susu', harga: 22000, warna: 1, inisial: 'KS' },
    { nama: 'Americano', harga: 18000, warna: 1, inisial: 'AM' },
    { nama: 'Matcha Latte', harga: 26000, warna: 6, inisial: 'ML' },
    { nama: 'Nasi Goreng', harga: 28000, warna: 3, inisial: 'NG' },
    { nama: 'Croissant', harga: 18000, warna: 5, inisial: 'CR' },
    { nama: 'Teh Manis', harga: 10000, warna: 6, inisial: 'TM' },
  ];

  return (
    <div
      className="kartu"
      aria-hidden="true"
      style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-2)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 168px' }}>
        <div style={{ padding: 'var(--sp-3)', borderRight: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-brand badge-pekat">Semua</span>
            <span className="badge badge-neutral">Kopi</span>
            <span className="badge badge-neutral">Makanan</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ubin.map((u) => (
              <div key={u.nama} className="ubin" style={{ minHeight: 0, cursor: 'default' }}>
                <span className={`ubin-muka ubin-muka-${u.warna}`} style={{ fontSize: 18 }}>
                  {u.inisial}
                </span>
                <span className="ubin-isi" style={{ padding: '6px 8px 8px' }}>
                  <span className="ubin-nama" style={{ fontSize: 12, lineHeight: '16px' }}>{u.nama}</span>
                  <span className="ubin-harga" style={{ fontSize: 12, lineHeight: '16px' }}>{rupiah(u.harga)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 'var(--sp-3)', display: 'grid', gap: 8, alignContent: 'start' }}>
          <span className="stack">
            <span className="t" style={{ fontSize: 13 }}>Keranjang</span>
            <span className="s">3 item</span>
          </span>
          <div className="krj-ringkas">
            <div className="krj-ringkas-baris"><span>Subtotal</span><span className="num">66.000</span></div>
            <div className="krj-ringkas-baris"><span>Pajak</span><span className="num">7.260</span></div>
          </div>
          <span className="krj-total-label">Total</span>
          <span className="num-besar" style={{ fontSize: 26, lineHeight: '30px' }}>{rupiah(73300)}</span>
          <span className="btn btn-bayar" style={{ pointerEvents: 'none' }}>Bayar</span>
        </div>
      </div>
    </div>
  );
}
