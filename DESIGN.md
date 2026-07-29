# Lekas, DESIGN.md

Sistem desain untuk aplikasi kasir Lekas. Semua nilai di sini sudah final dan rasio kontrasnya sudah **dihitung**, bukan dikira kira. Stage 3 dan Stage 5 tinggal memakai, tidak perlu menebak dan tidak perlu menghitung ulang.

Rumus yang dipakai: WCAG 2.1 relative luminance, ambang **4.5:1** untuk teks normal, **3:1** untuk teks besar (lebih besar sama dengan 24px, atau lebih besar sama dengan 18.66px dengan bobot 700) dan untuk komponen antarmuka serta objek grafis. Kontrol dengan atribut `disabled` dikecualikan (WCAG 1.4.3).

---

## 1. Prinsip

1. **Angka adalah pahlawannya.** Ini aplikasi uang. Total, kembalian, dan selisih kas mendapat ukuran, bobot, dan ruang paling besar di layarnya masing masing.
2. **Padat data, tidak ramai.** Kepadatan datang dari baris yang rapat dan hierarki yang jelas, bukan dari menumpuk warna, bayangan, dan garis.
3. **Radius 0 di mana pun** (R10). Tidak ada sudut membulat. Termasuk tombol, kartu, input, badge, modal, avatar, dan gambar. Ketegasan sudut siku adalah ciri visual produk ini.
4. **Satu warna merek, sisanya semantik.** Ungu tinta hanya untuk identitas dan navigasi. Hijau, merah, jingga, dan biru punya arti tetap dan tidak boleh dipakai dekoratif.
5. **Garis lebih murah daripada bayangan.** Pemisahan wilayah memakai garis dan perbedaan permukaan. Bayangan hanya untuk lapisan yang benar benar mengambang.
6. **Kontrol harus terlihat sebagai kontrol.** Setiap batas input, checkbox, toggle, radio, dan stepper wajib memakai `--control-border`. Ini kelas kegagalan R20 yang paling sering terulang.

---

## 2. Token warna, set CSS lengkap

Salin blok ini apa adanya ke `globals.css`. Nama token adalah kontrak, jangan diubah.

