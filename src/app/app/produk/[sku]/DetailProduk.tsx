'use client';

import { useState } from 'react';
import { petaKategori, rentangHarga, statusStok } from '@/data/katalog';
import type { DimensiVarian, OpsiTerpilih, Produk } from '@/data/types';
import { jam, rupiah, tanggalPendek } from '@/lib/format';
import { opsiBawaan, ringkasOpsi } from '@/lib/kasir';
import { bisa, useSesi } from '@/lib/sesi';
import { useProdukStore } from '@/lib/produkStore';
import { inisialProduk, warnaProduk } from '@/components/kasir/ubin';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, Cek } from '@/components/ui/Primitives';
import { Overlay } from '@/components/ui/Overlay';

const TONE = { aman: 'success', menipis: 'warning', habis: 'danger' } as const;
const LABEL = { aman: 'Stok aman', menipis: 'Stok menipis', habis: 'Stok habis' } as const;

let penghitungDimensi = 0;

/**
 * Halaman detail produk.
 *
 * Inilah tempat R42 paling mudah dilanggar. Memilih warna atau ukuran di sini
 * MENUKAR VARIAN DI TEMPAT: harga, SKU, dan stok berubah, nama produknya tidak,
 * dan alamat halamannya tidak berpindah.
 *
 * `produk` yang diterima dari server adalah data dasar hasil build statis.
 * Begitu mount, halaman ini membaca versi HIDUPNYA dari `produkStore` (yang
 * sama dipakai Kasir dan halaman Produk), jadi ubah produk, sesuaikan stok,
 * dan pengelola dimensi di sini langsung terlihat di seluruh aplikasi tanpa
 * build ulang. Render pertama tetap memakai `produk` dasar sehingga tidak ada
 * ketidakcocokan hidrasi.
 */
