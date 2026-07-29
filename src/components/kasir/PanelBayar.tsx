'use client';

import { Plus, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BarisBayar, MetodeBayar } from '@/data/types';
import { rupiah } from '@/lib/format';
import {
  LABEL_METODE,
  PECAHAN_CEPAT,
  kembalian,
  kurangBayar,
  pembulatanCepat,
  type BarisKeranjang,
  type RingkasanUang,
} from '@/lib/kasir';
import { Badge } from '@/components/ui/Primitives';
import { Overlay } from '@/components/ui/Overlay';
import { Select } from '@/components/ui/Select';
import { RingkasanUangBaris } from './Keranjang';
import { Struk } from './Struk';

const OPSI_METODE = (Object.keys(LABEL_METODE) as MetodeBayar[]).map((m) => ({
  nilai: m,
  label: LABEL_METODE[m],
}));

/**
 * Isi pembayaran, dipakai di DUA tempat.
 *
 * Di layar Kasir dia dibungkus overlay supaya jalur cepat tetap satu ketukan
 * dari tombol Bayar. Di `/app/pembayaran` dia dirender langsung di halaman
 * dengan pratinjau struk di sebelahnya, untuk pembayaran yang perlu diurus
 * pelan pelan: split lintas metode, koreksi nomor referensi, cetak ulang.
 *
 * Satu komponen dua tempat pasang, bukan dua implementasi. Dua implementasi
 * akan berselisih dalam sebulan, dan yang berselisih di sini adalah uang.
 */
