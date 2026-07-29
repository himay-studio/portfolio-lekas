'use client';

import { LockKeyhole, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PENGGUNA } from '@/data/operasional';
import { SHIFT } from '@/data/transaksi';
import { rupiah } from '@/lib/format';
import { adapterShift, selisihKas } from '@/lib/adapters';
import { PageHeader } from '@/components/shell/PageHeader';
import { CatatanStage, Kpi } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';
import { DataViews } from '@/components/views/DataViews';
import { ViewSwitcher, usePilihanView } from '@/components/views/ViewSwitcher';

const OPSI_STATUS = [
  { nilai: 'semua', label: 'Semua shift' },
  { nilai: 'terbuka', label: 'Sedang terbuka' },
  { nilai: 'tertutup', label: 'Sudah ditutup' },
];

const OPSI_KASIR = [
  { nilai: 'semua', label: 'Semua kasir' },
  ...PENGGUNA.filter((u) => u.peran === 'kasir').map((u) => ({ nilai: u.id, label: u.nama })),
];

export function ShiftClient() {
  const [view, setView] = usePilihanView(adapterShift);
  const [status, setStatus] = useState('semua');
  const [kasir, setKasir] = useState('semua');

  const data = useMemo(() => SHIFT
    .filter((s) => status === 'semua' || s.status === status)
    .filter((s) => kasir === 'semua' || s.kasirId === kasir)
    .sort((a, b) => b.buka.localeCompare(a.buka)), [status, kasir]);

  const tertutup = SHIFT.filter((s) => s.status === 'tertutup');
  const selisihTotal = tertutup.reduce((a, s) => a + (selisihKas(s) ?? 0), 0);
  const pas = tertutup.filter((s) => selisihKas(s) === 0).length;

  return (
    <>
      <PageHeader
        judul="Shift Kasir"
        ket="Buka shift dengan kas awal, tutup dengan hitungan fisik. Selisihnya ditampilkan apa adanya."
        aksi={(
          <>
            <button type="button" className="btn">
              <Play className="lucide" size={16} aria-hidden="true" />
              <span>Buka shift</span>
            </button>
            <button type="button" className="btn btn-sekunder">
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
          aksi: <button type="button" className="btn">Buka shift</button>,
        }}
      />

      <div style={{ marginTop: 'var(--sp-5)' }}>
        <CatatanStage>
          Form buka dan tutup shift masih kerangka. Stage 5 menambahkan penghitung pecahan uang saat
          tutup shift, sehingga selisih kas dihitung dari jumlah lembar dan koin, bukan dari satu
          angka yang diketik.
        </CatatanStage>
      </div>
    </>
  );
}
