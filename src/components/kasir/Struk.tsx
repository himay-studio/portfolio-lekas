import { PENGATURAN_PRINTER, PENGATURAN_TOKO } from '@/data/operasional';
import type { BarisBayar } from '@/data/types';
import { angka, jam, rupiah, tanggalPendek } from '@/lib/format';
import { LABEL_METODE, nettoBaris, type BarisKeranjang, type RingkasanUang } from '@/lib/kasir';

/**
 * Pratinjau struk.
 *
 * Sengaja dirender sebagai DOM mono berlebar tetap, meniru cetakan printer
 * termal 80mm, bukan sebagai gambar. Konsekuensinya bagus: teksnya ikut
 * tersapu pemeriksaan kontras dan pemeriksaan `innerText`, bisa dipilih dan
 * disalin, dan tidak mungkin memuat angka yang sudah basi dibanding transaksi
 * di sebelahnya.
 */
export function Struk({
  nomor,
  waktu,
  kasir,
  meja,
  baris,
  ringkasan,
  pembayaran,
  kepalaStruk = PENGATURAN_PRINTER.kepalaStruk,
  kakiStruk = PENGATURAN_PRINTER.kakiStruk,
  namaToko = PENGATURAN_TOKO.nama,
  lebar = PENGATURAN_PRINTER.lebarKertas,
}: {
  nomor: string;
  waktu: string;
  kasir: string;
  meja?: string | null;
  baris: Pick<BarisKeranjang, 'nama' | 'qty' | 'hargaSatuan' | 'diskonItem' | 'opsi'>[];
  ringkasan: RingkasanUang;
  pembayaran: BarisBayar[];
  /** Kalau tidak diberikan, dibaca dari pengaturan printer dasar. */
  kepalaStruk?: string;
  kakiStruk?: string;
  namaToko?: string;
  /** 58mm untuk printer kecil (32 karakter), 80mm untuk printer standar. */
  lebar?: 58 | 80;
}) {
  const dibayar = pembayaran.reduce((a, p) => a + p.jumlah, 0);

  return (
    <div className="struk" data-lebar={lebar} data-area-cetak="struk">
      <div className="struk-tengah">
        {kepalaStruk.split('\n').map((b, i) => (
          <div key={`${b}-${i}`}>{b}</div>
        ))}
      </div>
      <hr className="struk-garis" />

      <div className="struk-baris"><span>No</span><span>{nomor}</span></div>
      <div className="struk-baris"><span>Waktu</span><span>{tanggalPendek(waktu)} {jam(waktu)}</span></div>
      <div className="struk-baris"><span>Kasir</span><span>{kasir}</span></div>
      {meja ? <div className="struk-baris"><span>Meja</span><span>{meja}</span></div> : null}

      <hr className="struk-garis" />

      {baris.map((b, i) => (
        <div key={`${b.nama}-${i}`} style={{ marginBottom: 6 }}>
          <div>{b.nama}</div>
          {b.opsi.length > 0 ? <div style={{ paddingLeft: 8 }}>{b.opsi.map((o) => o.nama).join(', ')}</div> : null}
          <div className="struk-baris">
            <span>{b.qty} x {angka(b.hargaSatuan)}</span>
            <span>{angka(nettoBaris({ qty: b.qty, hargaSatuan: b.hargaSatuan, diskonItem: b.diskonItem }))}</span>
          </div>
        </div>
      ))}

      <hr className="struk-garis" />

      <div className="struk-baris"><span>Subtotal</span><span>{angka(ringkasan.brutoItem)}</span></div>
      {ringkasan.diskonItem > 0 ? (
        <div className="struk-baris"><span>Diskon item</span><span>-{angka(ringkasan.diskonItem)}</span></div>
      ) : null}
      {ringkasan.diskonTransaksi > 0 ? (
        <div className="struk-baris"><span>Diskon transaksi</span><span>-{angka(ringkasan.diskonTransaksi)}</span></div>
      ) : null}
      {ringkasan.service > 0 ? (
        <div className="struk-baris"><span>Service</span><span>{angka(ringkasan.service)}</span></div>
      ) : null}
      {ringkasan.pajak > 0 ? (
        <div className="struk-baris"><span>Pajak</span><span>{angka(ringkasan.pajak)}</span></div>
      ) : null}
      {ringkasan.pembulatan !== 0 ? (
        <div className="struk-baris"><span>Pembulatan</span><span>{angka(ringkasan.pembulatan)}</span></div>
      ) : null}

      <hr className="struk-garis" />
      <div className="struk-baris struk-tebal"><span>TOTAL</span><span>{rupiah(ringkasan.total)}</span></div>

      {pembayaran.map((p, i) => (
        <div key={`${p.metode}-${i}`} className="struk-baris">
          <span>{LABEL_METODE[p.metode]}{p.referensi ? ` ${p.referensi}` : ''}</span>
          <span>{angka(p.jumlah)}</span>
        </div>
      ))}
      {dibayar > ringkasan.total ? (
        <div className="struk-baris struk-tebal">
          <span>KEMBALI</span>
          <span>{rupiah(dibayar - ringkasan.total)}</span>
        </div>
      ) : null}

      <hr className="struk-garis" />
      <div className="struk-tengah">
        {kakiStruk.split('\n').map((b, i) => (
          <div key={`${b}-${i}`}>{b}</div>
        ))}
        <div style={{ marginTop: 6 }}>{namaToko}</div>
      </div>
    </div>
  );
}
