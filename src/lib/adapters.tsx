import { petaKategori, rentangHarga, statusStok } from '@/data/katalog';
import { PENGATURAN_PAJAK, petaMeja, petaPengguna } from '@/data/operasional';
import { LABEL_STATUS_TRANSAKSI } from '@/data/transaksi';
import type { Produk, Shift, Tone, Transaksi } from '@/data/types';
import type { AdapterView } from '@/components/views/types';
import { Badge } from '@/components/ui/Primitives';
import { durasi, jam, rupiah, tanggalPendek } from './format';
import { LABEL_METODE, hitungTransaksi } from './kasir';
import { inisialProduk, warnaProduk } from '@/components/kasir/ubin';

/**
 * Adapter view per modul.
 *
 * Tiap modul menerjemahkan barisnya sendiri jadi `ViewItem` netral SATU KALI di
 * sini, lalu keempat renderer memakai hasil terjemahan itu. Yang dihindari:
 * empat renderer yang masing masing tahu bentuk produk, transaksi, dan shift.
 * Begitu itu terjadi, menambah satu field berarti menyunting empat berkas, dan
 * yang keempat selalu terlewat.
 */

/* -------------------------------------------------------------------------- */
/* Produk                                                                      */
/* -------------------------------------------------------------------------- */

const TONE_STOK: Record<'aman' | 'menipis' | 'habis', Tone> = {
  aman: 'success',
  menipis: 'warning',
  habis: 'danger',
};

const LABEL_STOK: Record<'aman' | 'menipis' | 'habis', string> = {
  aman: 'Stok aman',
  menipis: 'Stok menipis',
  habis: 'Stok habis',
};

