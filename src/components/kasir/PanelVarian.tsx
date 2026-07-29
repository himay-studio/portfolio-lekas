'use client';

import { useEffect, useState } from 'react';
import type { OpsiTerpilih, Produk } from '@/data/types';
import { rupiah } from '@/lib/format';
import { opsiBawaan } from '@/lib/kasir';
import { Overlay } from '@/components/ui/Overlay';
import { Cek, Stepper } from '@/components/ui/Primitives';

/**
 * Pemilih varian.
 *
 * R42 dalam bentuk yang terlihat pengguna: ukuran, topping, dan warna dipilih
 * DI SINI, pada satu produk, lalu masuk keranjang sebagai satu baris. Panel ini
 * tidak pernah membawa pengguna ke produk lain, karena varian memang bukan
 * produk lain. Halaman detail produk memakai aturan yang sama: memilih warna
 * menukar varian di tempat, tidak berpindah slug.
 */
export function PanelVarian({
  produk,
  onTutup,
  onTambah,
}: {
  produk: Produk | null;
  onTutup: () => void;
  onTambah: (p: Produk, opsi: OpsiTerpilih[], qty: number) => void;
}) {
  const [pilih, setPilih] = useState<OpsiTerpilih[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!produk) return;
    setPilih(opsiBawaan(produk));
    setQty(1);
  }, [produk]);

  if (!produk) return null;

  const harga = produk.hargaDasar + pilih.reduce((a, o) => a + o.delta, 0);

  function setTunggal(dimensiId: string, opsiId: string, nama: string, delta: number) {
    setPilih((p) => [...p.filter((o) => o.dimensiId !== dimensiId), { dimensiId, opsiId, nama, delta }]);
  }

  function toggleGanda(dimensiId: string, opsiId: string, nama: string, delta: number, aktif: boolean) {
    setPilih((p) => (aktif
      ? [...p, { dimensiId, opsiId, nama, delta }]
      : p.filter((o) => !(o.dimensiId === dimensiId && o.opsiId === opsiId))));
  }

  const belumLengkap = produk.dimensi
    .filter((d) => d.wajib)
    .some((d) => !pilih.some((o) => o.dimensiId === d.id));

  return (
    <Overlay
      buka
      onTutup={onTutup}
      judul={produk.nama}
      ket={`${produk.sku} · ${rupiah(produk.hargaDasar)} per ${produk.satuan}`}
      kaki={(
        <>
          <button
            type="button"
            className="btn"
            disabled={belumLengkap}
            onClick={() => {
              onTambah(produk, pilih, qty);
              onTutup();
            }}
          >
            Tambah {rupiah(harga * qty)}
          </button>
          <button type="button" className="btn btn-sekunder" onClick={onTutup}>
            Batal
          </button>
        </>
      )}
    >
      <div className="form-grid">
        {produk.dimensi.map((d) => (
          <fieldset key={d.id} className="bidang" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="bantuan" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>
              {d.nama}
              {d.wajib ? '' : ' (opsional)'}
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
                          {o.deltaHarga !== 0 ? <span className="s">{o.deltaHarga > 0 ? '+' : ''}{rupiah(o.deltaHarga)}</span> : null}
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
                      {o.deltaHarga !== 0 ? (
                        <span className="s" style={{ color: 'inherit' }}>
                          {o.deltaHarga > 0 ? '+' : ''}{rupiah(o.deltaHarga)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="tbl-kartu-baris">
          <span className="tbl-kartu-label">Jumlah</span>
          <Stepper nilai={qty} onUbah={setQty} label={`jumlah ${produk.nama}`} />
        </div>

        <div className="tbl-kartu-baris">
          <span className="tbl-kartu-label">Harga satuan setelah varian</span>
          <span className="tbl-kartu-nilai num">{rupiah(harga)}</span>
        </div>
      </div>
    </Overlay>
  );
}
