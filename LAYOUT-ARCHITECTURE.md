# Lekas, LAYOUT-ARCHITECTURE.md

Peta rute, hierarki komponen, dan keputusan desain beserta alasannya. Ditulis
di Stage 3 untuk dibaca Stage 5 (Frontend Builder) dan Stage 6 (QA Deploy).

Yang perlu dibaca lebih dulu, berurutan: `BRAND.md`, `DESIGN.md`,
`ART-DIRECTION.md`. Kalau ada yang bentrok, `ART-DIRECTION.md` menang.

---

## 1. Peta rute

61 halaman terbangun. Semuanya ekspor statis (`output: 'export'`,
`trailingSlash: true`), jadi tiap rute jadi direktori berisi `index.html`.

### Di luar aplikasi

| Rute | Isi |
| --- | --- |
| `/` | Landing ringkas plus tombol masuk demo. Pratinjau produknya adalah komposisi DOM asli layar Kasir, bukan bitmap |
| `/login/` | Layar masuk demo. Kredensial ditampilkan, satu klik masuk, tanpa auth sungguhan |
| `/404/` | Halaman galat bawaan. Sengaja tidak ditautkan dari mana pun, dan dikecualikan dari sapuan halaman yatim R59 |

### Di dalam aplikasi

| Rute | Modul | View |
| --- | --- | --- |
| `/app/` | Beranda | kartu KPI, transaksi terbaru, produk terlaris, stok perlu perhatian |
| `/app/kasir/` | Kasir | layar khusus, lihat bagian 3 |
| `/app/pembayaran/` | Pembayaran | ruang pembayaran plus pratinjau struk |
| `/app/produk/` | Produk | **tabel, kartu, kanban** |
| `/app/produk/[sku]/` | Detail produk | 23 halaman, pemilih varian di tempat |
| `/app/transaksi/` | Transaksi | **tabel, kartu, kalender** |
| `/app/transaksi/[id]/` | Detail transaksi | 18 halaman, rincian, perhitungan, struk |
| `/app/shift/` | Shift Kasir | **tabel, kalender** |
| `/app/shift/[id]/` | Detail shift | 6 halaman, rekonsiliasi kas |
| `/app/laporan/` | Laporan | kartu ringkasan plus grafik, rentang tanggal |
| `/app/pengaturan/` | Profil toko | form plus daftar outlet |
| `/app/pengaturan/pajak/` | Pajak dan service | form plus pratinjau perhitungan |
| `/app/pengaturan/printer/` | Printer dan struk | form plus pratinjau struk |
| `/app/pengaturan/pengguna/` | Pengguna dan peran | tabel pengguna plus matriks hak akses |

Setiap rute dijangkau dari sidebar, dari tautan dalam halaman, atau dari
keduanya. Sapuan R59 di `scripts/qa-check.mjs` memeriksa dua arah: tidak ada
tautan internal yang menunjuk rute yang tidak dibangun, dan tidak ada rute
terbangun yang tidak ditautkan dari mana pun.

Sub halaman Pengaturan sengaja jadi **rute sungguhan**, bukan tab yang menukar
isi di tempat. Tab yang menyimpan keadaannya di JavaScript tidak punya alamat
sendiri, tidak bisa dibagikan, dan lolos dari sapuan tautan tanpa pernah
ketahuan.

---

## 2. Hierarki komponen

```
src/app/layout.tsx                  huruf, metadata, tautan lewati ke konten
  src/app/page.tsx                  landing
  src/app/login/                    layar masuk
  src/app/app/layout.tsx
    AppShell                        sidebar, topbar, laci mobile
      PageTransition                animasi tiap perpindahan rute (R46)
        <halaman modul>
```

### Kerangka, `src/components/shell/`

