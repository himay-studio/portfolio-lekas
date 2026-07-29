# Lekas, BRAND.md

Aplikasi kasir (POS) untuk toko retail dan kedai F&B skala UMKM sampai menengah.
Portfolio app demo Himay Studio. Merek fiktif, dibangun serius seperti produk nyata.

| Kunci | Nilai |
| --- | --- |
| Nama merek | **Lekas** |
| Slug | `lekas` |
| Repo | `himay-studio/portfolio-lekas` |
| Domain publik | `portfolio-lekas.himaystudio.com` |
| Pages project | `himaystudio-portfolio-lekas` |
| Kategori | Perangkat lunak kasir (POS), model langganan per outlet |
| Tagline | **Cepat di kasir, pas di laci.** |

---

## 1. Riset niche

### 1.1 Siapa penggunanya

Tiga peran memakai produk ini dan ketiganya punya kebutuhan yang berbeda tajam.

| Peran | Di mana dia berada | Yang dia butuhkan | Yang bikin dia benci aplikasi |
| --- | --- | --- | --- |
| **Kasir** | Berdiri di meja kasir, ada antrean di depannya | Layar satu halaman, tombol besar, jalur tercepat dari pilih barang sampai kembalian | Menu bertingkat, tulisan kecil, harus scroll saat pelanggan menunggu |
| **Manajer atau supervisor shift** | Di outlet, bolak balik antara gudang dan kasir | Tutup shift yang jelas, tahu siapa pegang kas, kenapa ada selisih | Selisih kas tanpa jejak, harus buka struk fisik satu satu |
| **Pemilik** | Tidak di outlet, buka aplikasi dari HP atau laptop di rumah | Angka penjualan hari ini, produk terlaris, jam sibuk, per kasir | Laporan yang harus diekspor ke Excel dulu baru bisa dibaca |

Profil bisnisnya: satu sampai lima outlet, dua sampai delapan karyawan per outlet, omzet harian Rp 1 juta sampai Rp 15 juta, sudah pakai QRIS, sudah punya printer termal, tapi pencatatannya masih campur antara aplikasi gratis, buku tulis, dan grup WhatsApp.

### 1.2 Masalah utama yang nyata

Riset di sumber lokal (Kledo, Trigonal, Program IPOS, Ciptareka) menunjukkan tiga masalah yang berulang, dan ketiganya adalah masalah **prosedur**, bukan masalah fitur:

1. **Selisih kas saat tutup shift.** Sekitar 80 persen kasus selisih kasir di toko retail disebabkan kesalahan manusia, bukan kecurangan. Proses tutup kas yang harusnya 15 menit bisa molor jadi 2 jam karena tidak ada jejak per transaksi. Yang paling menyakitkan bukan nominal selisihnya, tapi tidak ada yang bisa menjelaskan selisih itu datang dari mana.
2. **Kasir baru butuh waktu lama untuk bisa.** Pelatihan yang kurang dan prosedur yang tidak jelas disebut eksplisit sebagai penyebab tutup kasir yang salah. Di bisnis dengan perputaran karyawan tinggi, aplikasi yang butuh pelatihan seminggu adalah biaya nyata setiap kali ada orang baru.
3. **Bisnis dengan dua wajah tidak kebagian aplikasi yang pas.** Toko roti yang punya meja makan, kelontong yang punya pojok kopi, apotek yang jual minuman. Aplikasi retail tidak punya meja dan tahan pesanan, aplikasi F&B tidak punya barcode dan stok per SKU. Pemilik akhirnya memaksakan salah satu dan menambal sisanya secara manual.

### 1.3 Kompetitor nyata di pasar Indonesia

