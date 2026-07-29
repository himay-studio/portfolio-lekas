'use client';

import { useState } from 'react';
import { PENGATURAN_PAJAK } from '@/data/operasional';
import { rupiah } from '@/lib/format';
import { hitung } from '@/lib/kasir';
import { CatatanStage, Sakelar } from '@/components/ui/Primitives';
import { Select } from '@/components/ui/Select';

const OPSI_PEMBULATAN = [
  { nilai: '0', label: 'Tanpa pembulatan' },
  { nilai: '100', label: 'Kelipatan 100 rupiah' },
  { nilai: '500', label: 'Kelipatan 500 rupiah' },
  { nilai: '1000', label: 'Kelipatan 1.000 rupiah' },
];

/**
 * Pengaturan pajak dan service charge, lengkap dengan pratinjau hitung.
 *
 * Pratinjaunya memakai `hitung()` yang sama persis dengan layar Kasir, jadi
 * angka yang muncul di sini pasti sama dengan yang nanti tercetak di struk.
 * Pratinjau yang menghitung sendiri akan berselisih dengan kasir pada
 * perubahan aturan pertama, dan pemilik toko akan mempercayai yang salah.
 *
 * Urutannya juga terlihat di sini dan memang mengikat: service charge dihitung
 * dari dasar kena, lalu pajak dihitung dari dasar kena DITAMBAH service charge.
 */
export function PajakForm() {
  const [pajakAktif, setPajakAktif] = useState(PENGATURAN_PAJAK.pajakAktif);
  const [pajak, setPajak] = useState(String(PENGATURAN_PAJAK.pajakPersen));
  const [serviceAktif, setServiceAktif] = useState(PENGATURAN_PAJAK.serviceAktif);
  const [service, setService] = useState(String(PENGATURAN_PAJAK.servicePersen));
  const [pembulatan, setPembulatan] = useState(String(PENGATURAN_PAJAK.pembulatan));
  const [termasuk, setTermasuk] = useState(PENGATURAN_PAJAK.hargaSudahTermasukPajak);

  const contoh = hitung(
    [{ qty: 2, hargaSatuan: 22000, diskonItem: null }, { qty: 1, hargaSatuan: 28000, diskonItem: null }],
    {
      diskonTransaksi: null,
      servicePersen: serviceAktif ? Number(service) || 0 : 0,
      pajakPersen: pajakAktif ? Number(pajak) || 0 : 0,
      pembulatan: Number(pembulatan) || 0,
    },
  );

  return (
    <div className="kolom-2">
      <section className="kartu">
        <div className="kartu-judul">
          <h2>Pajak dan service charge</h2>
        </div>

        <div className="form-grid">
          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">Kenakan pajak</span>
              <span className="s">Pajak dihitung setelah service charge</span>
            </span>
            <Sakelar nilai={pajakAktif} onUbah={setPajakAktif} label="Kenakan pajak" />
          </div>

          <div className="bidang">
            <label htmlFor="pajak-persen">Besar pajak dalam persen</label>
            <input
              id="pajak-persen"
              className="input input-num"
              type="number"
              min={0}
              max={100}
              value={pajak}
              onChange={(e) => setPajak(e.target.value)}
              disabled={!pajakAktif}
            />
          </div>

          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">Harga sudah termasuk pajak</span>
              <span className="s">Kalau aktif, pajak dipisahkan dari harga jual, bukan ditambahkan</span>
            </span>
            <Sakelar nilai={termasuk} onUbah={setTermasuk} label="Harga sudah termasuk pajak" />
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 0 }} />

          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">Kenakan service charge</span>
              <span className="s">Biasanya hanya untuk transaksi kedai, bukan retail</span>
            </span>
            <Sakelar nilai={serviceAktif} onUbah={setServiceAktif} label="Kenakan service charge" />
          </div>

          <div className="bidang">
            <label htmlFor="service-persen">Besar service charge dalam persen</label>
            <input
              id="service-persen"
              className="input input-num"
              type="number"
              min={0}
              max={100}
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={!serviceAktif}
            />
          </div>

          <div className="bidang">
            <label htmlFor="pembulatan">Pembulatan total</label>
            <Select
              id="pembulatan"
              label="Pembulatan total"
              nilai={pembulatan}
              opsi={OPSI_PEMBULATAN}
              onUbah={setPembulatan}
              lebarPenuh
            />
            <span className="bantuan">
              Pembulatan diterapkan pada total akhir dan selisihnya tetap dicetak di struk.
            </span>
          </div>
        </div>
      </section>

      <div className="kolom-sisi">
        <section className="kartu">
          <div className="kartu-judul">
            <h2>Pratinjau perhitungan</h2>
          </div>
          <p className="bantuan" style={{ marginBottom: 'var(--sp-3)' }}>
            Contoh: dua Kopi Susu dan satu Nasi Goreng. Dihitung dengan mesin yang sama persis
            dengan layar Kasir.
          </p>
          <dl className="def">
            <div className="def-baris"><dt>Subtotal item</dt><dd className="num">{rupiah(contoh.brutoItem)}</dd></div>
            <div className="def-baris"><dt>Dasar kena</dt><dd className="num">{rupiah(contoh.dasarKena)}</dd></div>
            <div className="def-baris"><dt>Service charge</dt><dd className="num">{rupiah(contoh.service)}</dd></div>
            <div className="def-baris"><dt>Pajak</dt><dd className="num">{rupiah(contoh.pajak)}</dd></div>
            <div className="def-baris"><dt>Pembulatan</dt><dd className="num">{rupiah(contoh.pembulatan)}</dd></div>
            <div className="def-baris">
              <dt>Total</dt>
              <dd className="num-besar" style={{ fontSize: 24, lineHeight: '30px' }}>{rupiah(contoh.total)}</dd>
            </div>
          </dl>
        </section>

        <CatatanStage>
          Sakelar harga sudah termasuk pajak belum mengubah perhitungan. Stage 5 menambahkan mode
          itu ke `lib/kasir.ts` beserta pengujiannya, karena membaliknya menyentuh setiap total di
          aplikasi.
        </CatatanStage>
      </div>
    </div>
  );
}
