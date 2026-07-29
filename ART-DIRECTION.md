# Lekas, ART-DIRECTION.md

Sumber kebenaran untuk seluruh aset visual Lekas: logo, favicon, ikon aplikasi, gambar Open Graph, foto produk katalog demo, dan foto avatar pengguna demo.

Yang dikonsumsi Stage 2 (Asset Forge) ada di bagian 2 sampai 5. Yang dikonsumsi Stage 4 (Media Producer) ada di bagian 6 sampai 8. Daftar berkas final ada di bagian 10.

---

## 1. Ringkasan arah visual

Lekas terlihat seperti **alat kerja presisi**, bukan halaman arahan startup.

| Ya | Tidak |
| --- | --- |
| Sudut siku, radius 0 di mana pun | Sudut membulat, pil, kapsul |
| Bidang warna datar | Gradien, mesh, glassmorphism |
| Ungu tinta `#6D28A8` sebagai satu satunya warna merek | Ungu ke pink, warna pelangi |
| Garis tipis dan perbedaan permukaan | Bayangan tebal dan bevel |
| Foto meja kasir nyata dan foto produk polos | Ilustrasi 3D mengambang, orang tertawa di depan laptop |
| Angka besar dan tegas | Ikon dekoratif yang tidak membawa informasi |

Kata kunci arah: **presisi, cepat, terang, tenang, jujur.**

Yang dilarang keras di seluruh merek ini: cokelat kraft, kuning gading, tekstur kertas, gradien hangat, dan kosakata artisanal. Itu bahasa rak F&B artisanal, bukan bahasa perangkat lunak yang memegang uang orang.

---

## 2. Konsep logo

### 2.1 Ide

Mark Lekas adalah **huruf L yang kakinya digandakan menjadi dua batang sama panjang.**

Satu bentuk, tiga bacaan, dan ketiganya kebetulan benar semua:

1. **Huruf L**, inisial Lekas.
2. **Tanda sama dengan** di kaki huruf itu. Sama dengan berarti seimbang, dan itu janji produknya: kas fisik sama dengan kas sistem, total sama dengan yang dibayar. Ini kenapa dua batangnya wajib **persis sama panjang dan sama tebal**. Kalau tidak sama, artinya hilang.
3. **Dua garis laju**, tanda cepat, sesuai arti kata lekas.

Semua sudutnya siku, tidak ada satu pun yang membulat, sejalan dengan R10 dan dengan bahasa visual seluruh produk.

### 2.2 Geometri mark, spesifikasi presisi bukan saran

Kanvas `viewBox="0 0 100 100"`. Tiga persegi panjang, tidak ada elemen lain, tidak ada sudut membulat.

| Bagian | x | y | lebar | tinggi |
| --- | --- | --- | --- | --- |
| Batang tegak | 16 | 10 | 22 | 46 |
| Batang kaki atas | 16 | 56 | 68 | 14 |
| Batang kaki bawah | 16 | 76 | 68 | 14 |

Turunan yang wajib benar:

- Batang tegak dan kaki atas **bersentuhan tepat di y = 56** sehingga menyatu jadi satu bentuk huruf L.
- Jarak antara kedua kaki **tepat 6 unit** (dari y = 70 ke y = 76).
- Kedua kaki **identik**: sama sama x = 16, lebar 68, tinggi 14. Tidak boleh salah satu lebih pendek.
- Kotak isi keseluruhan: x dari 16 sampai 84, y dari 10 sampai 90. Jadi mark terpusat di kanvas dengan margin 16 kiri kanan dan 10 atas bawah.

SVG referensi, salin apa adanya lalu ganti `fill` sesuai varian:

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lekas">
  <rect x="16" y="10" width="22" height="46" fill="#6D28A8"/>
  <rect x="16" y="56" width="68" height="14" fill="#6D28A8"/>
  <rect x="16" y="76" width="68" height="14" fill="#6D28A8"/>
