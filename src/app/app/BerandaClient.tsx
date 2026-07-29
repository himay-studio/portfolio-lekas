'use client';

import Link from 'next/link';
import { statusStok } from '@/data/katalog';
import { HARI_INI, petaPengguna } from '@/data/operasional';
import { jam, rupiah, tambahHari, tanggalPanjang } from '@/lib/format';
import { omzet, padaTanggal, produkTerlaris, totalTransaksi } from '@/lib/derived';
import { useProdukStore } from '@/lib/produkStore';
import { useShiftStore } from '@/lib/shiftStore';
import { useTokoStore } from '@/lib/pengaturanStore';
import { useTransaksiStore } from '@/lib/transaksiStore';
import { BarDaftar } from '@/components/charts/Charts';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, Kpi } from '@/components/ui/Primitives';

/**
 * Beranda.
 *
 * Angka pembanding KPI omzet dihitung dari transaksi HARI_INI - 1, bukan
 * ditulis tetap. Sumber datanya `produkStore`/`transaksiStore`/`shiftStore`,
 * lapisan yang sama dipakai layar Kasir, jadi begitu ada transaksi baru dari
 * Kasir, kartu KPI dan daftar transaksi terbaru di sini ikut berubah tanpa
 * memuat ulang data dasar.
 */
export function BerandaClient() {
  const { produk } = useProdukStore();
  const { transaksi } = useTransaksiStore();
  const { shift } = useShiftStore();
  const { toko } = useTokoStore();

  const sah = transaksi.filter((t) => t.status === 'lunas');
  const hariIni = padaTanggal(HARI_INI, sah);
  const kemarin = padaTanggal(tambahHari(HARI_INI, -1), sah);
  const omzetHariIni = omzet(hariIni);
  const omzetKemarin = omzet(kemarin);

  const ubahOmzet = omzetKemarin > 0
    ? { arah: (omzetHariIni >= omzetKemarin ? 'naik' : 'turun') as 'naik' | 'turun', teks: `${Math.round(Math.abs((omzetHariIni - omzetKemarin) / omzetKemarin) * 100)} persen dari kemarin` }
    : omzetHariIni > 0
      ? { arah: 'naik' as const, teks: 'Kemarin belum ada penjualan' }
      : undefined;

  const shiftTerbuka = shift.filter((s) => s.status === 'terbuka');
  const stokPerhatian = produk.filter((p) => p.aktif && statusStok(p) !== 'aman');
  const terlaris = produkTerlaris(hariIni, 5);
  const terbaru = [...transaksi].sort((a, b) => b.waktu.localeCompare(a.waktu)).slice(0, 6);

  return (
    <>
      <PageHeader
        judul="Beranda"
        ket={`${toko.nama} · ${tanggalPanjang(HARI_INI)}`}
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
          ubah={ubahOmzet}
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
            {terbaru.length === 0 ? (
              <p className="bantuan">Belum ada transaksi.</p>
            ) : (
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
            )}
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
        </div>
      </div>
    </>
  );
}