| Berkas | Peran |
| --- | --- |
| `nav.ts` | struktur sidebar, lima kelompok, delapan tujuan, plus pencocokan item aktif |
| `AppShell.tsx` | kerangka, preferensi lipat, mode Kasir |
| `Sidebar.tsx` | sidebar kiri persisten |
| `MobileNav.tsx` | laci untuk 1024px ke bawah, **di-portal ke `document.body`** |
| `Topbar.tsx` | digabung ke `AppShell.tsx`, tidak berdiri sendiri |
| `PageHeader.tsx` | judul, aksi utama di kiri, penyaring, pemindah view |
| `PageTransition.tsx` | R46 |

### Dasar, `src/components/ui/`

| Berkas | Peran |
| --- | --- |
| `Portal.tsx` | satu satunya jalan overlay layar penuh (R53) |
| `useDisclosure.ts` | kontrak buka tutup bersama, sumber tunggal `aria-expanded` (R60) |
| `Select.tsx` | dropdown custom (R12), `<select>` bawaan dilarang |
| `DatePicker.tsx` | `DatePicker` tunggal dan `DateRangePicker` (R21) |
| `Overlay.tsx` | modal, laci, lembar bawah, dengan jerat fokus |
| `Primitives.tsx` | Badge, Avatar, Stepper, Sakelar, Cek, Kosong, Kpi, CatatanStage |

### Lapisan view, `src/components/views/`

Satu sumber data, empat cara memandang. Kontraknya `AdapterView<T>`: tiap modul
menerjemahkan barisnya sendiri jadi `ViewItem` netral satu kali, lalu keempat
renderer hanya tahu `ViewItem`. Adapter per modul ada di `src/lib/adapters.tsx`.

| Berkas | Peran |
| --- | --- |
| `types.ts` | kontrak `ViewItem`, `KolomTabel`, `AdapterView` |
| `ViewSwitcher.tsx` | pemindah view plus `usePilihanView`, disimpan per modul di localStorage |
| `DataViews.tsx` | satu pintu ke empat renderer, plus keadaan kosong |
| `TableView.tsx` | tabel, urut kolom, pilih baris, aksi massal, jadi kartu di bawah 769px |
| `CardView.tsx` | grid kartu |
| `KanbanView.tsx` | papan kelompok, sengaja tanpa seret |
| `CalendarView.tsx` | kalender bulanan |

### Kasir, `src/components/kasir/`

| Berkas | Peran |
| --- | --- |
| `KasirClient.tsx` | orkestrator layar Kasir |
| `GridProduk.tsx` | pencarian, chip kategori, grid ubin, plus `RelKategori` |
| `Keranjang.tsx` | isi keranjang dan **ubah qty saja** |
| `PanelDiskon.tsx` | **dua** panel terpisah: diskon item dan diskon transaksi |
| `PanelVarian.tsx` | pemilih varian, R42 |
| `PanelBayar.tsx` | `IsiPembayaran` plus pembungkus overlay |
| `PanelTahanan.tsx` | daftar transaksi tertahan plus pemilih meja |
| `Struk.tsx` | pratinjau struk |
| `ubin.ts` | inisial dan warna ubin produk |

### Logika, `src/lib/`

| Berkas | Peran |
| --- | --- |
| `kasir.ts` | **satu satunya** tempat aritmetika uang, lihat bagian 4 |
| `derived.ts` | turunan laporan, dihitung ulang dari transaksi |
| `adapters.tsx` | adapter view per modul |
| `format.ts` | rupiah, tanggal, jam, durasi, semuanya locale `id-ID` eksplisit |
| `storage.ts` | preferensi localStorage yang aman terhadap hidrasi |

---

## 3. Keputusan desain dan alasannya

### 3.1 Layar Kasir memakai kerangka yang sama, dengan `data-mode="kasir"`

**Keputusan.** `AppShell` mengenali rute `/app/kasir` lewat `usePathname()` dan
memasang `data-mode="kasir"` pada akar. Atribut itu memaksa sidebar jadi rail
ikon 64px, mengunci tinggi kerangka ke `100dvh`, dan mematikan gulir vertikal
halaman. Preferensi lipat pengguna **tidak** ditimpa.

