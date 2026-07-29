'use client';

import { ArrowDownRight, ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tone, WarnaDeret } from '@/data/types';

export const KELAS_TONE: Record<Tone, string> = {
  neutral: 'badge-neutral',
  brand: 'badge-brand',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

export const WARNA_TONE: Record<Tone, string> = {
  neutral: 'var(--text-muted)',
  brand: 'var(--brand)',
  info: 'var(--info)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
};

/**
 * Badge status. Isian soft, teks ink, batas --control-border (DESIGN.md 6.7).
 *
 * Batasnya sengaja --control-border dan bukan --border: pada latar soft,
 * --border hanya 1.48 dan badge-nya terbaca sebagai blok warna tanpa bentuk.
 * Badge juga TIDAK PERNAH hanya warna, selalu ada teksnya, supaya maknanya
 * tetap sampai tanpa membedakan warna.
 */
export function Badge({ tone = 'neutral', pekat = false, children }: { tone?: Tone; pekat?: boolean; children: ReactNode }) {
  return <span className={`badge ${KELAS_TONE[tone]} ${pekat ? 'badge-pekat' : ''}`}>{children}</span>;
}

export function Avatar({
  inisial,
  warna,
  ukuran = 'md',
  nama,
}: {
  inisial: string;
  warna: WarnaDeret;
  ukuran?: 'sm' | 'md' | 'lg';
  nama?: string;
}) {
  const kelas = ukuran === 'sm' ? 'avatar-sm' : ukuran === 'lg' ? 'avatar-lg' : '';
  return (
    <span className={`avatar avatar-${warna} ${kelas}`} title={nama} aria-hidden={nama ? undefined : 'true'}>
      {nama ? <span className="sr">{nama}</span> : null}
      <span aria-hidden="true">{inisial}</span>
    </span>
  );
}

/** Stepper jumlah. Tombol minus dan plus, bukan input teks bebas. */
export function Stepper({
  nilai,
  onUbah,
  min = 1,
  maks = 999,
  label,
}: {
  nilai: number;
  onUbah: (n: number) => void;
  min?: number;
  maks?: number;
  label: string;
}) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Kurangi ${label}`}
        disabled={nilai <= min}
        onClick={() => onUbah(Math.max(min, nilai - 1))}
      >
        <Minus className="lucide" size={16} aria-hidden="true" />
      </button>
      <span className="stepper-nilai" aria-live="polite" aria-label={`${label}, ${nilai}`}>
        {nilai}
      </span>
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Tambah ${label}`}
        disabled={nilai >= maks}
        onClick={() => onUbah(Math.min(maks, nilai + 1))}
      >
        <Plus className="lucide" size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Sakelar({
  nilai,
  onUbah,
  label,
}: {
  nilai: boolean;
  onUbah: (n: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={nilai}
      aria-label={label}
      className="sakelar"
      onClick={() => onUbah(!nilai)}
    />
  );
}

/**
 * Kotak centang.
 *
 * `sr` dipakai saat kotaknya TIDAK punya teks terlihat, misalnya kolom pilih di
 * tabel. Namanya dipasang sebagai `aria-label` pada input, bukan sebagai anak
 * yang disembunyikan dengan kelas `sr`. Bedanya nyata: anak yang disembunyikan
 * tetap punya kotak di dalam sel tabel yang ber-`text-overflow: ellipsis`,
 * sehingga sel itu merender titik titik kecil di sebelah kotak centang. Cacat
 * itu hanya terlihat di tangkapan layar, tidak pernah di JSX-nya.
 */
export function Cek({
  nilai,
  onUbah,
  children,
  sr,
}: {
  nilai: boolean;
  onUbah: (n: boolean) => void;
  children?: ReactNode;
  sr?: string;
}) {
  return (
    <label className="cek">
      <input
        type="checkbox"
        checked={nilai}
        aria-label={sr}
        onChange={(e) => onUbah(e.target.checked)}
      />
      <span className="cek-kotak" aria-hidden="true">
        {nilai ? <Check className="lucide" size={14} strokeWidth={3} /> : null}
      </span>
      {children ? <span>{children}</span> : null}
    </label>
  );
}

/**
 * Keadaan kosong.
 *
 * Tabel kosong tanpa apa apa itu bug, bukan desain. Satu kalimat penjelasan
 * plus tombol aksi utamanya, selalu.
 */
export function Kosong({
  judul,
  ket,
  aksi,
}: {
  judul: string;
  ket: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="kosong">
      {/* Bentuk geometris siku, digambar sendiri. Tidak ada ilustrasi bitmap. */}
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <rect x="6" y="10" width="44" height="8" fill="var(--border-strong)" />
        <rect x="6" y="24" width="30" height="8" fill="var(--border-strong)" />
        <rect x="6" y="38" width="38" height="8" fill="var(--border-strong)" />
      </svg>
      <span className="stack" style={{ alignItems: 'center', gap: 4 }}>
        <span className="kosong-judul">{judul}</span>
        <span className="s" style={{ maxWidth: '48ch' }}>{ket}</span>
      </span>
      {aksi}
    </div>
  );
}

export function Kpi({
  label,
  nilai,
  ubah,
  ket,
}: {
  label: string;
  nilai: string;
  ubah?: { arah: 'naik' | 'turun'; teks: string };
  ket?: string;
}) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-nilai">{nilai}</span>
      {ubah ? (
        <span className={`kpi-ubah ${ubah.arah === 'naik' ? 'kpi-naik' : 'kpi-turun'}`}>
          {ubah.arah === 'naik'
            ? <ArrowUpRight className="lucide" size={16} aria-hidden="true" />
            : <ArrowDownRight className="lucide" size={16} aria-hidden="true" />}
          <span>{ubah.teks}</span>
        </span>
      ) : null}
      {ket ? <span className="s">{ket}</span> : null}
    </div>
  );
}

export function Titik({ tone }: { tone: Tone }) {
  return <span className="kb-titik" style={{ background: WARNA_TONE[tone] }} aria-hidden="true" />;
}
