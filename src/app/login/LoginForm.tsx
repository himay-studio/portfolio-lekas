'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LABEL_PERAN, PENGGUNA } from '@/data/operasional';
import { Avatar } from '@/components/ui/Primitives';
import { tulisSesi } from '@/lib/sesi';

const KANDIDAT = [PENGGUNA[0], PENGGUNA[1], PENGGUNA[2]];

/**
 * Layar masuk demo.
 *
 * Tidak ada autentikasi sungguhan, dan kredensialnya sengaja ditampilkan di
 * layar. Demo portfolio yang meminta orang menebak kata sandi akan kehilangan
 * pengunjung di detik pertama, jadi satu klik langsung masuk.
 *
 * Peran yang dipilih menyambung ke `lib/sesi.ts`: seluruh aplikasi membaca
 * pengguna yang sedang masuk dari sana, jadi tombol yang tidak diizinkan
 * peran ini (diskon transaksi, void, kelola produk, dan seterusnya) memang
 * disembunyikan atau dinonaktifkan, bukan cuma teori di halaman Pengguna.
 */
export function LoginForm() {
  const router = useRouter();
  const [peranId, setPeranId] = useState(KANDIDAT[0].id);
  const dipilih = KANDIDAT.find((u) => u.id === peranId) ?? KANDIDAT[0];

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        tulisSesi(dipilih.id);
        router.push(dipilih.peran === 'kasir' ? '/app/kasir/' : '/app/');
      }}
    >
      <div className="masuk-kredensial">
        <dl>
          <dt>Surel</dt>
          <dd>{dipilih.email}</dd>
          <dt>Kata sandi</dt>
          <dd>demo1234</dd>
        </dl>
      </div>

      <fieldset className="bidang" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="bantuan" style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
          Masuk sebagai
        </legend>
        <div className="masuk-peran">
          {KANDIDAT.map((u) => (
            <button
              key={u.id}
              type="button"
              className="masuk-peran-btn"
              aria-pressed={u.id === peranId}
              onClick={() => setPeranId(u.id)}
            >
              <Avatar inisial={u.inisial} warna={u.warna} />
              <span className="stack">
                <span className="t">{u.nama}</span>
                <span className="s">{LABEL_PERAN[u.peran]}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn btn-bayar btn-lg btn-blok">
        Masuk demo
      </button>

      <p className="bantuan">
        Ini demo portfolio. Tidak ada autentikasi sungguhan dan tidak ada data yang dikirim ke mana pun.
        Semua perubahan hanya tersimpan di peramban ini.
      </p>
    </form>
  );
}