</svg>
```

### 2.3 Lockup dengan wordmark

- Wordmark: **Lekas**, L kapital sisanya huruf kecil. **Manrope ExtraBold 800**, `letter-spacing: -0.02em`.
- Mark di kiri, wordmark di kanan.
- Tinggi mark **sama dengan tinggi huruf kapital L** pada wordmark.
- Jarak antara mark dan wordmark **selebar batang tegak** (22 unit pada skala mark, sekitar 0.32 kali tinggi mark).
- Ruang aman di sekeliling lockup: **selebar batang tegak** di keempat sisi. Tidak ada elemen lain yang boleh masuk ke ruang itu.
- Ukuran minimum lockup: tinggi mark 20px. Di bawah itu pakai mark saja tanpa wordmark.

### 2.4 Dua varian WAJIB (R43)

Ini bagian yang paling sering gagal di build sebelumnya. Logo satu varian akan lenyap di sidebar gelap.

| Varian | Mark | Wordmark | Latar yang dituju |
| --- | --- | --- | --- |
| **Primary** | `#6D28A8` | `#16131F` | terang: `#FFFFFF`, `#F4F2F7` |
| **Knockout** | `#FFFFFF` | `#FFFFFF` | gelap: `#1A1424`, `#261E33`, `#6D28A8` |

Rasio yang berlaku, sudah dihitung:

| Pasangan | Rasio |
| --- | --- |
| mark primary `#6D28A8` di `#FFFFFF` | 8.34 |
| mark primary `#6D28A8` di `--bg` `#F4F2F7` | 7.50 |
| wordmark `#16131F` di `#FFFFFF` | 18.31 |
| mark knockout `#FFFFFF` di `--nav-bg` `#1A1424` | 17.96 |
| mark knockout `#FFFFFF` di `--brand` `#6D28A8` | 8.34 |

Aturan mengikat:

- **Kedua varian berlatar transparan.** Mark **tidak boleh** berupa kotak berwarna yang membawa ground sendiri. Ground sendiri itulah yang membuat logo berubah jadi persegi kosong saat ditaruh di footer atau sidebar sewarna. Itu kegagalan Legatara dan tidak boleh terulang.
- **Sidebar aplikasi berlatar `#1A1424`, jadi sidebar wajib memakai varian knockout.**
- **Satu satunya bentuk yang boleh punya ground penuh adalah ikon aplikasi dan favicon**: ground `#6D28A8`, mark putih, tanpa sudut membulat.
- Mark selalu **satu warna solid**. Dilarang dua nada, dilarang salah satu kaki diberi warna berbeda. Mark dua warna akan pecah begitu ditaruh di latar gelap.

### 2.5 Yang tidak boleh ada di logo

- Sudut membulat pada bagian mana pun.
- Gradien, bayangan jatuh, garis luar, efek kilau, tekstur.
- Latar berwarna yang menyatu dengan mark (kecuali ikon aplikasi, lihat 4).
- Simbol keranjang belanja, gerobak, mesin kasir, uang kertas, koin, atau ikon toko. Terlalu harfiah dan sudah dipakai semua kompetitor.
- Teks apa pun di dalam mark.
- Bacaan sebagai angka. Kalau kaki bawahnya dibuat lebih pendek, bentuknya mulai terbaca sebagai grafik batang atau angka 4. Kedua kaki wajib sama panjang.

---

## 3. Prompt logo siap pakai

Baca dulu **bagian 3.0**. Untuk logo ini jalur generate adalah **cadangan**, bukan jalur utama.

### 3.0 Jalur eksekusi yang direkomendasikan: tulis SVG, jangan generate

Mark Lekas hanya **tiga persegi panjang**. Menulis SVG dari tabel geometri di 2.2 menghasilkan berkas yang lebih tajam, jauh lebih kecil, presisi sampai unit, dan bisa diwarnai ulang dengan satu atribut. Model gambar tidak akan pernah menghasilkan koordinat yang persis.

Lebih penting lagi, **R62**: model gambar secara andal mengacaukan teks. Setiap gambar Wanantara yang memuat teks terbaca punya cacat, termasuk merek yang dikarang sendiri. Wordmark "Lekas" **wajib** diset sebagai teks asli memakai Manrope ExtraBold, entah sebagai `<text>` di SVG atau path hasil konversi huruf, **bukan** hasil generate. Kalau wordmark digenerate, hasilnya bisa terbaca "Lekos", "Lekass", atau nama lain sama sekali.

Jadi urutan kerjanya:

1. Tulis `mark-lekas.svg` dan `mark-lekas-knockout.svg` langsung dari tabel 2.2.
2. Susun lockup dengan menaruh mark plus teks Manrope ExtraBold, lalu konversi teksnya jadi path.
3. Ekspor PNG dari SVG itu untuk keperluan yang butuh raster.
4. Prompt di bawah hanya dipakai kalau langkah 1 sampai 3 tidak bisa dijalankan.