| Kompetitor | Posisi yang mereka ambil | Harga acuan | Celah yang mereka tinggalkan |
| --- | --- | --- | --- |
| **Moka** | Paling kuat untuk resto dan kafe. Manajemen meja, QR order, CRM pelanggan | Menengah ke atas | Sisi retail (barcode, SKU, stok per varian) terasa nomor dua |
| **Olsera** | Retail multi channel, sinkron toko fisik dan marketplace | Basic Rp 1.288.000 per tahun, Premium Rp 1.988.000, Pro Rp 2.688.000 | Antarmuka padat fitur, kurva belajar kasir baru panjang |
| **Majoo** | Serba ada, kasir sampai CRM, laporan keuangan, dan SDM | Relatif mahal untuk bisnis yang baru mulai | Terlalu besar untuk satu outlet, banyak modul tidak terpakai |
| **Pawoon** | Cocok untuk banyak cabang dan model waralaba, ada pengaturan meja dan antrean | Basic Rp 149.000 per bulan, standar Rp 299.000 per outlet per bulan | Fokus ke multi cabang, bukan ke kedalaman satu outlet |
| **Qasir** | Gratis untuk usaha mikro, paling ringan dan paling mudah | Ada paket gratis | Sengaja dangkal. Begitu bisnis butuh shift, peran, dan varian, harus pindah |

Pola yang terlihat: pasar terbelah antara **terlalu ringan** (Qasir) dan **terlalu berat** (Majoo, Olsera), dan terbelah lagi antara **rasa retail** (Olsera) dan **rasa F&B** (Moka). Tidak ada yang menaruh pertanggungjawaban kas sebagai janji utamanya.

### 1.4 Celah posisi yang Lekas ambil

> **Satu kasir untuk toko dan kedai di outlet yang sama, dengan tutup shift yang bisa ditelusuri sampai ke transaksinya.**

Dua klaim, dua duanya bisa dibuktikan di layar:

1. **Mode ganda tanpa ganti aplikasi.** Retail dan F&B hidup berdampingan. Barcode dan SKU untuk barang, meja dan tahan pesanan untuk yang makan di tempat. Kasir memilih mode di layar yang sama, bukan di aplikasi yang berbeda.
2. **Kas yang bisa ditelusuri.** Setiap shift punya kas awal, kas akhir, dan daftar transaksi yang membentuk angka itu. Kalau ada selisih, layar tutup shift langsung menunjukkan transaksi mana saja yang perlu dicek, bukan cuma menampilkan angka merah.

Yang **tidak** kami klaim, dan ini disengaja supaya posisinya tajam: bukan yang termurah, bukan yang paling banyak modul, bukan yang punya payroll dan akuntansi. Lekas adalah kasir yang benar benar bagus, bukan ERP yang kebetulan punya kasir.

---

## 2. Nama merek

### 2.1 Logika penamaan

**Lekas** adalah kata Indonesia yang berarti cepat, segera, tidak berlama lama. Kata sehari hari yang hangat, tapi tetap terdengar seperti nama produk perangkat lunak, bukan nama warung.

Alasannya lolos seleksi:

- **Menyebut janji utamanya.** Kriteria beli nomor satu untuk aplikasi kasir adalah cepat. Cepat dipelajari kasir baru, cepat dipakai saat antrean panjang, cepat saat tutup shift.
- **Dua suku kata, mudah diucapkan lewat telepon**, mudah dieja, mudah jadi wordmark.
- **Tidak bentrok.** Penelusuran tidak menemukan produk perangkat lunak atau SaaS Indonesia bernama Lekas. Slug `lekas` juga belum dipakai repo portfolio mana pun di `himay-studio` (dicek terhadap 26 repo yang ada pada 29 Juli 2026).
- **Sejalan dengan gaya rumah.** Saudara satu proyeknya memakai satu kata Indonesia dengan metafora yang nyambung ke domainnya: Derap (langkah, manajemen proyek), Palka (ruang muat kapal, gudang), Jaring (menjaring prospek, CRM). Lekas melanjutkan pola itu tanpa meminjam metaforanya.

Kata "lekas" memang sering terdengar dalam "lekas sembuh". Itu kolokasi, bukan arti kata. Berdiri sendiri, "lekas" tetap berarti cepat, dan konteks produk kasir menghapus asosiasi itu dalam sekali baca.

### 2.2 Penulisan nama