```css
:root {
  /* ---------- permukaan terang ---------- */
  --bg:              #F4F2F7;  /* kanvas aplikasi, di belakang semua panel */
  --surface:         #FFFFFF;  /* kartu, panel, baris tabel, modal, isi laci kasir */
  --surface-2:       #EDEAF3;  /* header tabel, baris zebra, keadaan hover baris */
  --surface-3:       #E3DFEC;  /* area inset, keadaan kosong, track slider, keadaan tekan */

  /* ---------- garis ---------- */
  --border:          #D7D2E2;  /* DEKORATIF SAJA. Garis kisi tabel, pemisah kartu */
  --border-strong:   #B9B2C9;  /* DEKORATIF SAJA. Pemisah antar wilayah besar */
  --control-border:  #76708A;  /* WAJIB untuk SETIAP batas kontrol interaktif */

  /* ---------- teks ---------- */
  --text:            #16131F;  /* teks utama, judul, nilai sel tabel, nominal */
  --text-muted:      #4B4459;  /* teks sekunder, label kolom, satuan, metadata */
  --text-subtle:     #5A5369;  /* teks paling redup yang masih boleh, placeholder */
  --text-disabled:   #8A8398;  /* HANYA untuk kontrol nonaktif. Lihat catatan 3.5 */
  --text-on-brand:   #FFFFFF;  /* teks di atas isian merek atau isian semantik pekat */

  /* ---------- merek ---------- */
  --brand:           #6D28A8;  /* ungu tinta. Tombol utama, tautan, cincin fokus, deret grafik 1 */
  --brand-hover:     #5A1F8C;  /* keadaan hover dan tekan pada isian merek */
  --brand-deep:      #46186E;  /* teks merek di atas --brand-soft, judul panel merek */
  --brand-soft:      #F0E7F9;  /* baris terpilih, latar chip merek, sorotan halus */
  --brand-bright:    #B588E8;  /* HANYA di atas latar gelap. DILARANG jadi teks di latar terang */

  /* ---------- sidebar kiri (gelap) ---------- */
  --nav-bg:             #1A1424;  /* latar sidebar */
  --nav-surface:        #261E33;  /* hover item menu, panel di dalam sidebar */
  --nav-active:         #8A3FCB;  /* isian item menu aktif. Sengaja lebih terang dari --brand */
  --nav-marker:         #C79BF2;  /* bar penanda item aktif, lebar 3px, menempel di tepi kiri */
  --nav-text:           #D6CFE2;  /* label menu tidak aktif */
  --nav-muted:          #A79DB8;  /* judul kelompok menu, teks pendukung di sidebar */
  --nav-border:         #332A42;  /* DEKORATIF SAJA. Pemisah di dalam sidebar */
  --nav-control-border: #6E6383;  /* WAJIB untuk batas kontrol di dalam sidebar */

  /* ---------- fokus ---------- */
  --focus:           #6D28A8;  /* cincin fokus di permukaan terang, tebal 2px, offset 2px */
  --focus-on-dark:   #E3D0FA;  /* cincin fokus di sidebar dan overlay gelap */

  /* ---------- semantik ---------- */
  --success:         #12723F;  /* uang diterima, transaksi lunas, kas pas, stok aman */
  --success-soft:    #E2F3E8;
  --success-ink:     #0C5A31;  /* teks di atas --success-soft */
  --pay:             var(--success);  /* isian tombol Bayar dan CTA Coba Demo. Nilai sama, sengaja */
  --pay-hover:       #0D5C32;

  --warning:         #8A5300;  /* stok menipis, shift belum ditutup, perlu perhatian */
  --warning-soft:    #FBEEDA;
  --warning-ink:     #7A4A00;

  --danger:          #B3241B;  /* void, refund, stok habis, aksi merusak */
  --danger-soft:     #FBE5E3;
  --danger-ink:      #8F1C15;

  --info:            #1A5FB4;  /* QRIS, kartu, catatan netral, tahap berjalan */
  --info-soft:       #E5EEFA;
  --info-ink:        #14508F;

  /* ---------- deret grafik ---------- */
  --chart-1: #6D28A8;  /* ungu merek, deret utama */
  --chart-2: #12723F;  /* hijau */
  --chart-3: #A05F0C;  /* jingga tua */
  --chart-4: #1A5FB4;  /* biru */
  --chart-5: #A8206C;  /* magenta plum */
  --chart-6: #106B76;  /* hijau kebiruan */

  /* ---------- huruf ---------- */
  --font-display: 'Manrope', system-ui, sans-serif;
  --font-ui:      'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono:    'IBM Plex Mono', ui-monospace, 'SF Mono', monospace;

  /* ---------- bentuk dan ruang ---------- */
  --radius: 0;                 /* R10. Tidak ada pengecualian di aplikasi ini */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  /* ---------- elevasi ---------- */
  --shadow-1: 0 1px 2px rgba(22, 19, 31, 0.08);                                  /* kartu diam */
  --shadow-2: 0 2px 8px rgba(22, 19, 31, 0.12);                                  /* dropdown, popover */
  --shadow-3: 0 8px 32px rgba(22, 19, 31, 0.20);                                 /* modal, drawer */
  --scrim:    rgba(22, 19, 31, 0.55);                                            /* latar gelap modal */

  /* ---------- gerak ---------- */
  --dur-fast:  120ms;   /* hover, tekan, ganti keadaan */
  --dur-base:  180ms;   /* buka tutup dropdown, geser panel */
  --dur-page:  220ms;   /* perpindahan halaman, R46 mensyaratkan 150ms sampai 300ms */
  --ease:      cubic-bezier(0.2, 0, 0.2, 1);
  --ease-out:  cubic-bezier(0, 0, 0.2, 1);

  /* ---------- ukuran tetap ---------- */
  --nav-w:          248px;  /* lebar sidebar terbuka */
  --nav-w-collapsed: 64px;  /* lebar sidebar terlipat, ikon saja */
  --topbar-h:        56px;
  --row-h:           44px;  /* tinggi baris tabel, juga tap target minimum */
  --control-h:       40px;  /* tinggi input, select custom, tombol */
  --control-h-lg:    52px;  /* tombol di layar Kasir, dipakai sambil berdiri */
}
```

---

## 3. Rasio kontras terhitung

Semua angka di bawah dihitung dengan rumus WCAG 2.1 terhadap nilai heksadesimal di atas. **Angka ini adalah bukti, bukan perkiraan.**

### 3.1 Teks di atas permukaan terang (ambang 4.5:1)

| Token | Hex | di `--surface` | di `--bg` | di `--surface-2` | di `--surface-3` |
| --- | --- | --- | --- | --- | --- |
| `--text` | #16131F | 18.31 | 16.47 | 15.40 | 13.98 |
| `--text-muted` | #4B4459 | 9.25 | 8.32 | 7.78 | 7.06 |
| `--text-subtle` | #5A5369 | 7.30 | 6.57 | 6.14 | 5.57 |
| `--text-disabled` | #8A8398 | 3.63 | 3.27 | 3.06 | 2.77 |

`--text-disabled` **tidak lolos 4.5:1 dan itu memang disengaja**. Token ini hanya untuk kontrol yang benar benar `disabled`, yang dikecualikan WCAG 1.4.3. Memakainya untuk teks biasa adalah kegagalan R20.

### 3.2 Teks putih di atas isian pekat (ambang 4.5:1)

| Isian | Hex | Putih di atasnya |
| --- | --- | --- |
| `--brand` | #6D28A8 | **8.34** |
| `--brand-hover` | #5A1F8C | **10.45** |
| `--nav-active` | #8A3FCB | **5.75** |
| `--success` dan `--pay` | #12723F | **5.99** |
| `--pay-hover` | #0D5C32 | **8.10** |
| `--warning` | #8A5300 | **6.33** |
| `--danger` | #B3241B | **6.59** |
| `--info` | #1A5FB4 | **6.29** |

### 3.3 Chip dan badge, teks di atas latar soft (ambang 4.5:1)

