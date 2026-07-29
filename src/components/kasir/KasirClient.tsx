'use client';

import { PauseCircle, ShoppingCart, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OUTLET, petaMeja, petaPengguna } from '@/data/operasional';
import type { BarisBayar, DiskonNilai, OpsiTerpilih, Produk } from '@/data/types';
import { rupiah, jam as formatJam } from '@/lib/format';
import { usePajakStore } from '@/lib/pengaturanStore';
import { useProdukStore } from '@/lib/produkStore';
import { bisa, useSesi } from '@/lib/sesi';
import { useShiftStore } from '@/lib/shiftStore';
import { usePreferensi } from '@/lib/storage';
import { useTransaksiStore } from '@/lib/transaksiStore';
import {
  brutoBaris,
  buatBaris,
  hitung,
  kunciBaris,
  opsiBawaan,
  type BarisKeranjang,
  type Tahanan,
} from '@/lib/kasir';
import { Kosong } from '@/components/ui/Primitives';
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
 * memegang kasir sungguhan. Empat keputusan strukturnya ditetapkan di Stage 3
 * dan tidak ditambal di sini:
 *
 * 1. Grid produk dan keranjang adalah DUA wilayah gulir terpisah.
 * 2. Ubah qty, diskon per item, dan diskon per transaksi tinggal di komponen
 *    yang berbeda, dan seluruh aritmetikanya di `lib/kasir.ts`.
 * 3. Transaksi tertahan adalah KOLEKSI, bukan satu slot.
 * 4. Varian adalah dimensi pada satu produk (R42).
 *
 * Yang ditambahkan Stage 5: keranjang, tahanan, meja, dan diskon transaksi
 * bertahan di localStorage lewat `usePreferensi` (tidak hilang saat tab
 * tertutup); pemindaian barcode lewat kolom pencarian (Enter pada kode yang
 * cocok persis langsung masuk keranjang, meniru pemindai sungguhan); pintasan
 * papan ketik F2-F9; dan tombol Bayar yang benar benar menutup transaksi:
 * membuat baris baru di `transaksiStore`, mengurangi stok di `produkStore`,
 * dan mencatat penjualan di shift aktif lewat `shiftStore`.
 *
 * Batas yang saya putuskan sendiri: shift aktif diutamakan milik kasir yang
 * sedang masuk, tapi kalau shift kasir itu sudah tertutup, layar ini jatuh ke
 * shift terbuka mana pun supaya demo tidak buntu hanya karena sesi bawaan
 * kebetulan jatuh pada kasir yang shift paginya sudah ditutup. Kalau memang
 * tidak ada shift terbuka sama sekali, layar ini menolak transaksi dan
 * mengarahkan ke halaman Shift, karena kasir sungguhan tidak bisa berjualan
 * tanpa membuka laci dulu.
 */