- Selalu **Lekas**, L kapital, sisanya huruf kecil. Bukan LEKAS, bukan lekas, bukan LeKas.
- Saat perlu penjelas kategori: **Lekas, aplikasi kasir**. Koma, bukan tanda pisah panjang (R11).
- Tidak pernah ditulis "Lekas POS" di dalam produk. "POS" hanya dipakai di teks penjelas kalau pembacanya butuh istilah teknis.

---

## 3. Positioning dan tagline

**Tagline utama: Cepat di kasir, pas di laci.**

Delapan kata, dua janji, dua duanya konkret. "Cepat di kasir" adalah kecepatan melayani. "Pas di laci" adalah laci uang yang isinya cocok dengan catatan saat tutup shift. Keduanya adalah hal yang benar benar dirasakan pemilik toko setiap hari.

Pernyataan posisi lengkap, untuk halaman landing dan meta:

> Lekas adalah aplikasi kasir untuk toko retail dan kedai F&B yang berjalan di satu outlet yang sama. Dibuat supaya kasir baru bisa langsung melayani di hari pertama, dan supaya tutup shift selesai dalam hitungan menit dengan selisih kas yang bisa ditelusuri sampai ke transaksinya.

Turunan tagline yang boleh dipakai per konteks:

| Konteks | Kalimat |
| --- | --- |
| Hero landing | Cepat di kasir, pas di laci. |
| Sub hero | Satu aplikasi kasir untuk toko dan kedai. Kasir baru bisa langsung melayani, tutup shift beres dalam hitungan menit. |
| Layar login | Masuk ke Lekas |
| Modul kasir kosong | Pilih produk untuk mulai transaksi |
| Tutup shift seimbang | Kas pas. Tidak ada selisih. |
| Tutup shift ada selisih | Ada selisih Rp 25.000. Cek transaksi yang ditandai di bawah. |

---

## 4. Cek realisme kategori (wajib, tidak boleh dilewat)

Tiga pertanyaan wajib dijawab lantang sebelum palet dan arah visual dikunci. Untuk produk perangkat lunak, "kemasan" diterjemahkan jadi bentuk nyata produk ini dipakai dan dijual.

### 4.1 Bagaimana produk ini sebenarnya dipakai dan dijual

Bukan di laptop desainer dengan layar 15 inci di kafe. Realitasnya:

- **Perangkat**: tablet Android 10 inci di dudukan logam, atau PC all in one layar sentuh 15 inci, di meja kasir. Kadang laptop bekas untuk toko yang lebih hemat. Sering dipakai satu tangan sambil tangan lain memegang barang.
- **Periferal**: printer termal **58mm** dan **80mm**, laci uang yang tersambung ke printer lewat port **RJ-11** dan terbuka otomatis setelah transaksi selesai, scanner barcode 1D yang juga bisa membaca QR 2D dari layar HP pelanggan.
- **Pembayaran**: tunai, kartu debit atau kredit lewat EDC terpisah, dan **QRIS statis atau dinamis**. Kembalian dihitung cepat, sering dibulatkan.
- **Kondisi ruangan**: lampu toko terang menyilaukan, layar sering berminyak, kasir tergesa. Kontras rendah dan tulisan kecil langsung gagal di kondisi ini.
- **Cara dijual**: langganan per outlet per bulan atau per tahun, kisaran Rp 100.000 sampai Rp 300.000 per outlet per bulan. Bukan lisensi sekali beli.

**Kata kunci yang wajib dipakai ulang di setiap prompt gambar MEDIA.md:**

> `layar kasir tablet 10 inci di dudukan logam pada meja kasir kayu terang, printer termal 80mm dan laci uang logam di sampingnya, toko Indonesia, siang hari, cahaya jendela`

Dan untuk foto produk katalog demo:

> `flat lay 1:1 di atas permukaan abu netral terang, cahaya jendela lembut, kemasan polos tanpa merek`

### 4.2 Rak mana yang saya tempati, sebut dua kompetitor nyata

Rak: perangkat lunak kasir langganan untuk UMKM Indonesia. Bukan rak fisik, tapi punya tampilan rak sendiri, yaitu halaman perbandingan aplikasi kasir dan hasil pencarian "aplikasi kasir terbaik".

