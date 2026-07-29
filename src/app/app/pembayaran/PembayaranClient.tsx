'use client';

import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { petaMeja, petaPengguna } from '@/data/operasional';
import type { BarisBayar } from '@/data/types';
import { jam, rupiah } from '@/lib/format';
import { usePajakStore, usePrinterStore, useTokoStore } from '@/lib/pengaturanStore';
import { hitung } from '@/lib/kasir';
import { useTransaksiStore } from '@/lib/transaksiStore';
import { IsiPembayaran } from '@/components/kasir/PanelBayar';
import { Struk } from '@/components/kasir/Struk';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, Kosong } from '@/components/ui/Primitives';

/**
 * Ruang pembayaran.
 *
 * Ini bukan salinan panel pembayaran di layar Kasir, melainkan pemasangan
 * KEDUA dari komponen yang sama, `IsiPembayaran`. Layar Kasir memakainya di
 * dalam overlay untuk jalur cepat satu ketukan; halaman ini memakainya
 * berdampingan dengan pratinjau struk untuk pembayaran yang perlu diurus pelan
 * pelan: split lintas metode, koreksi nomor referensi, cetak ulang.
 *
 * Menyelesaikan pembayaran di sini benar benar mengubah status transaksi lewat
 * `transaksiStore` (lapisan timpa localStorage yang sama dipakai layar
 * Kasir), sehingga tagihan yang sudah lunas di sini juga lunas di halaman
 * Transaksi dan di rekap Shift. Stok TIDAK dikurangi lagi di sini: baris demo
 * yang sudah tertahan sejak data dasar tidak pernah tercatat mengurangi stok
 * saat ditahan, jadi menguranginya baru saat lunas di sini akan menghitung
 * dua standar berbeda untuk asal usul angka stok yang sama. Pengurangan stok
 * yang konsisten hanya terjadi pada transaksi baru yang lahir dari layar
 * Kasir sendiri.
 */
export function PembayaranClient() {
  const { transaksi, selesaikanPembayaran } = useTransaksiStore();
  const { pajak } = usePajakStore();
  const { printer } = usePrinterStore();
  const { toko } = useTokoStore();

  const tagihan = useMemo(
    () => transaksi.filter((t) => t.status === 'ditahan' || t.status === 'lunas').slice(0, 8),
    [transaksi],
  );
  const [pilihId, setPilihId] = useState(tagihan[0]?.id ?? '');
  const [bayar, setBayar] = useState<BarisBayar[]>([]);
  const [barusanLunas, setBarusanLunas] = useState(false);

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

  const ringkasan = hitung(t.baris, {
    diskonTransaksi: t.diskonTransaksi,
    servicePersen: t.servicePersen,
    pajakPersen: t.pajakPersen,
    pembulatan: pajak.pembulatan,
    hargaSudahTermasukPajak: pajak.hargaSudahTermasukPajak,
  });
  const kasir = petaPengguna.get(t.kasirId);
  const meja = t.mejaId ? petaMeja.get(t.mejaId) : null;
  const dibayar = bayar.reduce((a, b) => a + b.jumlah, 0);
  const bisaSelesai = t.status === 'ditahan' && dibayar >= ringkasan.total && ringkasan.total > 0;

  function selesaikan() {
    if (!bisaSelesai) return;
    selesaikanPembayaran(t.id, bayar);
    setBayar([]);
    setBarusanLunas(true);
    setTimeout(() => setBarusanLunas(false), 2400);
  }

  return (
    <>
      <PageHeader
        judul="Pembayaran"
        ket="Selesaikan tagihan yang tertahan, bagi ke beberapa metode, lalu cetak strukanya"
        aksi={(
          <>
            <button type="button" className="btn btn-bayar" disabled={!bisaSelesai} onClick={selesaikan}>
              Selesaikan pembayaran
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => window.print()}>
              <Printer className="lucide" size={16} aria-hidden="true" />
              <span>Cetak struk</span>
            </button>
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

          {t.status === 'ditahan' ? (
            <section className="kartu">
              <IsiPembayaran ringkasan={ringkasan} bayar={bayar} onBayar={setBayar} />
            </section>
          ) : (
            <section className="kartu">
              <div className="kartu-judul">
                <h3>Sudah lunas</h3>
                {barusanLunas ? <Badge tone="success">Baru diselesaikan</Badge> : null}
              </div>
              <p className="bantuan">
                Transaksi ini sudah dibayar lunas. Gunakan tombol Cetak struk di atas untuk mencetak
                ulang, atau buka halaman Transaksi untuk rinciannya.
              </p>
            </section>
          )}
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
            kepalaStruk={printer.kepalaStruk}
            kakiStruk={printer.kakiStruk}
            namaToko={toko.nama}
            lebar={printer.lebarKertas}
          />
        </div>
      </div>
    </>
  );
}
