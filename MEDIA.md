# Lekas, MEDIA.md

**Jumlah aset yang perlu digenerate: NOL.**

Bukan karena kredit habis, dan bukan karena stage ini malas. Untuk aplikasi
bisnis, nol adalah jawaban yang benar, dan di bawah ini alasannya per kategori
beserta apa yang dipakai sebagai gantinya. Dua saudara kandung yang selesai
lebih dulu hari ini, Jaring (CRM) dan Derap (Project Management), sampai pada
kesimpulan yang sama.

> **Catatan untuk siapa pun yang membaca `ART-DIRECTION.md` lebih dulu.**
> Dokumen itu, bagian 6 dan 7, menyebut 24 foto produk dan 6 foto avatar untuk
> Stage 4. Daftar itu **tidak dieksekusi**, dan bukan karena diabaikan begitu
> saja. `ART-DIRECTION.md` sendiri sudah menyediakan jalan keluarnya di dua
> tempat: bagian **6.1** menyatakan ubin tipografis "**bukan** placeholder yang
> harus diganti nanti, itu bagian permanen dari desain", dan bagian **7**
> menyatakan avatar inisial adalah "pilihan yang sah dan tidak perlu izin".
> Stage 3 mengambil dua jalan keluar itu untuk SELURUH set, bukan hanya untuk
> sisanya. Bagian **8** juga sudah melarang tangkapan layar bitmap di halaman
> landing dan mengharuskan komposisi DOM asli, dan itu diikuti persis.
> Keputusan ini konsisten dengan arahan Forge Director di HIM-302 dan dengan
> R63, yang mencabut seluruh jalur generate di dalam pipeline.

---

## 1. Aset yang SUDAH ADA dan tidak boleh diminta ulang

Semuanya dikerjakan Stage 2 (Asset Forge) dan sudah ada di `public/`:

| Berkas | Dipakai di |
| --- | --- |
| `logo-lekas-primary.svg` dan `.png` | topbar mobile, halaman landing, layar masuk, halaman 404 |
| `logo-lekas-knockout.svg` dan `.png` | sidebar gelap dan laci navigasi mobile (R43) |
| `mark-lekas.svg` | cadangan latar terang |
| `mark-lekas-knockout.svg` | sidebar saat terlipat jadi rail ikon |
| `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | tab peramban |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | ikon aplikasi |
| `og-lekas.png` | pratinjau tautan Open Graph |

Semuanya sudah tersambung di kode. Tidak ada yang perlu digenerate ulang.

---

## 2. Kenapa nol, per kategori

### 2.1 Foto produk di grid Kasir, dan di halaman detail produk

**Dipakai:** ubin inisial di atas blok warna kategori. Dua huruf pertama nama
produk dalam Manrope 800 putih, latar salah satu dari `--chart-1` sampai
`--chart-6` sesuai kategori, radius 0.

**Alasan:** kasir sungguhan pun menampilkan ubin berhuruf untuk SKU yang belum
difoto, dan sebagian besar toko memang tidak pernah memotret setiap SKU. Jadi
untuk demo POS ini bukan kompromi, melainkan realisme kategori. Menggenerate 24
foto studio justru membuat demonya terlihat seperti katalog e-commerce, bukan
seperti kasir toko.

**Kontras:** putih di atas keenam warna deret berada di antara 5.08 dan 8.34,
semuanya lolos ambang teks normal. Angkanya ada di `DESIGN.md` 3.6.

**Kode:** `src/components/kasir/ubin.ts`, kelas `.ubin-muka` di `src/app/app.css`.

### 2.2 Avatar pengguna

**Dipakai:** ubin inisial di atas warna deret per orang, sama seperti Linear,
Jira, dan Notion.

**Alasan:** foto orang hasil generate adalah tempat cacat AI paling mudah
terlihat, yaitu kulit lilin, jari menyatu, mata tidak simetris. Untuk enam
pengguna demo yang muncul kecil di tabel dan topbar, risikonya tidak sebanding
dengan manfaatnya. `ART-DIRECTION.md` bagian 7 sudah mengizinkan ini tanpa
perlu bertanya.

**Kode:** komponen `Avatar` di `src/components/ui/Primitives.tsx`.

### 2.3 Keadaan kosong

**Dipakai:** bentuk geometris SVG bersudut siku yang ditulis langsung di kode.

**Alasan:** ilustrasi keadaan kosong hasil generate hampir selalu bergaya
berbeda dari antarmukanya sendiri, dan sudut siku R10 adalah hal pertama yang
dilanggarnya. Tiga persegi panjang sudah cukup dan konsisten dengan bahasa
visual produk.

**Kode:** komponen `Kosong` di `src/components/ui/Primitives.tsx`.

### 2.4 Grafik dan bagan

**Dipakai:** dirender dari data sebagai DOM dan SVG.

**Alasan:** grafik yang berupa gambar akan basi begitu datanya berubah, dan
tidak pernah tersapu pemeriksaan kontras maupun pemeriksaan `innerText`. Yang
dirender dari data selalu jujur dan ikut diperiksa.

**Kode:** `src/components/charts/Charts.tsx`.

### 2.5 Pratinjau produk di halaman landing

**Dipakai:** komposisi DOM asli dari layar Kasir, memakai token yang sama
persis dengan aplikasinya, ditandai `aria-hidden` dan tidak bisa difokus Tab.

**Alasan:** ini perintah eksplisit `ART-DIRECTION.md` bagian 8, dan alasannya
tetap berlaku: tidak ada risiko teks berantakan seperti pada gambar hasil
generate (R62), tajam di setiap kepadatan piksel, dan tidak mungkin melenceng
dari implementasinya.

**Kode:** fungsi `PratinjauKasir` di `src/app/page.tsx`.

### 2.6 Struk

**Dipakai:** DOM mono berlebar tetap yang meniru cetakan printer termal 80mm.

**Alasan:** isinya angka uang. Gambar struk akan berselisih dengan transaksi di
sebelahnya pada perubahan pertama, dan yang berselisih di sini adalah uang.

**Kode:** `src/components/kasir/Struk.tsx`.

---

## 3. Kalau nanti benar benar dibutuhkan aset foto

Tidak ada di build ini. Kalau owner memutuskan sebaliknya, yang mengerjakannya
adalah manusia, **Fahima Fauziah** (`e03e7d1b-1a30-4e2f-a273-4c9d33a34936`),
lewat Google Flow dengan Nano Banana, sesuai R63. Prompt siap pakai untuk 24
foto produk dan 6 avatar sudah tertulis lengkap di `ART-DIRECTION.md` bagian 6
dan 7, sudah memuat blok PHOTO DNA dan NEGATIVE (R33), sudah punya blok SUBJECT
tersendiri per aset (R49), dan sudah melarang teks terbaca di dalam gambar
(R62). Jadi tidak ada yang perlu ditulis ulang, tinggal disalin.

Yang **tidak** boleh terjadi: menuliskan daftar tiga puluh baris manifest di
berkas ini "supaya terlihat lengkap" padahal sudah dipastikan tidak akan
dikerjakan siapa pun. Itu menyerahkan pekerjaan hantu ke Stage 4 dan membuat
Stage 5 menunggu aset yang tidak pernah datang.

---

## 4. Video

Tidak ada. R2, R15, R30, dan R44 mengatur hero video untuk situs marketing dan
**tidak berlaku** untuk app portfolio, sesuai standar build di issue induk
HIM-281.