| Keluarga | Ink di atas soft | `--text` di atas soft | `--text-muted` di atas soft | `--control-border` di atas soft |
| --- | --- | --- | --- | --- |
| merek | #46186E di #F0E7F9 = **10.83** | 15.26 | 7.71 | 3.93 |
| berhasil | #0C5A31 di #E2F3E8 = **7.22** | 15.88 | 8.03 | 4.09 |
| peringatan | #7A4A00 di #FBEEDA = **6.54** | 15.99 | 8.08 | 4.12 |
| bahaya | #8F1C15 di #FBE5E3 = **7.43** | 15.19 | 7.67 | 3.91 |
| informasi | #14508F di #E5EEFA = **6.97** | 15.64 | 7.90 | 4.03 |

### 3.4 Batas kontrol dan garis (ambang 3:1 untuk kontrol)

| Pasangan | Rasio | Putusan |
| --- | --- | --- |
| `--control-border` #76708A di `--surface` | **4.71** | lolos |
| `--control-border` #76708A di `--bg` | **4.24** | lolos |
| `--control-border` #76708A di `--surface-2` | **3.97** | lolos |
| `--control-border` #76708A di `--surface-3` | **3.60** | lolos |
| `--border` #D7D2E2 di `--surface` | 1.48 | **gagal, dekoratif saja** |
| `--border-strong` #B9B2C9 di `--surface` | 2.04 | **gagal, dekoratif saja** |

> **Aturan mengikat.** `--border` dan `--border-strong` **dilarang** menjadi batas checkbox, radio, toggle, input, stepper qty, atau tombol sekunder. Keduanya hanya untuk garis kisi tabel dan pemisah kartu yang tidak membawa makna interaktif. Setiap kontrol wajib `--control-border`. Inilah alasan token ini diberi nama berbeda.

### 3.5 Sidebar gelap

| Token | Hex | vs `--nav-bg` | vs `--nav-surface` | vs `--nav-active` |
| --- | --- | --- | --- | --- |
| `--nav-text` | #D6CFE2 | **11.87** | **10.55** | 3.80 |
| `--nav-muted` | #A79DB8 | **6.98** | **6.20** | 2.23 |
| putih | #FFFFFF | **17.96** | **15.96** | **5.75** |
| `--focus-on-dark` | #E3D0FA | **12.54** | **11.15** | **4.01** |
| `--nav-marker` | #C79BF2 | **8.04** | 7.14 | 2.57 |

| Pasangan tambahan | Rasio | Putusan |
| --- | --- | --- |
| isian `--nav-active` #8A3FCB vs `--nav-bg` #1A1424 | **3.12** | lolos ambang 3:1 komponen |
| `--nav-control-border` #6E6383 vs `--nav-bg` | **3.23** | lolos |
| `--nav-border` #332A42 vs `--nav-bg` | 1.33 | **dekoratif saja** |

Tiga konsekuensi yang wajib dipatuhi:

1. **Teks item menu aktif wajib putih**, bukan `--nav-text` (yang hanya 3.80 di atas isian aktif).
2. **`--nav-active` #8A3FCB sengaja lebih terang dari `--brand` #6D28A8.** Kalau isian aktif memakai `--brand`, rasionya terhadap latar sidebar cuma 2.15 dan item aktif jadi nyaris tidak terlihat. Ini persis pelajaran R20: satu kontrol yang muncul di latar terang dan latar gelap wajib punya varian tersendiri, bukan warna yang sama dipaksakan di dua tempat.
3. **`--nav-marker` ditempatkan di talang 3px yang menempel `--nav-bg`**, bukan di atas isian aktif. Rasio yang berlaku untuk penanda itu adalah 8.04 terhadap `--nav-bg`.

### 3.6 Deret grafik (ambang 3:1 sebagai objek grafis)

| Token | Hex | di `--surface` | di `--bg` | putih di atasnya |
| --- | --- | --- | --- | --- |
| `--chart-1` | #6D28A8 | 8.34 | 7.50 | 8.34 |
| `--chart-2` | #12723F | 5.99 | 5.39 | 5.99 |
| `--chart-3` | #A05F0C | 5.08 | 4.57 | 5.08 |
| `--chart-4` | #1A5FB4 | 6.29 | 5.66 | 6.29 |
| `--chart-5` | #A8206C | 6.80 | 6.12 | 6.80 |
| `--chart-6` | #106B76 | 6.20 | 5.58 | 6.20 |

Keenamnya lolos 4.5:1 dengan teks putih, jadi label data boleh ditaruh di dalam batang atau potongan grafik. Deret grafik **tidak boleh** dibedakan hanya lewat warna: setiap deret juga punya label langsung atau legenda dengan teks.

---

## 4. Tipografi

### 4.1 Tiga keluarga huruf, semuanya Google Fonts

| Peran | Huruf | Bobot | Alasan |
| --- | --- | --- | --- |
| Judul, nominal besar, wordmark | **Manrope** | 600, 700, 800 | Geometris, terminal lurus, angka lebar dan tegas. Nominal Rp 128.500 di Manrope 800 terbaca dari jarak satu meter, yang persis situasi kasir berdiri |
| Seluruh antarmuka, tabel, label, badge | **IBM Plex Sans** | 400, 500, 600 | Dirancang untuk antarmuka padat. Tetap jelas di 12px, punya angka tabular sejati, dan bentuk 0 1 6 8 9 tidak saling tertukar. Ini penting saat angka uang dibaca cepat |
| Struk, SKU, barcode, kode transaksi | **IBM Plex Mono** | 400, 500 | Lebar tetap membuat kolom struk lurus dan terbaca seperti cetakan printer termal. Satu keluarga dengan Plex Sans, jadi bentuk hurufnya konsisten |