**Kenapa bukan grup rute kedua dengan layout sendiri.** Itu akan menggandakan
sidebar, topbar, dan laci mobile. Duplikat semacam itu selalu berakhir dengan
satu salinan yang ketinggalan perbaikan aksesibilitas, dan yang ketinggalan
biasanya yang jarang dibuka. Yang benar benar berbeda di layar Kasir hanya
lebar kanvas dan perilaku gulir, dan dua duanya urusan CSS.

**Kenapa preferensi lipat tidak ditimpa.** Kalau ditimpa, kasir yang keluar
dari layar Kasir menemukan sidebarnya berubah sendiri. Itu terbaca sebagai bug
walaupun disengaja.

**Satu jebakan yang sudah kena dan sudah diperbaiki.** Isi halaman dibungkus
`.page-enter` milik animasi R46. Pembungkus itu tingginya auto, jadi
`.kasir { height: 100% }` menghitung 100 persen dari auto dan hasilnya auto
juga. Akibatnya kerangka Kasir tumbuh melewati layar dan tombol Bayar terdorong
ke bawah lipatan, padahal seluruh CSS-nya terbaca benar. Perbaikannya satu
baris, `.app[data-mode='kasir'] .halaman > .page-enter { height: 100% }`, dan
yang menemukannya adalah melihat tangkapan layar 1440px, bukan membaca kode.

### 3.2 Grid produk dan keranjang adalah dua wilayah gulir terpisah

Tinggi kerangka tetap `100dvh`. Yang bergulir hanya `.kasir-grid-bungkus` dan
`.krj-daftar`, masing masing di dalam kotaknya sendiri. Kaki keranjang, yang
memuat total dan tombol Bayar, berada di luar wilayah gulir itu sehingga selalu
terlihat. Kalau keduanya berbagi satu wilayah gulir halaman, tombol Bayar
hilang dari layar tepat saat kasir sedang mencari produk, yaitu tepat saat
dibutuhkan.

Di 1280px ke atas tiga kolom: rel kategori 200px, grid produk fleksibel,
keranjang 380px. Di 1024 sampai 1279px kategori jadi baris chip horizontal. Di
bawah 1024px keranjang jadi lembar bawah dengan bar ringkas yang selalu
terlihat, memakai komponen `Keranjang` yang **sama persis** dengan prop
`lembar`, bukan implementasi kedua.

### 3.3 Ubah qty, diskon item, dan diskon transaksi tinggal terpisah

- Ubah qty: `Keranjang.tsx`
- Diskon per item: `PanelDiskonItem` di `PanelDiskon.tsx`
- Diskon per transaksi: `PanelDiskonTransaksi` di `PanelDiskon.tsx`
- Seluruh aritmetikanya: `lib/kasir.ts`

Keduanya **sengaja bukan satu panel dengan sakelar mode**, walaupun tampilannya
mirip. Itu justru jebakannya: diskon item dihitung dari bruto baris, diskon
transaksi dihitung dari subtotal setelah seluruh diskon item. Kalau berbagi satu
komponen, dasar hitungnya jadi satu prop yang gampang tertukar, dan dua diskon
10 persen yang bertumpuk menghasilkan potongan lebih besar daripada yang
disepakati kasir. Selisihnya baru ketahuan saat tutup shift, saat sudah tidak
ada yang ingat.

### 3.4 Transaksi tertahan adalah koleksi

`Tahanan[]`, bukan satu slot. Kedai ramai menahan tiga sampai lima pesanan
sekaligus: satu tamu izin ambil dompet, satu meja belum lengkap, satu pesanan
antar belum dijemput. Model satu slot memaksa kasir menyelesaikan atau membuang
tahanan lama sebelum boleh menahan yang baru, dan itu bukan kekurangan fitur,
itu kehilangan pesanan.

### 3.5 R42 dalam bentuk POS

`Produk.nama` adalah nama **model**. Ukuran, topping, warna, berat, dan rasa
adalah `DimensiVarian[]` di dalam produk itu. Akibatnya, dan ini yang penting:

