# Lekas, LOGO.md

Lembar kerja siap eksekusi untuk **Asset Forge (Stage 2)**. Cukup baca berkas ini untuk menuntaskan logo dan favicon.

> **Sumber kebenaran lengkap ada di [`ART-DIRECTION.md`](./ART-DIRECTION.md)** (rasional konsep, aturan lockup, ruang aman, arahan foto, daftar aset penuh). Berkas ini adalah ekstrak yang bisa langsung dijalankan. Kalau ada yang bentrok, `ART-DIRECTION.md` yang menang.

| Kunci | Nilai |
| --- | --- |
| Merek | Lekas |
| Warna merek | `#6D28A8` |
| Tinta wordmark | `#16131F` |
| Latar gelap yang dituju varian knockout | `#1A1424` |
| Huruf wordmark | Manrope ExtraBold 800, `letter-spacing: -0.02em` |
| Tujuan berkas | `public/` di repo ini |

---

## 1. Jalur eksekusi yang direkomendasikan: tulis SVG, jangan generate

Mark Lekas hanya **tiga persegi panjang**. Kalau kamu sanggup menulis SVG dari spesifikasi geometri di bawah, **lakukan itu**. Hasilnya lebih tajam, jauh lebih kecil, presisi sampai unit, dan bisa diwarnai ulang lewat satu atribut. Prompt di bagian 4 adalah **jalur cadangan**, bukan jalur utama.

Ada alasan kedua yang lebih keras: **R62**, model gambar secara andal mengacaukan teks dan mengarang nama merek. Wordmark "Lekas" **wajib** diset sebagai teks asli dengan Manrope ExtraBold lalu dikonversi jadi path, **tidak boleh** hasil generate. Wordmark yang digenerate bisa terbaca "Lekos" atau nama lain sama sekali, dan itu terjadi di Wanantara pada setiap gambar yang memuat teks.

### 1.1 Spesifikasi geometri, kanvas 100 x 100

Tiga persegi panjang, tidak ada elemen lain, tidak ada sudut membulat.

| Bagian | x | y | lebar | tinggi |
| --- | --- | --- | --- | --- |
| Batang tegak | 16 | 10 | 22 | 46 |
| Batang kaki atas | 16 | 56 | 68 | 14 |
| Batang kaki bawah | 16 | 76 | 68 | 14 |

Yang wajib benar:

- Batang tegak dan kaki atas **bersentuhan tepat di y = 56**, jadi keduanya menyatu membentuk huruf L.
- Jarak antar kaki **tepat 6 unit** (y = 70 sampai y = 76).
- Kedua kaki **identik**: x = 16, lebar 68, tinggi 14. **Kalau salah satu lebih pendek, artinya hilang** dan bentuknya mulai terbaca sebagai grafik batang.

Arti bentuknya: huruf L dari Lekas, sekaligus tanda sama dengan (kas fisik sama dengan kas sistem), sekaligus dua garis laju. Satu bentuk, tiga bacaan.

### 1.2 Berkas mark, salin apa adanya

`public/mark-lekas.svg`

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lekas">
  <rect x="16" y="10" width="22" height="46" fill="#6D28A8"/>
  <rect x="16" y="56" width="68" height="14" fill="#6D28A8"/>
  <rect x="16" y="76" width="68" height="14" fill="#6D28A8"/>
</svg>
```

`public/mark-lekas-knockout.svg` sama persis, `fill` diganti `#FFFFFF` pada ketiga `rect`.

### 1.3 Lockup

- Mark di kiri, wordmark **Lekas** di kanan. L kapital, sisanya huruf kecil.
- Tinggi mark **sama dengan tinggi huruf kapital L** pada wordmark.
- Jarak mark ke wordmark **selebar batang tegak**, yaitu 22 unit pada skala mark.
- Ruang aman selebar batang tegak di keempat sisi.
- Di bawah tinggi mark 20px, pakai mark saja tanpa wordmark.

---

## 2. Dua varian WAJIB (R43)

Ini bagian yang paling sering gagal di build sebelumnya. Logo satu varian akan lenyap di sidebar gelap.

| Varian | Mark | Wordmark | Latar yang dituju |
| --- | --- | --- | --- |
| **Primary** | `#6D28A8` | `#16131F` | terang: `#FFFFFF`, `#F4F2F7` |
| **Knockout** | `#FFFFFF` | `#FFFFFF` | gelap: `#1A1424`, `#261E33`, `#6D28A8` |

Rasio kontras, sudah dihitung:

| Pasangan | Rasio |
| --- | --- |
| mark primary `#6D28A8` di putih | 8.34 |
| mark primary `#6D28A8` di `#F4F2F7` | 7.50 |
| wordmark `#16131F` di putih | 18.31 |
| mark knockout putih di `#1A1424` | 17.96 |
| mark knockout putih di `#6D28A8` | 8.34 |

Aturan mengikat:

- **Kedua varian berlatar transparan.** Mark **tidak boleh** berupa kotak berwarna yang membawa ground sendiri. Ground sendiri itulah yang bikin logo jadi persegi kosong saat ditaruh di sidebar atau footer sewarna. Itu kegagalan Legatara.
- **Sidebar aplikasi berlatar `#1A1424`, jadi sidebar wajib memakai varian knockout.**
- **Satu satunya bentuk yang boleh punya ground penuh adalah ikon aplikasi dan favicon**: ground `#6D28A8`, mark putih, sudut tetap siku.
- Mark selalu **satu warna solid**. Dilarang dua nada, dilarang salah satu kaki diberi warna berbeda.

