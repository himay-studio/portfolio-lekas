'use client';

import { LockKeyhole, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { OUTLET, PENGGUNA } from '@/data/operasional';
import { rupiah } from '@/lib/format';
import { adapterShift, selisihKas } from '@/lib/adapters';
import { bisa, useSesi } from '@/lib/sesi';
import { useShiftStore, type InputBukaShift } from '@/lib/shiftStore';
import { PageHeader } from '@/components/shell/PageHeader';
import { Kpi } from '@/components/ui/Primitives';
import { Overlay } from '@/components/ui/Overlay';
import { Select } from '@/components/ui/Select';
import { DataViews } from '@/components/views/DataViews';
import { ViewSwitcher, usePilihanView } from '@/components/views/ViewSwitcher';
import { PenutupShift } from './PenutupShift';

const OPSI_STATUS = [
  { nilai: 'semua', label: 'Semua shift' },
  { nilai: 'terbuka', label: 'Sedang terbuka' },
  { nilai: 'tertutup', label: 'Sudah ditutup' },
];

const OPSI_KASIR = [
  { nilai: 'semua', label: 'Semua kasir' },
  ...PENGGUNA.filter((u) => u.peran === 'kasir').map((u) => ({ nilai: u.id, label: u.nama })),
];

const OPSI_OUTLET = OUTLET.map((o) => ({ nilai: o.id, label: o.nama }));

/**
 * Halaman Shift Kasir.
 *
 * "Buka shift" benar benar membuat baris shift baru lewat `shiftStore`
 * (status `terbuka`, kas sistem mulai dari kas awal), dan langsung dipakai
 * layar Kasir sebagai shift aktif kasir itu. "Tutup shift berjalan" membuka
 * penghitung pecahan uang (`PenutupShift.tsx`) untuk shift milik kasir yang
 * sedang masuk.
 */
export function ShiftClient() {
  const { shift: SHIFT, bukaShift } = useShiftStore();
  const [kasirSesi] = useSesi();
  const [view, setView] = usePilihanView(adapterShift);
  const [status, setStatus] = useState('semua');
  const [kasir, setKasir] = useState('semua');

  const [bukaForm, setBukaForm] = useState(false);
  const [formOutlet, setFormOutlet] = useState(OUTLET[0].id);
  const [formKasAwal, setFormKasAwal] = useState('500000');
  const [tutupId, setTutupId] = useState<string | null>(null);

  const data = useMemo(() => SHIFT
    .filter((s) => status === 'semua' || s.status === status)
    .filter((s) => kasir === 'semua' || s.kasirId === kasir)
    .sort((a, b) => b.buka.localeCompare(a.buka)), [SHIFT, status, kasir]);

  const tertutup = SHIFT.filter((s) => s.status === 'tertutup');
  const selisihTotal = tertutup.reduce((a, s) => a + (selisihKas(s) ?? 0), 0);
  const pas = tertutup.filter((s) => selisihKas(s) === 0).length;

  const shiftSayaTerbuka = SHIFT.find((s) => s.status === 'terbuka' && s.kasirId === kasirSesi.id) ?? null;
  const bisaTutupLain = bisa(kasirSesi.peran, 'shift');
  const shiftLainTerbuka = SHIFT.filter((s) => s.status === 'terbuka' && s.kasirId !== kasirSesi.id);

  function submitBuka() {
    const input: InputBukaShift = { kasirId: kasirSesi.id, outletId: formOutlet, kasAwal: Number(formKasAwal) || 0 };
    bukaShift(input);
    setBukaForm(false);
    setFormKasAwal('500000');
  }

  return (
    <>
      <PageHeader
        judul="Shift Kasir"
        ket="Buka shift dengan kas awal, tutup dengan hitungan fisik. Selisihnya ditampilkan apa adanya."
        aksi={(
          <>
            <button type="button" className="btn" onClick={() => setBukaForm(true)} disabled={Boolean(shiftSayaTerbuka)}>
              <Play className="lucide" size={16} aria-hidden="true" />
              <span>Buka shift</span>
            </button>
            <button
              type="button"
              className="btn btn-sekunder"
              onClick={() => shiftSayaTerbuka && setTutupId(shiftSayaTerbuka.id)}
              disabled={!shiftSayaTerbuka}
            >
              <LockKeyhole className="lucide" size={16} aria-hidden="true" />
              <span>Tutup shift berjalan</span>
            </button>
          </>
        )}
        saring={(
          <>
            <div style={{ minWidth: 180 }}>
              <label className="sr" htmlFor="shift-status">Saring status shift</label>
              <Select id="shift-status" label="Saring status shift" nilai={status} opsi={OPSI_STATUS} onUbah={setStatus} lebarPenuh />
            </div>
            <div style={{ minWidth: 200 }}>
              <label className="sr" htmlFor="shift-kasir">Saring kasir</label>
              <Select id="shift-kasir" label="Saring kasir" nilai={kasir} opsi={OPSI_KASIR} onUbah={setKasir} lebarPenuh />
            </div>
          </>
        )}
        ujung={<ViewSwitcher nilai={view} tersedia={adapterShift.viewTersedia} onUbah={setView} />}
      />

      {shiftSayaTerbuka ? (
        <p className="bantuan" style={{ marginBottom: 'var(--sp-4)' }}>
          Shift Anda sedang terbuka ({shiftSayaTerbuka.id}), kas awal {rupiah(shiftSayaTerbuka.kasAwal)}. Layar Kasir memakai shift ini secara otomatis.
        </p>
      ) : null}
      {!shiftSayaTerbuka && shiftLainTerbuka.length > 0 && !bisaTutupLain ? (
        <p className="bantuan" style={{ marginBottom: 'var(--sp-4)' }}>
          Ada {shiftLainTerbuka.length} shift terbuka milik kasir lain. Peran Anda tidak berwenang menutup shift kasir lain (HAK_AKSES).
        </p>
      ) : null}

      <div className="kpi-grid" style={{ marginBottom: 'var(--sp-5)' }}>
        <Kpi label="Shift tercatat" nilai={String(SHIFT.length)} />
        <Kpi label="Kas pas" nilai={`${pas} dari ${tertutup.length}`} ket="Shift yang selisihnya nol" />
        <Kpi
          label="Total selisih"
          nilai={rupiah(selisihTotal)}
          ubah={selisihTotal === 0 ? undefined : { arah: selisihTotal > 0 ? 'naik' : 'turun', teks: selisihTotal > 0 ? 'Lebih dari sistem' : 'Kurang dari sistem' }}
        />
      </div>

      <DataViews
        data={data}
        adapter={adapterShift}
        view={view}
        kosong={{
          judul: 'Belum ada shift pada saringan ini',
          ket: 'Buka shift baru untuk mulai mencatat kas awal dan penjualan kasir.',
          aksi: <button type="button" className="btn" onClick={() => setBukaForm(true)}>Buka shift</button>,
        }}
      />

      <Overlay
        buka={bukaForm}
        onTutup={() => setBukaForm(false)}
        judul="Buka shift"
        ket={`Sebagai ${kasirSesi.nama}`}
        kaki={(
          <>
            <button type="button" className="btn" onClick={submitBuka}>Buka shift</button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaForm(false)}>Batal</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="bidang">
            <label htmlFor="buka-outlet">Outlet</label>
            <Select id="buka-outlet" label="Outlet" nilai={formOutlet} opsi={OPSI_OUTLET} onUbah={setFormOutlet} lebarPenuh />
          </div>
          <div className="bidang">
            <label htmlFor="buka-kas">Kas awal</label>
            <input id="buka-kas" className="input input-num" type="number" min={0} value={formKasAwal} onChange={(e) => setFormKasAwal(e.target.value)} />
          </div>
        </div>
      </Overlay>

      <PenutupShift shiftId={tutupId} onTutup={() => setTutupId(null)} />
    </>
  );
}
