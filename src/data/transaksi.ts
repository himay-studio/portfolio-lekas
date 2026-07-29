import { petaProduk } from './katalog';
import { PENGATURAN_PAJAK } from './operasional';
import type { BarisBayar, BarisTransaksi, DiskonNilai, Shift, StatusTransaksi, Transaksi } from './types';
// `hitung()` dipakai HANYA untuk membangkitkan riwayat lama di bawah (lihat
// blok "Riwayat lama, dibangkitkan"), supaya nominal pembayarannya taat pada
// mesin uang yang sama dipakai layar Kasir sejak lahir, bukan angka yang
// ditulis tangan lalu bisa berselisih dari perhitungan ulang.
import { hitung } from '@/lib/kasir';

/**
 * Riwayat penjualan demo.
 *
 * Baris ditulis sebagai resep pendek lalu dikembangkan jadi `BarisTransaksi`
 * penuh oleh `baris()`, supaya harga satuan selalu diturunkan dari katalog dan
 * tidak pernah mengambang sendiri. Kalau harga produk berubah di
 * `katalog.ts`, riwayat ikut benar tanpa disunting satu satu.
 *
 * Tidak ada angka acak di sini. `Math.random()` akan menghasilkan nilai berbeda
 * antara render build dan render browser, dan itu muncul sebagai ketidakcocokan
 * hidrasi, bukan sebagai data yang menarik.
 */

type Resep = [produkId: string, qty: number, opsi?: string[], diskon?: DiskonNilai];

function baris(resep: Resep[]): BarisTransaksi[] {
  return resep.map(([produkId, qty, opsiIds = [], diskonItem]) => {
    const p = petaProduk.get(produkId);
    if (!p) throw new Error(`Produk demo tidak dikenal: ${produkId}`);
    const opsi = p.dimensi
      .flatMap((d) => d.opsi.map((o) => ({ d, o })))
      .filter(({ o }) => opsiIds.includes(o.id))
      .map(({ d, o }) => ({ dimensiId: d.id, opsiId: o.id, nama: o.nama, delta: o.deltaHarga }));
    return {
      produkId: p.id,
      nama: p.nama,
      sku: p.sku,
      opsi,
      qty,
      hargaSatuan: p.hargaDasar + opsi.reduce((a, o) => a + o.delta, 0),
      diskonItem: diskonItem ?? null,
      catatan: undefined,
    };
  });
}

interface Bibit {
  id: string;
  waktu: string;
  kasirId: string;
  shiftId: string;
  mejaId: string | null;
  tipe: 'retail' | 'fnb';
  resep: Resep[];
  diskonTransaksi?: DiskonNilai | null;
  pembayaran: BarisBayar[];
  status?: StatusTransaksi;
  alasanStatus?: string;
  catatan?: string;
}