---

## 3. Favicon dan ikon aplikasi

### 3.1 Berkas wajib di `public/`

| Berkas | Ukuran | Isi |
| --- | --- | --- |
| `favicon.ico` | 16, 32, 48 multi resolusi | ground `#6D28A8`, mark putih |
| `favicon-16x16.png` | 16 x 16 | sama |
| `favicon-32x32.png` | 32 x 32 | sama |
| `favicon-48x48.png` | 48 x 48 | sama |
| `apple-touch-icon.png` | 180 x 180 | sama, tanpa transparansi |
| `icon-192.png` | 192 x 192 | sama |
| `icon-512.png` | 512 x 512 | sama, **ini master** |
| `icon-maskable-512.png` | 512 x 512 | sama, mark diperkecil jadi 60 persen kanvas untuk zona aman |

### 3.2 Cara paling sederhana

Buat master `icon-512.png` lebih dulu, lalu **turunkan semua ukuran lain dari master itu**. Jangan membuat tiap ukuran secara terpisah, hasilnya pasti tidak konsisten.

```bash
for s in 16 32 48 180 192; do
  npx sharp-cli -i public/icon-512.png -o public/icon-$s.png resize $s $s
done

npx to-ico public/icon-16.png public/icon-32.png public/icon-48.png > public/favicon.ico
```

Kalau `sharp` tersedia sebagai pustaka Node, skrip Node lebih dapat diandalkan daripada CLI. Yang penting hasilnya sama: satu master, semua turunan konsisten.

### 3.3 Preferensi SVG di dalam aplikasi

Untuk sidebar, topbar, dan layar login, **selalu pakai SVG**, bukan PNG. Tajam di setiap kepadatan piksel, di bawah 1 KB, dan warnanya bisa diganti lewat `currentColor`.

PNG hanya untuk favicon, ikon aplikasi, dan Open Graph.

---

## 4. Prompt siap tempel (jalur cadangan)

Dipakai hanya kalau bagian 1 tidak bisa dijalankan. Tempel **utuh**, termasuk blok NEGATIVE, jangan cuma bagian MARK. Semua prompt di bawah menghasilkan **ikon saja tanpa teks**, karena wordmark selalu diset dengan huruf asli.

### 4.1 Varian PRIMARY (latar terang)

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

### 4.2 Varian KNOCKOUT (latar gelap, WAJIB, R43)

Bentuknya **wajib identik** dengan 4.1, hanya warnanya berubah.

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

### 4.3 Ikon aplikasi dan favicon (satu satunya yang boleh punya ground)

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

### 4.4 Wajib diperiksa setelah generate (R62)

Kalau jalur generate dipakai, buka **setiap** berkas hasil dengan alat `Read` bawaan (gratis, R55) dan periksa dengan mata:

1. Tidak ada teks sama sekali di dalam mark.
2. Kedua batang horizontal **sama panjang**. Kalau tidak, tolak dan ulang.
3. Semua sudut siku, tidak ada satu pun yang membulat.
4. Latarnya benar benar transparan, bukan putih yang menyamar transparan.
5. Bentuk knockout **identik** dengan primary, bukan gambar baru yang kebetulan mirip.

"Panggilan generate berhasil" dan "berkas ada di path yang benar" bukan bukti tentang isi gambarnya.

---

## 5. Jalur serah terima aset

- **Tujuan akhir semua berkas: folder `public/` di repo ini**, `himay-studio/portfolio-lekas`. Asset Forge menaruhnya langsung di sana, lalu commit dan push sesuai R27 dan R54.
- Kalau asetnya dibuat manusia di luar pipeline, berkas boleh diserahkan lewat dua jalur: dilampirkan ke issue Multica (`multica issue comment add --attachment`), atau ditaruh di folder kerja lokal `~/Project/lekas/` untuk kemudian disalin ke `public/`.
- **Nama berkas wajib persis** seperti tabel di bagian 3.1 dan bagian 10 `ART-DIRECTION.md`. Salah satu huruf saja berarti gambarnya 404 di `pages.dev` setelah static export, kelas kegagalan yang sama dengan aset hilang di R15.

---

## 6. Cara membuat lewat Google Flow (jalur gratis)

Kalau logo harus dibuat manusia tanpa pipeline, ini tutorialnya. Lima langkah, tidak boleh dipotong.

1. **Salin tempel prompt** dari bagian 4.1, lalu 4.2, lalu 4.3, **utuh termasuk blok NEGATIVE**, ke kolom chat Google Flow di https://labs.google/fx/id/tools/flow/project/1e873728-41ff-4e87-ab36-3de32f6ad416, di collection bernama `lekas`.
2. **Atur config**: rasio **1:1**, resolusi **1K**, model **Nano Banana** untuk gambar.
3. **Generate. Maksimum 4 media sekaligus**, tidak boleh berbarengan lebih dari 4.
4. **Lanjut ke prompt berikutnya tanpa download dulu.**
5. **Kalau semua sudah jadi**, select gambar hasilnya, download, lalu taruh di `~/Project/lekas/public/` (atau langsung ke `public/` repo ini) dengan nama berkas **persis** seperti tabel di bagian 3.1. Salah nama berarti gambarnya rusak di build.

Catatan: wordmark **tetap** diset dengan huruf Manrope ExtraBold asli, bukan digenerate, bahkan di jalur ini. Google Flow dipakai untuk mark dan ikon saja.
