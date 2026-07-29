'use client';

import Link from 'next/link';
import { Badge, Titik } from '@/components/ui/Primitives';
import type { AdapterView } from './types';

/**
 * Papan Kanban, HANYA untuk mengelompokkan, bukan untuk memindahkan.
 *
 * Di aplikasi manajemen tugas, menyeret kartu antar kolom adalah cara mengubah
 * status, dan itu benar. Di aplikasi kasir tidak. Kolomnya adalah status stok
 * dan status transaksi, dan dua duanya adalah AKIBAT dari kejadian lain:
 * penjualan, penerimaan barang, void yang beralasan. Menyeret kartu "Void" ke
 * kolom "Lunas" akan berarti mengarang catatan keuangan, jadi kemampuan itu
 * memang tidak boleh ada, bukan sekadar belum dibuat.
 *
 * Papannya bergulir horizontal DI DALAM kotaknya sendiri, dengan
 * `contain: paint`. Tanpa itu, kolom yang menonjol tetap menaikkan
 * `scrollWidth` dokumen walaupun wadahnya sudah `overflow-x: auto`. Terukur di
 * Jaring: 1943 lawan 375.
 */
export function KanbanView<T>({ data, adapter }: { data: T[]; adapter: AdapterView<T> }) {
  const item = data.map((b) => adapter.keItem(b));

  return (
    <div className="kb" role="list" aria-label={`Papan ${adapter.labelItem}`}>
      {adapter.grup.map((g) => {
        const isi = item.filter((i) => i.grup === g.id);
        return (
          <section key={g.id} className="kb-kolom" role="listitem" aria-label={`${g.nama}, ${isi.length} ${adapter.labelItem}`}>
            <header className="kb-kepala">
              <Titik tone={g.tone} />
              <span className="kb-nama">{g.nama}</span>
              <span className="kb-jumlah num">{isi.length}</span>
            </header>
            <div className="kb-isi">
              {isi.length === 0 ? (
                <p className="s" style={{ color: 'var(--text-muted)' }}>
                  Belum ada {adapter.labelItem} di kolom ini.
                </p>
              ) : (
                isi.map((i) => (
                  <Link key={i.id} href={i.href} className="kb-kartu">
                    <span className="stack">
                      <span className="t">{i.judul}</span>
                      {i.keterangan ? <span className="s">{i.keterangan}</span> : null}
                    </span>
                    <div className="item-kartu-kaki" style={{ paddingTop: 8 }}>
                      {i.badge ? <Badge tone={i.badge.tone}>{i.badge.teks}</Badge> : <span />}
                      {i.nilai ? <span className="num">{i.nilai}</span> : null}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