export function IsiPembayaran({
  ringkasan,
  bayar,
  onBayar,
  padat = false,
}: {
  ringkasan: RingkasanUang;
  bayar: BarisBayar[];
  onBayar: (b: BarisBayar[]) => void;
  padat?: boolean;
}) {
  const dibayar = bayar.reduce((a, b) => a + b.jumlah, 0);
  const kurang = kurangBayar(dibayar, ringkasan.total);
  const kembali = kembalian(dibayar, ringkasan.total);
  const adaTunai = bayar.some((b) => b.metode === 'tunai');

  function ubah(i: number, patch: Partial<BarisBayar>) {
    onBayar(bayar.map((b, n) => (n === i ? { ...b, ...patch } : b)));
  }

  function tambah(metode: MetodeBayar, jumlah: number) {
    onBayar([...bayar, { metode, jumlah }]);
  }

  return (
    <div className="form-grid">
      <div className="krj-total">
        <span className="krj-total-label">Total tagihan</span>
        <span className="krj-total-nilai">{rupiah(ringkasan.total)}</span>
      </div>

      {padat ? null : <RingkasanUangBaris ringkasan={ringkasan} />}

      <div className="seksi">
        <h3>Pecahan cepat</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          <button
            type="button"
            className="btn btn-sekunder"
            onClick={() => onBayar([{ metode: 'tunai', jumlah: ringkasan.total }])}
          >
            Uang pas
          </button>
          {pembulatanCepat(ringkasan.total).map((n) => (
            <button key={n} type="button" className="btn btn-sekunder" onClick={() => tambah('tunai', n)}>
              {rupiah(n)}
            </button>
          ))}
          {PECAHAN_CEPAT.map((n) => (
            <button key={`p-${n}`} type="button" className="btn btn-sekunder btn-sm" onClick={() => tambah('tunai', n)}>
              +{rupiah(n)}
            </button>
          ))}
        </div>
      </div>

      <div className="seksi">
        <div className="kartu-judul">
          <h3>Rincian pembayaran</h3>
          <button
            type="button"
            className="btn btn-sekunder btn-sm"
            onClick={() => tambah('qris', Math.max(0, kurang))}
          >
            <Plus className="lucide" size={16} aria-hidden="true" />
            <span>Tambah metode</span>
          </button>
        </div>

        {bayar.length === 0 ? (
          <p className="bantuan">
            Belum ada pembayaran. Pakai pecahan cepat di atas, atau tambah metode untuk membagi tagihan.
          </p>
        ) : (
          <div className="form-grid">
            {bayar.map((b, i) => (
              <div key={`${b.metode}-${i}`} className="kartu" style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                <div className="form-grid form-grid-2">
                  <div className="bidang">
                    <label htmlFor={`metode-${i}`}>Metode</label>
                    <Select
                      id={`metode-${i}`}
                      label={`Metode pembayaran baris ${i + 1}`}
                      nilai={b.metode}
                      opsi={OPSI_METODE}
                      onUbah={(n) => ubah(i, { metode: n as MetodeBayar })}
                      lebarPenuh
                    />
                  </div>
                  <div className="bidang">
                    <label htmlFor={`jumlah-${i}`}>Jumlah</label>
                    <input
                      id={`jumlah-${i}`}
                      className="input input-num"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={b.jumlah}
                      onChange={(e) => ubah(i, { jumlah: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                {b.metode !== 'tunai' ? (
                  <div className="bidang">
                    <label htmlFor={`ref-${i}`}>Nomor referensi</label>
                    <input
                      id={`ref-${i}`}
                      className="input"
                      value={b.referensi ?? ''}
                      onChange={(e) => ubah(i, { referensi: e.target.value })}
                      placeholder="4 digit terakhir kartu atau nomor QRIS"
                    />
                  </div>
                ) : null}
                <div>
                  <button
                    type="button"
                    className="btn btn-sekunder btn-sm"
                    onClick={() => onBayar(bayar.filter((_, n) => n !== i))}
                  >
                    <Trash2 className="lucide" size={16} aria-hidden="true" />
                    <span>Hapus baris</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="kartu" style={{ display: 'grid', gap: 'var(--sp-2)' }}>
        <div className="tbl-kartu-baris">
          <span className="tbl-kartu-label">Dibayar</span>
          <span className="tbl-kartu-nilai num">{rupiah(dibayar)}</span>
        </div>
        {kurang > 0 ? (
          <div className="tbl-kartu-baris">
            <span className="tbl-kartu-label">Kurang</span>
            <span className="tbl-kartu-nilai num negatif">{rupiah(kurang)}</span>
          </div>
        ) : (
          <div className="tbl-kartu-baris">
            <span className="tbl-kartu-label">Kembalian</span>
            <span className="tbl-kartu-nilai num-besar" style={{ fontSize: 24, lineHeight: '30px' }}>
              {rupiah(kembali)}
            </span>
          </div>
        )}
        {kembali > 0 && !adaTunai ? (
          // Kelebihan bayar pada kartu atau QRIS tidak mungkin terjadi di dunia
          // nyata, jadi kalau angkanya muncul, itu tanda datanya salah, bukan
          // tanda kasir harus mengembalikan uang.
          <Badge tone="warning">Kelebihan bayar non tunai, periksa lagi rinciannya</Badge>
        ) : null}
      </div>
    </div>
  );
}

/** Pembungkus overlay untuk jalur cepat di layar Kasir. */
export function PanelBayar({
  buka,
  onTutup,
  onSelesai,
  ringkasan,
  bayar,
  onBayar,
  baris,
  nomor,
  kasir,
  meja,
}: {
  buka: boolean;
  onTutup: () => void;
  onSelesai: () => void;
  ringkasan: RingkasanUang;
  bayar: BarisBayar[];
  onBayar: (b: BarisBayar[]) => void;
  baris: BarisKeranjang[];
  nomor: string;
  kasir: string;
  meja: string | null;
}) {
  const [lihatStruk, setLihatStruk] = useState(false);
  const dibayar = bayar.reduce((a, b) => a + b.jumlah, 0);
  const cukup = dibayar >= ringkasan.total && ringkasan.total > 0;

  return (
    <Overlay
      buka={buka}
      onTutup={onTutup}
      judul="Pembayaran"
      ket={`${ringkasan.jumlahItem} item, ${rupiah(ringkasan.total)}`}
      lebar
      kaki={(
        <>
          <button type="button" className="btn btn-bayar" disabled={!cukup} onClick={onSelesai}>
            Selesaikan pembayaran
          </button>
          <button type="button" className="btn btn-sekunder" onClick={() => setLihatStruk((v) => !v)}>
            <Printer className="lucide" size={16} aria-hidden="true" />
            <span>{lihatStruk ? 'Sembunyikan struk' : 'Pratinjau struk'}</span>
          </button>
          <button type="button" className="btn btn-halus" onClick={onTutup}>
            Batal
          </button>
        </>
      )}
    >
      <div className="kolom-2">
        <IsiPembayaran ringkasan={ringkasan} bayar={bayar} onBayar={onBayar} padat />
        {lihatStruk ? (
          <div className="kolom-sisi">
            <Struk
              nomor={nomor}
              waktu="2026-07-29T14:35:00"
              kasir={kasir}
              meja={meja}
              baris={baris}
              ringkasan={ringkasan}
              pembayaran={bayar}
            />
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}
