'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HARI_PENDEK, kunciTanggal, namaBulan, tanggalPendek } from '@/lib/format';
import { sisiPanel, useDisclosure } from './useDisclosure';

/**
 * Pemilih tanggal custom (R21). Input teks tanggal bebas DILARANG.
 *
 * Alasannya bukan estetika. Field bertuliskan "contoh: 12 Agustus 2026"
 * menghasilkan data yang tidak bisa diurai: "12/8", "12 agst", "besok". Di
 * aplikasi kasir itu langsung merusak penyaring riwayat dan rentang laporan.
 *
 * Satu komponen melayani dua bentuk, karena Laporan butuh rentang dan riwayat
 * transaksi butuh tanggal tunggal. Dirancang begitu sejak awal, bukan ditambal
 * belakangan dengan dua pemilih tunggal yang berdiri sendiri sendiri, yang
 * selalu berakhir dengan tanggal akhir lebih awal daripada tanggal mulai.
 *
 * Panelnya tidak dirender saat tertutup (R57), lebarnya 304px dan dijepit
 * `max-width: calc(100vw - 2rem)`. Tanpa jepitan itu, panel selebar ini adalah
 * penyebab luapan horizontal di 375px yang paling sering lolos, karena panel
 * tertutup yang cuma diredupkan tetap memakan lebar.
 */

export interface RentangTanggal {
  mulai: string | null;
  selesai: string | null;
}

function awalBulan(iso: string): Date {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

function selBulan(kursor: Date): Date[] {
  const awal = new Date(kursor.getFullYear(), kursor.getMonth(), 1);
  // Minggu dimulai hari Minggu, sesuai kebiasaan kalender Indonesia.
  const geser = awal.getDay();
  const mulai = new Date(awal.getFullYear(), awal.getMonth(), 1 - geser);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate() + i));
}

function tambahHari(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return kunciTanggal(new Date(y, m - 1, d + n));
}

function tambahBulan(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return kunciTanggal(new Date(y, m - 1 + n, d));
}