Manrope dan IBM Plex Sans sengaja dipilih berbeda karakter supaya judul dan isi terbaca sebagai dua tingkat, bukan satu blok abu abu. Manrope geometris dan bulat konstruksinya, Plex Sans lebih teknis dan bersudut. Kontras itu yang membuat hierarki bekerja tanpa perlu menambah warna.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Di Next.js pakai `next/font/google` supaya huruf ikut ter-bundle pada static export.

### 4.2 Aturan angka, ini yang paling sering salah

- **Setiap angka di dalam tabel, daftar, dan kolom wajib `font-variant-numeric: tabular-nums` dan wajib memakai `--font-ui` (IBM Plex Sans).** Plex Sans punya dukungan `tnum` yang pasti, jadi kolom rupiah lurus dari baris ke baris.
- **Manrope hanya untuk angka tunggal yang besar** dan tidak perlu sejajar antar baris: total belanja, kembalian, kartu ringkasan KPI, selisih kas di layar tutup shift. Di situ tidak ada kolom yang perlu diluruskan, jadi dukungan tabular tidak jadi soal.
- **Jangan pernah memakai Manrope untuk kolom angka di tabel.** Kalau ragu, pakai IBM Plex Sans.
- Format rupiah: `Rp 128.500`, ada spasi setelah Rp, pemisah ribuan titik, tanpa desimal kecuali memang ada. Angka negatif memakai tanda minus di depan dan warna `--danger`: `-Rp 25.000`.

### 4.3 Skala umum

| Peran | Ukuran / tinggi baris | Bobot | Huruf |
| --- | --- | --- | --- |
| Display, nominal raksasa (total bayar) | 44 / 48 | 800 | display |
| H1 halaman | 28 / 34 | 700 | display |
| H2 seksi | 22 / 28 | 700 | display |
| H3 kartu | 17 / 24 | 600 | display |
| Nilai KPI | 30 / 36 | 800 | display |
| Isi | 14 / 22 | 400 | ui |
| Isi tebal | 14 / 22 | 600 | ui |
| Kecil | 13 / 20 | 400 | ui |

### 4.4 Skala padat data, khusus tabel dan kontrol

| Peran | Ukuran / tinggi baris | Bobot | Huruf | Catatan |
| --- | --- | --- | --- | --- |
| Header kolom tabel | 12 / 16 | 600 | ui | huruf besar semua, tracking 0.04em, warna `--text-muted` |
| Sel tabel | 13 / 20 | 400 | ui | warna `--text` |
| Sel angka dan rupiah | 13 / 20 | 500 | ui | `tabular-nums`, rata kanan |
| Label kolom formulir | 13 / 18 | 500 | ui | warna `--text-muted`, blok tersendiri di atas input |
| Teks bantuan di bawah input | 12 / 16 | 400 | ui | warna `--text-subtle` |
| Badge dan chip | 12 / 16 | 600 | ui | padding 2px 8px, radius 0 |
| Label sekunder di kartu | 12 / 16 | 400 | ui | warna `--text-muted`, **wajib elemen blok tersendiri**, lihat 6.9 |
| SKU, barcode, kode transaksi | 12 / 16 | 400 | mono | tracking 0.02em |
| Baris struk | 12 / 18 | 400 | mono | lebar tetap 42 karakter, meniru printer 80mm |

Ukuran terkecil yang boleh dipakai di produk ini adalah **12px**. Tidak ada 10px dan 11px. Layar kasir dipakai di bawah lampu toko yang menyilaukan, dan pengguna bukan desainer yang duduk 40cm dari layar.

---

## 5. Bentuk, ruang, dan elevasi

### 5.1 Radius

`--radius: 0` di seluruh produk. Tidak ada pengecualian. Aturan floating WhatsApp di R10 tidak berlaku karena aplikasi ini tidak punya tombol itu.

Sudut siku bukan sekadar kepatuhan aturan, ini identitas visualnya: sudut siku terbaca sebagai alat kerja yang presisi, sejalan dengan janji "kas selalu pas".

### 5.2 Ruang

Skala 4px. Ritme baku:

| Konteks | Nilai |
| --- | --- |
| Padding sel tabel | 10px 12px |
| Padding kartu | 16px, kartu besar 24px |
| Jarak antar kartu di grid | 16px |
| Jarak antar seksi | 32px |
| Padding halaman, desktop | 24px |
| Padding halaman, mobile | 16px |
| Jarak label ke input | 6px |
| Jarak antar field formulir | 16px |

### 5.3 Elevasi

Empat tingkat, tidak lebih.

