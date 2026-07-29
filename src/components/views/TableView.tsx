'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Cek } from '@/components/ui/Primitives';
import type { AdapterView } from './types';

type Arah = 'naik' | 'turun';

/**
 * Tabel.
 *
 * `table-layout: fixed` dan `min-width` ada di CSS, bukan di sini, tapi
 * alasannya perlu diketahui saat menambah kolom: titik paling sempit BUKAN
 * mobile, melainkan 1025px, tempat sidebar sudah muncul tapi kanvasnya belum
 * tumbuh. Dengan layout auto, satu sel berisi nama panjang melebarkan seluruh
 * tabel melewati kanvas di lebar itu. Kolom bertanda `opsional` hilang di
 * bawah 1280px, yang menyelesaikan sisanya.
 *
 * Di bawah 769px tabel diganti daftar kartu. Keduanya ada di DOM dan dipilih
 * lewat media query, bukan lewat pengukuran lebar di JavaScript, karena
 * pengukuran itu baru bisa jalan setelah hidrasi dan menghasilkan render
 * pertama yang berbeda dari HTML hasil ekspor statis.
 */
export function TableView<T>({
  data,
  adapter,
  terpilih,
  onTerpilih,
}: {
  data: T[];
  adapter: AdapterView<T>;
  terpilih?: string[];
  onTerpilih?: (n: string[]) => void;
}) {
  const [urut, setUrut] = useState<{ kolom: string; arah: Arah } | null>(null);
  const bisaPilih = Boolean(onTerpilih);

  const kolomUrut = adapter.kolom.find((k) => k.id === urut?.kolom);
  const baris = kolomUrut?.nilaiUrut
    ? [...data].sort((a, b) => {
      const x = kolomUrut.nilaiUrut!(a);
      const y = kolomUrut.nilaiUrut!(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id');
      return urut?.arah === 'turun' ? -c : c;
    })
    : data;

  function klikUrut(id: string) {
    setUrut((u) => (u?.kolom === id ? { kolom: id, arah: u.arah === 'naik' ? 'turun' : 'naik' } : { kolom: id, arah: 'naik' }));
  }

  const semuaId = data.map((d) => adapter.kunci(d));
  const semuaTerpilih = terpilih ? terpilih.length > 0 && terpilih.length === semuaId.length : false;

  return (
    <>
      {bisaPilih && terpilih && terpilih.length > 0 ? (
        <div className="tbl-massal">
          <span>
            {terpilih.length} {adapter.labelItem} terpilih
          </span>
          <button type="button" className="btn btn-sekunder btn-sm" onClick={() => onTerpilih?.([])}>
            Batalkan pilihan
          </button>
          <button type="button" className="btn btn-sekunder btn-sm">Ekspor terpilih</button>
        </div>
      ) : null}

      <div className="tbl-bungkus tbl-desktop">
        <table className="tbl">
          <thead>
            <tr>
              {bisaPilih ? (
                <th scope="col" style={{ width: 44 }}>
                  <Cek
                    nilai={semuaTerpilih}
                    onUbah={(n) => onTerpilih?.(n ? semuaId : [])}
                    sr={`Pilih semua ${adapter.labelItem}`}
                  />
                </th>
              ) : null}
              {adapter.kolom.map((k) => {
                const ini = urut?.kolom === k.id;
                return (
                  <th
                    key={k.id}
                    scope="col"
                    className={`${k.rata === 'kanan' ? 'kanan' : ''} ${k.opsional ? 'kolom-opsional' : ''}`}
                    style={k.lebar ? { width: k.lebar } : undefined}
                    aria-sort={ini ? (urut?.arah === 'naik' ? 'ascending' : 'descending') : undefined}
                  >
                    {k.nilaiUrut ? (
                      <button type="button" className="tbl-urut" onClick={() => klikUrut(k.id)}>
                        <span>{k.judul}</span>
                        {ini
                          ? (urut?.arah === 'naik'
                            ? <ArrowUp className="lucide" size={14} aria-hidden="true" />
                            : <ArrowDown className="lucide" size={14} aria-hidden="true" />)
                          : <ChevronsUpDown className="lucide" size={14} aria-hidden="true" />}
                      </button>
                    ) : (
                      k.judul
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => {
              const id = adapter.kunci(b);
              const dipilih = terpilih?.includes(id) ?? false;
              return (
                <tr key={id} aria-selected={dipilih}>
                  {bisaPilih ? (
                    <td>
                      <Cek
                        nilai={dipilih}
                        onUbah={(n) => onTerpilih?.(n ? [...(terpilih ?? []), id] : (terpilih ?? []).filter((x) => x !== id))}
                        sr={`Pilih ${adapter.keItem(b).judul}`}
                      />
                    </td>
                  ) : null}
                  {adapter.kolom.map((k) => (
                    <td
                      key={k.id}
                      className={`${k.rata === 'kanan' ? 'kanan' : ''} ${k.opsional ? 'kolom-opsional' : ''}`}
                    >
                      {k.render(b)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tbl-kartu tbl-mobile">
        {baris.map((b) => {
          const item = adapter.keItem(b);
          return (
            <Link key={item.id} href={item.href} className="tbl-kartu-item">
              <span className="stack">
                <span className="t">{item.judul}</span>
                {item.keterangan ? <span className="s">{item.keterangan}</span> : null}
              </span>
              {item.kode ? (
                <div className="tbl-kartu-baris">
                  <span className="tbl-kartu-label">Kode</span>
                  <span className="tbl-kartu-nilai mono">{item.kode}</span>
                </div>
              ) : null}
              {item.metrik?.map((m) => (
                <div key={m.label} className="tbl-kartu-baris">
                  <span className="tbl-kartu-label">{m.label}</span>
                  <span className="tbl-kartu-nilai num">{m.nilai}</span>
                </div>
              ))}
              {item.nilai ? (
                <div className="tbl-kartu-baris">
                  <span className="tbl-kartu-label">Nilai</span>
                  <span className="tbl-kartu-nilai num">{item.nilai}</span>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}
