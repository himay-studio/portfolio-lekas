'use client';

import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PENGGUNA } from '@/data/operasional';
import { TRANSAKSI } from '@/data/transaksi';
import { adapterTransaksi } from '@/lib/adapters';
import { PageHeader } from '@/components/shell/PageHeader';
import { DatePicker } from '@/components/ui/DatePicker';
import { CatatanStage } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';
import { DataViews } from '@/components/views/DataViews';
import { ViewSwitcher, usePilihanView } from '@/components/views/ViewSwitcher';

const OPSI_STATUS = [
  { nilai: 'semua', label: 'Semua status' },
  { nilai: 'lunas', label: 'Lunas' },
  { nilai: 'ditahan', label: 'Ditahan' },
  { nilai: 'void', label: 'Void' },
  { nilai: 'refund', label: 'Refund' },
];

const OPSI_KASIR = [
  { nilai: 'semua', label: 'Semua kasir' },
  ...PENGGUNA.filter((u) => u.peran === 'kasir' || u.peran === 'manajer').map((u) => ({
    nilai: u.id,
    label: u.nama,
  })),
];

export function TransaksiClient() {
  const [view, setView] = usePilihanView(adapterTransaksi);
  const [status, setStatus] = useState('semua');
  const [kasir, setKasir] = useState('semua');
  const [tanggal, setTanggal] = useState<string | null>(null);

  const data = useMemo(() => TRANSAKSI
    .filter((t) => status === 'semua' || t.status === status)
    .filter((t) => kasir === 'semua' || t.kasirId === kasir)
    .filter((t) => tanggal === null || t.waktu.slice(0, 10) === tanggal)
    .sort((a, b) => b.waktu.localeCompare(a.waktu)), [status, kasir, tanggal]);

  return (
    <>
      <PageHeader
        judul="Transaksi"
        ket={`${data.length} dari ${TRANSAKSI.length} transaksi. Void dan refund tetap tersimpan lengkap dengan alasannya.`}
        aksi={(
          <>
            <button type="button" className="btn btn-sekunder">
              <Download className="lucide" size={16} aria-hidden="true" />
              <span>Ekspor CSV</span>
            </button>
          </>
        )}
        saring={(
          <>
            <div style={{ minWidth: 180 }}>
              <label className="sr" htmlFor="saring-status">Saring status</label>
              <Select id="saring-status" label="Saring status" nilai={status} opsi={OPSI_STATUS} onUbah={setStatus} lebarPenuh />
            </div>
            <div style={{ minWidth: 200 }}>
              <label className="sr" htmlFor="saring-kasir">Saring kasir</label>
              <Select id="saring-kasir" label="Saring kasir" nilai={kasir} opsi={OPSI_KASIR} onUbah={setKasir} lebarPenuh />
            </div>
            <div style={{ minWidth: 200 }}>
              {/* R21. Tanggal SELALU lewat pemilih, tidak pernah teks bebas. */}
              <label className="sr" htmlFor="saring-tanggal">Saring tanggal</label>
              <DatePicker id="saring-tanggal" label="Saring tanggal" nilai={tanggal} onUbah={setTanggal} />
            </div>
            {tanggal ? (
              <button type="button" className="btn btn-halus btn-sm" onClick={() => setTanggal(null)}>
                Hapus saringan tanggal
              </button>
            ) : null}
          </>
        )}
        ujung={<ViewSwitcher nilai={view} tersedia={adapterTransaksi.viewTersedia} onUbah={setView} />}
      />

      <DataViews
        data={data}
        adapter={adapterTransaksi}
        view={view}
        kosong={{
          judul: 'Tidak ada transaksi pada saringan ini',
          ket: 'Ubah tanggal, status, atau kasir untuk melihat riwayat lain.',
        }}
      />

      <div style={{ marginTop: 'var(--sp-5)' }}>
        <CatatanStage>
          Ekspor CSV dan penyaring rentang tanggal ganda belum aktif. Stage 5 menambahkannya
          bersama aksi refund dan void langsung dari daftar.
        </CatatanStage>
      </div>
    </>
  );
}
