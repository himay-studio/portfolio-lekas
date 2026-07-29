import { Check, Minus, UserPlus } from 'lucide-react';
import type { Metadata } from 'next';
import { HAK_AKSES, LABEL_PERAN, PENGGUNA } from '@/data/operasional';
import { jam, tanggalPendek } from '@/lib/format';
import { PageHeader } from '@/components/shell/PageHeader';
import { Avatar, Badge, CatatanStage } from '@/components/ui/Primitives';
import { PengaturanNav } from '../PengaturanNav';

export const metadata: Metadata = {
  title: 'Pengguna dan peran, Lekas',
  description: 'Daftar pengguna, peran pemilik, manajer, dan kasir, beserta hak aksesnya.',
};

export default function HalamanPengguna() {
  return (
    <>
      <PageHeader
        judul="Pengguna dan peran"
        ket="Tiga peran: pemilik, manajer, dan kasir. Hak aksesnya melekat pada peran, bukan pada orangnya."
        remah={[{ label: 'Pengaturan', href: '/app/pengaturan/' }, { label: 'Pengguna dan peran' }]}
        aksi={(
          <button type="button" className="btn">
            <UserPlus className="lucide" size={16} aria-hidden="true" />
            <span>Undang pengguna</span>
          </button>
        )}
      />

      <PengaturanNav />

      <section className="kartu" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="kartu-judul">
          <h2>Pengguna</h2>
        </div>

        <div className="tbl-bungkus tbl-desktop">
          <table className="tbl" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col" style={{ width: 130 }}>Peran</th>
                <th scope="col" className="kolom-opsional">Surel</th>
                <th scope="col" style={{ width: 170 }} className="kolom-opsional">Terakhir masuk</th>
                <th scope="col" style={{ width: 110 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {PENGGUNA.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Avatar inisial={u.inisial} warna={u.warna} ukuran="sm" nama={u.nama} />
                      <span className="stack">
                        <span className="t">{u.nama}</span>
                        <span className="s">{LABEL_PERAN[u.peran]}</span>
                      </span>
                    </span>
                  </td>
                  <td><Badge tone={u.peran === 'pemilik' ? 'brand' : u.peran === 'manajer' ? 'info' : 'neutral'}>{LABEL_PERAN[u.peran]}</Badge></td>
                  <td className="kolom-opsional">{u.email}</td>
                  <td className="kolom-opsional">{tanggalPendek(u.terakhirMasuk)} {jam(u.terakhirMasuk)}</td>
                  <td><Badge tone={u.aktif ? 'success' : 'danger'}>{u.aktif ? 'Aktif' : 'Nonaktif'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tbl-kartu tbl-mobile">
          {PENGGUNA.map((u) => (
            <div key={u.id} className="tbl-kartu-item">
              <div className="item-kartu-atas">
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <Avatar inisial={u.inisial} warna={u.warna} ukuran="sm" nama={u.nama} />
                  <span className="stack">
                    <span className="t">{u.nama}</span>
                    <span className="s">{LABEL_PERAN[u.peran]}</span>
                  </span>
                </span>
                <Badge tone={u.aktif ? 'success' : 'danger'}>{u.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
              <div className="tbl-kartu-baris">
                <span className="tbl-kartu-label">Surel</span>
                <span className="tbl-kartu-nilai">{u.email}</span>
              </div>
              <div className="tbl-kartu-baris">
                <span className="tbl-kartu-label">Terakhir masuk</span>
                <span className="tbl-kartu-nilai">{tanggalPendek(u.terakhirMasuk)} {jam(u.terakhirMasuk)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="kartu">
        <div className="kartu-judul">
          <h2>Hak akses per peran</h2>
        </div>

        <div className="tbl-bungkus">
          <table className="tbl" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th scope="col">Kemampuan</th>
                <th scope="col" style={{ width: 110 }}>Pemilik</th>
                <th scope="col" style={{ width: 110 }}>Manajer</th>
                <th scope="col" style={{ width: 110 }}>Kasir</th>
              </tr>
            </thead>
            <tbody>
              {HAK_AKSES.map((h) => (
                <tr key={h.id}>
                  <td>{h.label}</td>
                  {[h.pemilik, h.manajer, h.kasir].map((punya, i) => (
                    <td key={i}>
                      {/* Ikon tidak pernah berdiri sendiri sebagai penanda makna,
                          selalu ada teks untuk pembaca layar. */}
                      {punya ? (
                        <span style={{ color: 'var(--success-ink)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Check className="lucide" size={16} aria-hidden="true" />
                          <span className="sr">Bisa</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Minus className="lucide" size={16} aria-hidden="true" />
                          <span className="sr">Tidak bisa</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ marginTop: 'var(--sp-5)' }}>
        <CatatanStage>
          Peran belum benar benar membatasi apa pun di demo ini, dan itu ditulis apa adanya supaya
          tidak terbaca sebagai fitur yang sudah jadi. Stage 5 menyambungkan peran yang dipilih di
          layar masuk ke tombol yang tampil di tiap halaman.
        </CatatanStage>
      </div>
    </>
  );
}