- Penyaring kategori dan warna **tidak pernah mengganti nama produk**.
- Pemilih varian di halaman detail **menukar varian di tempat**, tidak
  berpindah slug.
- `produkTerlaris()` di `lib/derived.ts` mengagregasi per `produk.id`, jadi
  "Kopi Susu besar dingin" dan "Kopi Susu reguler panas" jatuh ke baris yang
  sama. Katalog yang menjadikan tiap varian sebagai produk sendiri memecah satu
  produk laris jadi enam baris kecil, dan tidak ada satu pun yang naik ke
  puncak.

Contoh paling gamblang di katalog: `p-kaus-polos`, satu produk dengan dimensi
Ukuran (4 opsi) dan Warna (3 opsi), bukan dua belas produk.

### 3.6 Penyaring hidup di atas lapisan view

`PageHeader` memegang penyaring, `DataViews` memegang renderer. Berpindah view
karena itu **tidak mungkin** mereset penyaring, bukan sekadar kebetulan tidak
mereset. Kalau penyaring ikut dirender di dalam view, tiap perpindahan tampilan
memasangnya ulang dan pilihannya hilang.

Pilihan view disimpan **per modul** di localStorage dengan kunci
`lekas:view:<modul>`. Satu kunci global akan memaksa Kalender ke halaman Produk
yang tidak punya kalender.

### 3.7 Kanban sengaja tidak bisa diseret

Kolomnya adalah status stok dan status transaksi, dan dua duanya adalah akibat
dari kejadian lain: penjualan, penerimaan barang, void yang beralasan. Menyeret
kartu "Void" ke kolom "Lunas" berarti mengarang catatan keuangan, jadi
kemampuan itu memang tidak boleh ada, bukan sekadar belum dibuat.

### 3.8 Aksi utama di kiri

Judul, lalu aksi utama, lalu penyaring, baru datanya. Urutan yang sama di setiap
layar. Aksi utama sejajar judul di kiri, bukan di pojok kanan atas, karena mata
membaca dari kiri dan tangan yang sudah ada di sisi kiri layar tidak perlu
menyeberang.

### 3.9 Item menu aktif memakai dua penanda

Isian `--nav-active` **plus** bar 3px `--nav-marker` di talang kiri, dengan teks
**putih**. Bergantung pada isian saja berarti bergantung pada warna saja. Teks
item aktif wajib putih karena `--nav-text` hanya 3.80 di atas isian aktif,
sementara putih 5.75. Dan `--nav-active` #8A3FCB sengaja lebih terang dari
`--brand` #6D28A8: kalau isian aktif memakai `--brand`, rasionya terhadap latar
sidebar cuma 2.15 dan item aktif nyaris tidak terlihat.

### 3.10 Tidak ada `backdrop-filter` di header dan sidebar

Keputusan sadar, bukan kelupaan. Elemen ber-`backdrop-filter`, `filter`,
`transform`, `perspective`, `contain: paint`, atau `will-change` menjadi
containing block bagi setiap keturunan `position: fixed`. Overlay yang bersarang
di dalamnya kolaps setinggi elemen itu, dan CSS-nya terbaca **sama persis** di
kasus rusak maupun benar. Latar buram tidak sebanding dengan risiko itu.

Sebagai lapisan kedua, setiap overlay layar penuh tetap di-portal ke
`document.body` lewat `Portal.tsx`.

### 3.11 R48 di aplikasi, garis batasnya

Standar build di HIM-281 menyatakan tabel boleh jadi daftar kartu di mobile.
Garis batas yang dipakai di sini:

- **Wajib carousel**: deret kartu KPI, dan blok pendamping berisi lebih dari
  tiga kartu sejenis. Sudah dipasang di Beranda dan Laporan lewat
  `.kpi-grid.snap-row`.
