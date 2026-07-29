import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUK, statusStok } from '@/data/katalog';
import { HARI_INI, PENGATURAN_TOKO, petaPengguna } from '@/data/operasional';
import { SHIFT, TRANSAKSI } from '@/data/transaksi';
import { jam, rupiah, tanggalPanjang } from '@/lib/format';
import { omzet, padaTanggal, produkTerlaris, totalTransaksi } from '@/lib/derived';
import { BarDaftar } from '@/components/charts/Charts';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, CatatanStage, Kpi } from '@/components/ui/Primitives';

export const metadata: Metadata = { title: 'Beranda, Lekas' };

export default function Beranda() {
  const hariIni = padaTanggal(HARI_INI);
  const omzetHariIni = omzet(hariIni);
  const shiftTerbuka = SHIFT.filter((s) => s.status === 'terbuka');
  const stokPerhatian = PRODUK.filter((p) => statusStok(p) !== 'aman');
  const terlaris = produkTerlaris(hariIni, 5);
  const terbaru = [...TRANSAKSI].sort((a, b) => b.waktu.localeCompare(a.waktu)).slice(0, 6);

  return (
    <>
      <PageHeader
        judul="Beranda"
        ket={`${PENGATURAN_TOKO.nama} · ${tanggalPanjang(HARI_INI)}`}
        aksi={(
          <>
            {/* Isian hijau --pay HANYA untuk tombol Bayar di layar Kasir dan
                CTA Coba Demo di halaman luar (DESIGN.md 6.2). Ini navigasi,
                jadi memakai isian merek. */}
            <Link className="btn" href="/app/kasir/">Buka layar Kasir</Link>
            <Link className="btn btn-sekunder" href="/app/shift/">Tutup shift</Link>
          </>
        )}
      />

      {/* Lebih dari tiga kartu sejenis, jadi jadi carousel di mobile (R48). */}
      <div className="kpi-grid snap-row">
        <Kpi
          label="Omzet hari ini"
          nilai={rupiah(omzetHariIni)}
          ubah={{ arah: 'naik', teks: '12 persen dari kemarin' }}
        />
        <Kpi label="Transaksi" nilai={String(hariIni.length)} ket="Hanya transaksi lunas" />
        <Kpi
          label="Rata rata belanja"
          nilai={rupiah(hariIni.length > 0 ? omzetHariIni / hariIni.length : 0)}
        />
        <Kpi
          label="Shift terbuka"
          nilai={String(shiftTerbuka.length)}
          ket={shiftTerbuka.length > 0 ? `Kasir ${petaPengguna.get(shiftTerbuka[0].kasirId)?.nama ?? ''}` : 'Semua shift sudah ditutup'}
        />
      </div>

      <div className="kolom-2" style={{ marginTop: 'var(--sp-6)' }}>
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Transaksi terbaru</h2>
              <Link className="btn btn-halus btn-sm" href="/app/transaksi/">Lihat semua</Link>
            </div>
            <div className="tbl-kartu">
              {terbaru.map((t) => {
                const kasir = petaPengguna.get(t.kasirId);
                return (
                  <Link key={t.id} href={`/app/transaksi/${t.id}/`} className="tbl-kartu-item">
                    <div className="item-kartu-atas">
                      <span className="stack">
                        <span className="t">{t.id}</span>
                        <span className="s">
                          {jam(t.waktu)} · {kasir?.nama ?? t.kasirId} · {t.baris.length} baris
                        </span>
                      </span>
                      <span className="stack" style={{ alignItems: 'flex-end' }}>
                        <span className="t num">{rupiah(totalTransaksi(t))}</span>
                        <span className="s">
                          {t.status === 'lunas' ? 'Lunas' : t.status === 'ditahan' ? 'Ditahan' : t.status === 'void' ? 'Void' : 'Refund'}
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Produk terlaris hari ini</h2>
              <Link className="btn btn-halus btn-sm" href="/app/laporan/">Buka laporan</Link>
            </div>
            {terlaris.length === 0 ? (
              <p className="bantuan">Belum ada penjualan hari ini.</p>
            ) : (
              <BarDaftar
                label="Produk terlaris hari ini"
                data={terlaris.map((p) => ({
                  label: p.nama,
                  ket: p.kategori,
                  nilai: p.qty,
                  teks: `${p.qty} terjual`,
                  warna: p.warna,
                }))}
              />
            )}
          </section>
        </div>

        <div className="kolom-sisi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Perlu perhatian</h2>
            </div>
            {stokPerhatian.length === 0 ? (
              <p className="bantuan">Semua stok aman.</p>
            ) : (
              <div className="tbl-kartu">
                {stokPerhatian.map((p) => (
                  <Link key={p.id} href={`/app/produk/${p.sku}/`} className="tbl-kartu-item">
                    <div className="item-kartu-atas">
                      <span className="stack">
                        <span className="t">{p.nama}</span>
                        <span className="s">Sisa {p.stok} {p.satuan}, minimum {p.stokMinimum}</span>
                      </span>
                      <Badge tone={statusStok(p) === 'habis' ? 'danger' : 'warning'}>
                        {statusStok(p) === 'habis' ? 'Habis' : 'Menipis'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Pintasan</h2>
            </div>
            <div style={{ display: 'grid', gap: 'var(--sp-2)' }}>
              <Link className="btn btn-sekunder btn-blok" href="/app/produk/">Kelola produk</Link>
              <Link className="btn btn-sekunder btn-blok" href="/app/pembayaran/">Ruang pembayaran</Link>
              <Link className="btn btn-sekunder btn-blok" href="/app/pengaturan/pajak/">Atur pajak dan service</Link>
            </div>
          </section>

          <CatatanStage>
            Angka pembanding pada kartu KPI masih ditulis tetap. Stage 5 menghitungnya dari
            transaksi hari sebelumnya dan menambah rentang tanggal di halaman ini.
          </CatatanStage>
        </div>
      </div>
    </>
  );
}
