import type { Metadata } from 'next';
import { PageHeader } from '@/components/shell/PageHeader';
import { PengaturanNav } from './PengaturanNav';
import { ProfilTokoForm } from './ProfilTokoForm';

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
      />

      <PengaturanNav />

      <ProfilTokoForm />
    </>
  );
}
