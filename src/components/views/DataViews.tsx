'use client';

import type { ReactNode } from 'react';
import { Kosong } from '@/components/ui/Primitives';
import { CalendarView } from './CalendarView';
import { CardView } from './CardView';
import { KanbanView } from './KanbanView';
import { TableView } from './TableView';
import type { AdapterView, JenisView } from './types';

/**
 * Satu pintu masuk ke empat renderer.
 *
 * Yang TIDAK ada di sini, dan itu disengaja: penyaring. Penyaring hidup di
 * `PageHeader`, satu tingkat di atas lapisan ini. Kalau penyaring ikut
 * dirender di dalam view, tiap kali pengguna berganti tampilan seluruh
 * penyaring dipasang ulang dan pilihannya hilang. Menaruhnya di atas membuat
 * berpindah view TIDAK MUNGKIN mereset penyaring, bukan sekadar kebetulan
 * tidak mereset.
 *
 * `key` pada jenis view memaksa animasi masuk berjalan lagi setiap kali
 * tampilan berganti. Tanpa itu React memakai ulang simpulnya dan perpindahan
 * jadi potong keras.
 */
export function DataViews<T>({
  data,
  adapter,
  view,
  terpilih,
  onTerpilih,
  kosong,
}: {
  data: T[];
  adapter: AdapterView<T>;
  view: JenisView;
  terpilih?: string[];
  onTerpilih?: (n: string[]) => void;
  kosong?: { judul: string; ket: string; aksi?: ReactNode };
}) {
  if (data.length === 0) {
    return (
      <Kosong
        judul={kosong?.judul ?? `Belum ada ${adapter.labelItem}`}
        ket={kosong?.ket ?? `Setelah ada ${adapter.labelItem}, daftarnya muncul di sini.`}
        aksi={kosong?.aksi}
      />
    );
  }

  return (
    <div key={view} className="view-panel" role="region" aria-label={`Daftar ${adapter.labelItem}`}>
      {view === 'tabel' ? <TableView data={data} adapter={adapter} terpilih={terpilih} onTerpilih={onTerpilih} /> : null}
      {view === 'kartu' ? <CardView data={data} adapter={adapter} /> : null}
      {view === 'kanban' ? <KanbanView data={data} adapter={adapter} /> : null}
      {view === 'kalender' ? <CalendarView data={data} adapter={adapter} /> : null}
    </div>
  );
}
