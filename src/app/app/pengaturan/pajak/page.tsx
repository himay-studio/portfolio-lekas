import type { Metadata } from 'next';
import { PageHeader } from '@/components/shell/PageHeader';
import { PengaturanNav } from '../PengaturanNav';
import { PajakForm } from './PajakForm';

export const metadata: Metadata = {
  title: 'Pajak dan service, Lekas',
  description: 'Atur pajak, service charge, dan pembulatan total.',
};

export default function HalamanPajak() {
  return (
    <>
      <PageHeader
        judul="Pajak dan service"
        ket="Urutannya mengikat: service charge dari dasar kena, lalu pajak dari dasar kena ditambah service charge."
        remah={[{ label: 'Pengaturan', href: '/app/pengaturan/' }, { label: 'Pajak dan service' }]}
        aksi={<button type="button" className="btn">Simpan perubahan</button>}
      />
      <PengaturanNav />
      <PajakForm />
    </>
  );
}