### 3.1 Prompt varian PRIMARY (latar terang)

Tempel **utuh**, termasuk blok NEGATIVE.

```
Flat vector logo mark for "Lekas", an Indonesian point of sale software product.

MARK: a bold geometric letter L constructed from three solid rectangles with
perfectly square corners. One vertical bar on the left. At its base, a horizontal
bar extending to the right, joined to the vertical bar so the two read as a single
letter L. Below that, a second horizontal bar, detached, separated by a thin even
gap, exactly the same length and exactly the same thickness as the first horizontal
bar. The two identical horizontal bars read simultaneously as an equals sign and as
speed lines. Perfect right angles everywhere. No rounded corners anywhere.

STYLE: flat vector, single solid color, crisp hard edges, geometric precision,
engineered, modern software logo. Absolutely uniform color fill, no shading.

COLOR: solid #6D28A8 (deep ink violet) on a fully transparent background.

TECHNICAL: transparent background, PNG with alpha, 1:1 square canvas, centered,
generous even margins, icon only with no text.

NEGATIVE: no text, no letters, no words, no wordmark, no rounded corners, no
gradient, no gradient mesh, no drop shadow, no outline, no stroke, no bevel, no
glow, no 3D, no photo, no realistic rendering, no texture, no paper grain, no
background color, no background shape, no square or circular container behind the
mark, no shopping cart, no shopping bag, no cash register, no banknote, no coin,
no storefront icon, no generic stock icon look, no two tone coloring, no unequal
bar lengths, no bar chart appearance.
```

### 3.2 Prompt varian KNOCKOUT (latar gelap, WAJIB, R43)

Sama persis, hanya warnanya berubah. Bentuknya **wajib identik** dengan varian primary.

```
Flat vector logo mark for "Lekas", an Indonesian point of sale software product.

MARK: a bold geometric letter L constructed from three solid rectangles with
perfectly square corners. One vertical bar on the left. At its base, a horizontal
bar extending to the right, joined to the vertical bar so the two read as a single
letter L. Below that, a second horizontal bar, detached, separated by a thin even
gap, exactly the same length and exactly the same thickness as the first horizontal
bar. Perfect right angles everywhere. No rounded corners anywhere.

STYLE: flat vector, single solid color, crisp hard edges, geometric precision.

COLOR: solid pure white #FFFFFF on a fully transparent background. This is the
knockout variant intended to sit on dark surfaces.

TECHNICAL: transparent background, PNG with alpha, 1:1 square canvas, centered,
generous even margins, icon only with no text.

NEGATIVE: no text, no letters, no words, no wordmark, no rounded corners, no
gradient, no drop shadow, no outline, no stroke, no bevel, no glow, no 3D, no photo,
no texture, no background color, no background shape, no dark rectangle behind the
mark, no container, no shopping cart, no cash register, no banknote, no coin, no
generic stock icon look, no two tone coloring, no unequal bar lengths.
```

### 3.3 Prompt MARK di dalam ground (ikon aplikasi dan favicon)

Ini **satu satunya** bentuk yang boleh punya latar penuh.

```
App icon for "Lekas", an Indonesian point of sale software product.

COMPOSITION: a full bleed solid square of deep ink violet #6D28A8 filling the entire
canvas edge to edge, with perfectly square corners and no rounding at all. Centered
on it, a bold geometric letter L in pure white #FFFFFF, constructed from three solid
rectangles: one vertical bar, a horizontal bar joined at its base extending right,
and a second detached horizontal bar below it of exactly the same length and
thickness, separated by a thin even gap.

STYLE: flat vector app icon, two colors only, crisp hard edges, generous even margin
between the white mark and the edge of the violet square.

TECHNICAL: 1:1 square, 512 by 512, PNG.

NEGATIVE: no text, no letters, no words, no rounded corners, no squircle, no circle
container, no gradient, no shadow, no bevel, no glow, no 3D, no photo, no texture,
no unequal bar lengths, no extra shapes.
```

### 3.4 Wajib diperiksa setelah generate (R62)

Kalau jalur generate benar benar dipakai, Asset Forge **wajib** membuka setiap berkas hasil dengan alat `Read` bawaan (gratis, R55) dan memeriksa dengan mata:

