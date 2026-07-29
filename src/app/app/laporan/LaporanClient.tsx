'use client';

import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LABEL_METODE } from '@/lib/kasir';
import { rupiah, tanggalPendek } from '@/lib/format';
import {
  TRANSAKSI_SAH,
  labaKotor,
  omzet,
  perHari,
  perJam,
  perKasir,
  perMetodeBayar,
  produkTerlaris,
} from '@/lib/derived';
import { BarDaftar, Donat, GrafikBatang, Legenda } from '@/components/charts/Charts';
import { PageHeader } from '@/components/shell/PageHeader';
import { DateRangePicker, type RentangTanggal } from '@/components/ui/DatePicker';
import { CatatanStage, Kpi } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';

const OPSI_KELOMPOK = [
  { nilai: 'harian', label: 'Harian' },
  { nilai: 'mingguan', label: 'Mingguan' },
  { nilai: 'bulanan', label: 'Bulanan' },
];

/**
 * Laporan.
 *
 * Rentang tanggalnya memakai `DateRangePicker`, bukan dua pemilih tunggal yang
 * berdiri sendiri sendiri (R21). Dua pemilih terpisah selalu berakhir dengan
 * tanggal akhir yang lebih awal daripada tanggal mulai, dan setiap perbaikannya
 * berupa validasi yang menolak masukan pengguna alih alih memperbaikinya.
 *
 * Semua angka datang dari `lib/derived.ts`, yang menghitung ulang dari
 * transaksi. Tidak ada satu pun ringkasan yang menyimpan totalnya sendiri.
 * Transaksi void dan refund dikeluarkan dari penjualan, karena laporan yang
 * memasukkannya akan tampak lebih bagus daripada isi laci.
 */
export function LaporanClient() {
  const [rentang, setRentang] = useState<RentangTanggal>({ mulai: '2026-07-27', selesai: '2026-07-29' });
  const [kelompok, setKelompok] = useState('harian');

  const data = useMemo(() => TRANSAKSI_SAH.filter((t) => {
    const k = t.waktu.slice(0, 10);
    if (rentang.mulai && k < rentang.mulai) return false;
    if (rentang.selesai && k > rentang.selesai) return false;
    return true;
  }), [rentang]);

  const total = omzet(data);
  const laba = labaKotor(data);
  const harian = perHari(data);
  const terlaris = produkTerlaris(data, 6);
  const metode = perMetodeBayar(data);
  const kasir = perKasir(data);
  const jam = perJam(data);

  return (
    <>
      <PageHeader
        judul="Laporan"
        ket="Penjualan, produk terlaris, metode bayar, kasir, dan jam sibuk. Transaksi void dan refund tidak ikut dihitung."
        aksi={(
          <>
            <button type="button" className="btn">Cetak laporan</button>
            <button type="button" className="btn btn-sekunder">
              <Download className="lucide" size={16} aria-hidden="true" />
              <span>Ekspor CSV</span>
            </button>
          </>
        )}
        saring={(
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
        )}
      />

      <div className="kpi-grid snap-row">
        <Kpi label="Omzet" nilai={rupiah(total)} ket={`${data.length} transaksi lunas`} />
        <Kpi label="Laba kotor" nilai={rupiah(laba)} ket="Penjualan bersih dikurangi harga modal" />
        <Kpi label="Rata rata belanja" nilai={rupiah(data.length > 0 ? total / data.length : 0)} />
        <Kpi label="Item terjual" nilai={String(data.reduce((a, t) => a + t.baris.reduce((s, b) => s + b.qty, 0), 0))} />
      </div>

      <div className="kolom-2" style={{ marginTop: 'var(--sp-6)' }}>
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Penjualan per hari</h2>
            </div>
            {harian.length === 0 ? (
              <p className="bantuan">Tidak ada penjualan pada rentang ini.</p>
            ) : (
              <>
                <GrafikBatang
                  label="Penjualan per hari"
                  data={harian.map((h) => ({
                    label: tanggalPendek(h.tanggal).replace(/ \d{4}$/, ''),
                    nilai: h.nilai,
                    teks: rupiah(h.nilai),
                  }))}
                />
                <div style={{ marginTop: 'var(--sp-3)' }}>
                  <Legenda data={[{ label: 'Omzet harian', warna: 1 }]} />
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

          <CatatanStage>
            Pilihan pengelompokan mingguan dan bulanan belum mengubah grafik, dan cetak serta
            ekspor belum aktif. Stage 5 menambahkannya bersama pembanding periode sebelumnya.
          </CatatanStage>
        </div>
      </div>
    </>
  );
}
