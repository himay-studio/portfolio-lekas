import { AppShell } from '@/components/shell/AppShell';
import { PageTransition } from '@/components/shell/PageTransition';

/**
 * Layout area aplikasi.
 *
 * `AppShell` memegang sidebar, topbar, dan laci mobile. `PageTransition`
 * membungkus isi halaman saja, bukan kerangkanya, supaya yang beranimasi di
 * setiap perpindahan rute (R46) hanya kontennya. Kalau sidebar ikut memudar
 * setiap kali menu diklik, navigasi terasa lambat padahal durasinya sama.
 */
export default function LayoutAplikasi({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  );
}