1. Tidak ada teks sama sekali di dalam mark.
2. Kedua batang horizontal **sama panjang**. Kalau tidak sama, tolak dan ulang.
3. Semua sudut siku, tidak ada satu pun yang membulat.
4. Latarnya benar benar transparan, bukan putih yang menyamar transparan.
5. Bentuk varian knockout **identik** dengan varian primary, bukan gambar baru yang kebetulan mirip.

"Panggilan generate berhasil" dan "berkas ada di path yang benar" bukan bukti tentang isi gambarnya.

---

## 4. Favicon dan ikon aplikasi

### 4.1 Berkas yang wajib ada di `public/`

| Berkas | Ukuran | Isi |
| --- | --- | --- |
| `favicon.ico` | 16, 32, 48 multi resolusi | ground `#6D28A8`, mark putih |
| `favicon-16x16.png` | 16 x 16 | sama |
| `favicon-32x32.png` | 32 x 32 | sama |
| `favicon-48x48.png` | 48 x 48 | sama |
| `apple-touch-icon.png` | 180 x 180 | sama, tanpa transparansi |
| `icon-192.png` | 192 x 192 | sama |
| `icon-512.png` | 512 x 512 | sama, ini master |
| `icon-maskable-512.png` | 512 x 512 | sama, mark diperkecil jadi 60 persen kanvas untuk zona aman maskable |

### 4.2 Cara paling sederhana membuatnya

Buat master 512 x 512 lebih dulu (`icon-512.png`), lalu turunkan semua ukuran dari situ.

```bash
# semua ukuran diturunkan dari master 512
for s in 16 32 48 180 192; do
  npx sharp-cli -i public/icon-512.png -o public/icon-$s.png resize $s $s
done

# favicon.ico multi resolusi
npx to-ico public/icon-16.png public/icon-32.png public/icon-48.png > public/favicon.ico
```

Kalau `sharp` tersedia sebagai pustaka, memakai skrip Node lebih dapat diandalkan daripada CLI. Yang penting hasil akhirnya sama: satu master, semua turunannya konsisten.

### 4.3 Preferensi SVG

Untuk pemakaian di dalam aplikasi (sidebar, topbar, layar login), **selalu pakai SVG**, bukan PNG. SVG tajam di setiap kepadatan piksel, ukurannya di bawah 1 KB, dan warnanya bisa diganti lewat `currentColor` sehingga varian knockout tidak perlu berkas terpisah kalau memang lebih praktis.

PNG hanya untuk favicon, ikon aplikasi, dan Open Graph.

---

## 5. Gambar Open Graph

`public/og-lekas.png`, 1200 x 630.

**Dibuat dengan merender templat SVG atau HTML, bukan digenerate model gambar.** Alasannya R62: gambar ini isinya teks, dan teks hasil generate tidak bisa dipercaya ejaannya.

Komposisi:

- Latar penuh `#1A1424`.
- Lockup knockout di kiri atas, tinggi mark 64px, margin 64px dari tepi.
- Judul di tengah kiri: **Cepat di kasir, pas di laci.** Manrope ExtraBold 800, 72px, putih.
- Sub judul di bawahnya: **Aplikasi kasir untuk toko retail dan kedai F&B.** IBM Plex Sans 400, 32px, `#D6CFE2` (11.87 di atas `#1A1424`).
- Di kanan bawah, garis 3px `#8A3FCB` sepanjang 240px sebagai aksen. Tidak ada elemen dekoratif lain.
- Semua sudut siku.

---

## 6. Foto produk katalog demo (Stage 4)

### 6.1 Keputusan yang sudah diambil, tidak perlu ditanya lagi

Katalog demo berisi puluhan produk supaya terasa seperti bisnis nyata (semangat R41). Menggenerate foto untuk **semua** produk itu mahal dan tidak perlu, karena aplikasi kasir sungguhan pun menampilkan ubin berwarna berhuruf awal untuk produk yang belum ada fotonya. Itu bukan kompromi, itu justru realisme kategori.

Jadi:

- **24 produk mendapat foto asli** (12 retail, 12 F&B). Ini produk yang tampil di grid Kasir pada kategori baku dan di halaman detail produk.
- **Sisanya memakai ubin tipografis**: latar salah satu dari `--chart-1` sampai `--chart-6` sesuai kategori, huruf awal nama produk dalam Manrope 800 putih, radius 0. Kontras putih di atas keenam warna itu antara 5.08 dan 8.34, semuanya lolos.
- Ubin tipografis **bukan** placeholder yang harus diganti nanti. Itu bagian permanen dari desain.

