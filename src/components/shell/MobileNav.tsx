'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Portal } from '@/components/ui/Portal';
import { NAV, itemAktif } from './nav';

/**
 * Laci navigasi untuk 1024px ke bawah.
 *
 * DI-PORTAL ke `document.body`, dan itu bukan pilihan gaya (R53). Laci ini
 * dulunya wajar ditaruh di dalam `<header>`, dan begitu header punya
 * `backdrop-filter`, header itu jadi containing block untuk anak
 * `position: fixed`, sehingga laci `top: 0; bottom: 0` kolaps jadi setinggi
 * header, yaitu sekitar 68px, dan terbaca sebagai pita aneh di atas topbar
 * lengkap dengan logo kedua. CSS-nya berbunyi sama persis di kedua kasus, jadi
 * satu satunya cara membedakannya adalah mengukur `getBoundingClientRect()`.
 */
export function MobileNav({
  buka,
  onTutup,
  jalur,
}: {
  buka: boolean;
  onTutup: () => void;
  jalur: string;
}) {
  useEffect(() => {
    if (!buka) return undefined;
    const padaTombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onTutup();
    };
    document.addEventListener('keydown', padaTombol);
    const lama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', padaTombol);
      document.body.style.overflow = lama;
    };
  }, [buka, onTutup]);

  if (!buka) return null;
  const aktif = itemAktif(jalur);

  return (
    <Portal>
      <div className="mn pada-gelap">
        <div className="mn-scrim" onClick={onTutup} aria-hidden="true" />
        <div className="mn-panel" role="dialog" aria-modal="true" aria-label="Navigasi utama">
          <div className="mn-head">
            {/* Logo muncul TEPAT SEKALI di layar. Topbar menyembunyikan
                logonya selama laci terbuka, lihat Topbar.tsx (R52). */}
            <img className="sb-logo" src="/logo-lekas-knockout.svg" alt="Lekas" />
            <button type="button" className="mn-tutup" onClick={onTutup} aria-label="Tutup navigasi">
              <X className="lucide" size={20} aria-hidden="true" />
            </button>
          </div>
          <nav className="mn-nav" aria-label="Navigasi utama">
            {NAV.map((g) => (
              <div key={g.id}>
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
                      onClick={onTutup}
                    >
                      <Ikon className="sb-ikon lucide" size={20} aria-hidden="true" />
                      <span className="sb-label">{i.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </Portal>
  );
}