export const adapterProduk: AdapterView<Produk> = {
  modul: 'produk',
  labelItem: 'produk',
  kunci: (p) => p.id,
  viewTersedia: ['tabel', 'kartu', 'kanban'],
  viewBawaan: 'tabel',
  grup: [
    { id: 'aman', nama: 'Stok aman', tone: 'success' },
    { id: 'menipis', nama: 'Stok menipis', tone: 'warning' },
    { id: 'habis', nama: 'Stok habis', tone: 'danger' },
  ],
  keItem: (p) => {
    const s = statusStok(p);
    const r = rentangHarga(p);
    return {
      id: p.id,
      kode: p.sku,
      judul: p.nama,
      // Kategori dan jumlah varian jadi label sekunder, dan label sekunder
      // SELALU blok terpisah (R50). Kalau digabung inline, hasil terendernya
      // `Kopi SusuKopi` dalam satu baris.
      keterangan: `${petaKategori.get(p.kategoriId)?.nama ?? ''}${p.dimensi.length > 0 ? ` · ${p.dimensi.length} dimensi varian` : ''}`,
      grup: s,
      tanggal: '',
      href: `/app/produk/${p.sku}/`,
      badge: { teks: LABEL_STOK[s], tone: TONE_STOK[s] },
      nilai: r.min === r.maks ? rupiah(r.min) : `${rupiah(r.min)} sampai ${rupiah(r.maks)}`,
      inisial: inisialProduk(p.nama),
      warna: warnaProduk(p),
      metrik: [
        { label: 'Stok', nilai: `${p.stok} ${p.satuan}` },
        { label: 'Modal', nilai: rupiah(p.hargaModal) },
      ],
    };
  },
  kolom: [
    {
      id: 'nama',
      judul: 'Produk',
      render: (p) => (
        <span className="stack">
          <span className="t">{p.nama}</span>
          <span className="s">{petaKategori.get(p.kategoriId)?.nama ?? ''}</span>
        </span>
      ),
      nilaiUrut: (p) => p.nama,
    },
    { id: 'sku', judul: 'SKU', lebar: 130, opsional: true, render: (p) => <span className="mono">{p.sku}</span>, nilaiUrut: (p) => p.sku },
    {
      id: 'varian',
      judul: 'Varian',
      lebar: 150,
      opsional: true,
      render: (p) => (p.dimensi.length === 0
        ? <span style={{ color: 'var(--text-muted)' }}>Tanpa varian</span>
        : <span>{p.dimensi.map((d) => d.nama).join(', ')}</span>),
    },
    { id: 'harga', judul: 'Harga', lebar: 120, rata: 'kanan', render: (p) => <span className="num">{rupiah(p.hargaDasar)}</span>, nilaiUrut: (p) => p.hargaDasar },
    { id: 'stok', judul: 'Stok', lebar: 100, rata: 'kanan', render: (p) => <span className="num">{p.stok}</span>, nilaiUrut: (p) => p.stok },
    {
      id: 'status',
      judul: 'Status stok',
      lebar: 140,
      render: (p) => <Badge tone={TONE_STOK[statusStok(p)]}>{LABEL_STOK[statusStok(p)]}</Badge>,
      nilaiUrut: (p) => statusStok(p),
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Transaksi                                                                   */
/* -------------------------------------------------------------------------- */

const TONE_TRANSAKSI: Record<Transaksi['status'], Tone> = {
  lunas: 'success',
  ditahan: 'warning',
  void: 'danger',
  refund: 'danger',
};

export const adapterTransaksi: AdapterView<Transaksi> = {
  modul: 'transaksi',
  labelItem: 'transaksi',
  kunci: (t) => t.id,
  viewTersedia: ['tabel', 'kartu', 'kalender'],
  viewBawaan: 'tabel',
  grup: [
    { id: 'lunas', nama: 'Lunas', tone: 'success' },
    { id: 'ditahan', nama: 'Ditahan', tone: 'warning' },
    { id: 'void', nama: 'Void', tone: 'danger' },
    { id: 'refund', nama: 'Refund', tone: 'danger' },
  ],
  keItem: (t) => {
    const kasir = petaPengguna.get(t.kasirId);
    const meja = t.mejaId ? petaMeja.get(t.mejaId) : null;
    return {
      id: t.id,
      // Nomor transaksi ITU judulnya. Menaruhnya lagi sebagai `kode` hanya
      // menghasilkan baris "Kode" yang mengulang judul di kartu mobile.
      judul: t.id,
      keterangan: `${tanggalPendek(t.waktu)} ${jam(t.waktu)} · ${kasir?.nama ?? t.kasirId}${meja ? ` · Meja ${meja.nama}` : ''}`,
      grup: t.status,
      tanggal: t.waktu,
      href: `/app/transaksi/${t.id}/`,
      badge: { teks: LABEL_STATUS_TRANSAKSI[t.status], tone: TONE_TRANSAKSI[t.status] },
      nilai: rupiah(hitungTransaksi(t, PENGATURAN_PAJAK).total),
      metrik: [
        { label: 'Item', nilai: String(t.baris.reduce((a, b) => a + b.qty, 0)) },
        // Label metode dibaca dari peta, bukan dari nilai enum mentah. `tunai`
        // dan `kredit` huruf kecil terbaca seperti kebocoran data internal.
        { label: 'Metode', nilai: t.pembayaran.length > 0 ? t.pembayaran.map((p) => LABEL_METODE[p.metode]).join(', ') : 'Belum dibayar' },
      ],
    };
  },
  kolom: [
    { id: 'id', judul: 'Nomor', lebar: 190, render: (t) => <span className="mono">{t.id}</span>, nilaiUrut: (t) => t.id },
    {
      id: 'waktu',
      judul: 'Waktu',
      lebar: 150,
      render: (t) => (
        <span className="stack">
          <span className="t">{jam(t.waktu)}</span>
          <span className="s">{tanggalPendek(t.waktu)}</span>
        </span>
      ),
      nilaiUrut: (t) => t.waktu,
    },
    {
      id: 'kasir',
      judul: 'Kasir',
      opsional: true,
      render: (t) => <span>{petaPengguna.get(t.kasirId)?.nama ?? t.kasirId}</span>,
      nilaiUrut: (t) => petaPengguna.get(t.kasirId)?.nama ?? t.kasirId,
    },
    {
      id: 'metode',
      judul: 'Metode bayar',
      opsional: true,
      render: (t) => (t.pembayaran.length === 0
        ? <span style={{ color: 'var(--text-muted)' }}>Belum dibayar</span>
        : <span>{t.pembayaran.map((p) => LABEL_METODE[p.metode]).join(', ')}</span>),
    },
    { id: 'item', judul: 'Item', lebar: 90, rata: 'kanan', render: (t) => <span className="num">{t.baris.reduce((a, b) => a + b.qty, 0)}</span>, nilaiUrut: (t) => t.baris.reduce((a, b) => a + b.qty, 0) },
    {
      id: 'total',
      judul: 'Total',
      lebar: 140,
      rata: 'kanan',
      render: (t) => <span className="num">{rupiah(hitungTransaksi(t, PENGATURAN_PAJAK).total)}</span>,
      nilaiUrut: (t) => hitungTransaksi(t, PENGATURAN_PAJAK).total,
    },
    {
      id: 'status',
      judul: 'Status',
      lebar: 120,
      render: (t) => <Badge tone={TONE_TRANSAKSI[t.status]}>{LABEL_STATUS_TRANSAKSI[t.status]}</Badge>,
      nilaiUrut: (t) => t.status,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Shift                                                                       */
/* -------------------------------------------------------------------------- */

export function selisihKas(s: Shift): number | null {
  return s.kasFisik === null ? null : s.kasFisik - s.kasSistem;
}

export const adapterShift: AdapterView<Shift> = {
  modul: 'shift',
  labelItem: 'shift',
  kunci: (s) => s.id,
  viewTersedia: ['tabel', 'kalender'],
  viewBawaan: 'tabel',
  grup: [
    { id: 'terbuka', nama: 'Terbuka', tone: 'warning' },
    { id: 'tertutup', nama: 'Tertutup', tone: 'success' },
  ],
  keItem: (s) => {
    const selisih = selisihKas(s);
    const kasir = petaPengguna.get(s.kasirId);
    return {
      id: s.id,
      kode: s.id,
      judul: kasir?.nama ?? s.kasirId,
      keterangan: `${tanggalPendek(s.buka)} ${jam(s.buka)}${s.tutup ? ` sampai ${jam(s.tutup)}` : ' sampai sekarang'}`,
      grup: s.status,
      tanggal: s.buka,
      href: `/app/shift/${s.id}/`,
      badge: s.status === 'terbuka'
        ? { teks: 'Shift terbuka', tone: 'warning' as Tone }
        : selisih === 0
          ? { teks: 'Kas pas', tone: 'success' as Tone }
          : { teks: 'Ada selisih', tone: 'danger' as Tone },
      nilai: rupiah(s.penjualanTunai + s.penjualanNonTunai),
      metrik: [
        { label: 'Transaksi', nilai: String(s.jumlahTransaksi) },
        { label: 'Selisih', nilai: selisih === null ? 'Belum ditutup' : rupiah(selisih) },
      ],
    };
  },
  kolom: [
    { id: 'id', judul: 'Shift', lebar: 170, render: (s) => <span className="mono">{s.id}</span>, nilaiUrut: (s) => s.id },
    {
      id: 'kasir',
      judul: 'Kasir',
      render: (s) => (
        <span className="stack">
          <span className="t">{petaPengguna.get(s.kasirId)?.nama ?? s.kasirId}</span>
          <span className="s">{tanggalPendek(s.buka)}</span>
        </span>
      ),
      nilaiUrut: (s) => petaPengguna.get(s.kasirId)?.nama ?? s.kasirId,
    },
    {
      id: 'durasi',
      judul: 'Durasi',
      lebar: 120,
      opsional: true,
      render: (s) => <span>{s.tutup ? durasi(s.buka, s.tutup) : 'Berjalan'}</span>,
    },
    { id: 'trx', judul: 'Transaksi', lebar: 110, rata: 'kanan', render: (s) => <span className="num">{s.jumlahTransaksi}</span>, nilaiUrut: (s) => s.jumlahTransaksi },
    {
      id: 'penjualan',
      judul: 'Penjualan',
      lebar: 140,
      rata: 'kanan',
      render: (s) => <span className="num">{rupiah(s.penjualanTunai + s.penjualanNonTunai)}</span>,
      nilaiUrut: (s) => s.penjualanTunai + s.penjualanNonTunai,
    },
    {
      id: 'selisih',
      judul: 'Selisih kas',
      lebar: 140,
      rata: 'kanan',
      render: (s) => {
        const d = selisihKas(s);
        if (d === null) return <span style={{ color: 'var(--text-muted)' }}>Belum ditutup</span>;
        return <span className={`num ${d < 0 ? 'negatif' : ''}`}>{rupiah(d)}</span>;
      },
      nilaiUrut: (s) => selisihKas(s) ?? 0,
    },
  ],
};