| Tingkat | Token | Dipakai untuk |
| --- | --- | --- |
| 0 | tanpa bayangan, hanya `1px solid var(--border)` | kartu, panel, tabel. **Ini keadaan baku** |
| 1 | `--shadow-1` | kartu yang bisa diklik saat hover, header tabel yang menempel |
| 2 | `--shadow-2` | panel dropdown, popover, tooltip, menu konteks |
| 3 | `--shadow-3` + `--scrim` di belakangnya | modal, drawer, panel pembayaran |

Bayangan tidak pernah dipakai untuk dekorasi. Kalau sebuah elemen tidak benar benar mengambang di atas elemen lain, dia tidak dapat bayangan.

---

## 6. Spesifikasi komponen

### 6.1 Sidebar kiri (wajib, standar proyek)

- Lebar `--nav-w` 248px, terlipat jadi `--nav-w-collapsed` 64px (ikon saja, label muncul sebagai tooltip).
- Latar `--nav-bg`, ikon 20px, label 14/20 bobot 500.
- **Item aktif**: isian `--nav-active`, teks dan ikon **putih**, plus bar penanda 3px `--nav-marker` menempel di tepi kiri. Dua penanda sekaligus (isian dan bar) supaya tidak bergantung pada warna saja.
- **Item hover**: isian `--nav-surface`, teks `--nav-text` naik ke putih.
- Judul kelompok menu: 11/16, bobot 600, huruf besar semua, tracking 0.06em, warna `--nav-muted`.
- Tombol lipat ada di bawah sidebar, bukan di topbar.
- Kontrol apa pun di dalam sidebar (misal pemilih outlet) memakai `--nav-control-border`, bukan `--control-border`.
- Di bawah 1024px sidebar berubah jadi drawer. **Drawer wajib dirender sebagai sibling `<header>` atau di-portal ke `document.body`** (R53), bukan bersarang di dalam elemen ber-`backdrop-filter`, `filter`, atau `transform`.

### 6.2 Tombol

| Jenis | Isian | Teks | Batas | Dipakai untuk |
| --- | --- | --- | --- | --- |
| Utama | `--brand` | putih (8.34) | tidak ada | aksi utama halaman: Simpan, Tambah Produk, Buka Shift |
| Uang | `--pay` | putih (5.99) | tidak ada | **hanya**: Bayar di layar kasir, dan Coba Demo di `/` serta `/login` |
| Sekunder | `--surface` | `--text` (18.31) | 1px `--control-border` | aksi pendamping: Batal, Tahan Pesanan |
| Halus | transparan | `--brand` (8.34 di surface) | tidak ada | aksi tersier di dalam baris tabel |
| Merusak | `--danger` | putih (6.59) | tidak ada | Void, Refund, Hapus |

- Tinggi `--control-h` 40px, di layar Kasir `--control-h-lg` 52px.
- Padding 0 16px, di layar Kasir 0 24px.
- **Tombol aksi utama selalu di KIRI**, bukan pojok kanan atas. Konsisten di semua halaman.
- Hover memakai varian `-hover`, tekan menambah `transform: translateY(1px)`.
- Fokus: `outline: 2px solid var(--focus); outline-offset: 2px`. Di dalam sidebar pakai `--focus-on-dark`.
- **Tombol sekunder di atas latar gelap wajib varian terbalik**: isian transparan, batas `--nav-control-border`, teks putih. Memakai varian terang di latar gelap adalah kegagalan R20 yang persis terjadi di Wanantara.

### 6.3 Tabel

- Header: latar `--surface-2`, teks 12/16 bobot 600 huruf besar `--text-muted`, garis bawah 1px `--border`.
- Baris: tinggi `--row-h` 44px, garis bawah 1px `--border`, hover `--surface-2`, terpilih `--brand-soft`.
- Kolom angka rata kanan, `tabular-nums`.
- Baris yang bisa diklik: `cursor: pointer`, bisa diaktifkan dengan Enter, punya `tabindex="0"`.
- Pengurutan kolom ditandai ikon panah plus atribut `aria-sort`.
- Header menempel saat digulir (`position: sticky; top: 0`) dengan `--shadow-1`.
- Di bawah 768px tabel berubah jadi daftar kartu. Kalau kartunya lebih dari 3 dalam satu seksi, berlaku R48 (lihat 8.3).

### 6.4 Input teks dan area teks

- Tinggi `--control-h`, padding 0 12px, latar `--surface`, batas **1px `--control-border`** (4.71).
- Label adalah **elemen blok tersendiri di atas input**, tidak pernah placeholder sebagai pengganti label. Placeholder `--text-subtle` (7.30) dan hanya berisi contoh, bukan instruksi.
- Fokus: batas jadi `--brand` plus `outline: 2px solid var(--focus); outline-offset: 1px`.
- Galat: batas `--danger`, pesan galat di bawah input dengan warna `--danger-ink` di atas `--surface`, dan `aria-describedby` menunjuk pesan itu.
- Input kosong **tidak boleh** tampil sebagai kotak putih tanpa apa apa. Batas `--control-border` memastikan kotaknya terlihat di semua breakpoint (kegagalan R19 di Komodrift).

### 6.5 Dropdown custom (R12, `<select>` bawaan DILARANG)

Wajib komponen sendiri, tidak boleh `<select>` bawaan browser dan tidak boleh dropdown tanpa animasi.

