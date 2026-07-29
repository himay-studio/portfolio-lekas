'use client';

import { Check, Minus, UserPlus } from 'lucide-react';
import { HAK_AKSES, LABEL_PERAN, PENGGUNA } from '@/data/operasional';
import { jam, tanggalPendek } from '@/lib/format';
import { bisa, useSesi } from '@/lib/sesi';
import { PageHeader } from '@/components/shell/PageHeader';
import { Avatar, Badge, Kosong } from '@/components/ui/Primitives';
import { PengaturanNav } from '../PengaturanNav';

/**
 * Pengguna dan peran.
 *
 * Halaman ini sendiri adalah tempat matriks `HAK_AKSES` didefinisikan secara
 * visual, dan sekarang matriks itu BENAR BENAR menggerakkan aplikasi lewat
 * `lib/sesi.ts` (`bisa(peran, kemampuan)`): diskon transaksi dan void di
 * layar Kasir/Transaksi, kelola produk di halaman Produk, tutup shift kasir
 * lain di halaman Shift, dan akses ke halaman ini sendiri semuanya membaca
 * baris yang sama di tabel di bawah. Mengelola pengguna sendiri dibatasi
 * hanya untuk peran Pemilik.
 */
export function PenggunaClient() {
  const [kasir] = useSesi();
  const bolehKelola = bisa(kasir.peran, 'pengguna');

  return (
    <>
      <PageHeader
        judul="Pengguna dan peran"
        ket="Tiga peran: pemilik, manajer, dan kasir. Hak aksesnya melekat pada peran, bukan pada orangnya."
        remah={[{ label: 'Pengaturan', href: '/app/pengaturan/' }, { label: 'Pengguna dan peran' }]}
        aksi={bolehKelola ? (
          <button type="button" className="btn">
            <UserPlus className="lucide" size={16} aria-hidden="true" />
            <span>Undang pengguna</span>
          </button>
        ) : null}
      />

      <PengaturanNav />

      {!bolehKelola ? (
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <Kosong
            judul="Anda masuk sebagai"
            ket={`${kasir.nama}, ${LABEL_PERAN[kasir.peran]}. Mengelola daftar pengguna hanya bisa dilakukan oleh peran Pemilik. Anda tetap bisa melihat matriks hak akses di bawah.`}
          />
        </div>
      ) : (
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
      )}

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
    </>
  );
}
