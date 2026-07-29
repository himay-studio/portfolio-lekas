import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Masuk demo, Lekas',
  description: 'Layar masuk demo aplikasi kasir Lekas. Kredensial ditampilkan di layar, satu klik langsung masuk.',
};

export default function Login() {
  return (
    <main id="isi" className="masuk">
      <div className="masuk-kotak">
        <Link href="/" aria-label="Lekas, ke halaman depan">
          <img className="masuk-logo" src="/logo-lekas-primary.svg" alt="Lekas" />
        </Link>

        <div className="kartu kartu-besar">
          <div className="ph-judul" style={{ marginBottom: 'var(--sp-4)' }}>
            <h1 style={{ fontSize: 22, lineHeight: '28px' }}>Masuk ke Lekas</h1>
            <span className="ph-ket">Pilih peran, lalu masuk. Tidak perlu mengetik apa pun.</span>
          </div>
          <LoginForm />
        </div>

        <p className="bantuan" style={{ textAlign: 'center', marginTop: 'var(--sp-4)' }}>
          Dibuat oleh{' '}
          <a href="https://himaystudio.com" target="_blank" rel="noopener">Himay Studio</a>
        </p>
      </div>
    </main>
  );
}
