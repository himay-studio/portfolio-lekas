'use client';

import { useEffect, useState } from 'react';
import { OUTLET } from '@/data/operasional';
import { useTokoStore } from '@/lib/pengaturanStore';
import { Badge } from '@/components/ui/Primitives';

/**
 * Form profil toko. Menyimpan ke `pengaturanStore`, dipakai di mana pun
 * `PENGATURAN_TOKO` dipakai untuk render langsung (misalnya nama toko di
 * kepala Beranda), supaya mengubah nama toko di sini benar benar terlihat di
 * seluruh aplikasi, bukan cuma di kotak formulir ini.
 */
export function ProfilTokoForm() {
  const { toko: tersimpan, simpanToko, siap } = useTokoStore();
  const [nama, setNama] = useState(tersimpan.nama);
  const [telepon, setTelepon] = useState(tersimpan.telepon);
  const [slogan, setSlogan] = useState(tersimpan.slogan);
  const [alamat, setAlamat] = useState(tersimpan.alamat);
  const [npwp, setNpwp] = useState(tersimpan.npwp);
  const [barusanSimpan, setBarusanSimpan] = useState(false);

  useEffect(() => {
    if (!siap) return;
    setNama(tersimpan.nama);
    setTelepon(tersimpan.telepon);
    setSlogan(tersimpan.slogan);
    setAlamat(tersimpan.alamat);
    setNpwp(tersimpan.npwp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siap]);

  return (
    <form
      className="kolom-2"
      onSubmit={(e) => {
        e.preventDefault();
        simpanToko({ nama, telepon, slogan, alamat, npwp });
        setBarusanSimpan(true);
        setTimeout(() => setBarusanSimpan(false), 2400);
      }}
    >
      <section className="kartu">
        <div className="kartu-judul">
          <h2>Profil toko</h2>
        </div>
        <div className="form-grid">
          <div className="form-grid form-grid-2">
            <div className="bidang">
              <label htmlFor="toko-nama">Nama toko</label>
              <input id="toko-nama" className="input" value={nama} onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="bidang">
              <label htmlFor="toko-telepon">Telepon</label>
              <input id="toko-telepon" className="input" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
          </div>

          <div className="bidang">
            <label htmlFor="toko-slogan">Slogan</label>
            <input id="toko-slogan" className="input" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
            <span className="bantuan">Muncul di halaman depan dan di bagian bawah struk.</span>
          </div>

          <div className="bidang">
            <label htmlFor="toko-alamat">Alamat</label>
            <textarea id="toko-alamat" className="textarea" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </div>

          <div className="form-grid form-grid-2">
            <div className="bidang">
              <label htmlFor="toko-npwp">NPWP</label>
              <input id="toko-npwp" className="input mono" value={npwp} onChange={(e) => setNpwp(e.target.value)} />
            </div>
            <div className="bidang">
              <label htmlFor="toko-zona">Zona waktu</label>
              <input id="toko-zona" className="input" defaultValue={tersimpan.zonaWaktu} readOnly />
              <span className="bantuan">Zona waktu mengikuti outlet dan belum bisa diubah di demo.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <button type="submit" className="btn">Simpan perubahan</button>
            {barusanSimpan ? <Badge tone="success">Tersimpan</Badge> : null}
          </div>
        </div>
      </section>

      <div className="kolom-sisi">
        <section className="kartu">
          <div className="kartu-judul">
            <h2>Outlet</h2>
          </div>
          <div className="tbl-kartu">
            {OUTLET.map((o) => (
              <div key={o.id} className="tbl-kartu-item">
                <span className="stack">
                  <span className="t">{o.nama}</span>
                  <span className="s">{o.alamat}</span>
                </span>
                <div className="tbl-kartu-baris">
                  <span className="tbl-kartu-label">Tipe usaha</span>
                  <span className="tbl-kartu-nilai">{o.tipe === 'fnb' ? 'Kedai F&B' : 'Retail'}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="bantuan" style={{ marginTop: 'var(--sp-3)' }}>
            Menambah outlet baru memerlukan konfigurasi pajak dan printer tersendiri, di luar cakupan
            demo ini. Dua outlet yang ada sudah cukup untuk menunjukkan bagaimana transaksi dan shift
            terbagi per outlet.
          </p>
        </section>
      </div>
    </form>
  );
}
