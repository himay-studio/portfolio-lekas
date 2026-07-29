import type { Metadata } from 'next';
import { OUTLET, PENGATURAN_TOKO } from '@/data/operasional';
import { PageHeader } from '@/components/shell/PageHeader';
import { CatatanStage } from '@/components/ui/Primitives';
import { PengaturanNav } from './PengaturanNav';

export const metadata: Metadata = {
  title: 'Pengaturan, Lekas',
  description: 'Profil toko, pajak, printer, serta pengguna dan peran.',
};

export default function HalamanPengaturan() {
  return (
    <>
      <PageHeader
        judul="Pengaturan"
        ket="Profil toko yang tercetak di struk dan tampil di seluruh aplikasi."
        aksi={<button type="button" className="btn">Simpan perubahan</button>}
      />

      <PengaturanNav />

      <div className="kolom-2">
        <section className="kartu">
          <div className="kartu-judul">
            <h2>Profil toko</h2>
          </div>
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="bidang">
                <label htmlFor="toko-nama">Nama toko</label>
                <input id="toko-nama" className="input" defaultValue={PENGATURAN_TOKO.nama} />
              </div>
              <div className="bidang">
                <label htmlFor="toko-telepon">Telepon</label>
                <input id="toko-telepon" className="input" defaultValue={PENGATURAN_TOKO.telepon} />
              </div>
            </div>

            <div className="bidang">
              <label htmlFor="toko-slogan">Slogan</label>
              <input id="toko-slogan" className="input" defaultValue={PENGATURAN_TOKO.slogan} />
              <span className="bantuan">Muncul di halaman depan dan di bagian bawah struk.</span>
            </div>

            <div className="bidang">
              <label htmlFor="toko-alamat">Alamat</label>
              <textarea id="toko-alamat" className="textarea" defaultValue={PENGATURAN_TOKO.alamat} />
            </div>

            <div className="form-grid form-grid-2">
              <div className="bidang">
                <label htmlFor="toko-npwp">NPWP</label>
                <input id="toko-npwp" className="input mono" defaultValue={PENGATURAN_TOKO.npwp} />
              </div>
              <div className="bidang">
                <label htmlFor="toko-zona">Zona waktu</label>
                <input id="toko-zona" className="input" defaultValue={PENGATURAN_TOKO.zonaWaktu} readOnly />
                <span className="bantuan">Zona waktu mengikuti outlet dan belum bisa diubah di demo.</span>
              </div>
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
          </section>

          <CatatanStage>
            Form ini belum menyimpan apa pun. Stage 5 menyambungkannya ke penyimpanan demo di
            localStorage dan menambah pengelola outlet.
          </CatatanStage>
        </div>
      </div>
    </>
  );
}
