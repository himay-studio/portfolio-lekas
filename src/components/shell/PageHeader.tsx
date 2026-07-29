'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Kepala halaman.
 *
 * Urutan yang sama di setiap layar: judul, lalu aksi utama, lalu penyaring,
 * baru datanya. Aksi utama ada di KIRI dan sejajar judul, bukan dibuang ke
 * pojok kanan atas, karena mata membaca dari kiri dan tangan yang sudah ada di
 * sisi kiri layar tidak perlu menyeberang.
 *
 * `saring` sengaja hidup DI SINI dan bukan di dalam lapisan view. Penyaring
 * yang ikut dirender oleh masing masing view akan terpasang ulang setiap kali
 * pengguna berganti tampilan, dan pilihannya ikut hilang. Menaruhnya satu
 * tingkat di atas membuat berpindah view TIDAK MUNGKIN mereset penyaring,
 * bukan sekadar kebetulan tidak mereset.
 */
export function PageHeader({
  judul,
  ket,
  remah,
  aksi,
  saring,
  ujung,
}: {
  judul: string;
  ket?: string;
  remah?: { label: string; href?: string }[];
  aksi?: ReactNode;
  saring?: ReactNode;
  /** Biasanya pemindah view. Didorong ke ujung kanan baris di desktop. */
  ujung?: ReactNode;
}) {
  return (
    <div className="ph">
      {remah && remah.length > 0 ? (
        <nav className="remah" aria-label="Remah roti">
          {remah.map((r, i) => (
            <span key={`${r.label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {i > 0 ? <ChevronRight className="lucide" size={14} aria-hidden="true" /> : null}
              {r.href ? <Link href={r.href}>{r.label}</Link> : <span>{r.label}</span>}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="ph-atas">
        <div className="ph-judul">
          <h1>{judul}</h1>
          {ket ? <span className="ph-ket">{ket}</span> : null}
        </div>
      </div>

      {aksi || saring || ujung ? (
        <div className="ph-bar">
          {aksi ? <div className="ph-aksi">{aksi}</div> : null}
          {saring ? <div className="ph-saring">{saring}</div> : null}
          {ujung ? <div className="ph-ujung">{ujung}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
