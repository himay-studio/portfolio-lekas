import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PENGATURAN_PAJAK, petaMeja, petaPengguna } from '@/data/operasional';
import { LABEL_STATUS_TRANSAKSI, TRANSAKSI } from '@/data/transaksi';
import { jam, rupiah, tanggalPanjang } from '@/lib/format';
import { LABEL_METODE, hitungTransaksi, nettoBaris, totalDibayar } from '@/lib/kasir';
import { Struk } from '@/components/kasir/Struk';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, CatatanStage } from '@/components/ui/Primitives';
import type { Tone } from '@/data/types';

export function generateStaticParams() {
  return TRANSAKSI.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id}, Lekas` };
}

const TONE: Record<string, Tone> = {
  lunas: 'success',
  ditahan: 'warning',
  void: 'danger',
  refund: 'danger',
};

export default async function DetailTransaksi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TRANSAKSI.find((x) => x.id === id);
  if (!t) notFound();

  const ringkasan = hitungTransaksi(t, PENGATURAN_PAJAK);
  const kasir = petaPengguna.get(t.kasirId);
  const meja = t.mejaId ? petaMeja.get(t.mejaId) : null;
  const dibayar = totalDibayar(t);

  return (
    <>
      <PageHeader
        judul={t.id}
        ket={`${tanggalPanjang(t.waktu)} pukul ${jam(t.waktu)} · ${kasir?.nama ?? t.kasirId}`}
        remah={[{ label: 'Transaksi', href: '/app/transaksi/' }, { label: t.id }]}
        aksi={(
          <>
            <button type="button" className="btn btn-sekunder">Cetak ulang struk</button>
            {t.status === 'lunas' ? (
              <button type="button" className="btn btn-rusak">Refund transaksi</button>
            ) : null}
          </>
        )}
      />

      <div className="kolom-2">
        <div className="seksi">
          {t.alasanStatus ? (
            <div className="catatan-stage" style={{ background: 'var(--danger-soft)', color: 'var(--danger-ink)' }}>
              <b>{LABEL_STATUS_TRANSAKSI[t.status]}.</b>
              <span>{t.alasanStatus}</span>
            </div>
          ) : null}

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Rincian belanja</h2>
              <Badge tone={TONE[t.status]}>{LABEL_STATUS_TRANSAKSI[t.status]}</Badge>
            </div>
            <div className="tbl-kartu">
              {t.baris.map((b, i) => (
                <div key={`${b.produkId}-${i}`} className="tbl-kartu-item">
                  <div className="item-kartu-atas">
                    <span className="stack">
                      <span className="t">{b.nama}</span>
                      <span className="s">
                        {b.sku}
                        {b.opsi.length > 0 ? ` · ${b.opsi.map((o) => o.nama).join(', ')}` : ''}
                      </span>
                    </span>
                    <span className="num">{rupiah(nettoBaris(b))}</span>
                  </div>
                  <div className="tbl-kartu-baris">
                    <span className="tbl-kartu-label">{b.qty} x {rupiah(b.hargaSatuan)}</span>
                    {b.diskonItem ? (
                      <span className="tbl-kartu-nilai">
                        <Badge tone="brand">
                          Diskon {b.diskonItem.tipe === 'persen' ? `${b.diskonItem.nilai}%` : rupiah(b.diskonItem.nilai)}
                        </Badge>
                      </span>
                    ) : <span className="tbl-kartu-nilai num">{rupiah(b.qty * b.hargaSatuan)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Perhitungan</h2>
            </div>
            <dl className="def">
              <div className="def-baris"><dt>Subtotal item</dt><dd className="num">{rupiah(ringkasan.brutoItem)}</dd></div>
              <div className="def-baris"><dt>Diskon item</dt><dd className="num">{ringkasan.diskonItem > 0 ? `-${rupiah(ringkasan.diskonItem)}` : rupiah(0)}</dd></div>
              <div className="def-baris">
                <dt>Diskon transaksi{t.diskonTransaksi?.alasan ? `, ${t.diskonTransaksi.alasan}` : ''}</dt>
                <dd className="num">{ringkasan.diskonTransaksi > 0 ? `-${rupiah(ringkasan.diskonTransaksi)}` : rupiah(0)}</dd>
              </div>
              <div className="def-baris"><dt>Dasar kena pajak</dt><dd className="num">{rupiah(ringkasan.dasarKena)}</dd></div>
              <div className="def-baris"><dt>Service charge {t.servicePersen} persen</dt><dd className="num">{rupiah(ringkasan.service)}</dd></div>
              <div className="def-baris"><dt>Pajak {t.pajakPersen} persen</dt><dd className="num">{rupiah(ringkasan.pajak)}</dd></div>
              <div className="def-baris"><dt>Pembulatan</dt><dd className="num">{rupiah(ringkasan.pembulatan)}</dd></div>
              <div className="def-baris"><dt>Total</dt><dd className="num-besar" style={{ fontSize: 24, lineHeight: '30px' }}>{rupiah(ringkasan.total)}</dd></div>
            </dl>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Pembayaran</h2>
            </div>
            {t.pembayaran.length === 0 ? (
              <p className="bantuan">Transaksi ini belum dibayar.</p>
            ) : (
              <dl className="def">
                {t.pembayaran.map((p, i) => (
                  <div key={`${p.metode}-${i}`} className="def-baris">
                    <dt>{LABEL_METODE[p.metode]}{p.referensi ? `, referensi ${p.referensi}` : ''}</dt>
                    <dd className="num">{rupiah(p.jumlah)}</dd>
                  </div>
                ))}
                <div className="def-baris"><dt>Total dibayar</dt><dd className="num">{rupiah(dibayar)}</dd></div>
                {dibayar > ringkasan.total ? (
                  <div className="def-baris"><dt>Kembalian</dt><dd className="num">{rupiah(dibayar - ringkasan.total)}</dd></div>
                ) : null}
              </dl>
            )}
          </section>

          <CatatanStage>
            Tombol refund dan cetak ulang masih kerangka. Stage 5 menyambungkannya ke penyimpanan
            demo, menambah form alasan wajib, dan menautkan hasilnya ke rekap shift.
          </CatatanStage>
        </div>

        <div className="kolom-sisi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Informasi</h2>
            </div>
            <dl className="def">
              <div className="def-baris"><dt>Kasir</dt><dd>{kasir?.nama ?? t.kasirId}</dd></div>
              <div className="def-baris"><dt>Shift</dt><dd className="mono">{t.shiftId}</dd></div>
              <div className="def-baris"><dt>Meja</dt><dd>{meja ? `Meja ${meja.nama}, ${meja.area}` : 'Bawa pulang'}</dd></div>
              <div className="def-baris"><dt>Tipe</dt><dd>{t.tipe === 'fnb' ? 'Kedai F&B' : 'Retail'}</dd></div>
              {t.catatan ? <div className="def-baris"><dt>Catatan</dt><dd>{t.catatan}</dd></div> : null}
            </dl>
          </section>

          <h2>Struk</h2>
          <Struk
            nomor={t.id}
            waktu={t.waktu}
            kasir={kasir?.nama ?? t.kasirId}
            meja={meja?.nama ?? null}
            baris={t.baris}
            ringkasan={ringkasan}
            pembayaran={t.pembayaran}
          />
        </div>
      </div>
    </>
  );
}