### 6.2 Aturan per aset (R49)

Setiap foto punya **blok SUBJECT sendiri yang spesifik**. Satu prompt "produk di atas meja" yang dipakai ulang untuk delapan baris adalah kegagalan. Manifes `MEDIA.md` baru lengkap kalau jumlah blok SUBJECT sama dengan jumlah path aset.

Rasio semua foto produk **1:1**, resolusi 1K, karena ubin di grid Kasir berbentuk persegi.

### 6.3 PHOTO DNA (ditempel ke setiap prompt foto produk, R33)

```
PHOTO DNA: real photograph, shot on a 50mm prime lens at f/2.8, soft directional
window light from the left, gentle natural shadows falling to the right, shallow
depth of field with the background falling off softly, subtle film grain, minor
real world surface imperfections such as faint dust, a small scuff, an uneven edge.
Neutral light grey seamless surface. Slightly overhead three quarter angle. Colors
natural and unsaturated, white balance neutral daylight.
```

### 6.4 NEGATIVE (ditempel ke setiap prompt foto produk, R33)

```
NEGATIVE: no AI look, no plastic or waxy surfaces, no over smoothed texture, no
hyper saturation, no symmetrical mirror reflections, no fake bokeh halo, no warped
or melted packaging, no floating objects, no impossible shadows, no perfect
symmetry, no artificial studio smear, no CGI render, no 3D render, no illustration,
no watermark, no logo, no brand name, no readable label text, no lettering, no
numbers, no price tag, no hands, no people, no text of any kind.
```

### 6.5 Aturan teks di dalam gambar (R62, ini yang paling sering gagal)

Model gambar merender huruf yang **kelihatan masuk akal**, bukan kata yang benar, dan dia mengarang nama merek. Untuk katalog produk konsekuensinya berat: kemasan mi instan dengan merek karangan, label kopi yang tulisannya berantakan.

Karena itu, untuk seluruh set foto produk Lekas:

- **Kemasan wajib polos.** Tidak ada label, tidak ada merek, tidak ada tulisan. Ini sudah masuk blok NEGATIVE di 6.4 dan tidak boleh dihapus dari prompt mana pun.
- Kalau sebuah subjek secara alami membawa tulisan (kemasan snack, botol minuman), pilih sudut yang membuat labelnya **membelakangi kamera** atau **di luar fokus**, jangan dipaksa tajam.
- **Jangan pernah meninggalkan token templat** seperti `[nama produk]` atau `{brand}` di dalam prompt. Model akan merender kurung siku itu apa adanya ke dalam gambar.
- **Verifikasi wajib membaca piksel.** Media Producer membuka setiap foto dengan alat `Read` (gratis, R55) dan memastikan tidak ada teks terbaca. Ada teks berarti regenerate dengan komposisi lebih ketat, sampai batas dua kali ulang per aset sesuai R33.

### 6.6 Daftar subjek, 24 foto

Retail (`public/img/produk/`):

| Berkas | Subjek |
| --- | --- |
| `retail-01-air-mineral.jpg` | botol air mineral plastik bening 600ml polos tanpa label, berembun tipis |
| `retail-02-mi-instan.jpg` | tumpukan tiga bungkus mi instan polos warna solid, tanpa tulisan |
| `retail-03-beras.jpg` | karung beras kecil 5kg anyaman plastik putih polos, mulut karung terlipat |
| `retail-04-minyak-goreng.jpg` | botol plastik minyak goreng 1 liter polos, isi kuning keemasan |
| `retail-05-gula-pasir.jpg` | kemasan gula pasir 1kg plastik bening polos, butiran terlihat |
| `retail-06-kopi-sachet.jpg` | renceng sachet kopi polos warna solid, tergantung |
| `retail-07-sabun-batang.jpg` | tiga sabun batang tanpa bungkus, disusun bertingkat |
| `retail-08-deterjen.jpg` | drigen deterjen cair 1 liter polos, tutup ulir |
| `retail-09-susu-kotak.jpg` | kotak susu UHT 250ml polos warna solid |
| `retail-10-telur.jpg` | tray telur ayam berisi sepuluh butir, tampak dari atas serong |
| `retail-11-roti-tawar.jpg` | roti tawar dalam kemasan plastik bening polos |
| `retail-12-baterai.jpg` | empat baterai AA polos berdiri berjajar |

F&B (`public/img/produk/`):

