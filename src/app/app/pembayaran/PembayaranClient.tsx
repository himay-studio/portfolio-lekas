'use client';

import { useMemo, useState } from 'react';
import { PENGATURAN_PAJAK, petaMeja, petaPengguna } from '@/data/operasional';
import { TRANSAKSI } from '@/data/transaksi';
import type { BarisBayar } from '@/data/types';
import { jam, rupiah } from '@/lib/format';
import { hitungTransaksi } from '@/lib/kasir';
import { IsiPembayaran } from '@/components/kasir/PanelBayar';
import { Struk } from '@/components/kasir/Struk';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, CatatanStage, Kosong } from '@/components/ui/Primitives';

/**
 * Ruang pembayaran.
 *
 * Ini bukan salinan panel pembayaran di layar Kasir, melainkan pemasangan
 * KEDUA dari komponen yang sama, `IsiPembayaran`. Layar Kasir memakainya di
 * dalam overlay untuk jalur cepat satu ketukan; halaman ini memakainya
 * berdampingan dengan pratinjau struk untuk pembayaran yang perlu diurus pelan
 * pelan: split lintas metode, koreksi nomor referensi, cetak ulang.
 *
 * Dua implementasi terpisah akan berselisih dalam sebulan, dan yang berselisih
 * di sini adalah uang.
 */
export function PembayaranClient() {
  const tagihan = useMemo(
    () => TRANSAKSI.filter((t) => t.status === 'ditahan' || t.status === 'lunas').slice(0, 6),
    [],
  );
  const [pilihId, setPilihId] = useState(tagihan[0]?.id ?? '');
  const [bayar, setBayar] = useState<BarisBayar[]>([]);

  const t = tagihan.find((x) => x.id === pilihId) ?? tagihan[0];
  if (!t) {
    return (
      <>
        <PageHeader judul="Pembayaran" ket="Selesaikan tagihan yang tertahan atau cetak ulang struk" />
        <Kosong
          judul="Tidak ada tagihan menunggu"
          ket="Tagihan yang ditahan di layar Kasir akan muncul di sini beserta rincian dan pratinjau struknya."
        />
      </>
    );
  }

  const ringkasan = hitungTransaksi(t, PENGATURAN_PAJAK);
  const kasir = petaPengguna.get(t.kasirId);
  const meja = t.mejaId ? petaMeja.get(t.mejaId) : null;

  return (
    <>
      <PageHeader
        judul="Pembayaran"
        ket="Selesaikan tagihan yang tertahan, bagi ke beberapa metode, lalu cetak strukanya"
        aksi={(
          <>
            <button type="button" className="btn btn-bayar">Selesaikan pembayaran</button>
            <button type="button" className="btn btn-sekunder">Cetak struk</button>
          </>
        )}
      />

      <div className="tab-baris" role="tablist" aria-label="Pilih tagihan">
        {tagihan.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === pilihId}
            className={`tab-btn ${x.id === pilihId ? 'tab-btn-aktif' : ''}`}
            onClick={() => {
              setPilihId(x.id);
              setBayar([]);
            }}
          >
            {x.id.replace('TRX-', '')}
          </button>
        ))}
      </div>

      <div className="kolom-2">
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <span className="stack">
                <span className="t" style={{ fontSize: 17, fontWeight: 600 }}>{t.id}</span>
                <span className="s">
                  {jam(t.waktu)} · {kasir?.nama ?? t.kasirId}
                  {meja ? ` · Meja ${meja.nama}` : ' · Bawa pulang'}
                </span>
              </span>
              <Badge tone={t.status === 'ditahan' ? 'warning' : 'success'}>
                {t.status === 'ditahan' ? 'Ditahan' : 'Lunas'}
              </Badge>
            </div>

            <div className="tbl-kartu">
              {t.baris.map((b, i) => (
                <div key={`${b.produkId}-${i}`} className="tbl-kartu-baris">
                  <span className="stack">
                    <span className="t">{b.nama}</span>
                    <span className="s">
                      {b.qty} x {rupiah(b.hargaSatuan)}
                      {b.opsi.length > 0 ? ` · ${b.opsi.map((o) => o.nama).join(', ')}` : ''}
                    </span>
                  </span>
                  <span className="tbl-kartu-nilai num">{rupiah(b.qty * b.hargaSatuan)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="kartu">
            <IsiPembayaran ringkasan={ringkasan} bayar={bayar} onBayar={setBayar} />
          </section>

          <CatatanStage>
            Menyelesaikan pembayaran di sini belum mengubah status transaksi. Stage 5 menyambungkannya
            ke penyimpanan demo di localStorage, menambah cetak ke printer termal, dan menautkan
            hasilnya ke rekap shift.
          </CatatanStage>
        </div>

        <div className="kolom-sisi">
          <h2>Pratinjau struk</h2>
          <Struk
            nomor={t.id}
            waktu={t.waktu}
            kasir={kasir?.nama ?? t.kasirId}
            meja={meja?.nama ?? null}
            baris={t.baris}
            ringkasan={ringkasan}
            pembayaran={bayar.length > 0 ? bayar : t.pembayaran}
          />
        </div>
      </div>
    </>
  );
}
