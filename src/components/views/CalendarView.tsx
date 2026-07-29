'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { HARI_PENDEK, kunciTanggal, namaBulan } from '@/lib/format';
import { WARNA_TONE } from '@/components/ui/Primitives';
import type { AdapterView } from './types';

/**
 * Kalender bulanan.
 *
 * Kursor bulan mulai dari bulan yang benar benar berisi data, bukan dari bulan
 * berjalan. Data demo bertanggal tetap, jadi kalender yang selalu membuka bulan
 * berjalan akan tampil kosong beberapa bulan lagi dan terbaca sebagai fitur
 * yang rusak, padahal datanya baik baik saja.
 */
export function CalendarView<T>({ data, adapter }: { data: T[]; adapter: AdapterView<T> }) {
  const item = data.map((b) => adapter.keItem(b));
  const [kursor, setKursor] = useState(() => {
    const tanggal = item.map((i) => i.tanggal).sort();
    const rujukan = tanggal[tanggal.length - 1] ?? kunciTanggal(new Date());
    const [y, m] = rujukan.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const perTanggal = new Map<string, typeof item>();
  for (const i of item) {
    const k = i.tanggal.slice(0, 10);
    perTanggal.set(k, [...(perTanggal.get(k) ?? []), i]);
  }

  const awal = new Date(kursor.getFullYear(), kursor.getMonth(), 1);
  const mulai = new Date(awal.getFullYear(), awal.getMonth(), 1 - awal.getDay());
  const sel = Array.from({ length: 42 }, (_, n) =>
    new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate() + n));
  const hariIni = kunciTanggal(new Date());

  const toneGrup = new Map(adapter.grup.map((g) => [g.id, g.tone]));

  return (
    <div className="kal">
      <div className="kal-bar">
        <span className="kal-bulan">
          {namaBulan(kursor.getMonth())} {kursor.getFullYear()}
        </span>
        <div className="kal-nav">
          <button
            type="button"
            className="dp-nav"
            aria-label="Bulan sebelumnya"
            onClick={() => setKursor(new Date(kursor.getFullYear(), kursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="lucide" size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dp-nav"
            aria-label="Bulan berikutnya"
            onClick={() => setKursor(new Date(kursor.getFullYear(), kursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="lucide" size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="kal-grid">
        {HARI_PENDEK.map((h) => (
          <div key={h} className="kal-hari">{h}</div>
        ))}
        {sel.map((d) => {
          const k = kunciTanggal(d);
          const isi = perTanggal.get(k) ?? [];
          const luar = d.getMonth() !== kursor.getMonth();
          return (
            <div
              key={k}
              className={`kal-sel ${luar ? 'kal-sel-luar' : ''} ${k === hariIni ? 'kal-sel-kini' : ''}`}
            >
              <span className="kal-tanggal">{d.getDate()}</span>
              {isi.slice(0, 2).map((i) => {
                const tone = toneGrup.get(i.grup) ?? 'neutral';
                return (
                  <Link
                    key={i.id}
                    href={i.href}
                    className="kal-acara"
                    style={{ background: 'var(--surface-2)', borderLeft: `3px solid ${WARNA_TONE[tone]}`, color: 'var(--text)' }}
                  >
                    {i.judul}
                  </Link>
                );
              })}
              {isi.length > 2 ? <span className="kal-lain">{isi.length - 2} lagi</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
