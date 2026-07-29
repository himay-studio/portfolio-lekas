'use client';

import { useState } from 'react';
import { petaKategori, rentangHarga, statusStok } from '@/data/katalog';
import type { OpsiTerpilih, Produk } from '@/data/types';
import { rupiah } from '@/lib/format';
import { opsiBawaan, ringkasOpsi } from '@/lib/kasir';
import { inisialProduk, warnaProduk } from '@/components/kasir/ubin';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, CatatanStage, Cek } from '@/components/ui/Primitives';

const TONE = { aman: 'success', menipis: 'warning', habis: 'danger' } as const;
const LABEL = { aman: 'Stok aman', menipis: 'Stok menipis', habis: 'Stok habis' } as const;

/**
 * Halaman detail produk.
 *
 * Inilah tempat R42 paling mudah dilanggar. Memilih warna atau ukuran di sini
 * MENUKAR VARIAN DI TEMPAT: harga, SKU, dan stok berubah, nama produknya tidak,
 * dan alamat halamannya tidak berpindah. Katalog yang menjadikan tiap warna
 * sebagai produk sendiri akan membuat pemilih warna melompat ke slug lain, dan
 * gejalanya terlihat sebagai "filter warna mengganti nama produk".
 */
export function DetailProduk({ produk }: { produk: Produk }) {
  const [pilih, setPilih] = useState<OpsiTerpilih[]>(() => opsiBawaan(produk));
  const s = statusStok(produk);
  const kategori = petaKategori.get(produk.kategoriId);
  const r = rentangHarga(produk);
  const hargaVarian = produk.hargaDasar + pilih.reduce((a, o) => a + o.delta, 0);

  // Stok varian, kalau dimensi yang dipilih memang punya stok sendiri.
  const stokVarian = produk.dimensi
    .flatMap((d) => d.opsi.filter((o) => pilih.some((p) => p.dimensiId === d.id && p.opsiId === o.id)))
    .map((o) => o.stok)
    .filter((x): x is number => x !== null);

  function setTunggal(dimensiId: string, opsiId: string, nama: string, delta: number) {
    setPilih((p) => [...p.filter((o) => o.dimensiId !== dimensiId), { dimensiId, opsiId, nama, delta }]);
  }

  function toggleGanda(dimensiId: string, opsiId: string, nama: string, delta: number, aktif: boolean) {
    setPilih((p) => (aktif
      ? [...p, { dimensiId, opsiId, nama, delta }]
      : p.filter((o) => !(o.dimensiId === dimensiId && o.opsiId === opsiId))));
  }

  return (
    <>
      <PageHeader
        judul={produk.nama}
        ket={`${kategori?.nama ?? ''} · ${produk.satuan}`}
        remah={[
          { label: 'Produk', href: '/app/produk/' },
          { label: produk.nama },
        ]}
        aksi={(
          <>
            <button type="button" className="btn">Ubah produk</button>
            <button type="button" className="btn btn-sekunder">Sesuaikan stok</button>
          </>
        )}
      />

      <div className="kolom-2">
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Varian</h2>
              <Badge tone={TONE[s]}>{LABEL[s]}</Badge>
            </div>

            {produk.dimensi.length === 0 ? (
              <p className="bantuan">
                Produk ini tidak punya dimensi varian. Harga dan stoknya tunggal.
              </p>
            ) : (
              <div className="form-grid">
                {produk.dimensi.map((d) => (
                  <fieldset key={d.id} className="bidang" style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend
                      className="bantuan"
                      style={{ marginBottom: 6, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}
                    >
                      {d.nama}
                      {d.wajib ? '' : ' (opsional)'}
                      {d.ganda ? ', boleh lebih dari satu' : ''}
                    </legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                      {d.opsi.map((o) => {
                        const aktif = pilih.some((x) => x.dimensiId === d.id && x.opsiId === o.id);
                        if (d.ganda) {
                          return (
                            <span key={o.id} style={{ border: '1px solid var(--control-border)', padding: '8px 12px' }}>
                              <Cek nilai={aktif} onUbah={(n) => toggleGanda(d.id, o.id, o.nama, o.deltaHarga, n)}>
                                <span className="stack">
                                  <span className="t">{o.nama}</span>
                                  {o.deltaHarga !== 0 ? (
                                    <span className="s">{o.deltaHarga > 0 ? '+' : ''}{rupiah(o.deltaHarga)}</span>
                                  ) : null}
                                </span>
                              </Cek>
                            </span>
                          );
                        }
                        return (
                          <button
                            key={o.id}
                            type="button"
                            className={`btn ${aktif ? '' : 'btn-sekunder'}`}
                            style={{ height: 'auto', paddingTop: 8, paddingBottom: 8 }}
                            aria-pressed={aktif}
                            onClick={() => setTunggal(d.id, o.id, o.nama, o.deltaHarga)}
                          >
                            <span className="stack" style={{ alignItems: 'flex-start' }}>
                              <span className="t" style={{ color: 'inherit' }}>{o.nama}</span>
                              <span className="s" style={{ color: 'inherit' }}>
                                {o.deltaHarga === 0 ? 'Harga dasar' : `${o.deltaHarga > 0 ? '+' : ''}${rupiah(o.deltaHarga)}`}
                                {o.stok !== null ? `, stok ${o.stok}` : ''}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Rincian</h2>
            </div>
            <dl className="def">
              <div className="def-baris"><dt>SKU</dt><dd className="mono">{produk.sku}</dd></div>
              <div className="def-baris"><dt>Barcode</dt><dd className="mono">{produk.barcode}</dd></div>
              <div className="def-baris"><dt>Harga dasar</dt><dd className="num">{rupiah(produk.hargaDasar)}</dd></div>
              <div className="def-baris"><dt>Harga modal</dt><dd className="num">{rupiah(produk.hargaModal)}</dd></div>
              <div className="def-baris">
                <dt>Rentang harga setelah varian</dt>
                <dd className="num">{r.min === r.maks ? rupiah(r.min) : `${rupiah(r.min)} sampai ${rupiah(r.maks)}`}</dd>
              </div>
              <div className="def-baris"><dt>Stok</dt><dd className="num">{produk.stok} {produk.satuan}</dd></div>
              <div className="def-baris"><dt>Stok minimum</dt><dd className="num">{produk.stokMinimum} {produk.satuan}</dd></div>
              <div className="def-baris"><dt>Keterangan</dt><dd>{produk.deskripsi}</dd></div>
            </dl>
          </section>

          <CatatanStage>
            Riwayat pergerakan stok, kartu produk terkait, dan pengelola dimensi varian belum ada.
            Stage 5 menambahkannya beserta form ubah produk.
          </CatatanStage>
        </div>

        <div className="kolom-sisi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Varian terpilih</h2>
            </div>
            <div style={{ display: 'grid', gap: 'var(--sp-3)', justifyItems: 'start' }}>
              <span
                className={`ubin-muka ubin-muka-${warnaProduk(produk)}`}
                style={{ width: 96, height: 96, aspectRatio: 'auto' }}
                aria-hidden="true"
              >
                {inisialProduk(produk.nama)}
              </span>
              <span className="stack">
                {/* Nama produk TIDAK berubah saat varian ditukar. Yang berubah
                    hanya harga, stok, dan label varian di bawahnya (R42). */}
                <span className="t" style={{ fontSize: 17, fontWeight: 600 }}>{produk.nama}</span>
                <span className="s">{pilih.length > 0 ? ringkasOpsi(pilih) : 'Tanpa varian'}</span>
              </span>
              <span className="num-besar" style={{ fontSize: 30, lineHeight: '36px' }}>{rupiah(hargaVarian)}</span>
              {stokVarian.length > 0 ? (
                <span className="bantuan">Stok varian ini {Math.min(...stokVarian)} {produk.satuan}</span>
              ) : null}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Ubin di layar Kasir</h2>
            </div>
            <p className="bantuan">
              Ubin memakai inisial di atas warna kategori, bukan foto. Toko sungguhan jarang punya
              foto untuk setiap SKU, jadi ini bentuk yang jujur dan bukan placeholder yang menunggu
              diganti. Keputusan lengkapnya ada di MEDIA.md.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
