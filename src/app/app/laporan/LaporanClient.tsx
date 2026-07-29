'use client';

import { Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LABEL_PERAN } from '@/data/operasional';
import { LABEL_METODE } from '@/lib/kasir';
import { angka, rupiah, selisihHari, tambahHari, tanggalPendek } from '@/lib/format';
import {
  labaKotor,
  omzet,
  perBulan,
  perHari,
  perJam,
  perKasir,
  perMetodeBayar,
  perMinggu,
  produkTerlaris,
} from '@/lib/derived';
import { useTransaksiStore } from '@/lib/transaksiStore';
import { bisa, useSesi } from '@/lib/sesi';
import { BarDaftar, Donat, GrafikBatang, Legenda } from '@/components/charts/Charts';
import { PageHeader } from '@/components/shell/PageHeader';
import { DateRangePicker, type RentangTanggal } from '@/components/ui/DatePicker';
import { Kosong, Kpi } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';

const OPSI_KELOMPOK = [
  { nilai: 'harian', label: 'Harian' },
  { nilai: 'mingguan', label: 'Mingguan' },
  { nilai: 'bulanan', label: 'Bulanan' },
];

function csvSel(nilai: string | number): string {
  const s = String(nilai);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Laporan.
 *
 * Rentang tanggalnya memakai `DateRangePicker` (R21). Semua angka datang dari
 * `lib/derived.ts`, yang menghitung ulang dari transaksi lunas di
 * `transaksiStore` (lapisan yang sama dipakai Kasir), jadi laporan ini ikut
 * bertambah begitu ada penjualan baru dari layar Kasir. Transaksi void dan
 * refund dikeluarkan dari penjualan.
 *
 * Pembanding periode: rentang yang dipilih dibandingkan dengan rentang
 * SEPANJANG SAMA tepat sebelumnya (7 hari dibandingkan 7 hari sebelum itu,
 * bukan bulan kalender sebelumnya), supaya perbandingannya adil terhadap
 * jumlah hari yang sama.
 */
export function LaporanClient() {
  const [kasirSesi] = useSesi();
  const bolehLihat = bisa(kasirSesi.peran, 'laporan');
  const { transaksi } = useTransaksiStore();
  const sah = useMemo(() => transaksi.filter((t) => t.status === 'lunas'), [transaksi]);

  const [rentang, setRentang] = useState<RentangTanggal>({ mulai: '2026-07-27', selesai: '2026-07-29' });
  const [kelompok, setKelompok] = useState('harian');

  const data = useMemo(() => sah.filter((t) => {
    const k = t.waktu.slice(0, 10);
    if (rentang.mulai && k < rentang.mulai) return false;
    if (rentang.selesai && k > rentang.selesai) return false;
    return true;
  }), [sah, rentang]);

  const dataSebelumnya = useMemo(() => {
    if (!rentang.mulai || !rentang.selesai) return [];
    const panjang = selisihHari(rentang.mulai, rentang.selesai) + 1;
    const selesaiSebelum = tambahHari(rentang.mulai, -1);
    const mulaiSebelum = tambahHari(selesaiSebelum, -(panjang - 1));
    return sah.filter((t) => {
      const k = t.waktu.slice(0, 10);
      return k >= mulaiSebelum && k <= selesaiSebelum;
    });
  }, [sah, rentang]);

  const total = omzet(data);
  const totalSebelumnya = omzet(dataSebelumnya);
  const ubahOmzet = totalSebelumnya > 0
    ? { arah: (total >= totalSebelumnya ? 'naik' : 'turun') as 'naik' | 'turun', teks: `${Math.round(Math.abs((total - totalSebelumnya) / totalSebelumnya) * 100)} persen dari periode sebelumnya` }
    : total > 0 ? { arah: 'naik' as const, teks: 'Periode sebelumnya belum ada penjualan' } : undefined;

  const laba = labaKotor(data);
  const harian = perHari(data);
  const mingguan = perMinggu(data);
  const bulanan = perBulan(data);
  const terlaris = produkTerlaris(data, 6);
  const metode = perMetodeBayar(data);
  const kasir = perKasir(data);
  const jam = perJam(data);

  const deretUtama = kelompok === 'mingguan'
    ? mingguan.map((m) => ({ label: m.label, nilai: m.nilai, teks: rupiah(m.nilai) }))
    : kelompok === 'bulanan'
      ? bulanan.map((b) => ({ label: b.label, nilai: b.nilai, teks: rupiah(b.nilai) }))
      : harian.map((h) => ({ label: tanggalPendek(h.tanggal).replace(/ \d{4}$/, ''), nilai: h.nilai, teks: rupiah(h.nilai) }));
  const judulDeret = kelompok === 'mingguan' ? 'Penjualan per minggu' : kelompok === 'bulanan' ? 'Penjualan per bulan' : 'Penjualan per hari';

  function eksporCsv() {
    const header = ['periode', 'omzet'];
    const baris = deretUtama.map((d) => [d.label, angka(d.nilai)].map(csvSel).join(','));
    const isi = [header.join(','), ...baris].join('\n');
    const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${kelompok}-${rentang.mulai ?? 'awal'}-${rentang.selesai ?? 'akhir'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        judul="Laporan"
        ket="Penjualan, produk terlaris, metode bayar, kasir, dan jam sibuk. Transaksi void dan refund tidak ikut dihitung."
        aksi={bolehLihat ? (
          <>
            <button type="button" className="btn" onClick={() => window.print()}>
              <Printer className="lucide" size={16} aria-hidden="true" />
              <span>Cetak laporan</span>
            </button>
            <button type="button" className="btn btn-sekunder" onClick={eksporCsv}>
              <Download className="lucide" size={16} aria-hidden="true" />
              <span>Ekspor CSV</span>
            </button>
          </>
        ) : null}
        saring={bolehLihat ? (
          <>
            <div style={{ minWidth: 280 }}>
              <label className="sr" htmlFor="rentang-laporan">Rentang tanggal laporan</label>
              <DateRangePicker label="Rentang tanggal laporan" nilai={rentang} onUbah={setRentang} />
            </div>
            <div style={{ minWidth: 170 }}>
              <label className="sr" htmlFor="kelompok-laporan">Kelompokkan</label>
              <Select id="kelompok-laporan" label="Kelompokkan laporan" nilai={kelompok} opsi={OPSI_KELOMPOK} onUbah={setKelompok} lebarPenuh />
            </div>
          </>
        ) : null}
      />

      {!bolehLihat ? (
        <Kosong
          judul="Tidak berwenang melihat laporan"
          ket={`Anda masuk sebagai ${kasirSesi.nama}, ${LABEL_PERAN[kasirSesi.peran]}. HAK_AKSES 'laporan' membatasi halaman ini untuk peran Pemilik dan Manajer.`}
        />
      ) : (

      <div data-area-cetak="laporan">
        <div className="kpi-grid snap-row">
          <Kpi label="Omzet" nilai={rupiah(total)} ket={`${data.length} transaksi lunas`} ubah={ubahOmzet} />
          <Kpi label="Laba kotor" nilai={rupiah(laba)} ket="Penjualan bersih dikurangi harga modal" />
          <Kpi label="Rata rata belanja" nilai={rupiah(data.length > 0 ? total / data.length : 0)} />
          <Kpi label="Item terjual" nilai={String(data.reduce((a, t) => a + t.baris.reduce((s, b) => s + b.qty, 0), 0))} />
        </div>

        <div className="kolom-2" style={{ marginTop: 'var(--sp-6)' }}>
          <div className="seksi">
            <section className="kartu">
              <div className="kartu-judul">
                <h2>{judulDeret}</h2>
              </div>
              {deretUtama.length === 0 ? (
                <p className="bantuan">Tidak ada penjualan pada rentang ini.</p>
              ) : (
                <>
                  <GrafikBatang label={judulDeret} data={deretUtama} />
                  <div style={{ marginTop: 'var(--sp-3)' }}>
                    <Legenda data={[{ label: judulDeret, warna: 1 }]} />
                  </div>
                </>
              )}
            </section>

            <section className="kartu">
              <div className="kartu-judul">
                <h2>Jam paling sibuk</h2>
              </div>
              <GrafikBatang
                label="Penjualan per jam"
                data={jam.map((j) => ({ label: j.label, nilai: j.nilai, teks: rupiah(j.nilai), warna: 4 }))}
              />
              <p className="bantuan" style={{ marginTop: 'var(--sp-3)' }}>
                Sumbu mendatar adalah jam dalam sehari, dari jam buka sampai jam tutup.
              </p>
            </section>

            <section className="kartu">
              <div className="kartu-judul">
                <h2>Produk terlaris</h2>
              </div>
              {terlaris.length === 0 ? (
                <p className="bantuan">Tidak ada penjualan pada rentang ini.</p>
              ) : (
                <BarDaftar
                  label="Produk terlaris"
                  data={terlaris.map((p) => ({
                    label: p.nama,
                    ket: `${p.kategori} · ${rupiah(p.nilai)}`,
                    nilai: p.qty,
                    teks: `${p.qty} terjual`,
                    warna: p.warna,
                  }))}
                />
              )}
              <p className="bantuan" style={{ marginTop: 'var(--sp-3)' }}>
                Diagregasi per produk, bukan per varian. Kopi Susu besar dan Kopi Susu reguler jatuh ke
                baris yang sama, sesuai model data di katalog.
              </p>
            </section>
          </div>

          <div className="kolom-sisi">
            <section className="kartu">
              <div className="kartu-judul">
                <h2>Metode bayar</h2>
              </div>
              {metode.length === 0 ? (
                <p className="bantuan">Belum ada pembayaran pada rentang ini.</p>
              ) : (
                <Donat
                  label="Penjualan per metode bayar"
                  data={metode.map((m) => ({
                    label: LABEL_METODE[m.metode],
                    nilai: m.nilai,
                    teks: rupiah(m.nilai),
                    warna: m.warna,
                  }))}
                />
              )}
            </section>

            <section className="kartu">
              <div className="kartu-judul">
                <h2>Per kasir</h2>
              </div>
              {kasir.length === 0 ? (
                <p className="bantuan">Belum ada transaksi pada rentang ini.</p>
              ) : (
                <BarDaftar
                  label="Penjualan per kasir"
                  data={kasir.map((k) => ({
                    label: k.nama,
                    ket: `${k.jumlah} transaksi`,
                    nilai: k.nilai,
                    teks: rupiah(k.nilai),
                    warna: k.warna,
                  }))}
                />
              )}
            </section>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
