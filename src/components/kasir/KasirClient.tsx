'use client';

import { PauseCircle, ShoppingCart, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PRODUK, statusStok } from '@/data/katalog';
import { PENGATURAN_PAJAK, PENGGUNA, petaMeja } from '@/data/operasional';
import type { BarisBayar, DiskonNilai, OpsiTerpilih, Produk } from '@/data/types';
import { rupiah } from '@/lib/format';
import {
  brutoBaris,
  buatBaris,
  hitung,
  kunciBaris,
  opsiBawaan,
  type BarisKeranjang,
  type Tahanan,
} from '@/lib/kasir';
import { Overlay } from '@/components/ui/Overlay';
import { GridProduk, RelKategori } from './GridProduk';
import { Keranjang } from './Keranjang';
import { PanelBayar } from './PanelBayar';
import { PanelDiskonItem, PanelDiskonTransaksi } from './PanelDiskon';
import { PanelMeja, PanelTahanan } from './PanelTahanan';
import { PanelVarian } from './PanelVarian';

/**
 * Layar Kasir.
 *
 * Delapan dari sembilan layar aplikasi ini bentuknya sama dengan aplikasi
 * bisnis mana pun. Layar ini tidak. Dia dipakai sambil berdiri, ratusan kali
 * sehari, dan dinilai dalam sepuluh detik pertama oleh orang yang pernah
 * memegang kasir sungguhan. Empat keputusan strukturnya ditetapkan di sini dan
 * tidak bisa ditambal di Stage 5:
 *
 * 1. Grid produk dan keranjang adalah DUA wilayah gulir terpisah, bukan satu
 *    halaman panjang. Kalau satu, tombol Bayar hilang dari layar tepat saat
 *    dibutuhkan.
 * 2. Ubah qty, diskon per item, dan diskon per transaksi tinggal di komponen
 *    yang berbeda, dan seluruh aritmetikanya di `lib/kasir.ts`. Kalau dicampur,
 *    urutan pajak dan service charge jadi tidak bisa dipastikan.
 * 3. Transaksi tertahan adalah KOLEKSI, bukan satu slot.
 * 4. Varian adalah dimensi pada satu produk (R42), jadi memilih ukuran atau
 *    warna tidak pernah berpindah produk.
 *
 * Yang masih kerangka di Stage 3 dan diserahkan ke Stage 5: pemindaian barcode
 * sungguhan, pintasan papan ketik F1 sampai F12, cetak ke printer termal, dan
 * penyimpanan keranjang ke localStorage supaya bertahan saat tab tertutup.
 */
