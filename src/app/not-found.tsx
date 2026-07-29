import Link from 'next/link';

/**
 * Halaman 404.
 *
 * Rute ini memang tidak ditautkan dari mana pun, dan itu bukan halaman yatim
 * yang dilarang R59: dia dijangkau saat alamat tidak dikenal, bukan lewat
 * tautan. Sapuan yatim di `scripts/qa-check.mjs` mengecualikan `/404/` secara
 * eksplisit karena alasan itu.
 */
export default function TidakDitemukan() {
  return (
    <main id="isi" className="masuk">
      <div className="masuk-kotak" style={{ textAlign: 'center' }}>
        <img className="masuk-logo" src="/logo-lekas-primary.svg" alt="Lekas" />
        <div className="kartu kartu-besar">
          <span className="stack" style={{ alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <span className="t" style={{ fontSize: 22, lineHeight: '28px', fontWeight: 700 }}>
              Halaman tidak ditemukan
            </span>
            <span className="s">Alamat yang kamu buka tidak ada di aplikasi ini.</span>
          </span>
          <Link className="btn btn-blok" href="/app/">Ke beranda aplikasi</Link>
        </div>
      </div>
    </main>
  );
}