- **Moka.** Identitas visual biru kehijauan, bersih, ramah, foto barista dan kafe. Layar kasirnya grid produk besar dengan foto menu.
- **Pawoon.** Identitas jingga hangat, energik, foto pemilik warung dan kedai. Menekankan mudah dan terjangkau.

Keduanya memakai palet terang dan bersih, dengan satu warna merek yang kuat. Tidak ada yang gelap, tidak ada yang hangat kecoklatan. Itu bukan kebetulan: layar kasir dipakai di ruangan terang berjam jam, dan palet gelap membuat pantulan lampu toko jadi masalah.

### 4.3 Apakah palet saya cocok dengan mood kategori, atau saya default ke gelap dan hangat karena kelihatan premium

Dijawab lantang: **palet Lekas terang, netral tenang keunguan, dengan ungu tinta sebagai warna merek. Ini bukan default gelap dan hangat.**

Kenapa ungu, bukan biru:

- Kategori ini penuh biru dan hijau kebiruan (Moka, Olsera, Qasir, Kasir Pintar). Ungu tinta langsung terbaca beda di halaman perbandingan tanpa jadi aneh.
- Ungu tinta tetap terbaca serius dan tepercaya. Ini aplikasi yang memegang uang, jadi tidak boleh terasa main main.
- Tidak bentrok dengan satu pun warna semantik. Hijau tetap bebas untuk uang diterima dan berhasil, merah untuk batal dan refund, jingga untuk peringatan, biru untuk informasi. Kalau merek memakai biru atau hijau, salah satu makna semantik itu pasti kabur.
- Tidak dipakai saudara satu proyek: Derap nila kebiruan, Palka biru laut tua, Jaring hijau kebiruan.

Netralnya sengaja diberi sedikit undertone ungu (`#F4F2F7` bukan abu netral murni) supaya kanvas terasa satu keluarga dengan warna merek, tapi tetap tenang. Aplikasi padat data tidak boleh punya latar yang berteriak.

**Yang dilarang keras di merek ini:** cokelat kraft, kuning gading, tekstur kertas, gradien hangat, dan segala kosakata artisanal. Itu bahasa rak F&B artisanal, bukan bahasa perangkat lunak yang memegang uang orang. Palet gelap dan hangat pada produk perangkat lunak modern membuatnya terlihat jadul dan langsung gagal.

---

## 5. Persona merek

**Lekas adalah supervisor kasir yang sudah 10 tahun di lapangan.**

Dia tahu persis apa yang terjadi di jam 12 siang saat antrean mengular. Dia tidak menggurui, tidak menjual mimpi transformasi digital, dan tidak pernah memakai kata "solusi". Kalau ada selisih kas, dia tidak menyalahkan, dia menunjukkan transaksi mana yang perlu dicek. Kalau ada yang salah, dia bilang apa yang salah dan apa langkah berikutnya.

| Dia | Bukan dia |
| --- | --- |
| Tenang, ringkas, langsung ke inti | Ramai, banyak seru, banyak emoji |
| Memakai kata yang dipakai orang toko | Memakai jargon SaaS dan istilah Inggris tanpa perlu |
| Menunjukkan angka | Menjanjikan "peningkatan efisiensi" |
| Menganggap penggunanya kompeten | Menganggap penggunanya gaptek |

---

## 6. Tone of voice

### 6.1 Prinsip

1. **Bahasa Indonesia yang wajar.** Bukan terjemahan Inggris. "Tutup shift", bukan "close shift". "Tahan pesanan", bukan "hold bill". "Kembalian", bukan "change".
2. **Kalimat pendek.** Satu kalimat satu gagasan. Layar kasir dibaca sambil melayani, bukan sambil duduk santai.
3. **Angka lebih dipercaya daripada kata sifat.** "Tutup shift 2 menit" lebih kuat daripada "tutup shift super cepat".
4. **Pesan galat menyebutkan langkah berikutnya.** Bukan "terjadi kesalahan", tapi "Stok Roti Cokelat tinggal 2. Kurangi jumlah atau lanjutkan dengan stok minus."
5. **Tanpa em dash dan en dash, di mana pun** (R11). Pakai koma, titik, atau titik dua. Termasuk dilarang bentuk entity HTML seperti `&mdash;`, `&ndash;`, `&#8212;`, `&#8211;` (R58).

