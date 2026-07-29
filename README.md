# Lekas

**Cepat di kasir, pas di laci.**

Aplikasi kasir (POS) untuk toko retail dan kedai F&B skala UMKM sampai menengah. Ini **app portfolio demo Himay Studio**: merek fiktif, dibangun dengan standar produk nyata, dipakai untuk menunjukkan kemampuan kepada calon klien yang butuh sistem kasir.

Bukan situs marketing. Ini aplikasi, dengan sidebar kiri, banyak view per modul, dan data demo yang cukup banyak untuk terasa seperti bisnis sungguhan.

---

## Posisi produk

Satu kasir untuk toko dan kedai di outlet yang sama, dengan tutup shift yang bisa ditelusuri sampai ke transaksinya.

Dua janji, dua duanya bisa dibuktikan di layar:

1. **Mode ganda tanpa ganti aplikasi.** Barcode dan SKU untuk barang retail, meja dan tahan pesanan untuk yang makan di tempat. Satu layar yang sama.
2. **Kas yang bisa ditelusuri.** Kalau tutup shift menunjukkan selisih, layarnya langsung menunjuk transaksi mana yang perlu dicek, bukan cuma menampilkan angka merah.

---

## Dokumen

| Berkas | Isi |
| --- | --- |
| [`BRAND.md`](./BRAND.md) | Riset niche, kompetitor, celah posisi, logika nama, tagline, persona, tone of voice, istilah baku, cek realisme kategori |
| [`DESIGN.md`](./DESIGN.md) | Sistem desain: token warna lengkap dengan rasio kontras terhitung, tipografi, ruang, elevasi, spesifikasi komponen, gerak, responsif |
| [`ART-DIRECTION.md`](./ART-DIRECTION.md) | Arah visual, konsep dan geometri logo, prompt siap pakai, favicon, Open Graph, foto produk katalog, avatar, ikon antarmuka, daftar aset |
| [`LOGO.md`](./LOGO.md) | Ekstrak siap eksekusi untuk Asset Forge: geometri SVG, dua varian wajib, favicon, prompt cadangan, jalur serah terima |
| [`LAYOUT-ARCHITECTURE.md`](./LAYOUT-ARCHITECTURE.md) | Peta rute, hierarki komponen, keputusan desain beserta alasannya, mesin uang, dan daftar yang ditunda ke Stage 5 |
| [`MEDIA.md`](./MEDIA.md) | Manifes media. Nol aset perlu digenerate, dengan alasan per kategori |

---

## Identitas singkat

| Kunci | Nilai |
| --- | --- |
| Warna merek | `#6D28A8` ungu tinta |
| Kanvas aplikasi | `#F4F2F7` |
| Sidebar | `#1A1424` |
| Hijau uang dan berhasil | `#12723F` |
| Judul dan nominal besar | Manrope 600, 700, 800 |
| Antarmuka, tabel, label | IBM Plex Sans 400, 500, 600 |
| Struk, SKU, kode transaksi | IBM Plex Mono 400, 500 |
| Radius | 0 di mana pun, tanpa pengecualian |

Setiap rasio kontras di `DESIGN.md` sudah dihitung dengan rumus WCAG 2.1, bukan dikira kira. Jangan mengganti nilai token tanpa menghitung ulang.

---

## Modul yang dibangun

- **Kasir**: grid produk dan kategori, pencarian cepat, keranjang, ubah jumlah, diskon per item dan per transaksi, pajak dan servis, catatan pesanan, tahan pesanan, pilih meja untuk mode F&B.
- **Pembayaran**: tunai dengan hitung kembalian, kartu, QRIS, split payment, pratinjau struk.
- **Produk**: katalog dengan varian (ukuran, topping, warna) sebagai dimensi pada satu produk, kategori, harga, stok, barcode dan SKU.
- **Transaksi**: riwayat penjualan, detail struk, refund dan void dengan alasan.
- **Shift kasir**: buka shift, kas awal, tutup shift, selisih kas, rekap per kasir.
- **Laporan**: penjualan harian, mingguan, bulanan, produk terlaris, penjualan per metode bayar, per kasir, per jam sibuk.
- **Pengaturan**: profil toko, pajak, printer, pengguna dan peran (pemilik, manajer, kasir).

Ditambah halaman landing produk ringkas di `/` dan `/login` dengan kredensial demo yang ditampilkan di layar.

---

## Teknis

- Next.js dengan `output: 'export'` (static export), dideploy ke Cloudflare Pages.
- Data demo statis di `src/data/*.ts`, state di sisi klien, `localStorage` untuk mutasi demo. Tanpa backend, tanpa auth sungguhan.
- Deploy: Pages project `himaystudio-portfolio-lekas`, domain publik **`portfolio-lekas.himaystudio.com`**. URL `pages.dev` hanya cadangan internal dan tidak pernah dipakai sebagai URL publik (R26, R40).
- `rm -rf out .next` sebelum setiap build deploy (R61), sudah terpasang sebagai `prebuild` di `package.json`.

### Perintah

```bash
npm install
npm run dev          # pengembangan
npm run typecheck    # tsc --noEmit
npm run build        # bersihkan, build, ekspor statis ke out/
npm run qa           # sapuan terukur seluruh rute di 5 breakpoint
node scripts/qa-probe.mjs   # probe terarah plus tangkapan layar ke qa-shots/
npm run deploy       # bersihkan, build, kirim ke Cloudflare Pages
```

`scripts/qa-setup.mjs` menyalakan Chromium di runtime ini sepenuhnya dari ruang
pengguna, tanpa root. Dipanggil otomatis oleh dua skrip QA di atas, jadi
"tidak ada peramban di runtime ini" bukan alasan yang sah untuk melewati R51.

---

## Aturan yang berlaku di repo ini

Berlaku: R10 radius 0, R11 dan R58 tanpa em dash dan en dash termasuk bentuk entity HTML, R12 dropdown custom, R19 dan R57 responsif tanpa meluber horizontal, R20 kontras WCAG AA pada setiap kontrol, R21 date picker custom, R27 dan R54 dan R56 commit push sampai tersaji, R41 kedalaman data demo, R42 varian sebagai dimensi produk, R43 dua varian logo, R46 animasi perpindahan halaman, R47 dan R52 topbar mobile, R48 carousel mobile, R49 prompt spesifik per aset, R50 judul dan label sebagai blok terpisah, R51 QA wajib melampirkan tangkapan layar, R53 overlay di luar ancestor ber-filter, R59 semua tautan internal 200, R60 `aria-expanded` sinkron, R61 bersihkan build, R62 verifikasi teks di dalam gambar.

Tidak berlaku: R2, R15, R30, R44 hero video (aplikasi tidak punya hero video), R13 welcome modal, R14 CTA WhatsApp, R16 dan R32 mega menu navbar, R37 floating CTA. Aplikasi ini memakai sidebar, bukan navbar marketing. Cukup satu tautan halus **Dibuat oleh Himay Studio** di halaman landing dan di footer login, dofollow ke https://himaystudio.com.

---

Dibuat oleh [Himay Studio](https://himaystudio.com).