- **Boleh menumpuk vertikal**: daftar koleksi data yang memang jadi tujuan
  halamannya, yaitu daftar produk, transaksi, dan shift. Carousel berisi dua
  puluh transaksi lebih buruk daripada daftar, karena pengguna datang ke halaman
  itu justru untuk menelusuri semuanya. Obat untuk daftar panjang adalah
  pengelompokan dan halaman, bukan carousel.

Satu jebakan yang sudah kena: `.kpi-grid` dan `.snap-row` sama sama
berspesifisitas 0,1,0 dan `app.css` dimuat setelah `globals.css`, jadi
`display: grid` menang dan carousel-nya diam diam tidak pernah terjadi. Aturan
gabungannya ditulis ulang di `app.css` dengan spesifisitas 0,2,0.

### 3.12 Tabel memakai `table-layout: fixed`

Titik paling sempit bukan mobile, melainkan **1025px**, tempat sidebar sudah
muncul tapi kanvasnya belum tumbuh. Dengan layout auto, satu sel berisi nama
panjang melebarkan seluruh tabel melewati kanvas di lebar itu. Kolom bertanda
`opsional` hilang di bawah 1280px, dan pembungkus tabel bergulir sendiri dengan
`contain: paint`.

`contain: paint` itu wajib dan bukan hiasan: `overflow-x: auto` **saja** tidak
menahan lebar dokumen. Jaring mengukur papan kanbannya melapor
`documentElement.scrollWidth` 1943 lawan `innerWidth` 375 padahal wadahnya
sendiri sudah bergulir benar.

---

## 4. Mesin uang, `src/lib/kasir.ts`

Urutan yang mengikat, tidak boleh ditukar:

```
1.  hargaSatuan  = hargaDasar + seluruh delta opsi varian terpilih
2.  brutoItem    = Sigma (qty * hargaSatuan)
3.  diskonItem   = Sigma diskon tiap baris, dihitung dari bruto BARIS itu
4.  subtotal     = brutoItem - diskonItem
5.  diskonTrx    = diskon tingkat transaksi, dihitung dari SUBTOTAL
6.  dasarKena    = subtotal - diskonTrx
7.  service      = servicePersen dari dasarKena
8.  pajak        = pajakPersen dari (dasarKena + service)
9.  pembulatan   = penyesuaian total ke kelipatan terdekat
10. total        = dasarKena + service + pajak + pembulatan
```

Langkah 5 yang paling sering dibalik, dan langkah 8 yang paling sering
dilupakan. Halaman Pengaturan Pajak memakai fungsi `hitung()` yang **sama
persis** untuk pratinjaunya, jadi angka di sana tidak mungkin berselisih dengan
struk.

`lib/derived.ts` mengeluarkan transaksi `void` dan `refund` dari seluruh angka
penjualan. Void artinya penjualan itu tidak pernah terjadi, refund artinya
uangnya sudah dikembalikan. Memasukkannya membuat laporan tampak lebih bagus
daripada isi laci.

---

## 5. Data demo

Statis di `src/data/*.ts`, keadaan di klien, tanpa backend.

| Berkas | Isi |
| --- | --- |
| `types.ts` | seluruh bentuk data |
| `katalog.ts` | 8 kategori, 23 produk dengan dimensi varian |
| `operasional.ts` | 2 outlet, 6 pengguna, 10 meja, matriks hak akses, pengaturan toko, pajak, printer |
| `transaksi.ts` | 18 transaksi lintas 3 hari, 6 shift |

Semua tanggal ditulis sebagai string tetap terhadap jangkar `HARI_INI`
(`2026-07-29`), **tidak pernah** dihitung dari `new Date()` saat modul dimuat.
Ekspor statis merender di waktu build sedangkan peramban merender di waktu
kunjung, jadi tanggal yang dihitung saat impor akan berbeda antara keduanya dan
React melaporkannya sebagai ketidakcocokan hidrasi. Alasan yang sama berlaku
untuk `Math.random()`, yang tidak dipakai sama sekali.