function IsiKalender({
  kursor,
  setKursor,
  fokus,
  setFokus,
  onPilih,
  aktif,
  rentang,
  min,
  maks,
  label,
}: {
  kursor: Date;
  setKursor: (d: Date) => void;
  fokus: string;
  setFokus: (s: string) => void;
  onPilih: (s: string) => void;
  aktif: string[];
  rentang: RentangTanggal | null;
  min?: string;
  maks?: string;
  label: string;
}) {
  const refGrid = useRef<HTMLDivElement | null>(null);
  const perluFokus = useRef(false);

  useEffect(() => {
    if (!perluFokus.current) return;
    perluFokus.current = false;
    refGrid.current?.querySelector<HTMLButtonElement>('[data-fokus="ya"]')?.focus();
  });

  function gerak(delta: number) {
    const baru = tambahHari(fokus, delta);
    setFokus(baru);
    const d = awalBulan(baru);
    if (d.getMonth() !== kursor.getMonth() || d.getFullYear() !== kursor.getFullYear()) setKursor(d);
    perluFokus.current = true;
  }

  function padaTombol(e: React.KeyboardEvent) {
    const peta: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    };
    if (peta[e.key] !== undefined) {
      e.preventDefault();
      gerak(peta[e.key]);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const baru = tambahBulan(fokus, e.key === 'PageUp' ? -1 : 1);
      setFokus(baru);
      setKursor(awalBulan(baru));
      perluFokus.current = true;
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const [y, m] = fokus.split('-').map(Number);
      const hari = e.key === 'Home' ? 1 : new Date(y, m, 0).getDate();
      setFokus(kunciTanggal(new Date(y, m - 1, hari)));
      perluFokus.current = true;
    }
  }

  const sel = selBulan(kursor);
  const hariIni = kunciTanggal(new Date());

  return (
    <>
      <div className="dp-bar">
        <button
          type="button"
          className="dp-nav"
          aria-label="Bulan sebelumnya"
          onClick={() => setKursor(new Date(kursor.getFullYear(), kursor.getMonth() - 1, 1))}
        >
          <ChevronLeft className="lucide" size={16} aria-hidden="true" />
        </button>
        <span className="dp-bulan">
          {namaBulan(kursor.getMonth())} {kursor.getFullYear()}
        </span>
        <button
          type="button"
          className="dp-nav"
          aria-label="Bulan berikutnya"
          onClick={() => setKursor(new Date(kursor.getFullYear(), kursor.getMonth() + 1, 1))}
        >
          <ChevronRight className="lucide" size={16} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={refGrid}
        className="dp-grid"
        role="grid"
        aria-label={label}
        onKeyDown={padaTombol}
      >
        {HARI_PENDEK.map((h) => (
          <div key={h} className="dp-hari" role="columnheader" aria-label={h}>
            {h}
          </div>
        ))}
        {sel.map((d) => {
          const k = kunciTanggal(d);
          const luar = d.getMonth() !== kursor.getMonth();
          const terpilih = aktif.includes(k);
          const dalamRentang = Boolean(
            rentang?.mulai && rentang?.selesai && k > rentang.mulai && k < rentang.selesai,
          );
          // Tanggal di luar batas memakai `disabled` sungguhan, sehingga
          // dikecualikan dari sapuan kontras (WCAG 1.4.3 inactive component).
          const mati = Boolean((min && k < min) || (maks && k > maks));
          const kelas = [
            'dp-sel',
            luar ? 'dp-sel-luar' : '',
            k === hariIni ? 'dp-sel-kini' : '',
            terpilih ? 'dp-sel-pilih' : '',
            dalamRentang ? 'dp-sel-rentang' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={k}
              type="button"
              role="gridcell"
              aria-selected={terpilih}
              aria-label={tanggalPendek(k)}
              data-fokus={k === fokus ? 'ya' : 'tidak'}
              tabIndex={k === fokus ? 0 : -1}
              disabled={mati}
              className={kelas}
              onClick={() => onPilih(k)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Pemilih tanggal tunggal. */
export function DatePicker({
  nilai,
  onUbah,
  label,
  min,
  maks,
  id,
}: {
  nilai: string | null;
  onUbah: (n: string) => void;
  label: string;
  min?: string;
  maks?: string;
  id?: string;
}) {
  const { buka, toggle, tutup, idPanel, refPemicu, refPanel } = useDisclosure();
  const [kursor, setKursor] = useState(() => awalBulan(nilai ?? kunciTanggal(new Date())));
  const [fokus, setFokus] = useState(nilai ?? kunciTanggal(new Date()));
  const [sisi, setSisi] = useState<'kiri' | 'kanan'>('kiri');

  useEffect(() => {
    if (buka) setSisi(sisiPanel(refPemicu.current));
  }, [buka, refPemicu]);

  return (
    <div className="dp">
      <button
        ref={refPemicu}
        type="button"
        id={id}
        className="sel-pemicu"
        aria-haspopup="dialog"
        aria-expanded={buka}
        aria-controls={idPanel}
        aria-label={label}
        onClick={toggle}
      >
        <span className="sel-nilai">{nilai ? tanggalPendek(nilai) : 'Pilih tanggal'}</span>
        <CalendarDays className="lucide" size={16} aria-hidden="true" />
      </button>

      {buka ? (
        <div ref={refPanel} id={idPanel} className="dp-panel" data-sisi={sisi} role="dialog" aria-label={label}>
          <IsiKalender
            kursor={kursor}
            setKursor={setKursor}
            fokus={fokus}
            setFokus={setFokus}
            onPilih={(k) => {
              onUbah(k);
              tutup();
            }}
            aktif={nilai ? [nilai] : []}
            rentang={null}
            min={min}
            maks={maks}
            label={label}
          />
        </div>
      ) : null}
    </div>
  );
}

const PINTAS: { id: string; label: string; hitung: (h: string) => RentangTanggal }[] = [
  { id: 'hari-ini', label: 'Hari ini', hitung: (h) => ({ mulai: h, selesai: h }) },
  { id: '7-hari', label: '7 hari', hitung: (h) => ({ mulai: tambahHari(h, -6), selesai: h }) },
  { id: '30-hari', label: '30 hari', hitung: (h) => ({ mulai: tambahHari(h, -29), selesai: h }) },
  {
    id: 'bulan-ini',
    label: 'Bulan ini',
    hitung: (h) => {
      const [y, m] = h.split('-').map(Number);
      return { mulai: kunciTanggal(new Date(y, m - 1, 1)), selesai: h };
    },
  },
];

/**
 * Pemilih rentang tanggal, dipakai Laporan.
 *
 * Klik pertama menetapkan tanggal mulai, klik kedua menetapkan selesai. Kalau
 * klik kedua jatuh sebelum yang pertama, keduanya ditukar, bukan ditolak.
 * Menolak akan memaksa pengguna mengingat urutan klik, dan itu bukan
 * pengetahuan yang wajar dituntut dari kasir.
 */
export function DateRangePicker({
  nilai,
  onUbah,
  label,
  maks,
}: {
  nilai: RentangTanggal;
  onUbah: (n: RentangTanggal) => void;
  label: string;
  maks?: string;
}) {
  const { buka, toggle, tutup, idPanel, refPemicu, refPanel } = useDisclosure();
  const hariIni = kunciTanggal(new Date());
  const [kursor, setKursor] = useState(() => awalBulan(nilai.mulai ?? hariIni));
  const [fokus, setFokus] = useState(nilai.mulai ?? hariIni);
  const [sisi, setSisi] = useState<'kiri' | 'kanan'>('kiri');
  const [sementara, setSementara] = useState<string | null>(null);

  useEffect(() => {
    if (buka) setSisi(sisiPanel(refPemicu.current));
  }, [buka, refPemicu]);

  function pilih(k: string) {
    if (sementara === null) {
      setSementara(k);
      onUbah({ mulai: k, selesai: null });
      return;
    }
    const [a, b] = sementara <= k ? [sementara, k] : [k, sementara];
    setSementara(null);
    onUbah({ mulai: a, selesai: b });
    tutup();
  }

  const teks = nilai.mulai && nilai.selesai
    ? `${tanggalPendek(nilai.mulai)} sampai ${tanggalPendek(nilai.selesai)}`
    : nilai.mulai
      ? `${tanggalPendek(nilai.mulai)} sampai ...`
      : 'Pilih rentang';

  return (
    <div className="dp">
      <button
        ref={refPemicu}
        type="button"
        className="sel-pemicu"
        aria-haspopup="dialog"
        aria-expanded={buka}
        aria-controls={idPanel}
        aria-label={label}
        onClick={toggle}
      >
        <span className="sel-nilai">{teks}</span>
        <CalendarDays className="lucide" size={16} aria-hidden="true" />
      </button>

      {buka ? (
        <div
          ref={refPanel}
          id={idPanel}
          className="dp-panel dp-panel-lebar"
          data-sisi={sisi}
          role="dialog"
          aria-label={label}
        >
          <div className="dp-pintas">
            {PINTAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="btn btn-sekunder btn-sm"
                onClick={() => {
                  setSementara(null);
                  onUbah(p.hitung(hariIni));
                  tutup();
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <IsiKalender
            kursor={kursor}
            setKursor={setKursor}
            fokus={fokus}
            setFokus={setFokus}
            onPilih={pilih}
            aktif={[nilai.mulai, nilai.selesai].filter(Boolean) as string[]}
            rentang={nilai}
            maks={maks}
            label={label}
          />
          <div className="dp-kaki">
            <span className="bantuan">
              {sementara ? 'Pilih tanggal akhir' : 'Pilih tanggal awal'}
            </span>
            <button type="button" className="btn btn-sekunder btn-sm" onClick={() => tutup()}>
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