- Pemicu: tampilannya sama persis dengan input teks, plus ikon chevron 16px di kanan.
- **Chevron berputar 180 derajat** saat terbuka, transisi `--dur-base` dengan `--ease`.
- Panel: latar `--surface`, batas 1px `--control-border`, `--shadow-2`, radius 0.
- Animasi buka tutup: `grid-template-rows: 0fr` ke `1fr`, atau opacity plus `translateY(-4px)`, durasi `--dur-base`.
- Opsi: tinggi 36px, hover `--surface-2`, terpilih `--brand-soft` dengan ikon centang.
- Semantik: pemicu `role="combobox"` dengan `aria-expanded` dan `aria-controls`, panel `role="listbox"`, opsi `role="option"` dengan `aria-selected`. Ada `<input type="hidden">` untuk nilai formulir.
- Papan ketik: ArrowUp dan ArrowDown pindah opsi, Enter memilih, Escape menutup dan mengembalikan fokus ke pemicu, Home dan End ke ujung, mengetik huruf melompat ke opsi yang cocok.
- **`aria-expanded` wajib bernilai true tepat saat panel benar benar terlihat** (R60). Jangan memasang pembuka `onFocus` bersama toggler `onClick` di elemen yang sama, karena klik nyata memicu keduanya dan panel langsung tertutup lagi sementara CSS `:hover` membuatnya tetap terlihat.
- **Saat tertutup, panel wajib `display: none` atau dilepas dari DOM**, bukan sekadar `opacity: 0` (R57). Panel yang cuma diredupkan tetap menyumbang lebar dan bisa membuat `scrollWidth` melebihi `innerWidth` tanpa terlihat di tangkapan layar mana pun.
- Panel wajib `max-width: calc(100vw - 2rem)` dan menjauh dari tepi terdekat: pemicu paling kiri memakai `left: 0`, pemicu paling kanan memakai `right: 0`.

### 6.6 Pemilih tanggal (R21, input teks tanggal bebas DILARANG)

- Pemicu seperti input dengan ikon kalender. **Tidak pernah** input teks dengan placeholder seperti "contoh: 12 Agustus 2026".
- Panel kalender: grid 7 kolom, `role="grid"`, sel tanggal `role="gridcell"`, hari ini bergaris bawah 2px `--brand`, tanggal terpilih isian `--brand` teks putih.
- Papan ketik: panah empat arah pindah hari dan minggu, PageUp dan PageDown pindah bulan, Enter memilih, Escape menutup.
- Tanggal di luar rentang memakai `disabled` sungguhan, sehingga dikecualikan dari sapuan kontras (WCAG 1.4.3).
- Berlaku juga aturan `display: none` saat tertutup dan `max-width: calc(100vw - 2rem)` dari 6.5. Panel kalender lebarnya sekitar 320px dan inilah penyebab meluber horizontal di 375px kalau tidak dijepit.
- Dipakai di: filter riwayat transaksi, rentang laporan, kalender shift.

### 6.7 Badge dan chip status

Isian soft, teks ink, batas 1px `--control-border`, radius 0, padding 2px 8px, 12/16 bobot 600.

| Status | Latar | Teks | Rasio |
| --- | --- | --- | --- |
| Lunas, Selesai, Kas pas | `--success-soft` | `--success-ink` | 7.22 |
| Ditahan, Stok menipis, Shift terbuka | `--warning-soft` | `--warning-ink` | 6.54 |
| Void, Refund, Stok habis | `--danger-soft` | `--danger-ink` | 7.43 |
| QRIS, Kartu, Informasi | `--info-soft` | `--info-ink` | 6.97 |
| Merek, Terpilih | `--brand-soft` | `--brand-deep` | 10.83 |

Badge tidak pernah hanya warna. Selalu ada teksnya.

### 6.8 Pemindah view (tabel, kartu, kanban, kalender)

- Kelompok tombol bersambung, batas 1px `--control-border`, radius 0.
- Aktif: isian `--brand`, teks putih (8.34). Tidak aktif: isian `--surface`, teks `--text-muted` (9.25).
- Semantik `role="tablist"` dan `role="tab"` dengan `aria-selected`, panelnya `role="tabpanel"`.
- Perpindahan view beranimasi: konten lama `opacity: 0` selama `--dur-fast`, konten baru masuk dengan opacity plus `translateY(4px)` selama `--dur-base`.
- Pilihan view disimpan per modul di `localStorage`.

### 6.9 Judul plus label sekunder (R50)

Setiap kali sebuah item membawa judul **dan** label kedua (kategori, SKU, harga, keterangan), keduanya wajib elemen blok terpisah dengan jarak eksplisit.

```css
.stack { display: flex; flex-direction: column; gap: 2px; }
.stack > .t { display: block; font: 500 14px/20px var(--font-ui); color: var(--text); }
.stack > .s { display: block; font: 400 12px/16px var(--font-ui); color: var(--text-muted); }
```

Dua simpul teks inline yang bersebelahan tanpa pemisah **dilarang**, karena tampil menempel seperti `Kopi SusuMinuman`. Ini termasuk **wordmark merek dan tagline di footer**: kalau tagline jadi anak `<small>` di dalam elemen wordmark, defaultnya `display: inline` dan hasilnya `LekasCEPAT DI KASIR` dalam satu baris.

