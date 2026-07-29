'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Primitives';
import type { AdapterView } from './types';

/**
 * View kartu.
 *
 * Setiap kartu memakai `.stack` untuk judul plus label sekunder, jadi keduanya
 * elemen blok terpisah dengan jarak eksplisit (R50). Menempelkan keduanya
 * sebagai dua simpul inline menghasilkan `Kopi SusuMinuman` dalam satu baris
 * terender, yang lolos setiap review yang cuma membaca JSX.
 */
export function CardView<T>({ data, adapter }: { data: T[]; adapter: AdapterView<T> }) {
  return (
    <div className="kartu-grid">
      {data.map((b) => {
        const i = adapter.keItem(b);
        return (
          <Link key={i.id} href={i.href} className="item-kartu">
            <div className="item-kartu-atas">
              <span className="stack">
                <span className="t">{i.judul}</span>
                {i.keterangan ? <span className="s">{i.keterangan}</span> : null}
              </span>
              {i.badge ? <Badge tone={i.badge.tone} pekat={i.badge.pekat}>{i.badge.teks}</Badge> : null}
            </div>

            {i.kode ? <span className="mono" style={{ color: 'var(--text-muted)' }}>{i.kode}</span> : null}

            <div className="item-kartu-kaki">
              {i.metrik?.slice(0, 2).map((m) => (
                <span key={m.label} className="metrik">
                  <span className="metrik-label">{m.label}</span>
                  <span className="metrik-nilai num">{m.nilai}</span>
                </span>
              ))}
              {i.nilai ? (
                <span className="metrik" style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <span className="metrik-label">Nilai</span>
                  <span className="metrik-nilai num">{i.nilai}</span>
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