Baris transaksi ditulis sebagai resep pendek lalu dikembangkan dari katalog,
jadi harga satuan selalu turun dari katalog dan tidak pernah mengambang sendiri.

---

## 6. Yang sengaja ditunda ke Stage 5

Semuanya sudah ditandai **di layar** lewat komponen `CatatanStage`, bukan
disembunyikan di komentar kode. Placeholder yang tidak beranotasi tidak bisa
dibedakan dari fitur yang dianggap sudah selesai.

| Layar | Yang ditunda |
| --- | --- |
| Kasir | pemindaian barcode sungguhan, pintasan papan ketik F1 sampai F12, cetak ke printer termal, keranjang bertahan di localStorage |
| Pembayaran | menyelesaikan pembayaran belum mengubah status transaksi, cetak belum aktif |
| Produk | tambah produk, impor CSV, aksi massal, pengelola dimensi varian |
| Detail produk | riwayat pergerakan stok, form ubah produk |
| Transaksi | ekspor CSV, penyaring rentang tanggal ganda, aksi refund dan void |
| Shift | form buka dan tutup shift, penghitung pecahan uang |
| Laporan | pengelompokan mingguan dan bulanan, cetak, ekspor, pembanding periode |
| Pengaturan | seluruh form belum menyimpan, mode harga sudah termasuk pajak, lebar struk 58mm |
| Beranda | angka pembanding KPI masih tetap, belum dihitung dari hari sebelumnya |
| Peran | peran belum benar benar membatasi apa pun |

Data demo juga masih perlu digemukkan sesuai semangat R41: 23 produk dan 18
transaksi cukup untuk membuat tata letak terlihat jujur, belum cukup untuk
terasa seperti bisnis yang sudah berjalan setahun.

---

## 7. Perkakas QA

| Berkas | Fungsi |
| --- | --- |
| `scripts/qa-setup.mjs` | menyalakan Chromium di runtime ini, unduh 9 deb ke ruang pengguna lalu pasang `LD_LIBRARY_PATH`. Idempoten |
| `scripts/qa-check.mjs` | sapuan terukur seluruh rute di 375, 480, 768, 1025, 1440. R19, R20, R50, R11 dan R58, R53, R57, R59, R60, R16.1 |
| `scripts/qa-probe.mjs` | probe terarah yang **mencetak angkanya**, plus tangkapan layar ke `qa-shots/` |

Dua duanya disalin dari `portfolio-derap` dan `portfolio-jaring`, yang sudah
membuktikan resepnya di runtime ini, lalu disesuaikan pada dua titik saja:
daftar kata berkapital sah dan pola rute contoh. Segmen dinamis Lekas memakai
huruf besar (`FNB-K-001`, `TRX-20260729-0007`), jadi polanya wajib mencakup A-Z.

`qa-check.mjs` melaporkan **temuan**. Kalau dia melapor nol, ada dua kemungkinan
yang terbaca sama dari luar: benar benar bersih, atau sapuannya tidak pernah
menyentuh apa yang seharusnya diperiksa. `qa-probe.mjs` ada untuk menutup jarak
itu dengan mencetak angka yang diukurnya.

**Dan keduanya tetap tidak cukup.** Tiga cacat nyata di build ini lolos dari
seluruh sapuan terukur dan hanya ketahuan dari melihat tangkapan layar:

1. Batang grafik menyusut jadi garis 2px, karena persentase tinggi dihitung
   terhadap induk yang tingginya auto.
2. Ubin produk melebar mengikuti panjang nama, karena `<button>` menyusut
   mengikuti isinya walaupun sudah `display: flex`.
3. Seluruh nilai di kartu mobile berwarna ungu tautan, karena kartunya `<a>` dan
   warnanya menurun ke anak yang tidak menetapkan warna sendiri.

Ketiganya lolos karena elemennya memang ada, kontrasnya benar, dan halamannya
tidak meluap. Sapuan terukur dan pembacaan piksel keduanya wajib, dan tidak ada
yang menggantikan yang lain.