Cara memverifikasi: baca `innerText` lalu **pecah per baris**, dan tolak hanya kalau ada huruf kecil langsung menempel huruf besar **di dalam satu baris terender** (regex `[a-z][A-Z]`). Jangan memakai `textContent`, karena `textContent` menyambung simpul blok yang sebenarnya sudah terpisah secara visual dan menghasilkan lapor positif palsu.

### 6.10 Overlay dan modal (R53)

- Modal, drawer, panel pembayaran, dan lightbox **wajib** dirender sebagai sibling dari `<header>` atau di-portal ke `document.body`.
- **Dilarang** bersarang di dalam ancestor yang memakai `backdrop-filter`, `filter`, `transform`, `perspective`, `contain: paint`, atau `will-change` pada properti itu. Ancestor semacam itu menjadi containing block untuk anak `position: fixed`, sehingga overlay yang seharusnya menutupi viewport malah terpotong setinggi header.
- Verifikasinya adalah **pengukuran**, bukan pembacaan CSS: `el.getBoundingClientRect().height` harus kira kira sama dengan `window.innerHeight` dan `top` kira kira 0. CSS-nya tertulis sama persis di kasus rusak maupun benar, jadi membaca stylesheet tidak pernah bisa membedakannya.
- Scrim memakai `--scrim` dan **wajib** `pointer-events: none` kalau dia murni dekoratif. Kalau scrim memang menangkap klik untuk menutup modal, dia bukan dekorasi dan boleh menerima pointer, tapi konten interaktif wajib berada di z-index lebih tinggi.
- Fokus terperangkap selama modal terbuka, Escape menutup, dan fokus kembali ke elemen pemicu. Saat tertutup, modal **dilepas dari DOM**.

### 6.11 Kartu ringkasan KPI

Batas 1px `--border`, latar `--surface`, padding 16px, tanpa bayangan. Isinya berurutan dari atas: label 12/16 `--text-muted` huruf besar, nilai 30/36 Manrope 800 `--text`, dan perubahan 13/20 dengan warna `--success` untuk naik atau `--danger` untuk turun plus ikon panah. Label dan nilai adalah elemen blok terpisah (6.9).

---

## 7. Gerak

| Interaksi | Durasi | Easing |
| --- | --- | --- |
| Hover, tekan, ganti warna | `--dur-fast` 120ms | `--ease` |
| Buka tutup dropdown dan panel | `--dur-base` 180ms | `--ease-out` |
| Ganti view tabel ke kartu | `--dur-base` 180ms | `--ease-out` |
| Perpindahan halaman (R46) | `--dur-page` 220ms | `--ease-out` |
| Drawer masuk dari kiri | 220ms | `--ease-out` |

**Perpindahan halaman (R46).** Setiap ganti rute wajib beranimasi, bukan potong keras. Pola yang dipakai: pembungkus `.page-enter` yang memulai dari `opacity: 0; transform: translateY(6px)` lalu ke keadaan normal selama `--dur-page`, dipicu ulang oleh perubahan `usePathname()`. Animasi tidak boleh menunda cat pertama dan tidak boleh menghalangi interaksi.

**Reveal saat gulir.** Kalau dipakai, keadaan terungkap **wajib punya spesifisitas lebih tinggi daripada setiap aturan penyembunyi** (R34): tulis `.reveal.in, .js .reveal.in { opacity: 1; transform: none }`, dan jangan menambah aturan `.js .reveal { opacity: 0 }` yang berlebihan. Pemindainya juga wajib menangkap simpul yang disisipkan setelah mount lewat `MutationObserver` (R24), karena hasil pencarian, hasil filter, dan baris yang dimuat asinkron muncul setelah mount.

**Gerak berkurang.** Di dalam `@media (prefers-reduced-motion: reduce)` semua durasi jadi 0.01ms dan transformasi dimatikan, tapi keadaan akhir tetap terlihat. Konten tidak boleh tersangkut di `opacity: 0`.

---

## 8. Responsif

### 8.1 Breakpoint

| Nama | Lebar | Tata letak |
| --- | --- | --- |
| mobile kecil | sampai 480px | drawer, tabel jadi kartu, satu kolom |
| mobile | 481px sampai 768px | drawer, tabel jadi kartu, dua kolom untuk KPI |
| tablet | 769px sampai 1024px | drawer, tabel gulir horizontal di dalam pembungkusnya sendiri |
| desktop sempit | 1025px sampai 1279px | sidebar terlipat sebagai baku, panel wajib dijepit viewport |
| desktop | 1280px ke atas | sidebar terbuka penuh |

### 8.2 Aturan tanpa tawar

