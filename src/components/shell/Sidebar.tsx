'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { NAV, itemAktif } from './nav';

/**
 * Sidebar kiri persisten. Ini aplikasi, bukan halaman arahan, jadi navigasi
 * utamanya di kiri dan bukan di topbar.
 *
 * Elemen ini sengaja TIDAK memakai `backdrop-filter`, `filter`, atau
 * `transform`, karena semua itu menjadikannya containing block bagi keturunan
 * `position: fixed` (R53). Efek visualnya tidak sebanding dengan risikonya.
 */
export function Sidebar({
  jalur,
  lipat,
  onLipat,
  paksaLipat,
}: {
  jalur: string;
  lipat: boolean;
  onLipat: (n: boolean) => void;
  /** Layar Kasir memaksa rail ikon tanpa mengubah preferensi pengguna. */
  paksaLipat: boolean;
}) {
  const aktif = itemAktif(jalur);
  const kecil = lipat || paksaLipat;

  return (
    <aside className="sb pada-gelap">
      <div className="sb-head">
        <Link href="/app/" aria-label="Lekas, ke beranda">
          {/* Sidebar berlatar #1A1424, jadi WAJIB varian knockout (R43). */}
          <img className="sb-logo" src="/logo-lekas-knockout.svg" alt="Lekas" />
          <img className="sb-mark" src="/mark-lekas-knockout.svg" alt="Lekas" />
        </Link>
      </div>

      <nav className="sb-nav" aria-label="Navigasi utama">
        {NAV.map((g) => (
          <div key={g.id}>
            {/* Label kelompok selalu utuh di DOM. Saat rail ikon, CSS
                menyembunyikannya secara visual, bukan memangkasnya. */}
            <span className="sb-grup">{g.label}</span>
            {g.item.map((i) => {
              const ini = aktif?.href === i.href;
              const Ikon = i.ikon;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`sb-item ${ini ? 'sb-item-aktif' : ''}`}
                  aria-current={ini ? 'page' : undefined}
                  title={kecil ? i.label : undefined}
                >
                  <Ikon className="sb-ikon lucide" size={20} aria-hidden="true" />
                  <span className="sb-label">{i.label}</span>
                  {/* Saat terlipat, label visual hilang tapi namanya tetap
                      terbaca pembaca layar. Ikon tidak pernah jadi satu satunya
                      penanda makna. */}
                  {kecil ? <span className="sr">{i.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sb-kaki">
        <button
          type="button"
          className="sb-lipat"
          onClick={() => onLipat(!lipat)}
          aria-label={lipat ? 'Lebarkan sidebar' : 'Lipat sidebar'}
          disabled={paksaLipat}
        >
          {lipat
            ? <PanelLeftOpen className="lucide" size={18} aria-hidden="true" />
            : <PanelLeftClose className="lucide" size={18} aria-hidden="true" />}
          <span>{lipat ? 'Lebarkan' : 'Lipat sidebar'}</span>
        </button>
      </div>
    </aside>
  );
}
