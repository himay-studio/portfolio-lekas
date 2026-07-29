'use client';

import { useEffect, useState } from 'react';
import { rupiah } from '@/lib/format';
import { hitung } from '@/lib/kasir';
import { usePajakStore } from '@/lib/pengaturanStore';
import { Badge, Sakelar } from '@/components/ui/Primitives';
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
  const { pajak: tersimpan, simpanPajak, siap } = usePajakStore();
  const [pajakAktif, setPajakAktif] = useState(tersimpan.pajakAktif);
  const [pajak, setPajak] = useState(String(tersimpan.pajakPersen));
  const [serviceAktif, setServiceAktif] = useState(tersimpan.serviceAktif);
  const [service, setService] = useState(String(tersimpan.servicePersen));
  const [pembulatan, setPembulatan] = useState(String(tersimpan.pembulatan));
  const [termasuk, setTermasuk] = useState(tersimpan.hargaSudahTermasukPajak);
  const [barusanSimpan, setBarusanSimpan] = useState(false);

  // Timpaan localStorage baru terbaca setelah mount (lihat catatan hidrasi di
  // `lib/storage.ts`), jadi begitu siap, form disinkronkan sekali dari nilai
  // yang sudah tersimpan supaya pengunjung yang kembali melihat pilihannya
  // sendiri, bukan nilai demo bawaan.
  useEffect(() => {
    if (!siap) return;
    setPajakAktif(tersimpan.pajakAktif);
    setPajak(String(tersimpan.pajakPersen));
    setServiceAktif(tersimpan.serviceAktif);
    setService(String(tersimpan.servicePersen));
    setPembulatan(String(tersimpan.pembulatan));
    setTermasuk(tersimpan.hargaSudahTermasukPajak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siap]);

  const contoh = hitung(
    [{ qty: 2, hargaSatuan: 22000, diskonItem: null }, { qty: 1, hargaSatuan: 28000, diskonItem: null }],
    {
      diskonTransaksi: null,
      servicePersen: serviceAktif ? Number(service) || 0 : 0,
      pajakPersen: pajakAktif ? Number(pajak) || 0 : 0,
      pembulatan: Number(pembulatan) || 0,
      hargaSudahTermasukPajak: termasuk,
    },
  );

  function simpan() {
    simpanPajak({
      pajakAktif,
      pajakPersen: Number(pajak) || 0,
      serviceAktif,
      servicePersen: Number(service) || 0,
      pembulatan: Number(pembulatan) || 0,
      hargaSudahTermasukPajak: termasuk,
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
          <p className="bantuan" style={{ marginTop: 'var(--sp-3)' }}>
            {termasuk
              ? 'Harga sudah termasuk pajak aktif: pajak diekstrak dari dasar kena ditambah service, tidak ditambahkan lagi di atasnya.'
              : 'Pajak dan service ditambahkan di atas harga jual, seperti biasa.'}
          </p>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <button type="submit" className="btn">Simpan perubahan</button>
          {barusanSimpan ? <Badge tone="success">Tersimpan</Badge> : null}
        </div>
      </div>
    </form>
  );
}
