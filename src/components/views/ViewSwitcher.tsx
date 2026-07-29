'use client';

import { CalendarDays, LayoutGrid, Rows3, Table2 } from 'lucide-react';
import { usePreferensi } from '@/lib/storage';
import { LABEL_VIEW, type AdapterView, type JenisView } from './types';

const IKON: Record<JenisView, typeof Table2> = {
  tabel: Table2,
  kartu: Rows3,
  kanban: LayoutGrid,
  kalender: CalendarDays,
};

/**
 * Pilihan view diingat PER MODUL.
 *
 * Satu kunci global akan memaksa Kalender ke halaman Produk yang tidak punya
 * kalender, dan modul itu akan jatuh ke view bawaan tanpa penjelasan. Ruang
 * nama per modul juga yang membuat kasir bisa membiarkan Transaksi selalu
 * Kalender sementara Produk selalu Tabel.
 */
export function usePilihanView<T>(adapter: AdapterView<T>): [JenisView, (v: JenisView) => void] {
  const [nilai, simpan] = usePreferensi<JenisView>(`view:${adapter.modul}`, adapter.viewBawaan);
  const aman = adapter.viewTersedia.includes(nilai) ? nilai : adapter.viewBawaan;
  return [aman, simpan];
}

export function ViewSwitcher({
  nilai,
  tersedia,
  onUbah,
}: {
  nilai: JenisView;
  tersedia: JenisView[];
  onUbah: (v: JenisView) => void;
}) {
  return (
    <div className="vs" role="group" aria-label="Pilih tampilan">
      {tersedia.map((v) => {
        const Ikon = IKON[v];
        const aktif = v === nilai;
        return (
          <button
            key={v}
            type="button"
            className={`vs-btn ${aktif ? 'vs-btn-aktif' : ''}`}
            aria-pressed={aktif}
            title={LABEL_VIEW[v]}
            onClick={() => onUbah(v)}
          >
            <Ikon className="lucide" size={16} aria-hidden="true" />
            {/* Label tetap ada di DOM di semua lebar, hanya disembunyikan
                secara visual di bawah 560px. Ikon tidak pernah berdiri sendiri
                sebagai satu satunya penanda makna. */}
            <span className="vs-label">{LABEL_VIEW[v]}</span>
          </button>
        );
      })}
    </div>
  );
}
