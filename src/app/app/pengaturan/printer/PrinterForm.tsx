'use client';

import { useState } from 'react';
import { PENGATURAN_PAJAK, PENGATURAN_PRINTER, PENGGUNA } from '@/data/operasional';
import { hitung } from '@/lib/kasir';
import { Struk } from '@/components/kasir/Struk';
import { CatatanStage, Sakelar, Stepper } from '@/components/ui/Primitives';
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

export function PrinterForm() {
  const [printer, setPrinter] = useState(PENGATURAN_PRINTER.nama);
  const [lebar, setLebar] = useState(String(PENGATURAN_PRINTER.lebarKertas));
  const [otomatis, setOtomatis] = useState(PENGATURAN_PRINTER.cetakOtomatis);
  const [salinan, setSalinan] = useState(PENGATURAN_PRINTER.salinan);
  const [kepala, setKepala] = useState(PENGATURAN_PRINTER.kepalaStruk);
  const [kaki, setKaki] = useState(PENGATURAN_PRINTER.kakiStruk);

  const ringkasan = hitung(CONTOH, {
    diskonTransaksi: null,
    servicePersen: PENGATURAN_PAJAK.servicePersen,
    pajakPersen: PENGATURAN_PAJAK.pajakPersen,
    pembulatan: PENGATURAN_PAJAK.pembulatan,
  });

  return (
    <div className="kolom-2">
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
        </div>
      </section>

      <div className="kolom-sisi">
        <h2>Pratinjau struk</h2>
        <Struk
          nomor="TRX-20260729-0018"
          waktu="2026-07-29T14:35:00"
          kasir={PENGGUNA[2].nama}
          meja="A3"
          baris={CONTOH}
          ringkasan={ringkasan}
          pembayaran={[{ metode: 'tunai', jumlah: 100000 }]}
        />

        <CatatanStage>
          Kepala dan kaki struk di pratinjau masih dibaca dari data demo, bukan dari kotak teks di
          sebelah. Stage 5 menyambungkannya sekaligus menambah pemilihan lebar 58 mm yang benar
          benar mengubah lebar baris.
        </CatatanStage>
      </div>
    </div>
  );
}