### 6.2 Istilah baku, dipakai konsisten di seluruh produk

| Konsep | Istilah baku Lekas | Jangan pakai |
| --- | --- | --- |
| Layar kasir utama | Kasir | POS, Point of Sale, Register |
| Menahan transaksi | Tahan pesanan | Hold, Hold bill, Parkir |
| Sesi kerja kasir | Shift | Sesi, Session |
| Uang tunai awal shift | Kas awal | Modal awal, Opening balance |
| Selisih saat tutup | Selisih kas | Variance, Discrepancy |
| Struk | Struk | Receipt, Nota digital |
| Membatalkan transaksi lunas | Refund | Pengembalian dana, Retur |
| Membatalkan sebelum bayar | Void | Batal, Cancel |
| Dimensi produk | Varian | Opsi, Option, Pilihan |
| Biaya layanan F&B | Servis | Service charge |

### 6.3 Contoh sebelum dan sesudah

| Jangan | Pakai |
| --- | --- |
| Solusi POS terintegrasi untuk transformasi digital UMKM Anda | Aplikasi kasir untuk toko dan kedai. Satu layar, satu alur. |
| Oops! Terjadi kesalahan | Pembayaran belum bisa diproses. Cek koneksi printer, lalu coba lagi. |
| Maksimalkan potensi bisnis Anda sekarang juga | Lihat penjualan hari ini |
| Fitur canggih untuk kemudahan Anda | Scan barcode, pilih varian, bayar. Tiga langkah. |

---

## 7. Daftar boleh dan jangan

### Boleh

- Menampilkan angka rupiah besar dan tebal. Ini aplikasi uang, angkanya adalah pahlawannya.
- Memakai warna semantik dengan disiplin: hijau untuk uang diterima dan berhasil, merah untuk batal dan refund, jingga untuk perlu perhatian, biru untuk informasi netral.
- Memberi ruang kosong di layar kasir. Padat data tidak berarti penuh sesak.
- Menyebut nama kasir dan waktu di setiap transaksi. Pertanggungjawaban adalah janji produknya.

### Jangan

- Jangan pakai sudut membulat. Radius 0 di seluruh produk (R10).
- Jangan pakai `<select>` bawaan browser atau input teks bebas untuk tanggal (R12, R21).
- Jangan pakai warna sebagai satu satunya penanda status. Selalu ada label teks juga.
- Jangan pakai foto stok orang tertawa di depan laptop. Kalau ada foto, itu foto meja kasir nyata atau foto produk katalog.
- Jangan pakai ilustrasi 3D mengambang, gradien ungu ke pink, atau glassmorphism. Ini alat kerja, bukan halaman arahan startup.
- Jangan pakai em dash dan en dash, termasuk bentuk entity HTML (R11, R58).
- Jangan menaruh tombol aksi utama di pojok kanan atas. Aksi utama selalu di kiri (standar proyek ini).

---

## 8. Yang diwariskan ke stage berikutnya

Tiga hal ini dikunci di sini dan tidak boleh diubah diam diam oleh stage mana pun.

1. **Kata kunci arah gambar** (bagian 4.1). Setiap prompt di `MEDIA.md` menyalin kata kunci itu apa adanya. Salah kata kunci berarti seluruh set gambar salah kategori.
2. **Warna merek `#6D28A8` dan seluruh token di `DESIGN.md`.** Rasio kontras sudah dihitung, bukan dikira kira. Jangan ganti nilai token tanpa menghitung ulang.
3. **Istilah baku (bagian 6.2).** Ini menjadi kamus untuk seluruh label antarmuka. Konsistensi istilah adalah bagian dari janji "kasir baru bisa langsung melayani".

Detail sistem desain ada di [`DESIGN.md`](./DESIGN.md). Arah visual, logo, dan aset ada di [`ART-DIRECTION.md`](./ART-DIRECTION.md) serta [`LOGO.md`](./LOGO.md).
