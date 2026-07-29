'use client';

import { Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { KATEGORI, PRODUK, statusStok } from '@/data/katalog';
import { adapterProduk } from '@/lib/adapters';
import { PageHeader } from '@/components/shell/PageHeader';
import { CatatanStage } from '@/components/ui/Primitives';
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

/**
 * Halaman Produk.
 *
 * Penyaring hidup di `PageHeader`, satu tingkat DI ATAS lapisan view, jadi
 * berpindah tampilan tidak mungkin mereset penyaring yang sedang aktif. Kalau
 * penyaring ikut dirender di dalam view, tiap perpindahan tampilan
 * memasangnya ulang dan pilihannya hilang.
 *
 * Perhatikan bahwa penyaring kategori TIDAK mengubah nama produk mana pun
 * (R42): kategori adalah atribut produk, dan varian adalah dimensi di dalam
 * produk. Katalog yang menjadikan tiap warna sebagai produk sendiri akan
 * membuat penyaring warna tampak "mengganti nama produk", dan itu gejala dari
 * model data yang salah, bukan dari penyaring yang salah.
 */
export function ProdukClient() {
  const [view, setView] = usePilihanView(adapterProduk);
  const [kategori, setKategori] = useState('semua');
  const [stok, setStok] = useState('semua');
  const [cari, setCari] = useState('');
  const [terpilih, setTerpilih] = useState<string[]>([]);

  const data = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return PRODUK
      .filter((p) => kategori === 'semua' || p.kategoriId === kategori)
      .filter((p) => stok === 'semua' || statusStok(p) === stok)
      .filter((p) => q === '' || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [kategori, stok, cari]);

  return (
    <>
      <PageHeader
        judul="Produk"
        ket={`${data.length} dari ${PRODUK.length} produk. Ukuran, topping, dan warna adalah dimensi di dalam produk, bukan produk terpisah.`}
        aksi={(
          <>
            <button type="button" className="btn">
              <Plus className="lucide" size={16} aria-hidden="true" />
              <span>Tambah produk</span>
            </button>
            <button type="button" className="btn btn-sekunder">
              <Upload className="lucide" size={16} aria-hidden="true" />
              <span>Impor CSV</span>
            </button>
          </>
        )}
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

      <DataViews
        data={data}
        adapter={adapterProduk}
        view={view}
        terpilih={terpilih}
        onTerpilih={setTerpilih}
        kosong={{
          judul: 'Tidak ada produk yang cocok',
          ket: 'Longgarkan penyaring, atau tambahkan produk baru ke katalog.',
          aksi: <button type="button" className="btn">Tambah produk</button>,
        }}
      />

      <div style={{ marginTop: 'var(--sp-5)' }}>
        <CatatanStage>
          Tambah produk, impor CSV, dan aksi massal masih kerangka. Stage 5 menyambungkannya ke
          penyimpanan demo dan menambah pengelola varian di halaman detail.
        </CatatanStage>
      </div>
    </>
  );
}