export function DetailProduk({ produk: dasar }: { produk: Produk }) {
  const { produk: semua, ubahProduk, sesuaikanStok, riwayatStok, ubahDimensi } = useProdukStore();
  const [kasir] = useSesi();
  const bolehKelola = bisa(kasir.peran, 'produk');
  const produk = semua.find((p) => p.id === dasar.id) ?? dasar;

  const [pilih, setPilih] = useState<OpsiTerpilih[]>(() => opsiBawaan(produk));
  const s = statusStok(produk);
  const kategori = petaKategori.get(produk.kategoriId);
  const r = rentangHarga(produk);
  const hargaVarian = produk.hargaDasar + pilih.reduce((a, o) => a + o.delta, 0);

  const stokVarian = produk.dimensi
    .flatMap((d) => d.opsi.filter((o) => pilih.some((p) => p.dimensiId === d.id && p.opsiId === o.id)))
    .map((o) => o.stok)
    .filter((x): x is number => x !== null);

  function setTunggal(dimensiId: string, opsiId: string, nama: string, delta: number) {
    setPilih((p) => [...p.filter((o) => o.dimensiId !== dimensiId), { dimensiId, opsiId, nama, delta }]);
  }

  function toggleGanda(dimensiId: string, opsiId: string, nama: string, delta: number, aktif: boolean) {
    setPilih((p) => (aktif
      ? [...p, { dimensiId, opsiId, nama, delta }]
      : p.filter((o) => !(o.dimensiId === dimensiId && o.opsiId === opsiId))));
  }

  // ---------- ubah produk ----------
  const [bukaUbah, setBukaUbah] = useState(false);
  const [formUbah, setFormUbah] = useState(() => ({
    nama: produk.nama, hargaDasar: String(produk.hargaDasar), hargaModal: String(produk.hargaModal),
    stokMinimum: String(produk.stokMinimum), satuan: produk.satuan, deskripsi: produk.deskripsi,
  }));

  // ---------- sesuaikan stok ----------
  const [bukaStok, setBukaStok] = useState(false);
  const [deltaStok, setDeltaStok] = useState('0');
  const [alasanStok, setAlasanStok] = useState('');
  const riwayat = riwayatStok(produk.id);

  // ---------- pengelola dimensi varian ----------
  const [bukaDimensi, setBukaDimensi] = useState(false);
  const [dimensiKerja, setDimensiKerja] = useState<DimensiVarian[]>(produk.dimensi);

  function bukaPengelolaDimensi() {
    setDimensiKerja(produk.dimensi.map((d) => ({ ...d, opsi: d.opsi.map((o) => ({ ...o })) })));
    setBukaDimensi(true);
  }

  function tambahDimensiBaru() {
    penghitungDimensi += 1;
    setDimensiKerja((d) => [...d, {
      id: `dim-${penghitungDimensi}`,
      nama: 'Dimensi baru',
      wajib: false,
      ganda: false,
      opsi: [{ id: `opsi-${penghitungDimensi}-1`, nama: 'Opsi 1', deltaHarga: 0, stok: null }],
    }]);
  }

  function tambahOpsi(dimensiId: string) {
    penghitungDimensi += 1;
    setDimensiKerja((ds) => ds.map((d) => (d.id === dimensiId
      ? { ...d, opsi: [...d.opsi, { id: `opsi-${penghitungDimensi}`, nama: 'Opsi baru', deltaHarga: 0, stok: null }] }
      : d)));
  }

  return (
    <>
      <PageHeader
        judul={produk.nama}
        ket={`${kategori?.nama ?? ''} · ${produk.satuan}`}
        remah={[
          { label: 'Produk', href: '/app/produk/' },
          { label: produk.nama },
        ]}
        aksi={bolehKelola ? (
          <>
            <button type="button" className="btn" onClick={() => setBukaUbah(true)}>Ubah produk</button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaStok(true)}>Sesuaikan stok</button>
          </>
        ) : null}
      />

      <div className="kolom-2">
        <div className="seksi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Varian</h2>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
                <Badge tone={TONE[s]}>{LABEL[s]}</Badge>
                {bolehKelola ? (
                  <button type="button" className="btn btn-halus btn-sm" onClick={bukaPengelolaDimensi}>
                    Kelola dimensi
                  </button>
                ) : null}
              </div>
            </div>

            {produk.dimensi.length === 0 ? (
              <p className="bantuan">
                Produk ini tidak punya dimensi varian. Harga dan stoknya tunggal.
              </p>
            ) : (
              <div className="form-grid">
                {produk.dimensi.map((d) => (
                  <fieldset key={d.id} className="bidang" style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend
                      className="bantuan"
                      style={{ marginBottom: 6, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}
                    >
                      {d.nama}
                      {d.wajib ? '' : ' (opsional)'}
                      {d.ganda ? ', boleh lebih dari satu' : ''}
                    </legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                      {d.opsi.map((o) => {
                        const aktif = pilih.some((x) => x.dimensiId === d.id && x.opsiId === o.id);
                        if (d.ganda) {
                          return (
                            <span key={o.id} style={{ border: '1px solid var(--control-border)', padding: '8px 12px' }}>
                              <Cek nilai={aktif} onUbah={(n) => toggleGanda(d.id, o.id, o.nama, o.deltaHarga, n)}>
                                <span className="stack">
                                  <span className="t">{o.nama}</span>
                                  {o.deltaHarga !== 0 ? (
                                    <span className="s">{o.deltaHarga > 0 ? '+' : ''}{rupiah(o.deltaHarga)}</span>
                                  ) : null}
                                </span>
                              </Cek>
                            </span>
                          );
                        }
                        return (
                          <button
                            key={o.id}
                            type="button"
                            className={`btn ${aktif ? '' : 'btn-sekunder'}`}
                            style={{ height: 'auto', paddingTop: 8, paddingBottom: 8 }}
                            aria-pressed={aktif}
                            onClick={() => setTunggal(d.id, o.id, o.nama, o.deltaHarga)}
                          >
                            <span className="stack" style={{ alignItems: 'flex-start' }}>
                              <span className="t" style={{ color: 'inherit' }}>{o.nama}</span>
                              <span className="s" style={{ color: 'inherit' }}>
                                {o.deltaHarga === 0 ? 'Harga dasar' : `${o.deltaHarga > 0 ? '+' : ''}${rupiah(o.deltaHarga)}`}
                                {o.stok !== null ? `, stok ${o.stok}` : ''}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Rincian</h2>
            </div>
            <dl className="def">
              <div className="def-baris"><dt>SKU</dt><dd className="mono">{produk.sku}</dd></div>
              <div className="def-baris"><dt>Barcode</dt><dd className="mono">{produk.barcode}</dd></div>
              <div className="def-baris"><dt>Harga dasar</dt><dd className="num">{rupiah(produk.hargaDasar)}</dd></div>
              <div className="def-baris"><dt>Harga modal</dt><dd className="num">{rupiah(produk.hargaModal)}</dd></div>
              <div className="def-baris">
                <dt>Rentang harga setelah varian</dt>
                <dd className="num">{r.min === r.maks ? rupiah(r.min) : `${rupiah(r.min)} sampai ${rupiah(r.maks)}`}</dd>
              </div>
              <div className="def-baris"><dt>Stok</dt><dd className="num">{produk.stok} {produk.satuan}</dd></div>
              <div className="def-baris"><dt>Stok minimum</dt><dd className="num">{produk.stokMinimum} {produk.satuan}</dd></div>
              <div className="def-baris"><dt>Keterangan</dt><dd>{produk.deskripsi}</dd></div>
            </dl>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Riwayat pergerakan stok</h2>
            </div>
            {riwayat.length === 0 ? (
              <p className="bantuan">
                Belum ada penyesuaian manual pada produk ini. Penjualan lewat layar Kasir mengurangi
                stok langsung tanpa dicatat di sini; kolom ini khusus penyesuaian manual (retur dari
                pemasok, barang rusak, koreksi hitung fisik).
              </p>
            ) : (
              <div className="tbl-kartu">
                {riwayat.map((l) => (
                  <div key={l.id} className="tbl-kartu-item" style={{ cursor: 'default' }}>
                    <div className="item-kartu-atas">
                      <span className="stack">
                        <span className="t">{l.alasan}</span>
                        <span className="s">{tanggalPendek(l.waktu.slice(0, 10))} {jam(l.waktu.slice(0, 19))}</span>
                      </span>
                      <span className={`num ${l.delta < 0 ? 'negatif' : ''}`}>{l.delta > 0 ? '+' : ''}{l.delta}</span>
                    </div>
                    <div className="tbl-kartu-baris">
                      <span className="tbl-kartu-label">Stok sesudah</span>
                      <span className="tbl-kartu-nilai num">{l.stokSesudah} {produk.satuan}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="kolom-sisi">
          <section className="kartu">
            <div className="kartu-judul">
              <h2>Varian terpilih</h2>
            </div>
            <div style={{ display: 'grid', gap: 'var(--sp-3)', justifyItems: 'start' }}>
              <span
                className={`ubin-muka ubin-muka-${warnaProduk(produk)}`}
                style={{ width: 96, height: 96, aspectRatio: 'auto' }}
                aria-hidden="true"
              >
                {inisialProduk(produk.nama)}
              </span>
              <span className="stack">
                {/* Nama produk TIDAK berubah saat varian ditukar (R42). */}
                <span className="t" style={{ fontSize: 17, fontWeight: 600 }}>{produk.nama}</span>
                <span className="s">{pilih.length > 0 ? ringkasOpsi(pilih) : 'Tanpa varian'}</span>
              </span>
              <span className="num-besar" style={{ fontSize: 30, lineHeight: '36px' }}>{rupiah(hargaVarian)}</span>
              {stokVarian.length > 0 ? (
                <span className="bantuan">Stok varian ini {Math.min(...stokVarian)} {produk.satuan}</span>
              ) : null}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-judul">
              <h2>Ubin di layar Kasir</h2>
            </div>
            <p className="bantuan">
              Ubin memakai inisial di atas warna kategori, bukan foto. Toko sungguhan jarang punya
              foto untuk setiap SKU, jadi ini bentuk yang jujur dan bukan placeholder yang menunggu
              diganti. Keputusan lengkapnya ada di MEDIA.md.
            </p>
          </section>
        </div>
      </div>

      {/* ---------- ubah produk ---------- */}
      <Overlay
        buka={bukaUbah}
        onTutup={() => setBukaUbah(false)}
        judul="Ubah produk"
        ket={produk.sku}
        lebar
        kaki={(
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                ubahProduk(produk.id, {
                  nama: formUbah.nama.trim() || produk.nama,
                  hargaDasar: Number(formUbah.hargaDasar) || 0,
                  hargaModal: Number(formUbah.hargaModal) || 0,
                  stokMinimum: Number(formUbah.stokMinimum) || 0,
                  satuan: formUbah.satuan.trim() || produk.satuan,
                  deskripsi: formUbah.deskripsi,
                });
                setBukaUbah(false);
              }}
            >
              Simpan perubahan
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaUbah(false)}>Batal</button>
          </>
        )}
      >
        <div className="form-grid form-grid-2">
          <div className="bidang">
            <label htmlFor="u-nama">Nama produk</label>
            <input id="u-nama" className="input" value={formUbah.nama} onChange={(e) => setFormUbah((f) => ({ ...f, nama: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="u-satuan">Satuan</label>
            <input id="u-satuan" className="input" value={formUbah.satuan} onChange={(e) => setFormUbah((f) => ({ ...f, satuan: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="u-harga">Harga dasar</label>
            <input id="u-harga" className="input input-num" type="number" min={0} value={formUbah.hargaDasar} onChange={(e) => setFormUbah((f) => ({ ...f, hargaDasar: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="u-modal">Harga modal</label>
            <input id="u-modal" className="input input-num" type="number" min={0} value={formUbah.hargaModal} onChange={(e) => setFormUbah((f) => ({ ...f, hargaModal: e.target.value }))} />
          </div>
          <div className="bidang">
            <label htmlFor="u-stok-min">Stok minimum</label>
            <input id="u-stok-min" className="input input-num" type="number" min={0} value={formUbah.stokMinimum} onChange={(e) => setFormUbah((f) => ({ ...f, stokMinimum: e.target.value }))} />
          </div>
        </div>
        <div className="bidang" style={{ marginTop: 'var(--sp-3)' }}>
          <label htmlFor="u-deskripsi">Deskripsi</label>
          <textarea id="u-deskripsi" className="textarea" value={formUbah.deskripsi} onChange={(e) => setFormUbah((f) => ({ ...f, deskripsi: e.target.value }))} />
        </div>
      </Overlay>

      {/* ---------- sesuaikan stok ---------- */}
      <Overlay
        buka={bukaStok}
        onTutup={() => setBukaStok(false)}
        judul="Sesuaikan stok"
        ket={`Stok sekarang ${produk.stok} ${produk.satuan}`}
        kaki={(
          <>
            <button
              type="button"
              className="btn"
              disabled={Number(deltaStok) === 0 || !alasanStok.trim()}
              onClick={() => {
                sesuaikanStok(produk.id, Number(deltaStok) || 0, alasanStok.trim());
                setDeltaStok('0');
                setAlasanStok('');
                setBukaStok(false);
              }}
            >
              Simpan penyesuaian
            </button>
            <button type="button" className="btn btn-sekunder" onClick={() => setBukaStok(false)}>Batal</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="bidang">
            <label htmlFor="d-stok">Perubahan stok (positif menambah, negatif mengurangi)</label>
            <input id="d-stok" className="input input-num" type="number" value={deltaStok} onChange={(e) => setDeltaStok(e.target.value)} />
          </div>
          <div className="bidang">
            <label htmlFor="d-alasan">Alasan</label>
            <input
              id="d-alasan"
              className="input"
              value={alasanStok}
              onChange={(e) => setAlasanStok(e.target.value)}
              placeholder="Koreksi hitung fisik, barang rusak, retur pemasok"
            />
          </div>
          <p className="bantuan">
            Stok sesudah penyesuaian: {Math.max(0, produk.stok + (Number(deltaStok) || 0))} {produk.satuan}
          </p>
        </div>
      </Overlay>

      {/* ---------- pengelola dimensi varian ---------- */}
      <Overlay
        buka={bukaDimensi}
        onTutup={() => setBukaDimensi(false)}
        judul="Kelola dimensi varian"
        ket="Ukuran, topping, dan warna tetap dimensi pada produk yang sama (R42), bukan produk baru"
        lebar
        kaki={(
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                ubahDimensi(produk.id, dimensiKerja);
                setBukaDimensi(false);
              }}
            >
              Simpan dimensi
            </button>
            <button type="button" className="btn btn-sekunder" onClick={tambahDimensiBaru}>
              Tambah dimensi
            </button>
            <button type="button" className="btn btn-halus" onClick={() => setBukaDimensi(false)}>Batal</button>
          </>
        )}
      >
        <div className="form-grid">
          {dimensiKerja.length === 0 ? (
            <p className="bantuan">Belum ada dimensi. Tambah dimensi untuk memberi produk ini varian ukuran, warna, atau topping.</p>
          ) : null}
          {dimensiKerja.map((d, di) => (
            <div key={d.id} className="kartu" style={{ display: 'grid', gap: 'var(--sp-3)' }}>
              <div className="form-grid form-grid-2">
                <div className="bidang">
                  <label htmlFor={`dim-nama-${d.id}`}>Nama dimensi</label>
                  <input
                    id={`dim-nama-${d.id}`}
                    className="input"
                    value={d.nama}
                    onChange={(e) => setDimensiKerja((ds) => ds.map((x, i) => (i === di ? { ...x, nama: e.target.value } : x)))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', paddingTop: 20 }}>
                  <Cek
                    nilai={d.wajib}
                    onUbah={(n) => setDimensiKerja((ds) => ds.map((x, i) => (i === di ? { ...x, wajib: n } : x)))}
                  >
                    Wajib dipilih
                  </Cek>
                  <Cek
                    nilai={d.ganda}
                    onUbah={(n) => setDimensiKerja((ds) => ds.map((x, i) => (i === di ? { ...x, ganda: n } : x)))}
                  >
                    Boleh lebih dari satu
                  </Cek>
                </div>
              </div>

              <div className="form-grid">
                {d.opsi.map((o, oi) => (
                  <div key={o.id} className="form-grid form-grid-2" style={{ alignItems: 'end' }}>
                    <div className="bidang">
                      <label htmlFor={`opsi-nama-${o.id}`}>Nama opsi</label>
                      <input
                        id={`opsi-nama-${o.id}`}
                        className="input"
                        value={o.nama}
                        onChange={(e) => setDimensiKerja((ds) => ds.map((x, i) => (i === di
                          ? { ...x, opsi: x.opsi.map((y, j) => (j === oi ? { ...y, nama: e.target.value } : y)) }
                          : x)))}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <div className="bidang" style={{ flex: 1 }}>
                        <label htmlFor={`opsi-delta-${o.id}`}>Selisih harga</label>
                        <input
                          id={`opsi-delta-${o.id}`}
                          className="input input-num"
                          type="number"
                          value={o.deltaHarga}
                          onChange={(e) => setDimensiKerja((ds) => ds.map((x, i) => (i === di
                            ? { ...x, opsi: x.opsi.map((y, j) => (j === oi ? { ...y, deltaHarga: Number(e.target.value) || 0 } : y)) }
                            : x)))}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-sekunder btn-sm"
                        style={{ marginTop: 'auto', height: 40 }}
                        disabled={d.opsi.length <= 1}
                        onClick={() => setDimensiKerja((ds) => ds.map((x, i) => (i === di
                          ? { ...x, opsi: x.opsi.filter((_, j) => j !== oi) }
                          : x)))}
                      >
                        Hapus opsi
                      </button>
                    </div>
                  </div>
                ))}
                <div>
                  <button type="button" className="btn btn-halus btn-sm" onClick={() => tambahOpsi(d.id)}>
                    Tambah opsi
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-sekunder btn-sm"
                  onClick={() => setDimensiKerja((ds) => ds.filter((_, i) => i !== di))}
                >
                  Hapus dimensi ini
                </button>
              </div>
            </div>
          ))}
        </div>
      </Overlay>
    </>
  );
}