const BIBIT_RESEN: Bibit[] = [
  {
    id: 'TRX-20260729-0007',
    waktu: '2026-07-29T09:14:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: 'm-01',
    tipe: 'fnb',
    resep: [
      ['p-kopi-susu', 2, ['besar', 'dingin']],
      ['p-croissant', 1],
    ],
    pembayaran: [{ metode: 'qris', jumlah: 82000, referensi: 'QR-4471' }],
  },
  {
    id: 'TRX-20260729-0008',
    waktu: '2026-07-29T09:31:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: null,
    tipe: 'fnb',
    resep: [['p-americano', 1, ['reguler', 'panas']]],
    pembayaran: [{ metode: 'tunai', jumlah: 25000 }],
  },
  {
    id: 'TRX-20260729-0009',
    waktu: '2026-07-29T10:02:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: 'm-03',
    tipe: 'fnb',
    resep: [
      ['p-nasi-goreng', 2, ['sedang', 'telur']],
      ['p-teh-manis', 2, ['reguler', 'dingin']],
      ['p-kentang-goreng', 1, ['keju']],
    ],
    diskonTransaksi: { tipe: 'persen', nilai: 10, alasan: 'Promo pagi' },
    pembayaran: [{ metode: 'debit', jumlah: 141000, referensi: '4188' }],
  },
  {
    id: 'TRX-20260729-0010',
    waktu: '2026-07-29T10:44:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: null,
    tipe: 'fnb',
    resep: [
      ['p-matcha-latte', 1, ['besar', 'dingin', 'oat-milk']],
      ['p-donat-gula', 2],
    ],
    pembayaran: [{ metode: 'qris', jumlah: 63000, referensi: 'QR-4472' }],
  },
  {
    id: 'TRX-20260729-0011',
    waktu: '2026-07-29T11:20:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: 'm-07',
    tipe: 'fnb',
    resep: [
      ['p-cappuccino', 1, ['reguler', 'panas']],
      ['p-brownies', 1],
    ],
    status: 'ditahan',
    pembayaran: [],
    catatan: 'Tamu keluar sebentar, minta ditahan.',
  },
  {
    id: 'TRX-20260729-0012',
    waktu: '2026-07-29T11:58:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260729-P',
    mejaId: null,
    tipe: 'fnb',
    resep: [
      ['p-mi-ayam', 1],
      ['p-teh-manis', 1, ['reguler', 'dingin']],
    ],
    pembayaran: [
      { metode: 'tunai', jumlah: 25000 },
      { metode: 'qris', jumlah: 17000, referensi: 'QR-4473' },
    ],
  },
  {
    id: 'TRX-20260729-0013',
    waktu: '2026-07-29T12:36:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260729-S',
    mejaId: null,
    tipe: 'retail',
    resep: [
      ['p-beras', 1, ['10kg']],
      ['p-minyak-goreng', 2, ['1l']],
      ['p-gula-pasir', 1],
    ],
    pembayaran: [{ metode: 'tunai', jumlah: 200000 }],
  },
  {
    id: 'TRX-20260729-0014',
    waktu: '2026-07-29T13:05:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260729-S',
    mejaId: null,
    tipe: 'retail',
    resep: [
      ['p-air-mineral', 6, ['600ml']],
      ['p-susu-kotak', 4, ['cokelat']],
    ],
    pembayaran: [{ metode: 'qris', jumlah: 61000, referensi: 'QR-4474' }],
  },
  {
    id: 'TRX-20260729-0015',
    waktu: '2026-07-29T13:47:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260729-S',
    mejaId: null,
    tipe: 'retail',
    resep: [['p-kaus-polos', 2, ['l', 'navy']]],
    diskonTransaksi: { tipe: 'nominal', nilai: 20000, alasan: 'Pelanggan lama' },
    pembayaran: [{ metode: 'kredit', jumlah: 158000, referensi: '9032' }],
  },
  {
    id: 'TRX-20260729-0016',
    waktu: '2026-07-29T14:22:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260729-S',
    mejaId: null,
    tipe: 'retail',
    resep: [['p-deterjen', 1], ['p-sabun-batang', 3]],
    pembayaran: [{ metode: 'tunai', jumlah: 55000 }],
    status: 'void',
    alasanStatus: 'Salah input jumlah sabun, diulang di TRX-20260729-0017.',
  },
  {
    id: 'TRX-20260729-0017',
    waktu: '2026-07-29T14:24:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260729-S',
    mejaId: null,
    tipe: 'retail',
    resep: [['p-deterjen', 1], ['p-sabun-batang', 6]],
    pembayaran: [{ metode: 'tunai', jumlah: 70000 }],
  },
  {
    id: 'TRX-20260728-0031',
    waktu: '2026-07-28T16:12:00',
    kasirId: 'u-5',
    shiftId: 'SH-20260728-S',
    mejaId: 'm-05',
    tipe: 'fnb',
    resep: [
      ['p-kopi-susu', 3, ['reguler', 'dingin', 'boba']],
      ['p-kentang-goreng', 2, ['bbq']],
    ],
    pembayaran: [{ metode: 'qris', jumlah: 148000, referensi: 'QR-4390' }],
  },
  {
    id: 'TRX-20260728-0032',
    waktu: '2026-07-28T17:03:00',
    kasirId: 'u-5',
    shiftId: 'SH-20260728-S',
    mejaId: null,
    tipe: 'fnb',
    resep: [['p-cokelat', 2, ['besar', 'panas']]],
    pembayaran: [{ metode: 'tunai', jumlah: 70000 }],
  },
  {
    id: 'TRX-20260728-0033',
    waktu: '2026-07-28T18:41:00',
    kasirId: 'u-5',
    shiftId: 'SH-20260728-S',
    mejaId: 'm-10',
    tipe: 'fnb',
    resep: [
      ['p-nasi-goreng', 1, ['pedas', 'ayam']],
      ['p-mi-ayam', 1],
      ['p-teh-manis', 3, ['besar', 'dingin']],
    ],
    pembayaran: [{ metode: 'debit', jumlah: 128000, referensi: '2210' }],
    status: 'refund',
    alasanStatus: 'Pesanan salah antar ke meja lain, dana dikembalikan penuh.',
  },
  {
    id: 'TRX-20260728-0034',
    waktu: '2026-07-28T19:15:00',
    kasirId: 'u-5',
    shiftId: 'SH-20260728-S',
    mejaId: null,
    tipe: 'retail',
    resep: [['p-telur', 2], ['p-beras', 1, ['5kg']]],
    pembayaran: [{ metode: 'tunai', jumlah: 135000 }],
  },
  {
    id: 'TRX-20260727-0022',
    waktu: '2026-07-27T11:26:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260727-P',
    mejaId: 'm-02',
    tipe: 'fnb',
    resep: [
      ['p-americano', 2, ['besar', 'dingin']],
      ['p-croissant', 2],
    ],
    pembayaran: [{ metode: 'qris', jumlah: 96000, referensi: 'QR-4301' }],
  },
  {
    id: 'TRX-20260727-0023',
    waktu: '2026-07-27T12:48:00',
    kasirId: 'u-3',
    shiftId: 'SH-20260727-P',
    mejaId: null,
    tipe: 'retail',
    resep: [['p-baterai', 2], ['p-air-mineral', 12, ['600ml']]],
    pembayaran: [{ metode: 'tunai', jumlah: 90000 }],
  },
  {
    id: 'TRX-20260727-0024',
    waktu: '2026-07-27T15:09:00',
    kasirId: 'u-4',
    shiftId: 'SH-20260727-S',
    mejaId: 'm-06',
    tipe: 'fnb',
    resep: [
      ['p-matcha-latte', 2, ['reguler', 'dingin']],
      ['p-donat-gula', 4],
      ['p-brownies', 2],
    ],
    diskonTransaksi: { tipe: 'persen', nilai: 15, alasan: 'Promo sore' },
    pembayaran: [{ metode: 'transfer', jumlah: 108000, referensi: 'BCA-77120' }],
  },
];

