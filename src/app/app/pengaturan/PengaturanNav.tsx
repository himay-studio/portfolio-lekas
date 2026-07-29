'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TAB = [
  { href: '/app/pengaturan/', label: 'Profil toko' },
  { href: '/app/pengaturan/pajak/', label: 'Pajak dan service' },
  { href: '/app/pengaturan/printer/', label: 'Printer dan struk' },
  { href: '/app/pengaturan/pengguna/', label: 'Pengguna dan peran' },
];

/**
 * Sub navigasi Pengaturan.
 *
 * Tautan sungguhan, bukan tab yang menukar isi di tempat, supaya setiap
 * bagiannya punya alamat sendiri yang bisa dibagikan dan bisa dirayapi
 * pemeriksaan tautan (R59). Tab yang menyimpan keadaannya di JavaScript akan
 * lolos dari pemeriksaan itu tanpa pernah ketahuan.
 */
export function PengaturanNav() {
  const jalur = usePathname();
  return (
    <div className="tab-baris" role="navigation" aria-label="Bagian pengaturan">
      {TAB.map((t) => {
        const aktif = jalur === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`tab-btn ${aktif ? 'tab-btn-aktif' : ''}`}
            aria-current={aktif ? 'page' : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
