'use client';

import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { PENGGUNA } from '@/data/operasional';
import { usePreferensi } from '@/lib/storage';
import { Avatar } from '@/components/ui/Primitives';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { itemAktif } from './nav';

/**
 * Kerangka aplikasi.
 *
 * Satu keputusan yang perlu ditulis alasannya: layar Kasir memakai kerangka
 * yang sama, bukan kerangka terpisah, tapi dengan `data-mode="kasir"` yang
 * memaksa sidebar jadi rail 64px dan mengunci tinggi ke 100dvh.
 *
 * Alternatifnya adalah membuat grup rute kedua dengan layout sendiri. Itu
 * ditolak karena akan menggandakan sidebar, topbar, dan laci mobile, dan
 * duplikat semacam itu selalu berakhir dengan satu salinan yang ketinggalan
 * perbaikan aksesibilitas. Yang benar benar berbeda di layar Kasir hanya lebar
 * kanvas dan perilaku gulir, dan dua duanya urusan CSS, bukan urusan struktur.
 *
 * Preferensi lipat pengguna TIDAK ditimpa saat masuk layar Kasir. Kalau ditimpa,
 * kasir yang keluar dari layar Kasir akan menemukan sidebarnya berubah sendiri,
 * dan itu terbaca sebagai bug meskipun disengaja.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const jalur = usePathname() ?? '/app/';
  const [lipat, setLipat] = usePreferensi('sidebar-lipat', false);
  const [laci, setLaci] = useState(false);
  const modeKasir = jalur.startsWith('/app/kasir');
  const aktif = itemAktif(jalur);
  const pengguna = PENGGUNA[0];

  return (
    <div className="app" data-lipat={lipat ? 'ya' : 'tidak'} data-mode={modeKasir ? 'kasir' : 'standar'}>
      <Sidebar jalur={jalur} lipat={lipat} onLipat={setLipat} paksaLipat={modeKasir} />

      <div className="app-isi">
        <header className="tb">
          <div className="tb-kiri">
            <button
              type="button"
              className="tb-hamburger"
              onClick={() => setLaci(true)}
              aria-label="Buka navigasi"
              aria-expanded={laci}
            >
              <Menu className="lucide" size={20} aria-hidden="true" />
            </button>
            {/* Logo topbar disembunyikan selama laci terbuka supaya tidak ada
                dua logo di layar sekaligus (R52). */}
            {laci ? null : (
              <Link href="/app/" aria-label="Lekas, ke beranda">
                <img className="tb-logo" src="/logo-lekas-primary.svg" alt="Lekas" />
              </Link>
            )}
            <span className="tb-judul">{aktif?.judul ?? 'Lekas'}</span>
          </div>

          <div className="tb-kanan">
            <button type="button" className="tb-cari" aria-label="Cari produk atau transaksi">
              <Search className="lucide" size={16} aria-hidden="true" />
              <span>Cari</span>
            </button>
            <Avatar inisial={pengguna.inisial} warna={pengguna.warna} nama={pengguna.nama} />
          </div>
        </header>

        <MobileNav buka={laci} onTutup={() => setLaci(false)} jalur={jalur} />

        <main id="isi" className="halaman">
          {children}
        </main>
      </div>
    </div>
  );
}
