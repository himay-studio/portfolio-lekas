'use client';

import { PauseCircle, Percent, Trash2 } from 'lucide-react';
import { rupiah } from '@/lib/format';
import { nettoBaris, ringkasOpsi, type BarisKeranjang, type RingkasanUang } from '@/lib/kasir';
import { Badge, Kosong, Stepper } from '@/components/ui/Primitives';

/**
 * Panel keranjang.
 *
 * Komponen ini HANYA mengurus isi keranjang dan jumlah per baris. Diskon per
 * item dan diskon per transaksi sengaja tinggal di komponen lain
 * (`PanelDiskon.tsx`), dan aritmetikanya seluruhnya di `lib/kasir.ts`.
 *
 * Pemisahan itu bukan selera. Begitu ubah qty, diskon item, dan diskon
 * transaksi dicampur dalam satu komponen, urutan pajak dan service charge
 * ditentukan oleh urutan render, bukan oleh aturan. Yang terjadi kemudian
 * adalah layar Kasir dan halaman Transaksi melaporkan total berbeda untuk
 * keranjang yang sama, dan tidak ada satu pun yang jelas salah.
 */
export function Keranjang({
  baris,
  ringkasan,
  namaMeja,
  onQty,
  onHapus,
  onDiskonItem,
  onDiskonTransaksi,
  onTahan,
  onBayar,
  onKosongkan,
  lembar = false,
  diskonTrxDiizinkan = true,
}: {
  baris: BarisKeranjang[];
  ringkasan: RingkasanUang;
  namaMeja: string | null;
  onQty: (key: string, qty: number) => void;
  onHapus: (key: string) => void;
  onDiskonItem: (key: string) => void;
  onDiskonTransaksi: () => void;
  onTahan: () => void;
  onBayar: () => void;
  onKosongkan: () => void;
  /** Bentuk lembar bawah untuk mobile. Isinya sama persis, hanya kotaknya beda. */
  lembar?: boolean;
  /** R42/HAK_AKSES: peran kasir tidak boleh memberi diskon transaksi, hanya diskon item. */
  diskonTrxDiizinkan?: boolean;
}) {
  const kosong = baris.length === 0;

  return (
    <aside className={`keranjang ${lembar ? 'keranjang-lembar' : ''}`} aria-label="Keranjang">
      <div className="krj-kepala">
        <span className="stack">
          <span className="t">Keranjang</span>
          <span className="s">
            {kosong ? 'Belum ada item' : `${ringkasan.jumlahItem} item, ${ringkasan.jumlahBaris} baris`}
          </span>
        </span>
        {namaMeja ? <Badge tone="info">Meja {namaMeja}</Badge> : null}
      </div>

      <div className="krj-daftar">
        {kosong ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <Kosong
              judul="Keranjang masih kosong"
              ket="Ketuk ubin produk di sebelah kiri, atau pindai barcode lewat kolom pencarian."
            />
          </div>
        ) : (
          baris.map((b) => {
            const opsi = ringkasOpsi(b.opsi);
            return (
              <div key={b.key} className="krj-baris">
                <div className="krj-baris-atas">
                  <span className="stack">
                    <span className="t">{b.nama}</span>
                    {/* Opsi varian dan harga satuan adalah blok sekunder
                        tersendiri, tidak pernah menempel di judul (R50). */}
                    <span className="s">
                      {opsi ? `${opsi} · ${rupiah(b.hargaSatuan)}` : rupiah(b.hargaSatuan)}
                    </span>
                  </span>
                  <span className="num" style={{ whiteSpace: 'nowrap' }}>{rupiah(nettoBaris(b))}</span>
                </div>

                {b.diskonItem ? (
                  <Badge tone="brand">
                    Diskon {b.diskonItem.tipe === 'persen' ? `${b.diskonItem.nilai}%` : rupiah(b.diskonItem.nilai)}
                  </Badge>
                ) : null}

                <div className="krj-baris-bawah">
                  <Stepper
                    nilai={b.qty}
                    onUbah={(n) => onQty(b.key, n)}
                    label={`jumlah ${b.nama}`}
                  />
                  <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                    <button
                      type="button"
                      className="btn btn-sekunder btn-sm btn-ikon"
                      style={{ width: 32, height: 32 }}
                      aria-label={`Diskon untuk ${b.nama}`}
                      onClick={() => onDiskonItem(b.key)}
                    >
                      <Percent className="lucide" size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sekunder btn-sm btn-ikon"
                      style={{ width: 32, height: 32 }}
                      aria-label={`Hapus ${b.nama} dari keranjang`}
                      onClick={() => onHapus(b.key)}
                    >
                      <Trash2 className="lucide" size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="krj-kaki">
        <RingkasanUangBaris ringkasan={ringkasan} />

        <div className="krj-total">
          <span className="krj-total-label">Total</span>
          <span className="krj-total-nilai">{rupiah(ringkasan.total)}</span>
        </div>

        <div className="krj-aksi">
          <div className="krj-aksi-baris">
            <button
              type="button"
              className="btn btn-sekunder"
              onClick={onDiskonTransaksi}
              disabled={kosong || !diskonTrxDiizinkan}
              title={diskonTrxDiizinkan ? undefined : 'Peran kasir tidak memiliki hak memberi diskon transaksi'}
            >
              <Percent className="lucide" size={16} aria-hidden="true" />
              <span>Diskon</span>
            </button>
            <button type="button" className="btn btn-sekunder" onClick={onTahan} disabled={kosong}>
              <PauseCircle className="lucide" size={16} aria-hidden="true" />
              <span>Tahan</span>
            </button>
          </div>
          {/* Tombol Bayar selalu terlihat tanpa perlu menggulir, karena kaki
              keranjang berada di luar wilayah gulir daftar item. */}
          <button type="button" className="btn btn-bayar btn-lg btn-blok" onClick={onBayar} disabled={kosong}>
            Bayar {kosong ? '' : rupiah(ringkasan.total)}
          </button>
          <button type="button" className="btn btn-halus btn-sm" onClick={onKosongkan} disabled={kosong}>
            Kosongkan keranjang
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Rincian di atas total. Dipakai keranjang dan panel pembayaran. */
export function RingkasanUangBaris({ ringkasan }: { ringkasan: RingkasanUang }) {
  return (
    <div className="krj-ringkas">
      <div className="krj-ringkas-baris">
        <span>Subtotal</span>
        <span className="num">{rupiah(ringkasan.brutoItem)}</span>
      </div>
      {ringkasan.diskonItem > 0 ? (
        <div className="krj-ringkas-baris">
          <span>Diskon item</span>
          <span className="num negatif">-{rupiah(ringkasan.diskonItem)}</span>
        </div>
      ) : null}
      {ringkasan.diskonTransaksi > 0 ? (
        <div className="krj-ringkas-baris">
          <span>Diskon transaksi</span>
          <span className="num negatif">-{rupiah(ringkasan.diskonTransaksi)}</span>
        </div>
      ) : null}
      {ringkasan.service > 0 ? (
        <div className="krj-ringkas-baris">
          <span>Service charge</span>
          <span className="num">{rupiah(ringkasan.service)}</span>
        </div>
      ) : null}
      {ringkasan.pajak > 0 ? (
        <div className="krj-ringkas-baris">
          <span>Pajak</span>
          <span className="num">{rupiah(ringkasan.pajak)}</span>
        </div>
      ) : null}
      {ringkasan.pembulatan !== 0 ? (
        <div className="krj-ringkas-baris">
          <span>Pembulatan</span>
          <span className="num">{rupiah(ringkasan.pembulatan)}</span>
        </div>
      ) : null}
    </div>
  );
}