export function KasirClient() {
  const [kasir] = useSesi();
  const { produk: PRODUK, kurangiStokTerjual } = useProdukStore();
  const { shift, catatPenjualan } = useShiftStore();
  const { buatTransaksiSelesai } = useTransaksiStore();
  const { pajak } = usePajakStore();

  const [baris, setBaris] = usePreferensi<BarisKeranjang[]>('kasir-keranjang', []);
  const [mejaId, setMejaId] = usePreferensi<string | null>('kasir-meja', null);
  const [diskonTransaksi, setDiskonTransaksi] = usePreferensi<DiskonNilai | null>('kasir-diskon-trx', null);
  const [tahanan, setTahanan] = usePreferensi<Tahanan[]>('kasir-tahanan', []);

  const [kategori, setKategori] = useState('semua');
  const [cari, setCari] = useState('');
  const [barcodeSalah, setBarcodeSalah] = useState(false);
  const [bayar, setBayar] = useState<BarisBayar[]>([]);

  const [varian, setVarian] = useState<Produk | null>(null);
  const [diskonItemKey, setDiskonItemKey] = useState<string | null>(null);
  const [bukaDiskonTrx, setBukaDiskonTrx] = useState(false);
  const [bukaBayar, setBukaBayar] = useState(false);
  const [bukaTahanan, setBukaTahanan] = useState(false);
  const [bukaMeja, setBukaMeja] = useState(false);
  const [bukaKeranjang, setBukaKeranjang] = useState(false);

  const refCari = useRef<HTMLInputElement | null>(null);

  const shiftAktif = useMemo(
    () => shift.find((s) => s.status === 'terbuka' && s.kasirId === kasir.id) ?? shift.find((s) => s.status === 'terbuka') ?? null,
    [shift, kasir.id],
  );
  const outletAktif = useMemo(
    () => (shiftAktif ? OUTLET.find((o) => o.id === shiftAktif.outletId) ?? OUTLET[0] : null),
    [shiftAktif],
  );

  const terlihat = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return PRODUK.filter((p) => p.aktif)
      .filter((p) => kategori === 'semua' || p.kategoriId === kategori)
      .filter((p) => q === ''
        || p.nama.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || p.barcode.includes(q));
  }, [PRODUK, kategori, cari]);

  const jumlahPerKategori = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of PRODUK.filter((x) => x.aktif)) m.set(p.kategoriId, (m.get(p.kategoriId) ?? 0) + 1);
    return m;
  }, [PRODUK]);

  const ringkasan = hitung(baris, {
    diskonTransaksi,
    servicePersen: pajak.serviceAktif && outletAktif?.tipe === 'fnb' ? pajak.servicePersen : 0,
    pajakPersen: pajak.pajakAktif ? pajak.pajakPersen : 0,
    pembulatan: pajak.pembulatan,
    hargaSudahTermasukPajak: pajak.hargaSudahTermasukPajak,
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
    if (p.stok <= 0) return;
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

  /** Pemindaian barcode: Enter pada kode yang cocok persis langsung masuk keranjang. */
  function pindai(kode: string) {
    const cocok = PRODUK.find((p) => p.aktif && p.barcode === kode.trim());
    if (!cocok) {
      setBarcodeSalah(true);
      setTimeout(() => setBarcodeSalah(false), 1600);
      return;
    }
    pilihProduk(cocok);
    setCari('');
  }

  function tahan() {
    if (baris.length === 0) return;
    setTahanan((t) => [
      ...t,
      {
        id: `HOLD-${Date.now().toString(36)}`,
        label: meja ? `Meja ${meja.nama}` : `Tahanan ${t.length + 1}`,
        waktu: new Date().toISOString().slice(0, 19),
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

  function selesaikanPembayaran() {
    if (!shiftAktif || !outletAktif) return;
    const t = buatTransaksiSelesai({
      kasirId: kasir.id,
      shiftId: shiftAktif.id,
      outletId: outletAktif.id,
      mejaId,
      tipe: outletAktif.tipe,
      baris: baris.map((b) => ({
        produkId: b.produkId,
        nama: b.nama,
        sku: b.sku,
        opsi: b.opsi,
        qty: b.qty,
        hargaSatuan: b.hargaSatuan,
        diskonItem: b.diskonItem,
        catatan: b.catatan || undefined,
      })),
      diskonTransaksi,
      servicePersen: pajak.serviceAktif && outletAktif.tipe === 'fnb' ? pajak.servicePersen : 0,
      pajakPersen: pajak.pajakAktif ? pajak.pajakPersen : 0,
      pembayaran: bayar,
    });
    kurangiStokTerjual(baris.map((b) => ({ produkId: b.produkId, qty: b.qty })));
    const tunai = bayar.filter((p) => p.metode === 'tunai').reduce((a, p) => a + p.jumlah, 0);
    const nonTunai = bayar.filter((p) => p.metode !== 'tunai').reduce((a, p) => a + p.jumlah, 0);
    catatPenjualan(shiftAktif.id, tunai, nonTunai);
    setBukaBayar(false);
    kosongkan();
    return t;
  }

  // Pintasan papan ketik F2 sampai F9. Diabaikan saat overlay lain sedang
  // menangkap fokus supaya tidak bentrok dengan aksi di dalamnya.
  useEffect(() => {
    function tangani(e: KeyboardEvent) {
      const overlayTerbuka = bukaBayar || bukaTahanan || bukaMeja || Boolean(varian) || Boolean(diskonItemKey) || bukaDiskonTrx;
      if (e.key === 'F2') {
        e.preventDefault();
        refCari.current?.focus();
        return;
      }
      if (overlayTerbuka) return;
      if (e.key === 'F3') {
        e.preventDefault();
        if (baris.length > 0) setBukaBayar(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        tahan();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setBukaMeja(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setBukaTahanan(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (baris.length > 0) kosongkan();
      }
    }
    window.addEventListener('keydown', tangani);
    return () => window.removeEventListener('keydown', tangani);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bukaBayar, bukaTahanan, bukaMeja, varian, diskonItemKey, bukaDiskonTrx, baris]);

  const diskonTrxDiizinkan = bisa(kasir.peran, 'diskon-transaksi');

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
    diskonTrxDiizinkan,
  };

  return (
    <div className="kasir">
      <RelKategori kategori={kategori} onKategori={setKategori} jumlah={jumlahPerKategori} />

      <div className="kasir-tengah">
        <div className="kasir-cari" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span className="stack">
            <span className="t">
              {shiftAktif && shiftAktif.kasirId !== kasir.id
                ? `Memakai shift ${petaPengguna.get(shiftAktif.kasirId)?.nama ?? shiftAktif.kasirId}`
                : `Shift ${kasir.nama}`}
            </span>
            <span className="s">
              {shiftAktif
                ? `Dibuka ${formatJam(shiftAktif.buka)} · Kas awal ${rupiah(shiftAktif.kasAwal)} · ${outletAktif?.nama ?? ''}`
                : 'Belum ada shift terbuka untuk kasir ini'}
            </span>
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

        {!shiftAktif ? (
          <div style={{ padding: 'var(--sp-4)' }}>
            <Kosong
              judul="Belum ada shift terbuka"
              ket="Buka shift dulu di halaman Shift Kasir sebelum memproses transaksi. Kas awal yang dicatat di sana ikut menentukan selisih kas saat tutup shift nanti."
              aksi={<Link className="btn" href="/app/shift/">Buka shift</Link>}
            />
          </div>
        ) : (
          <GridProduk
            ref={refCari}
            produk={terlihat}
            kategori={kategori}
            onKategori={setKategori}
            cari={cari}
            onCari={setCari}
            onPilih={pilihProduk}
            onPindai={pindai}
            barcodeSalah={barcodeSalah}
          />
        )}

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
              disabled={baris.length === 0 || !shiftAktif}
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
        onSelesai={selesaikanPembayaran}
        ringkasan={ringkasan}
        bayar={bayar}
        onBayar={setBayar}
        baris={baris}
        nomor="Transaksi baru"
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
        pajakPersen={pajak.pajakAktif ? pajak.pajakPersen : 0}
        servicePersen={pajak.serviceAktif ? pajak.servicePersen : 0}
        pembulatan={pajak.pembulatan}
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
