'use client';

import { Plus, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { KATEGORI, statusStok } from '@/data/katalog';
import type { Produk } from '@/data/types';
import { adapterProduk } from '@/lib/adapters';
import { bisa, useSesi } from '@/lib/sesi';
import { useProdukStore, type InputProdukBaru } from '@/lib/produkStore';
import { PageHeader } from '@/components/shell/PageHeader';
import { Overlay } from '@/components/ui/Overlay';
import { Select } from '@/components/ui/Select';
import { DataViews } from '@/components/views/DataViews';
import { ViewSwitcher, usePilihanView } from '@/components/views/ViewSwitcher';

const OPSI_KATEGORI = [
  { nilai: 'semua', label: 'Semua kategori' },
  ...KATEGORI.map((k) => ({ nilai: k.id, label: k.nama, ket: k.tipe === 'fnb' ? 'Kedai' : 'Retail' })),
];

const OPSI_STOK = [
  { nilai: 'semua', label: 'Semua status stok' },
  { nilai: 'aman', label: 'Stok aman' },
  { nilai: 'menipis', label: 'Stok menipis' },
  { nilai: 'habis', label: 'Stok habis' },
];

const OPSI_KATEGORI_FORM = KATEGORI.map((k) => ({ nilai: k.id, label: k.nama }));

const KOSONG_FORM = {
  sku: '', barcode: '', nama: '', kategoriId: KATEGORI[0].id, hargaDasar: '', hargaModal: '',
  stok: '', stokMinimum: '', satuan: '', deskripsi: '',
};

const KOLOM_CSV = ['sku', 'barcode', 'nama', 'kategoriId', 'hargaDasar', 'hargaModal', 'stok', 'stokMinimum', 'satuan', 'deskripsi'] as const;

function unduhTeks(nama: string, isi: string) {
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}

function uraiCsv(teks: string): InputProdukBaru[] {
  const baris = teks.split(/\r?\n/).map((b) => b.trim()).filter(Boolean);
  if (baris.length === 0) return [];
  const header = baris[0].split(',').map((h) => h.trim());
  return baris.slice(1).map((b) => {
    const kolom = b.split(',').map((k) => k.trim());
    const rekam: Record<string, string> = {};
    header.forEach((h, i) => { rekam[h] = kolom[i] ?? ''; });
    return {
      sku: rekam.sku || `IMPOR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      barcode: rekam.barcode || '',
      nama: rekam.nama || 'Produk tanpa nama',
      kategoriId: KATEGORI.some((k) => k.id === rekam.kategoriId) ? rekam.kategoriId : KATEGORI[0].id,
      hargaDasar: Number(rekam.hargaDasar) || 0,
      hargaModal: Number(rekam.hargaModal) || 0,
      stok: Number(rekam.stok) || 0,
      stokMinimum: Number(rekam.stokMinimum) || 0,
      satuan: rekam.satuan || 'pcs',
      dimensi: [],
      deskripsi: rekam.deskripsi || '',
    };
  });
}

/**
 * Halaman Produk.
 *
 * Penyaring hidup di `PageHeader`, satu tingkat DI ATAS lapisan view, jadi
 * berpindah tampilan tidak mungkin mereset penyaring yang sedang aktif.
 *
 * Tambah produk, impor CSV, dan aksi massal tersambung ke `produkStore`
 * (lapisan timpa localStorage). Ketiganya, plus aksi massal, disembunyikan
 * untuk peran kasir (HAK_AKSES `produk`), karena mengubah katalog bukan
 * kewenangan kasir di kedai mana pun.
 */
export function ProdukClient() {
  const { produk: PRODUK, tambahProduk, importCsv, aksiMassal } = useProdukStore();
  const [kasir] = useSesi();
  const bolehKelola = bisa(kasir.peran, 'produk');

  const [view, setView] = usePilihanView(adapterProduk);
  const [kategori, setKategori] = useState('semua');
  const [stok, setStok] = useState('semua');
  const [cari, setCari] = useState('');
  const [terpilih, setTerpilih] = useState<string[]>([]);

  const [bukaTambah, setBukaTambah] = useState(false);
  const [form, setForm] = useState(KOSONG_FORM);
  const [bukaImpor, setBukaImpor] = useState(false);
  const [pratinjauCsv, setPratinjauCsv] = useState<InputProdukBaru[]>([]);
  const refFile = useRef<HTMLInputElement | null>(null);

  const data = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return PRODUK
      .filter((p) => kategori === 'semua' || p.kategoriId === kategori)
      .filter((p) => stok === 'semua' || statusStok(p) === stok)
      .filter((p) => q === '' || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [PRODUK, kategori, stok, cari]);

  function simpanProdukBaru() {
    if (!form.sku.trim() || !form.nama.trim()) return;
    tambahProduk({
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || `NOBAR-${form.sku.trim()}`,
      nama: form.nama.trim(),
      kategoriId: form.kategoriId,
      hargaDasar: Number(form.hargaDasar) || 0,
      hargaModal: Number(form.hargaModal) || 0,
      stok: Number(form.stok) || 0,
      stokMinimum: Number(form.stokMinimum) || 0,
      satuan: form.satuan.trim() || 'pcs',
      dimensi: [],
      deskripsi: form.deskripsi.trim(),
      aktif: true,
      favorit: false,
    });
    setForm(KOSONG_FORM);
    setBukaTambah(false);
  }

  function padaFile(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    if (!berkas) return;
    const reader = new FileReader();
    reader.onload = () => setPratinjauCsv(uraiCsv(String(reader.result ?? '')));
    reader.readAsText(berkas);
  }

  return (
    <>
      <PageHeader
        judul="Produk"
        ket={`${data.length} dari ${PRODUK.length} produk. Ukuran, topping, dan warna adalah dimensi di dalam produk, bukan produk terpisah.`}
        aksi={bolehKelola ? (
          <>
            <button type="button" className="btn" onClick={() => setBukaTambah(true)}>
              <Plus className="lucide" size={16} aria-hidden="true" />
              <span>Tambah produk</span>
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaImpor(true)}>
              <Upload className="lucide" size={16} aria-hidden="true" />
              <span>Impor CSV</span>
            </button>
          </>
        ) : null}
        saring={(
          <>
            <div style={{ minWidth: 200 }}>
              <label className="sr" htmlFor="saring-kategori">Saring kategori</label>
              <Select id="saring-kategori" label="Saring kategori" nilai={kategori} opsi={OPSI_KATEGORI} onUbah={setKategori} lebarPenuh />
            </div>
            <div style={{ minWidth: 190 }}>
              <label className="sr" htmlFor="saring-stok">Saring status stok</label>
              <Select id="saring-stok" label="Saring status stok" nilai={stok} opsi={OPSI_STOK} onUbah={setStok} lebarPenuh />
            </div>
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <label className="sr" htmlFor="saring-cari">Cari produk</label>
              <input
                id="saring-cari"
                className="input"
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Nama, SKU, atau barcode"
              />
            </div>
          </>
        )}
        ujung={<ViewSwitcher nilai={view} tersedia={adapterProduk.viewTersedia} onUbah={setView} />}
      />

      {bolehKelola && view === 'tabel' && terpilih.length > 0 ? (
        <div className="tbl-massal" style={{ marginBottom: 'var(--sp-3)' }}>
          <span>{terpilih.length} produk terpilih</span>
          <button
            type="button"
            className="btn btn-sekunder btn-sm"
            onClick={() => { aksiMassal(terpilih, { aktif: true }); setTerpilih([]); }}
          >
            Aktifkan
          </button>
          <button
            type="button"
            className="btn btn-sekunder btn-sm"
            onClick={() => { aksiMassal(terpilih, { aktif: false }); setTerpilih([]); }}
          >
            Nonaktifkan
          </button>
          <button type="button" className="btn btn-halus btn-sm" onClick={() => setTerpilih([])}>
            Batalkan pilihan
          </button>
        </div>
      ) : null}

      <DataViews
        data={data}
        adapter={adapterProduk}
        view={view}
        terpilih={bolehKelola ? terpilih : undefined}
        onTerpilih={bolehKelola ? setTerpilih : undefined}
        kosong={{
          judul: 'Tidak ada produk yang cocok',
          ket: 'Longgarkan penyaring, atau tambahkan produk baru ke katalog.',
          aksi: bolehKelola ? <button type="button" className="btn" onClick={() => setBukaTambah(true)}>Tambah produk</button> : undefined,
        }}
      />

      <Overlay
        buka={bukaTambah}
        onTutup={() => setBukaTambah(false)}
        judul="Tambah produk"
        ket="Varian ukuran, topping, atau warna bisa ditambahkan lewat halaman detail setelah produk dibuat"
        lebar
        kaki={(
          <>
            <button type="button" className="btn" onClick={simpanProdukBaru} disabled={!form.sku.trim() || !form.nama.trim()}>
              Simpan produk
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaTambah(false)}>Batal</button>
          </>
        )}
      >
        <div className="form-grid form-grid-2">
          <div className="bidang">
            <label htmlFor="f-nama">Nama produk (model, bukan varian)</label>
            <input id="f-nama" className="input" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} placeholder="Kopi Susu" />
          </div>
          <div className="bidang">
            <label htmlFor="f-kategori">Kategori</label>
            <Select id="f-kategori" label="Kategori" nilai={form.kategoriId} opsi={OPSI_KATEGORI_FORM} onUbah={(n) => setForm((f) => ({ ...f, kategoriId: n }))} lebarPenuh />
          </div>
          <div className="bidang">
            <label htmlFor="f-sku">SKU</label>
            <input id="f-sku" className="input mono" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="FNB-K-010" />
          </div>
          <div className="bidang">
            <label htmlFor="f-barcode">Barcode</label>
            <input id="f-barcode" className="input mono" value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="8991002101011" />
          </div>
          <div className="bidang">
            <label htmlFor="f-harga">Harga dasar</label>
            <input id="f-harga" className="input input-num" type="number" min={0} value={form.hargaDasar} onChange={(e) => setForm((f) => ({ ...f, hargaDasar: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="f-modal">Harga modal</label>
            <input id="f-modal" className="input input-num" type="number" min={0} value={form.hargaModal} onChange={(e) => setForm((f) => ({ ...f, hargaModal: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="f-stok">Stok awal</label>
            <input id="f-stok" className="input input-num" type="number" min={0} value={form.stok} onChange={(e) => setForm((f) => ({ ...f, stok: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="f-stok-min">Stok minimum</label>
            <input id="f-stok-min" className="input input-num" type="number" min={0} value={form.stokMinimum} onChange={(e) => setForm((f) => ({ ...f, stokMinimum: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="f-satuan">Satuan</label>
            <input id="f-satuan" className="input" value={form.satuan} onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))} placeholder="gelas, potong, botol" />
          </div>
        </div>
        <div className="bidang" style={{ marginTop: 'var(--sp-3)' }}>
          <label htmlFor="f-deskripsi">Deskripsi</label>
          <textarea id="f-deskripsi" className="textarea" value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
        </div>
      </Overlay>

      <Overlay
        buka={bukaImpor}
        onTutup={() => { setBukaImpor(false); setPratinjauCsv([]); }}
        judul="Impor produk lewat CSV"
        ket={`Kolom: ${KOLOM_CSV.join(', ')}`}
        lebar
        kaki={(
          <>
            <button
              type="button"
              className="btn"
              disabled={pratinjauCsv.length === 0}
              onClick={() => {
                importCsv(pratinjauCsv);
                setPratinjauCsv([]);
                setBukaImpor(false);
                if (refFile.current) refFile.current.value = '';
              }}
            >
              Impor {pratinjauCsv.length > 0 ? `${pratinjauCsv.length} produk` : ''}
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => { setBukaImpor(false); setPratinjauCsv([]); }}>Batal</button>
          </>
        )}
      >
        <div className="form-grid">
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sekunder btn-sm"
              onClick={() => unduhTeks('contoh-produk.csv', `${KOLOM_CSV.join(',')}\nFNB-K-099,8991002109099,Es Kopi Aren,kopi,24000,9000,50,10,gelas,Kopi susu dengan gula aren`)}
            >
              Unduh contoh CSV
            </button>
          </div>
          <div className="bidang">
            <label htmlFor="f-csv">Berkas CSV</label>
            <input ref={refFile} id="f-csv" className="input" type="file" accept=".csv,text/csv" onChange={padaFile} />
            <span className="bantuan">Baris pertama adalah header. Kategori yang tidak dikenal jatuh ke kategori pertama.</span>
          </div>

          {pratinjauCsv.length > 0 ? (
            <div className="tbl-bungkus">
              <table className="tbl" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="kanan">Harga</th>
                    <th scope="col" className="kanan">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {pratinjauCsv.map((p, i) => (
                    <tr key={`${p.sku}-${i}`}>
                      <td>{p.nama}</td>
                      <td className="mono">{p.sku}</td>
                      <td className="kanan num">{p.hargaDasar.toLocaleString('id-ID')}</td>
                      <td className="kanan num">{p.stok}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </Overlay>
    </>
  );
}