- **Tidak boleh ada meluber horizontal di 375, 480, 768, 1025, dan 1440.** Diukur, bukan dilihat: `document.documentElement.scrollWidth <= window.innerWidth`.
- **Pengukuran dilakukan dua kali di setiap breakpoint**: sekali dengan **semua** dropdown, pemilih tanggal, dan popover **TERTUTUP**, lalu sekali lagi dengan tiap panel **TERBUKA** (R57). Panel tertutup yang hanya diredupkan tetap menempati tata letak dan tetap bisa melubernya.
- Tabel yang lebih lebar dari layar digulir **di dalam pembungkusnya sendiri** (`overflow-x: auto` pada pembungkus tabel), tidak pernah membuat halaman ikut bergulir.
- Topbar mobile satu baris flex `space-between`, tinggi tetap, tiap anak di slot sendiri, tap target minimal 44x44px, tidak ada elemen tumpang tindih, dan logo muncul **tepat satu kali** (R47, R52).

### 8.3 Carousel mobile (R48)

Di 768px ke bawah, setiap wadah yang berisi **lebih dari 3 anak sejenis berupa kartu atau ubin** wajib jadi snap-carousel horizontal:

```css
.snap-row { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; }
.snap-row > * { flex: 0 0 82vw; scroll-snap-align: start; }
```

Yang **dikecualikan**: akar halaman dan daftar `<section>`-nya, kolom tautan footer, kelompok field formulir, prosa (wadah yang anaknya `<p>`), akordeon FAQ yang terkatup, dan panggung galeri crossfade.

Yang **tidak** dikecualikan: grid produk di layar Kasir, daftar kartu transaksi, kartu ringkasan laporan, daftar shift, kartu produk terkait. Kalau anaknya kartu, aturan ini berlaku.

Untuk daftar panjang (misalnya katalog produk 60 baris), polanya adalah **kelompokkan dulu per kategori, lalu jadikan tiap kelompok satu carousel**, bukan satu tumpukan vertikal tanpa ujung.

Verifikasinya programatik di 375px: telusuri setiap wadah dengan lebih dari 3 anak sejenis setinggi lebih dari 80px, lalu periksa gaya terhitung **wadahnya**, `overflow-x` harus `auto` atau `scroll` dan `scroll-snap-type` harus diawali `x`. Wadah dengan `grid-template-columns` satu jalur plus `overflow-x: visible` adalah tumpukan vertikal yang dilarang aturan ini.

---

## 9. Tata letak layar Kasir (khusus, tidak seperti halaman lain)

Layar Kasir adalah satu satunya layar yang tidak memakai pola halaman biasa.

- **Tanpa gulir vertikal pada kerangkanya.** Tinggi tetap `100dvh`. Yang bergulir hanya grid produk dan daftar keranjang, masing masing di dalam wadahnya sendiri.
- **Tiga kolom di 1280px ke atas**: rel kategori 200px di kiri, grid produk fleksibel di tengah, keranjang 380px di kanan. Sidebar utama terlipat otomatis jadi 64px di layar ini supaya lebar kerja maksimal.
- **Dua kolom di 1024px sampai 1279px**: kategori jadi baris chip horizontal di atas grid.
- **Mobile**: grid produk penuh layar, keranjang jadi lembar bawah yang bisa ditarik naik, dengan bar ringkas yang selalu terlihat berisi jumlah item dan total.
- **Ubin produk**: rasio 1:1, radius 0, nama produk dua baris maksimal dengan `line-clamp`, harga di bawahnya sebagai blok terpisah (6.9), tap target minimal 88x88px.
- **Tombol Bayar** memakai isian `--pay`, tinggi `--control-h-lg` 52px, lebar penuh kolom keranjang, dan **selalu terlihat** tanpa perlu menggulir.
- Total belanja memakai Manrope 800 ukuran 44, warna `--text`, di atas tombol Bayar.

---

## 10. Daftar periksa sebelum menyerahkan pekerjaan

Setiap stage yang menyentuh antarmuka wajib melewati ini:

1. Sapuan kontras **programatik dan menyeluruh di semua rute**, bukan pemeriksaan sampel. Latar yang dipakai wajib latar **efektif**: telusuri rantai ancestor dan komposit setiap `backgroundColor` yang tidak transparan sampai ke halaman. Membaca `background-color` elemen itu sendiri akan melaporkan transparan dan lolos secara diam diam.
2. Ambang per elemen: 4.5:1 normal, 3:1 hanya kalau `font-size` lebih besar sama dengan 24px atau lebih besar sama dengan 18.66px dengan bobot lebih besar sama dengan 700. Saring dulu `el.disabled` dan `aria-disabled` supaya tanggal nonaktif di pemilih tanggal tidak membanjiri laporan.
3. `scrollWidth <= innerWidth` di 375, 480, 768, 1025, 1440, dengan panel tertutup **dan** terbuka.
4. Setiap dropdown dibuka, lalu pointer dijauhkan, lalu `aria-expanded` dan gaya terhitung panel dibaca **dua duanya** dan harus sepakat.
5. `innerText` dibaca per baris di seluruh halaman, tidak ada baris yang cocok dengan `[a-z][A-Z]` kecuali nama merek yang memang begitu.
6. Tidak ada em dash dan en dash pada teks **terender**, dan tidak ada bentuk entity `&mdash;`, `&ndash;`, `&#8212;`, `&#8211;`, `&#x2013;`, `&#x2014;` pada sumber di luar komentar kode.
7. Setiap tautan internal dirayapi dan mengembalikan 200, dan tidak ada rute yatim yang tidak ditautkan dari mana pun.