export function KasirClient() {
  const [baris, setBaris] = useState<BarisKeranjang[]>([]);
  const [kategori, setKategori] = useState('semua');
  const [cari, setCari] = useState('');
  const [mejaId, setMejaId] = useState<string | null>(null);
  const [diskonTransaksi, setDiskonTransaksi] = useState<DiskonNilai | null>(null);
  const [tahanan, setTahanan] = useState<Tahanan[]>([]);
  const [bayar, setBayar] = useState<BarisBayar[]>([]);

  const [varian, setVarian] = useState<Produk | null>(null);
  const [diskonItemKey, setDiskonItemKey] = useState<string | null>(null);
  const [bukaDiskonTrx, setBukaDiskonTrx] = useState(false);
  const [bukaBayar, setBukaBayar] = useState(false);
  const [bukaTahanan, setBukaTahanan] = useState(false);
  const [bukaMeja, setBukaMeja] = useState(false);
  const [bukaKeranjang, setBukaKeranjang] = useState(false);

  const kasir = PENGGUNA[2];

  const terlihat = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return PRODUK.filter((p) => p.aktif)
      .filter((p) => kategori === 'semua' || p.kategoriId === kategori)
      .filter((p) => q === ''
        || p.nama.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || p.barcode.includes(q));
  }, [kategori, cari]);

  const jumlahPerKategori = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of PRODUK.filter((x) => x.aktif)) m.set(p.kategoriId, (m.get(p.kategoriId) ?? 0) + 1);
    return m;
  }, []);

  const ringkasan = hitung(baris, {
    diskonTransaksi,
    servicePersen: PENGATURAN_PAJAK.serviceAktif ? PENGATURAN_PAJAK.servicePersen : 0,
    pajakPersen: PENGATURAN_PAJAK.pajakAktif ? PENGATURAN_PAJAK.pajakPersen : 0,
    pembulatan: PENGATURAN_PAJAK.pembulatan,
  });

  const subtotalSetelahDiskonItem = ringkasan.subtotal;
  const barisDiskon = baris.find((b) => b.key === diskonItemKey) ?? null;
  const meja = mejaId ? petaMeja.get(mejaId) : null;

  function tambah(p: Produk, opsi: OpsiTerpilih[], qty: number) {
    const key = kunciBaris(p.id, opsi);
    setBaris((lama) => {
      const ada = lama.find((b) => b.key === key);
      // Item identik menyatu jadi satu baris dengan qty bertambah, bukan dua
      // baris kembar. Dua baris kembar membuat diskon per item mustahil
      // dijelaskan ke pelanggan.
      if (ada) return lama.map((b) => (b.key === key ? { ...b, qty: b.qty + qty } : b));
      return [...lama, buatBaris(p, opsi, qty)];
    });
  }

  function pilihProduk(p: Produk) {
    if (statusStok(p) === 'habis') return;
    // Produk tanpa dimensi wajib masuk keranjang dengan satu ketukan. Memaksa
    // panel varian untuk air mineral akan menambah satu ketukan pada produk
    // yang paling sering dibeli.
    if (p.dimensi.length === 0) {
      tambah(p, [], 1);
      return;
    }
    if (p.dimensi.every((d) => !d.wajib || (!d.ganda && d.opsi.length === 1))) {
      tambah(p, opsiBawaan(p), 1);
      return;
    }
    setVarian(p);
  }

  function tahan() {
    if (baris.length === 0) return;
    setTahanan((t) => [
      ...t,
      {
        id: `HOLD-${t.length + 1}`,
        label: meja ? `Meja ${meja.nama}` : `Tahanan ${t.length + 1}`,
        waktu: '2026-07-29T14:30:00',
        mejaId,
        baris,
        diskonTransaksi,
        catatan: '',
      },
    ]);
    kosongkan();
  }

  function kosongkan() {
    setBaris([]);
    setDiskonTransaksi(null);
    setBayar([]);
    setMejaId(null);
  }

  const propsKeranjang = {
    baris,
    ringkasan,
    namaMeja: meja?.nama ?? null,
    onQty: (key: string, qty: number) => setBaris((l) => l.map((b) => (b.key === key ? { ...b, qty } : b))),
    onHapus: (key: string) => setBaris((l) => l.filter((b) => b.key !== key)),
    onDiskonItem: (key: string) => setDiskonItemKey(key),
    onDiskonTransaksi: () => setBukaDiskonTrx(true),
    onTahan: tahan,
    onBayar: () => setBukaBayar(true),
    onKosongkan: kosongkan,
  };

  return (
    <div className="kasir">
      <RelKategori kategori={kategori} onKategori={setKategori} jumlah={jumlahPerKategori} />

      <div className="kasir-tengah">
        <div className="kasir-cari" style={{ justifyContent: 'space-between' }}>
          <span className="stack">
            <span className="t">Shift {kasir.nama}</span>
            <span className="s">Dibuka 12:00 · Kas awal {rupiah(500000)}</span>
          </span>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-sekunder btn-sm" onClick={() => setBukaMeja(true)}>
              <Utensils className="lucide" size={16} aria-hidden="true" />
              <span>{meja ? `Meja ${meja.nama}` : 'Pilih meja'}</span>
            </button>
            <button type="button" className="btn btn-sekunder btn-sm" onClick={() => setBukaTahanan(true)}>
              <PauseCircle className="lucide" size={16} aria-hidden="true" />
              <span>Tertahan {tahanan.length}</span>
            </button>
          </div>
        </div>

        <GridProduk
          produk={terlihat}
          kategori={kategori}
          onKategori={setKategori}
          cari={cari}
          onCari={setCari}
          onPilih={pilihProduk}
        />

        {/* Bar ringkas mobile: jumlah item dan total selalu terlihat, isinya
            ditarik naik jadi lembar bawah. */}
        <div className="krj-bar">
          <span className="stack">
            <span className="t">{ringkasan.jumlahItem} item</span>
            <span className="s">{rupiah(ringkasan.total)}</span>
          </span>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaKeranjang(true)}>
              <ShoppingCart className="lucide" size={16} aria-hidden="true" />
              <span>Keranjang</span>
            </button>
            <button
              type="button"
              className="btn btn-bayar"
              disabled={baris.length === 0}
              onClick={() => setBukaBayar(true)}
            >
              Bayar
            </button>
          </div>
        </div>
      </div>

      <Keranjang {...propsKeranjang} />

      {/* ---------- overlay, semuanya di-portal ke document.body (R53) ---------- */}

      <PanelVarian produk={varian} onTutup={() => setVarian(null)} onTambah={tambah} />

      <PanelDiskonItem
        buka={Boolean(barisDiskon)}
        onTutup={() => setDiskonItemKey(null)}
        namaProduk={barisDiskon?.nama ?? ''}
        brutoBarisIni={barisDiskon ? brutoBaris(barisDiskon) : 0}
        diskon={barisDiskon?.diskonItem ?? null}
        onSimpan={(d) => setBaris((l) => l.map((b) => (b.key === diskonItemKey ? { ...b, diskonItem: d } : b)))}
      />

      <PanelDiskonTransaksi
        buka={bukaDiskonTrx}
        onTutup={() => setBukaDiskonTrx(false)}
        subtotal={subtotalSetelahDiskonItem}
        diskon={diskonTransaksi}
        onSimpan={setDiskonTransaksi}
      />

      <PanelBayar
        buka={bukaBayar}
        onTutup={() => setBukaBayar(false)}
        onSelesai={() => { setBukaBayar(false); kosongkan(); }}
        ringkasan={ringkasan}
        bayar={bayar}
        onBayar={setBayar}
        baris={baris}
        nomor="TRX-20260729-0018"
        kasir={kasir.nama}
        meja={meja?.nama ?? null}
      />

      <PanelTahanan
        buka={bukaTahanan}
        onTutup={() => setBukaTahanan(false)}
        tahanan={tahanan}
        onLanjut={(t) => {
          setBaris(t.baris);
          setDiskonTransaksi(t.diskonTransaksi);
          setMejaId(t.mejaId);
          setTahanan((l) => l.filter((x) => x.id !== t.id));
        }}
        onHapus={(id) => setTahanan((l) => l.filter((x) => x.id !== id))}
        pajakPersen={PENGATURAN_PAJAK.pajakAktif ? PENGATURAN_PAJAK.pajakPersen : 0}
        servicePersen={PENGATURAN_PAJAK.serviceAktif ? PENGATURAN_PAJAK.servicePersen : 0}
        pembulatan={PENGATURAN_PAJAK.pembulatan}
      />

      <PanelMeja buka={bukaMeja} onTutup={() => setBukaMeja(false)} terpilih={mejaId} onPilih={setMejaId} />

      <Overlay
        buka={bukaKeranjang}
        onTutup={() => setBukaKeranjang(false)}
        judul="Keranjang"
        ket={`${ringkasan.jumlahItem} item`}
        letak="bawah"
      >
        <Keranjang {...propsKeranjang} lembar />
      </Overlay>
    </div>
  );
}
