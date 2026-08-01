import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Manrope } from 'next/font/google';
import './globals.css';
import './app.css';
import { GtmHead, GtmNoScript, MetaPixelClient } from '@/components/Analytics';

/**
 * Tiga keluarga huruf sesuai DESIGN.md 4.1, dimuat lewat `next/font/google`
 * supaya ikut ter-bundle pada ekspor statis dan tidak bergantung pada
 * permintaan ke domain pihak ketiga saat halaman dibuka.
 */
const display = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const ui = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  /**
   * Domain publik menurut R26 dan R40, yaitu custom domain, BUKAN alamat
   * `*.pages.dev`. Tanpa `metadataBase`, gambar Open Graph diselesaikan
   * terhadap `http://localhost:3000` dan tautan pratinjaunya mati di mana pun
   * di luar mesin build.
   */
  metadataBase: new URL('https://portfolio-lekas.himaystudio.com'),
  title: 'Lekas, Portfolio Aplikasi Kasir by Himay Studio',
  description:
    'Demo aplikasi kasir Lekas untuk toko retail dan kedai F&B. Proyek pembuatan aplikasi web oleh Himay Studio. Ingin aplikasi seperti ini? Hubungi kami.',
  alternates: {
    canonical: '/',
  },
  applicationName: 'Lekas',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Lekas, aplikasi kasir untuk retail dan F&B',
    description: 'Cepat di kasir, pas di laci. Demo portfolio aplikasi kasir oleh Himay Studio.',
    images: ['/og-lekas.png'],
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1424',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${ui.variable} ${mono.variable}`}>
      <head>
        {/* R36: GTM as high in the head as the framework allows */}
        <GtmHead />
      </head>
      <body>
        {/* R36: the noscript iframe immediately after the opening body tag */}
        <GtmNoScript />
        {/* HIM-360: Meta Pixel (browser) + CAPI trigger client, no-op-safe */}
        <MetaPixelClient />
        <a className="lewati" href="#isi">Lewati ke konten utama</a>
        {children}
      </body>
    </html>
  );
}
