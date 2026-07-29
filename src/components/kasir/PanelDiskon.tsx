'use client';

import { useEffect, useState } from 'react';
import type { DiskonNilai } from '@/data/types';
import { rupiah } from '@/lib/format';
import { nilaiDiskon } from '@/lib/kasir';
import { Overlay } from '@/components/ui/Overlay';
import { Select } from '@/components/ui/Select';

/**
 * Dua panel diskon yang sengaja BERBEDA, bukan satu panel dengan sakelar mode.
 *
 * Keduanya kelihatan mirip, dan itu justru jebakannya: diskon item dihitung
 * dari bruto BARIS, diskon transaksi dihitung dari SUBTOTAL setelah seluruh
 * diskon item. Kalau keduanya berbagi satu komponen, dasar hitungnya jadi satu
 * prop yang gampang tertukar, dan dua diskon 10 persen yang bertumpuk
 * menghasilkan potongan lebih besar daripada yang disepakati kasir. Selisihnya
 * baru ketahuan saat tutup shift, saat sudah tidak ada yang ingat.
 */

const TIPE = [
  { nilai: 'persen', label: 'Persen' },
  { nilai: 'nominal', label: 'Nominal rupiah' },
];

const ALASAN = [
  { nilai: '', label: 'Tanpa alasan' },
  { nilai: 'Promo hari ini', label: 'Promo hari ini' },
  { nilai: 'Pelanggan lama', label: 'Pelanggan lama' },
  { nilai: 'Karyawan', label: 'Karyawan' },
  { nilai: 'Kompensasi', label: 'Kompensasi' },
];

function FormDiskon({
  dasar,
  awal,
  onSimpan,
  onHapus,
  labelDasar,
}: {
  dasar: number;
  awal: DiskonNilai | null;
  onSimpan: (d: DiskonNilai | null) => void;
  onHapus: () => void;
  labelDasar: string;
}) {
  const [tipe, setTipe] = useState<'persen' | 'nominal'>(awal?.tipe ?? 'persen');
  const [nilai, setNilai] = useState(String(awal?.nilai ?? ''));
  const [alasan, setAlasan] = useState(awal?.alasan ?? '');

  useEffect(() => {
    setTipe(awal?.tipe ?? 'persen');
    setNilai(String(awal?.nilai ?? ''));
    setAlasan(awal?.alasan ?? '');
  }, [awal]);

  const angka = Number(nilai) || 0;
  const potong = nilaiDiskon(angka > 0 ? { tipe, nilai: angka } : null, dasar);

  return (
    <div className="form-grid">
      <div className="tbl-kartu-baris">
        <span className="tbl-kartu-label">{labelDasar}</span>
        <span className="tbl-kartu-nilai num">{rupiah(dasar)}</span>
      </div>

      <div className="form-grid form-grid-2">
        <div className="bidang">
          <label htmlFor="diskon-tipe">Jenis diskon</label>
          <Select
            id="diskon-tipe"
            label="Jenis diskon"
            nilai={tipe}
            opsi={TIPE}
            onUbah={(n) => setTipe(n as 'persen' | 'nominal')}
            lebarPenuh
          />
        </div>
        <div className="bidang">
          <label htmlFor="diskon-nilai">{tipe === 'persen' ? 'Besar diskon dalam persen' : 'Besar diskon dalam rupiah'}</label>
          <input
            id="diskon-nilai"
            className="input input-num"
            type="number"
            min={0}
            inputMode="numeric"
            value={nilai}
            onChange={(e) => setNilai(e.target.value)}
            placeholder={tipe === 'persen' ? '10' : '5000'}
          />
        </div>
      </div>

      <div className="bidang">
        <label htmlFor="diskon-alasan">Alasan</label>
        <Select id="diskon-alasan" label="Alasan diskon" nilai={alasan} opsi={ALASAN} onUbah={setAlasan} lebarPenuh />
        <span className="bantuan">Alasan ikut tercatat di riwayat transaksi dan rekap shift.</span>
      </div>

      <div className="tbl-kartu-baris">
        <span className="tbl-kartu-label">Potongan</span>
        <span className="tbl-kartu-nilai num negatif">-{rupiah(potong)}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
        <button
          type="button"
          className="btn"
          onClick={() => onSimpan(angka > 0 ? { tipe, nilai: angka, alasan: alasan || undefined } : null)}
        >
          Terapkan diskon
        </button>
        {awal ? (
          <button type="button" className="btn btn-sekunder" onClick={onHapus}>
            Hapus diskon
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Diskon per item. Dasarnya bruto baris itu saja. */
export function PanelDiskonItem({
  buka,
  onTutup,
  namaProduk,
  brutoBarisIni,
  diskon,
  onSimpan,
}: {
  buka: boolean;
  onTutup: () => void;
  namaProduk: string;
  brutoBarisIni: number;
  diskon: DiskonNilai | null;
  onSimpan: (d: DiskonNilai | null) => void;
}) {
  return (
    <Overlay buka={buka} onTutup={onTutup} judul="Diskon item" ket={namaProduk}>
      <FormDiskon
        dasar={brutoBarisIni}
        awal={diskon}
        labelDasar="Nilai baris sebelum diskon"
        onSimpan={(d) => {
          onSimpan(d);
          onTutup();
        }}
        onHapus={() => {
          onSimpan(null);
          onTutup();
        }}
      />
    </Overlay>
  );
}

/** Diskon per transaksi. Dasarnya subtotal SETELAH seluruh diskon item. */
export function PanelDiskonTransaksi({
  buka,
  onTutup,
  subtotal,
  diskon,
  onSimpan,
}: {
  buka: boolean;
  onTutup: () => void;
  subtotal: number;
  diskon: DiskonNilai | null;
  onSimpan: (d: DiskonNilai | null) => void;
}) {
  return (
    <Overlay
      buka={buka}
      onTutup={onTutup}
      judul="Diskon transaksi"
      ket="Dihitung dari subtotal setelah seluruh diskon item"
    >
      <FormDiskon
        dasar={subtotal}
        awal={diskon}
        labelDasar="Subtotal setelah diskon item"
        onSimpan={(d) => {
          onSimpan(d);
          onTutup();
        }}
        onHapus={() => {
          onSimpan(null);
          onTutup();
        }}
      />
    </Overlay>
  );
}
