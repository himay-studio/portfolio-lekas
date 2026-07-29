import type { Metadata } from 'next';
import { BerandaClient } from './BerandaClient';

export const metadata: Metadata = { title: 'Beranda, Lekas' };

export default function Beranda() {
  return <BerandaClient />;
}