| Berkas | Subjek |
| --- | --- |
| `fnb-01-kopi-susu.jpg` | es kopi susu dalam gelas plastik bening polos, lapisan susu dan kopi terlihat, embun di dinding gelas |
| `fnb-02-americano.jpg` | americano panas dalam cangkir keramik putih polos di atas piring kecil |
| `fnb-03-matcha-latte.jpg` | es matcha latte dalam gelas tinggi bening, gradasi hijau ke putih |
| `fnb-04-teh-manis.jpg` | es teh manis dalam gelas bening, satu irisan lemon di bibir gelas |
| `fnb-05-roti-bakar.jpg` | roti bakar cokelat keju terbelah dua di piring keramik putih |
| `fnb-06-croissant.jpg` | croissant mentega di atas kertas roti polos, serpihan remah di sekitarnya |
| `fnb-07-donat-gula.jpg` | tiga donat gula halus disusun di piring keramik putih |
| `fnb-08-nasi-goreng.jpg` | nasi goreng dengan telur mata sapi di piring keramik putih polos |
| `fnb-09-mi-ayam.jpg` | mangkuk mi ayam dengan potongan ayam dan sawi, sumpit di sisi mangkuk |
| `fnb-10-kentang-goreng.jpg` | kentang goreng dalam keranjang saji beralas kertas polos |
| `fnb-11-pisang-goreng.jpg` | pisang goreng krispi di piring keramik putih, taburan gula halus |
| `fnb-12-brownies.jpg` | dua potong brownies cokelat di atas papan kayu terang |

---

## 7. Foto avatar pengguna demo (Stage 4)

Enam avatar untuk data demo pengguna dan peran, `public/img/avatar/`.

| Berkas | Peran | Subjek |
| --- | --- | --- |
| `avatar-01.jpg` | Pemilik | perempuan Indonesia usia 40an, kemeja polos, ekspresi tenang |
| `avatar-02.jpg` | Manajer | laki laki Indonesia usia 30an, kemeja polos berkerah |
| `avatar-03.jpg` | Kasir | perempuan Indonesia usia 20an, kaus polo polos |
| `avatar-04.jpg` | Kasir | laki laki Indonesia usia 20an, kaus polo polos |
| `avatar-05.jpg` | Kasir | perempuan Indonesia usia 30an, berhijab polos |
| `avatar-06.jpg` | Kasir | laki laki Indonesia usia 20an, kemeja polos lengan pendek |

Aturan:

- Rasio **1:1**, potongan kepala dan bahu, wajah menghadap kamera, latar polos abu terang di luar fokus.
- Tanpa seragam bermerek, tanpa name tag, tanpa tulisan apa pun di baju (R62).
- PHOTO DNA yang sama dari 6.3, dengan tambahan: `natural skin texture with visible pores and fine lines, catchlight in the eyes, no beauty retouching`.
- NEGATIVE yang sama dari 6.4, dengan tambahan: `no waxy skin, no plastic skin, no over smoothed face, no extra fingers, no merged fingers, no distorted ears, no asymmetric eyes, no name tag, no badge, no lanyard text`.
- **Cadangan kalau foto tidak layak**: pakai avatar inisial, yaitu ubin `--brand-soft` dengan dua huruf inisial `--brand-deep` (10.83), Manrope 700, radius 0. Ini pilihan yang sah dan tidak perlu izin.

---

## 8. Tampilan produk di halaman landing

**Halaman landing `/` tidak memakai tangkapan layar bitmap dan tidak memakai gambar hasil generate.**

Yang dipakai adalah **komposisi DOM asli** dari antarmuka Lekas: potongan layar Kasir sungguhan (rel kategori, beberapa ubin produk, panel keranjang dengan total dan tombol Bayar) dirender sebagai HTML dan CSS di dalam halaman landing, memakai token yang sama dari `DESIGN.md`.

Alasannya:

1. Tidak ada risiko teks berantakan seperti pada gambar hasil generate (R62).
2. Tajam di setiap kepadatan piksel dan responsif ikut breakpoint.
3. Selalu jujur, karena yang ditampilkan memang produk yang sama, bukan mockup yang bisa melenceng dari implementasi.
4. Ikut tersapu oleh pemeriksaan kontras dan pemeriksaan `innerText`, sedangkan bitmap lolos begitu saja tanpa pernah diperiksa.

