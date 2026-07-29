import type { Metadata } from 'next';
import { PageHeader } from '@/components/shell/PageHeader';
import { PengaturanNav } from '../PengaturanNav';
import { PrinterForm } from './PrinterForm';

export const metadata: Metadata = {
  title: 'Printer dan struk, Lekas',
  description: 'Atur printer termal, lebar kertas, salinan, serta kepala dan kaki struk.',
};

export default function HalamanPrinter() {
  return (
    <>
      <PageHeader
        judul="Printer dan struk"
        ket="Yang diatur di sini langsung terlihat di pratinjau struk di sebelah kanan."
        remah={[{ label: 'Pengaturan', href: '/app/pengaturan/' }, { label: 'Printer dan struk' }]}
      />
      <PengaturanNav />
      <PrinterForm />
    </>
  );
}
