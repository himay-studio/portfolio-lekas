import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PENGATURAN_PAJAK, petaPengguna } from '@/data/operasional';
import { SHIFT, TRANSAKSI } from '@/data/transaksi';
import { durasi, jam, rupiah, tanggalPanjang } from '@/lib/format';
import { hitungTransaksi } from '@/lib/kasir';
import { selisihKas } from '@/lib/adapters';
import { PageHeader } from '@/components/shell/PageHeader';
import { Avatar, Badge, CatatanStage, Kpi } from '@/components/ui/Primitives';

export function generateStaticParams() {
  return SHIFT.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id}, Lekas` };
}

export default async function DetailShift({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = SHIFT.find((x) => x.id === id);
  if (!s) notFound();

  const kasir = petaPengguna.get(s.kasirId);
  const selisih = selisihKas(s);
  const trx = TRANSAKSI.filter((t) => t.shiftId === s.id);

  return (
    <>
      <PageHeader
        judul={`Shift ${kasir?.nama ?? s.kasirId}`}
        ket={`${tanggalPanjang(s.buka)} · ${jam(s.buka)}${s.tutup ? ` sampai ${jam(s.tutup)}` : ' sampai sekarang'}`}
        remah={[{ label: 'Shift Kasir', href: '/app/shift/' }, { label: s.id }]}
        aksi={s.status === 'terbuka'
          ? <button type="button" className="btn">Tutup shift ini</button>
          : <button type="button" className="btn btn-sekunder">Cetak rekap shift</button>}
      />

      <div className="kpi-grid" style={{ marginBottom: 'var(--sp-5)' }}>
        <Kpi label="Penjualan tunai" nilai={rupiah(s.penjualanTunai)} />
        <Kpi label="Penjualan non tunai" nilai={rupiah(s.penjualanNonTunai)} />
        <Kpi label="Transaksi" nilai={String(s.jumlahTransaksi)} />
        <Kpi
          label="Selisih kas"
          nilai={selisih === null ? 'Belum ditutup' : rupiah(selisih)}
          ket={selisih === null
            ? 'Shift masih berjalan'
            : selisih === 0 ? 'Kas fisik sama dengan kas sistem' : 'Perlu penjelasan kasir'}
        />
      </div>

      <div className="kolom-2">
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Perhitungan kas</h2>
              {s.status === 'terbuka'
                ? <Badge tone="warning">Shift terbuka</Badge>
                : <Badge tone={selisih === 0 ? 'success' : 'danger'}>{selisih === 0 ? 'Kas pas' : 'Ada selisih'}</Badge>}
            </div>
            <dl className="def">
              <div className="def-baris"><dt>Kas awal</dt><dd className="num">{rupiah(s.kasAwal)}</dd></div>
              <div className="def-baris"><dt>Penjualan tunai</dt><dd className="num">{rupiah(s.penjualanTunai)}</dd></div>
              <div className="def-baris"><dt>Kas menurut sistem</dt><dd className="num">{rupiah(s.kasSistem)}</dd></div>
              <div className="def-baris">
                <dt>Kas fisik yang dihitung</dt>
                <dd className="num">{s.kasFisik === null ? 'Belum dihitung' : rupiah(s.kasFisik)}</dd>
              </div>
              <div className="def-baris">
                <dt>Selisih</dt>
                <dd className={`num-besar ${selisih !== null && selisih < 0 ? 'negatif' : ''}`} style={{ fontSize: 24, lineHeight: '30px' }}>
                  {selisih === null ? 'Belum ditutup' : rupiah(selisih)}
                </dd>
              </div>
            </dl>
            {s.catatan ? <p className="bantuan" style={{ marginTop: 'var(--sp-3)' }}>{s.catatan}</p> : null}
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Transaksi pada shift ini</h2>
              <Link className="btn btn-halus btn-sm" href="/app/transaksi/">Buka daftar transaksi</Link>
            </div>
            {trx.length === 0 ? (
              <p className="bantuan">
                Data demo belum memuat rincian transaksi untuk shift ini. Angka rekap di atas tetap
                berasal dari catatan shift.
              </p>
            ) : (
              <div className="tbl-kartu">
                {trx.map((t) => (
                  <Link key={t.id} href={`/app/transaksi/${t.id}/`} className="tbl-kartu-item">
                    <div className="item-kartu-atas">
                      <span className="stack">
                        <span className="t">{t.id}</span>
                        <span className="s">{jam(t.waktu)} · {t.baris.length} baris</span>
                      </span>
                      <span className="num">{rupiah(hitungTransaksi(t, PENGATURAN_PAJAK).total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <CatatanStage>
            Penghitung pecahan uang saat tutup shift belum ada. Stage 5 menambahkannya supaya
            selisih kas datang dari jumlah lembar dan koin, bukan dari satu angka yang diketik.
          </CatatanStage>
        </div>

        <div className="kolom-sisi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Kasir</h2>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
              <Avatar inisial={kasir?.inisial ?? '??'} warna={kasir?.warna ?? 1} ukuran="lg" nama={kasir?.nama} />
              <span className="stack">
                <span className="t">{kasir?.nama ?? s.kasirId}</span>
                <span className="s">{kasir?.email ?? ''}</span>
              </span>
            </div>
            <dl className="def" style={{ marginTop: 'var(--sp-4)' }}>
              <div className="def-baris"><dt>Kode shift</dt><dd className="mono">{s.id}</dd></div>
              <div className="def-baris"><dt>Durasi</dt><dd>{s.tutup ? durasi(s.buka, s.tutup) : 'Masih berjalan'}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
