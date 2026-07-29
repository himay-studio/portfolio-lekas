'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Portal } from './Portal';

const BISA_FOKUS = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])',
  'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export type LetakOverlay = 'tengah' | 'kanan' | 'bawah';

/**
 * Overlay bersama: modal, laci, dan lembar bawah.
 *
 * Selalu DI-PORTAL ke `document.body` (R53), tidak pernah bersarang di dalam
 * header atau kartu. Ancestor ber-`filter`, `transform`, atau
 * `backdrop-filter` menjadi containing block untuk anak `position: fixed`,
 * dan overlay yang terjebak di dalamnya akan kolaps setinggi ancestor itu
 * sementara CSS-nya tetap terbaca benar.
 *
 * Saat tertutup komponen ini melepas seluruh isinya dari DOM, bukan
 * menyembunyikannya. Overlay tersembunyi yang masih ada di DOM adalah cara
 * paling umum sebuah halaman kehilangan seluruh kliknya: scrim tak terlihat
 * tetap menangkap pointer, dan tidak ada satu pun tangkapan layar yang bisa
 * menunjukkannya.
 */
export function Overlay({
  buka,
  onTutup,
  judul,
  ket,
  letak = 'tengah',
  lebar = false,
  kaki,
  children,
}: {
  buka: boolean;
  onTutup: () => void;
  judul: string;
  ket?: string;
  letak?: LetakOverlay;
  lebar?: boolean;
  kaki?: ReactNode;
  children: ReactNode;
}) {
  const refKotak = useRef<HTMLDivElement | null>(null);
  const refPemicuSebelumnya = useRef<HTMLElement | null>(null);
  const idJudul = useId();

  useEffect(() => {
    if (!buka) return undefined;

    refPemicuSebelumnya.current = document.activeElement as HTMLElement | null;
    const kotak = refKotak.current;
    kotak?.querySelector<HTMLElement>(BISA_FOKUS)?.focus();

    const padaTombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onTutup();
        return;
      }
      if (e.key !== 'Tab' || !kotak) return;
      // Jerat fokus. Tanpa ini, Tab keluar dari dialog dan menyusuri halaman di
      // baliknya, yang bagi pengguna papan ketik berarti dialog itu hilang.
      const isi = [...kotak.querySelectorAll<HTMLElement>(BISA_FOKUS)]
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (isi.length === 0) return;
      const pertama = isi[0];
      const terakhir = isi[isi.length - 1];
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    };

    document.addEventListener('keydown', padaTombol);
    const overflowLama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', padaTombol);
      document.body.style.overflow = overflowLama;
      refPemicuSebelumnya.current?.focus();
    };
  }, [buka, onTutup]);

  if (!buka) return null;

  return (
    <Portal>
      <div className={`ov ov-${letak} ${lebar ? 'ov-lebar' : ''}`}>
        {/*
          Scrim ini BUKAN dekorasi: dia memang menangkap klik untuk menutup
          dialog, jadi dia sengaja tidak `pointer-events: none`. Isinya duduk
          di z-index lebih tinggi sehingga tidak pernah tertutupi.
        */}
        <div className="ov-scrim" onClick={onTutup} aria-hidden="true" />
        <div
          ref={refKotak}
          className="ov-kotak"
          role="dialog"
          aria-modal="true"
          aria-labelledby={idJudul}
        >
          <div className="ov-kepala">
            <span className="stack">
              <span className="t" id={idJudul} style={{ fontSize: 17, lineHeight: '24px', fontWeight: 600 }}>
                {judul}
              </span>
              {ket ? <span className="s">{ket}</span> : null}
            </span>
            <button type="button" className="ov-tutup" onClick={onTutup} aria-label="Tutup">
              <X className="lucide" size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="ov-isi">{children}</div>
          {kaki ? <div className="ov-kaki">{kaki}</div> : null}
        </div>
      </div>
    </Portal>
  );
}
