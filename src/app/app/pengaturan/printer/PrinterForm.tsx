'use client';

import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PENGGUNA } from '@/data/operasional';
import { hitung } from '@/lib/kasir';
import { usePajakStore, usePrinterStore } from '@/lib/pengaturanStore';
import { Struk } from '@/components/kasir/Struk';
import { Badge, Sakelar, Stepper } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';

const OPSI_LEBAR = [
  { nilai: '58', label: '58 mm', ket: 'Printer kecil, 32 karakter' },
  { nilai: '80', label: '80 mm', ket: 'Printer standar, 42 karakter' },
];

const OPSI_PRINTER = [
  { nilai: 'Epson TM-T82 (USB)', label: 'Epson TM-T82', ket: 'Terhubung lewat USB' },
  { nilai: 'Xprinter XP-80C (LAN)', label: 'Xprinter XP-80C', ket: 'Terhubung lewat jaringan' },
  { nilai: 'Bluetooth Printer', label: 'Printer Bluetooth', ket: 'Untuk kasir berpindah' },
];

const CONTOH = [
  { nama: 'Kopi Susu', qty: 2, hargaSatuan: 27000, diskonItem: null, opsi: [{ dimensiId: 'ukuran', opsiId: 'besar', nama: 'Besar', delta: 5000 }] },
  { nama: 'Croissant', qty: 1, hargaSatuan: 18000, diskonItem: null, opsi: [] },
];

/**
 * Form printer dan struk. Kepala, kaki, dan lebar kertas di sini langsung
 * terlihat di pratinjau struk di sebelah kanan SEBELUM disimpan (`Struk`
 * membaca dari state form ini, bukan dari pengaturan yang sudah tersimpan),
 * dan setelah disimpan tersambung ke `pengaturanStore` yang sama dibaca
 * layar Kasir dan Pembayaran, jadi lebar 58 mm yang dipilih di sini benar
 * benar memendekkan struk yang tercetak di sana.
 */
export function PrinterForm() {
  const { printer: tersimpan, simpanPrinter, siap } = usePrinterStore();
  const { pajak } = usePajakStore();
  const [printer, setPrinter] = useState(tersimpan.nama);
  const [lebar, setLebar] = useState(String(tersimpan.lebarKertas));
  const [otomatis, setOtomatis] = useState(tersimpan.cetakOtomatis);
  const [salinan, setSalinan] = useState(tersimpan.salinan);
  const [kepala, setKepala] = useState(tersimpan.kepalaStruk);
  const [kaki, setKaki] = useState(tersimpan.kakiStruk);
  const [barusanSimpan, setBarusanSimpan] = useState(false);

  useEffect(() => {
    if (!siap) return;
    setPrinter(tersimpan.nama);
    setLebar(String(tersimpan.lebarKertas));
    setOtomatis(tersimpan.cetakOtomatis);
    setSalinan(tersimpan.salinan);
    setKepala(tersimpan.kepalaStruk);
    setKaki(tersimpan.kakiStruk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siap]);

  const ringkasan = hitung(CONTOH, {
    diskonTransaksi: null,
    servicePersen: pajak.serviceAktif ? pajak.servicePersen : 0,
    pajakPersen: pajak.pajakAktif ? pajak.pajakPersen : 0,
    pembulatan: pajak.pembulatan,
    hargaSudahTermasukPajak: pajak.hargaSudahTermasukPajak,
  });

  function simpan() {
    simpanPrinter({
      nama: printer,
      lebarKertas: Number(lebar) as 58 | 80,
      cetakOtomatis: otomatis,
      salinan,
      kepalaStruk: kepala,
      kakiStruk: kaki,
    });
    setBarusanSimpan(true);
    setTimeout(() => setBarusanSimpan(false), 2400);
  }

  return (
    <form
      className="kolom-2"
      onSubmit={(e) => {
        e.preventDefault();
        simpan();
      }}
    >
      <section className="kartu">
        <div className="kartu-judul">
          <h2>Printer</h2>
        </div>

        <div className="form-grid">
          <div className="bidang">
            <label htmlFor="printer-nama">Printer aktif</label>
            <Select id="printer-nama" label="Printer aktif" nilai={printer} opsi={OPSI_PRINTER} onUbah={setPrinter} lebarPenuh />
          </div>

          <div className="bidang">
            <label htmlFor="printer-lebar">Lebar kertas</label>
            <Select id="printer-lebar" label="Lebar kertas" nilai={lebar} opsi={OPSI_LEBAR} onUbah={setLebar} lebarPenuh />
            <span className="bantuan">Lebar kertas menentukan berapa karakter yang muat dalam satu baris struk.</span>
          </div>

          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">Cetak otomatis setelah bayar</span>
              <span className="s">Kalau mati, kasir mencetak manual dari layar transaksi</span>
            </span>
            <Sakelar nilai={otomatis} onUbah={setOtomatis} label="Cetak otomatis setelah bayar" />
          </div>

          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">Jumlah salinan</span>
              <span className="s">Satu untuk pelanggan, tambahan untuk arsip toko</span>
            </span>
            <Stepper nilai={salinan} onUbah={setSalinan} min={1} maks={3} label="jumlah salinan struk" />
          </div>

          <div className="bidang">
            <label htmlFor="struk-kepala">Kepala struk</label>
            <textarea id="struk-kepala" className="textarea" value={kepala} onChange={(e) => setKepala(e.target.value)} />
          </div>

          <div className="bidang">
            <label htmlFor="struk-kaki">Kaki struk</label>
            <textarea id="struk-kaki" className="textarea" value={kaki} onChange={(e) => setKaki(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <button type="submit" className="btn">Simpan perubahan</button>
            {barusanSimpan ? <Badge tone="success">Tersimpan</Badge> : null}
          </div>
        </div>
      </section>

      <div className="kolom-sisi">
        <div className="kartu-judul">
          <h2>Pratinjau struk</h2>
          <button type="button" className="btn btn-sekunder btn-sm" onClick={() => window.print()}>
            <Printer className="lucide" size={16} aria-hidden="true" />
            <span>Cetak pratinjau</span>
          </button>
        </div>
        <Struk
          nomor="TRX-20260729-0018"
          waktu="2026-07-29T14:35:00"
          kasir={PENGGUNA[2].nama}
          meja="A3"
          baris={CONTOH}
          ringkasan={ringkasan}
          pembayaran={[{ metode: 'tunai', jumlah: 100000 }]}
          kepalaStruk={kepala}
          kakiStruk={kaki}
          lebar={Number(lebar) as 58 | 80}
        />
      </div>
    </form>
  );
}
