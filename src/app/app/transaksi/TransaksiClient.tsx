'use client';

import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PENGGUNA } from '@/data/operasional';
import { adapterTransaksi } from '@/lib/adapters';
import { angka } from '@/lib/format';
import { usePajakStore } from '@/lib/pengaturanStore';
import { hitung } from '@/lib/kasir';
import { useTransaksiStore } from '@/lib/transaksiStore';
import { PageHeader } from '@/components/shell/PageHeader';
import { DateRangePicker, type RentangTanggal } from '@/components/ui/DatePicker';
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

function csvSel(nilai: string | number): string {
  const s = String(nilai);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Halaman Transaksi.
 *
 * Rentang tanggalnya memakai `DateRangePicker`, GANDA (mulai dan selesai),
 * bukan satu `DatePicker` tunggal seperti Stage 3, karena riwayat penjualan
 * jarang ditelusuri per satu hari saja. Ekspor CSV mengekspor persis baris
 * yang sedang terlihat sesudah seluruh penyaring, bukan seluruh riwayat,
 * supaya berkas yang diunduh cocok dengan yang dilihat di layar.
 */
export function TransaksiClient() {
  const { transaksi: TRANSAKSI } = useTransaksiStore();
  const { pajak } = usePajakStore();
  const [view, setView] = usePilihanView(adapterTransaksi);
  const [status, setStatus] = useState('semua');
  const [kasir, setKasir] = useState('semua');
  const [rentang, setRentang] = useState<RentangTanggal>({ mulai: null, selesai: null });

  const data = useMemo(() => TRANSAKSI
    .filter((t) => status === 'semua' || t.status === status)
    .filter((t) => kasir === 'semua' || t.kasirId === kasir)
    .filter((t) => {
      const k = t.waktu.slice(0, 10);
      if (rentang.mulai && k < rentang.mulai) return false;
      if (rentang.selesai && k > rentang.selesai) return false;
      return true;
    })
    .sort((a, b) => b.waktu.localeCompare(a.waktu)), [TRANSAKSI, status, kasir, rentang]);

  function eksporCsv() {
    const header = ['nomor', 'waktu', 'kasirId', 'status', 'item', 'total'];
    const baris = data.map((t) => {
      const total = hitung(t.baris, {
        diskonTransaksi: t.diskonTransaksi,
        servicePersen: t.servicePersen,
        pajakPersen: t.pajakPersen,
        pembulatan: pajak.pembulatan,
        hargaSudahTermasukPajak: pajak.hargaSudahTermasukPajak,
      }).total;
      return [t.id, t.waktu, t.kasirId, t.status, String(t.baris.reduce((a, b) => a + b.qty, 0)), angka(total)]
        .map(csvSel).join(',');
    });
    const isi = [header.join(','), ...baris].join('\n');
    const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi-${rentang.mulai ?? 'semua'}-${rentang.selesai ?? 'tanggal'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        judul="Transaksi"
        ket={`${data.length} dari ${TRANSAKSI.length} transaksi. Void dan refund tetap tersimpan lengkap dengan alasannya.`}
        aksi={(
          <>
            <button type="button" className="btn btn-sekunder" onClick={eksporCsv} disabled={data.length === 0}>
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
            <div style={{ minWidth: 260 }}>
              {/* R21. Rentang tanggal GANDA lewat DateRangePicker, tidak pernah teks bebas. */}
              <label className="sr" htmlFor="saring-rentang">Saring rentang tanggal</label>
              <DateRangePicker label="Saring rentang tanggal" nilai={rentang} onUbah={setRentang} />
            </div>
            {rentang.mulai || rentang.selesai ? (
              <button type="button" className="btn btn-halus btn-sm" onClick={() => setRentang({ mulai: null, selesai: null })}>
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
          ket: 'Ubah rentang tanggal, status, atau kasir untuk melihat riwayat lain.',
        }}
      />
    </>
  );
}