/* -------------------------------------------------------------------------- */
/* Riwayat lama, dibangkitkan (Stage 5, R41)                                   */
/* -------------------------------------------------------------------------- */

/**
 * `BIBIT_RESEN` di atas (18 transaksi, 27-29 Juli) ditulis tangan oleh
 * Stage 3 dan SENGAJA tidak disentuh di sini, termasuk selisih kecil antara
 * nominal pembayarannya dan total yang dihitung ulang `hitung()` pada
 * beberapa barisnya. Itu milik Stage 3 dan mengubahnya berisiko mengubah
 * narasi yang sudah ditinjau.
 *
 * Blok di bawah ini MEMBANGKITKAN riwayat yang lebih tua (29 Juni sampai 26
 * Juli, melintasi batas bulan supaya pengelompokan "Bulanan" di Laporan
 * benar benar punya lebih dari satu batang) secara deterministik: seluruh
 * variasinya berasal dari aritmetika indeks loop, bukan `Math.random()` atau
 * `new Date()` tanpa argumen, jadi hasilnya identik di build dan di
 * peramban. Nominal pembayarannya DIHITUNG lewat mesin `hitung()` yang sama
 * dipakai layar Kasir, jadi setiap baris yang dibangkitkan di sini taat pada
 * urutan aritmetika di `lib/kasir.ts` sejak lahir, tidak seperti beberapa
 * baris tulisan tangan di atas.
 */

const AWAL_LAMA = '2026-06-29';
const AKHIR_LAMA = '2026-07-26';