Komposisi itu bersifat dekoratif untuk pembaca layar (`aria-hidden="true"`) dan **tidak boleh** bisa difokus dengan Tab, supaya tidak menjadi jebakan papan ketik di halaman landing.

---

## 9. Ikon antarmuka

- Satu set saja: **Lucide**, ukuran baku 20px di sidebar dan 16px di dalam baris tabel.
- Ketebalan garis `1.75`, warna mengikuti `currentColor`.
- **`stroke-linecap` dan `stroke-linejoin` diset `square`**, bukan `round`, supaya ikon sejalan dengan bahasa sudut siku produk ini (R10). Ini satu baris override global dan wajib dilakukan.
- Ikon tidak pernah berdiri sendiri sebagai satu satunya penanda makna. Selalu ada label teks atau `aria-label`.
- Dilarang mencampur set ikon lain.

---

## 10. Daftar aset yang harus dihasilkan

### 10.1 Stage 2, Asset Forge

| Berkas | Sumber |
| --- | --- |
| `public/mark-lekas.svg` | tulis langsung dari tabel geometri 2.2, fill `#6D28A8` |
| `public/mark-lekas-knockout.svg` | sama, fill `#FFFFFF` |
| `public/logo-lekas-primary.svg` | lockup, mark `#6D28A8` plus wordmark `#16131F` |
| `public/logo-lekas-knockout.svg` | lockup, mark dan wordmark `#FFFFFF` |
| `public/logo-lekas-primary.png` | ekspor dari SVG, tinggi 256, latar transparan |
| `public/logo-lekas-knockout.png` | ekspor dari SVG, tinggi 256, latar transparan |
| `public/icon-512.png` | ground `#6D28A8`, mark putih, master ikon |
| `public/icon-192.png` | turunan dari master |
| `public/icon-maskable-512.png` | mark 60 persen kanvas untuk zona aman |
| `public/apple-touch-icon.png` | 180 x 180, tanpa transparansi |
| `public/favicon-16x16.png` | turunan |
| `public/favicon-32x32.png` | turunan |
| `public/favicon-48x48.png` | turunan |
| `public/favicon.ico` | multi resolusi 16, 32, 48 |
| `public/og-lekas.png` | 1200 x 630, dirender dari templat SVG atau HTML, bukan digenerate |

### 10.2 Stage 4, Media Producer

| Kelompok | Jumlah | Path | Rasio |
| --- | --- | --- | --- |
| Foto produk retail | 12 | `public/img/produk/retail-*.jpg` | 1:1 |
| Foto produk F&B | 12 | `public/img/produk/fnb-*.jpg` | 1:1 |
| Avatar pengguna demo | 6 | `public/img/avatar/avatar-0*.jpg` | 1:1 |

Total 30 aset generate. Tidak ada video, tidak ada hero video: R2, R15, R30, dan R44 tidak berlaku untuk app portfolio.

Media Producer wajib mencocokkan setiap path yang dideklarasikan di `MEDIA.md` dengan berkas yang benar benar mendarat di disk: tidak boleh ada nama melenceng, berkas hilang, berkas nyasar, atau penanda placeholder yang tertinggal.

---

## 11. Cara membuat lewat Google Flow (jalur gratis, kalau dibutuhkan)

Kalau generate lewat pipeline tidak bisa dijalankan, ini yang diserahkan ke manusia. Lima langkah, tidak boleh dipotong:

1. **Salin tempel prompt yang sudah dirangkai** (blok SUBJECT plus PHOTO DNA plus NEGATIVE dari `MEDIA.md`, apa adanya, jangan cuma SUBJECT-nya) ke kolom chat Google Flow di https://labs.google/fx/id/tools/flow/project/1e873728-41ff-4e87-ab36-3de32f6ad416, di collection bernama `lekas`.
2. **Atur config**: rasio sesuai kolom ratio di `MEDIA.md` (1:1 untuk foto produk dan avatar, 1:1 untuk mark logo), resolusi 1K, model Nano Banana untuk gambar.
3. **Generate, maksimum 4 media sekaligus.** Tidak boleh lebih dari 4 berbarengan.
4. **Lanjut ke prompt berikutnya tanpa download dulu.**
5. **Kalau sudah selesai semua**, select gambar hasilnya, download, lalu taruh di folder `public/` sesuai konvensi (`public/img/produk/`, `public/img/avatar/`) dengan nama berkas **persis** seperti kolom path di `MEDIA.md`. Salah nama berarti gambarnya rusak di build.