function tambahHariLokal(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function waktuPada(tanggal: string, menitSejakTengahMalam: number): string {
  const total = Math.max(0, Math.min(23 * 60 + 59, menitSejakTengahMalam));
  const j = Math.floor(total / 60);
  const mnt = total % 60;
  return `${tanggal}T${String(j).padStart(2, '0')}:${String(mnt).padStart(2, '0')}:00`;
}

const RESEP_FNB: Resep[][] = [
  [['p-kopi-susu', 1, ['reguler', 'dingin']]],
  [['p-americano', 1, ['besar', 'panas']], ['p-croissant', 1]],
  [['p-cappuccino', 2, ['reguler', 'panas']]],
  [['p-matcha-latte', 1, ['reguler', 'dingin', 'boba']], ['p-donat-gula', 2]],
  [['p-teh-manis', 2, ['besar', 'dingin']], ['p-kentang-goreng', 1, ['keju']]],
  [['p-nasi-goreng', 1, ['sedang', 'telur']], ['p-es-kopi-aren', 1, ['reguler']]],
  [['p-mi-ayam', 1], ['p-lemon-tea', 1, ['reguler', 'dingin']]],
  [['p-ayam-geprek', 1, ['pedas']], ['p-teh-manis', 1, ['reguler', 'dingin']]],
  [['p-roti-bakar', 1, ['cokelat-keju']], ['p-kopi-tubruk', 1, ['panas']]],
  [['p-cheese-roll', 2], ['p-cokelat', 1, ['reguler', 'panas']]],
  [['p-brownies', 1], ['p-americano', 1, ['reguler', 'dingin']]],
  [['p-pastel', 3], ['p-teh-manis', 1, ['besar', 'panas']]],
];

const RESEP_RETAIL: Resep[][] = [
  [['p-beras', 1, ['5kg']], ['p-minyak-goreng', 1, ['1l']]],
  [['p-air-mineral', 12, ['600ml']], ['p-susu-kotak', 6, ['cokelat']]],
  [['p-gula-pasir', 2], ['p-telur', 1]],
  [['p-deterjen', 1], ['p-sabun-batang', 4]],
  [['p-baterai', 2], ['p-teh-kotak', 10, ['original']]],
  [['p-kaus-polos', 1, ['m', 'hitam']]],
  [['p-tote-bag', 2]],
  [['p-tepung-terigu', 2, ['1kg']], ['p-kecap-manis', 1]],
  [['p-pewangi-pakaian', 3], ['p-kantong-plastik', 1, ['sedang-kantong']]],
  [['p-celana-chino', 1, ['32', 'navy-celana']]],
  [['p-minyak-goreng', 2, ['2l']], ['p-beras', 1, ['10kg']]],
  [['p-air-mineral', 24, ['600ml']]],
];

const METODE_URUT: BarisBayar['metode'][] = ['tunai', 'qris', 'debit', 'kredit', 'transfer', 'tunai', 'qris'];

function bulatkanTunai(total: number): number {
  return Math.ceil(total / 5000) * 5000;
}

interface LaneLama {
  kode: 'P' | 'S';
  tipe: 'fnb' | 'retail';
  outletId: string;
  kasirGenap: string;
  kasirGanjil: string;
  bukaJam: number;
  panjangJam: number;
}

const LANE_LAMA: LaneLama[] = [
  { kode: 'P', tipe: 'fnb', outletId: 'o-pusat', kasirGenap: 'u-3', kasirGanjil: 'u-5', bukaJam: 8, panjangJam: 8 },
  { kode: 'S', tipe: 'retail', outletId: 'o-bintaro', kasirGenap: 'u-4', kasirGanjil: 'u-4', bukaJam: 12, panjangJam: 8 },
];

const BIBIT_LAMA: Bibit[] = [];
const SHIFT_LAMA: Shift[] = [];

{
  let hariGeser = 0;
  let shiftGlobal = 0;
  let txGlobal = 0;
  let tanggal = AWAL_LAMA;
  while (tanggal <= AKHIR_LAMA) {
    LANE_LAMA.forEach((lane, laneIdx) => {
      const kasirId = hariGeser % 2 === 0 ? lane.kasirGenap : lane.kasirGanjil;
      const kunciHari = tanggal.replace(/-/g, '');
      const shiftId = `SH-${kunciHari}-${lane.kode}`;
      const buka = waktuPada(tanggal, lane.bukaJam * 60);
      const tutup = waktuPada(tanggal, (lane.bukaJam + lane.panjangJam) * 60);

      const jumlahTx = 1 + (shiftGlobal % 2);
      let penjualanTunai = 0;
      let penjualanNonTunai = 0;
      let jumlahTransaksi = 0;

      for (let txIdx = 0; txIdx < jumlahTx; txIdx += 1) {
        const pool = lane.tipe === 'fnb' ? RESEP_FNB : RESEP_RETAIL;
        const resep = pool[(hariGeser * 5 + laneIdx * 3 + txIdx * 7) % pool.length];
        const menit = lane.bukaJam * 60 + Math.round(((txIdx + 1) / (jumlahTx + 1)) * (lane.panjangJam * 60 - 20));
        const waktu = waktuPada(tanggal, menit);

        const dapatDiskon = txGlobal % 6 === 5;
        const diskonTransaksi: DiskonNilai | null = dapatDiskon
          ? (lane.tipe === 'fnb'
            ? { tipe: 'persen', nilai: 10, alasan: 'Promo pagi' }
            : { tipe: 'nominal', nilai: 15000, alasan: 'Pelanggan lama' })
          : null;

        const barisResep = baris(resep);
        const servicePersen = lane.tipe === 'fnb' && PENGATURAN_PAJAK.serviceAktif ? PENGATURAN_PAJAK.servicePersen : 0;
        const pajakPersen = PENGATURAN_PAJAK.pajakAktif ? PENGATURAN_PAJAK.pajakPersen : 0;
        const ringkasan = hitung(barisResep, {
          diskonTransaksi,
          servicePersen,
          pajakPersen,
          pembulatan: PENGATURAN_PAJAK.pembulatan,
        });

        const metode = METODE_URUT[txGlobal % METODE_URUT.length];
        const jumlahBayar = metode === 'tunai' ? bulatkanTunai(ringkasan.total) : ringkasan.total;
        const referensi = metode === 'tunai'
          ? undefined
          : metode === 'qris'
            ? `QR-${5000 + txGlobal}`
            : metode === 'transfer'
              ? `TRF-${8000 + txGlobal}`
              : `${4000 + txGlobal}`;

        let status: StatusTransaksi = 'lunas';
        let alasanStatus: string | undefined;
        if (txGlobal % 17 === 16) {
          status = 'refund';
          alasanStatus = 'Pesanan tidak sesuai pesanan pelanggan, dana dikembalikan penuh.';
        } else if (txGlobal % 11 === 10) {
          status = 'void';
          alasanStatus = 'Salah input saat transaksi, dibatalkan sebelum tutup laci.';
        }

        BIBIT_LAMA.push({
          id: `TRX-${kunciHari}-L${String(1000 + txGlobal).slice(1)}`,
          waktu,
          kasirId,
          shiftId,
          mejaId: lane.tipe === 'fnb' && txIdx % 2 === 0 ? `m-0${1 + (txGlobal % 9)}` : null,
          tipe: lane.tipe,
          resep,
          diskonTransaksi,
          pembayaran: [{ metode, jumlah: jumlahBayar, referensi }],
          status,
          alasanStatus,
        });

        if (status === 'lunas') {
          jumlahTransaksi += 1;
          if (metode === 'tunai') penjualanTunai += jumlahBayar;
          else penjualanNonTunai += jumlahBayar;
        }
        txGlobal += 1;
      }

      const selisihPola = shiftGlobal % 4;
      const selisih = selisihPola === 0 ? 2500 : selisihPola === 2 ? -3000 : 0;
      const kasSistem = 500000 + penjualanTunai;
      SHIFT_LAMA.push({
        id: shiftId,
        kasirId,
        outletId: lane.outletId,
        buka,
        tutup,
        kasAwal: 500000,
        kasSistem,
        kasFisik: kasSistem + selisih,
        jumlahTransaksi,
        penjualanTunai,
        penjualanNonTunai,
        status: 'tertutup',
        catatan: selisih !== 0
          ? `Selisih ${selisih > 0 ? 'lebih' : 'kurang'} ${Math.abs(selisih).toLocaleString('id-ID')}, dicatat saat tutup shift.`
          : undefined,
      });

      shiftGlobal += 1;
    });

    hariGeser += 1;
    tanggal = tambahHariLokal(tanggal, 1);
  }
}

const BIBIT: Bibit[] = [...BIBIT_LAMA, ...BIBIT_RESEN];

export const TRANSAKSI: Transaksi[] = BIBIT.map((b) => ({
  id: b.id,
  waktu: b.waktu,
  kasirId: b.kasirId,
  shiftId: b.shiftId,
  outletId: b.tipe === 'fnb' ? 'o-pusat' : 'o-bintaro',
  mejaId: b.mejaId,
  tipe: b.tipe,
  baris: baris(b.resep),
  diskonTransaksi: b.diskonTransaksi ?? null,
  servicePersen: b.tipe === 'fnb' && PENGATURAN_PAJAK.serviceAktif ? PENGATURAN_PAJAK.servicePersen : 0,
  pajakPersen: PENGATURAN_PAJAK.pajakAktif ? PENGATURAN_PAJAK.pajakPersen : 0,
  pembayaran: b.pembayaran,
  status: b.status ?? 'lunas',
  alasanStatus: b.alasanStatus,
  catatan: b.catatan,
}));

export const petaTransaksi = new Map(TRANSAKSI.map((t) => [t.id, t]));

export const LABEL_STATUS_TRANSAKSI: Record<StatusTransaksi, string> = {
  lunas: 'Lunas',
  ditahan: 'Ditahan',
  void: 'Void',
  refund: 'Refund',
};

const SHIFT_RESEN: Shift[] = [
  {
    id: 'SH-20260729-P',
    kasirId: 'u-3',
    outletId: 'o-pusat',
    buka: '2026-07-29T08:00:00',
    tutup: '2026-07-29T12:00:00',
    kasAwal: 500000,
    kasSistem: 620000,
    kasFisik: 620000,
    jumlahTransaksi: 24,
    penjualanTunai: 120000,
    penjualanNonTunai: 612000,
    status: 'tertutup',
  },
  {
    id: 'SH-20260729-S',
    kasirId: 'u-4',
    outletId: 'o-bintaro',
    buka: '2026-07-29T12:00:00',
    tutup: null,
    kasAwal: 500000,
    kasSistem: 770000,
    kasFisik: null,
    jumlahTransaksi: 18,
    penjualanTunai: 270000,
    penjualanNonTunai: 431000,
    status: 'terbuka',
  },
  {
    id: 'SH-20260728-P',
    kasirId: 'u-3',
    outletId: 'o-pusat',
    buka: '2026-07-28T08:00:00',
    tutup: '2026-07-28T16:00:00',
    kasAwal: 500000,
    kasSistem: 941000,
    kasFisik: 936000,
    jumlahTransaksi: 41,
    penjualanTunai: 441000,
    penjualanNonTunai: 1284000,
    status: 'tertutup',
    catatan: 'Selisih kurang 5.000, kemungkinan kembalian dibulatkan ke atas.',
  },
  {
    id: 'SH-20260728-S',
    kasirId: 'u-5',
    outletId: 'o-pusat',
    buka: '2026-07-28T16:00:00',
    tutup: '2026-07-28T22:00:00',
    kasAwal: 500000,
    kasSistem: 705000,
    kasFisik: 705000,
    jumlahTransaksi: 33,
    penjualanTunai: 205000,
    penjualanNonTunai: 1102000,
    status: 'tertutup',
  },
  {
    id: 'SH-20260727-P',
    kasirId: 'u-3',
    outletId: 'o-pusat',
    buka: '2026-07-27T08:00:00',
    tutup: '2026-07-27T15:00:00',
    kasAwal: 500000,
    kasSistem: 812000,
    kasFisik: 824000,
    jumlahTransaksi: 29,
    penjualanTunai: 312000,
    penjualanNonTunai: 908000,
    status: 'tertutup',
    catatan: 'Selisih lebih 12.000, kembalian belum diambil pelanggan.',
  },
  {
    id: 'SH-20260727-S',
    kasirId: 'u-4',
    outletId: 'o-bintaro',
    buka: '2026-07-27T15:00:00',
    tutup: '2026-07-27T21:00:00',
    kasAwal: 500000,
    kasSistem: 688000,
    kasFisik: 688000,
    jumlahTransaksi: 26,
    penjualanTunai: 188000,
    penjualanNonTunai: 764000,
    status: 'tertutup',
  },
];

export const SHIFT: Shift[] = [...SHIFT_LAMA, ...SHIFT_RESEN];

export const petaShift = new Map(SHIFT.map((s) => [s.id, s]));
