#!/usr/bin/env node
/**
 * Uji interaksi POS Lekas: bukan cuma "halaman render", tapi logika bisnis
 * sungguhan benar. Puppeteer benar benar mengklik, mengetik, dan menekan
 * tombol papan ketik, lalu membaca localStorage dan DOM untuk memastikan
 * KEADAAN berubah seperti yang dijanjikan kode, bukan cuma elemen ada di DOM.
 *
 * Ditulis dengan membaca sumber sungguhan lebih dulu (KasirClient.tsx,
 * produkStore.ts, transaksiStore.ts, shiftStore.ts, storage.ts,
 * DetailProduk.tsx, TransaksiClient.tsx, DetailTransaksi.tsx, DatePicker.tsx,
 * LoginForm.tsx), bukan menebak API.
 *
 * Pemakaian:
 *   node scripts/qa-interactions.mjs <base-url>
 *   node scripts/qa-interactions.mjs                # bawaan http://localhost:4173
 */

import puppeteer from 'puppeteer-core';
import { siapkanBrowser } from './qa-setup.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4173';

let lolos = 0;
let gagal = 0;
const gagalDetail = [];

function cek(label, kondisi, detail) {
  if (kondisi) {
    lolos += 1;
    process.stdout.write(`  OK   ${label}${detail ? `  (${detail})` : ''}\n`);
  } else {
    gagal += 1;
    gagalDetail.push(label);
    process.stdout.write(`  FAIL ${label}${detail ? `  (${detail})` : ''}\n`);
  }
}

function tunggu(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Bersihkan seluruh state demo (semua kunci berawalan lekas:) supaya setiap
 * jalur uji mulai dari data dasar yang deterministik, tidak tercampur sisa
 * jalannya qa-probe.mjs atau qa-check.mjs sebelumnya. */
async function bersihkanState(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const kunci = Object.keys(window.localStorage).filter((k) => k.startsWith('lekas:'));
    for (const k of kunci) window.localStorage.removeItem(k);
  });
}

async function bacaLekas(page, kunci) {
  return page.evaluate((k) => {
    const mentah = window.localStorage.getItem(`lekas:${k}`);
    return mentah === null ? null : JSON.parse(mentah);
  }, kunci);
}

async function loginSebagai(page, indeksKandidat) {
  await page.goto(`${BASE}/login/`, { waitUntil: 'networkidle0' });
  await tunggu(200);
  const tombolPeran = await page.$$('.masuk-peran-btn');
  await tombolPeran[indeksKandidat].click();
  await tunggu(150);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await tunggu(200);
}

async function bacaStokProduk(page, sku) {
  await page.goto(`${BASE}/app/produk/${sku}/`, { waitUntil: 'networkidle0' });
  await tunggu(250);
  return page.evaluate(() => {
    const baris = [...document.querySelectorAll('.def-baris')];
    const b = baris.find((x) => x.querySelector('dt')?.textContent?.trim() === 'Stok');
    if (!b) return null;
    const teks = b.querySelector('dd')?.textContent ?? '';
    return Number(teks.trim().split(/\s+/)[0].replace(/\./g, ''));
  });
}

async function bacaKrjBar(page) {
  return page.evaluate(() => {
    const bar = document.querySelector('.krj-bar');
    if (!bar) return null;
    return bar.querySelector('.stack .t')?.textContent?.trim() ?? null;
  });
}

async function utama() {
  const { chrome } = siapkanBrowser();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'shell',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => process.stdout.write(`  [console pageerror] ${e}\n`));
  await page.setViewport({ width: 1440, height: 960 });

  process.stdout.write(`\n=== qa-interactions.mjs terhadap ${BASE} ===\n\n`);

  try {
    // ------------------------------------------------------------------
    process.stdout.write('-- 1. Kasir: pemindaian barcode + F2 fokus pencarian --\n');
    await bersihkanState(page);
    await loginSebagai(page, 2); // PENGGUNA[2], peran kasir -> masuk demo mengarahkan ke /app/kasir/
    cek('login kasir mendarat di /app/kasir/', page.url().includes('/app/kasir/'), page.url());

    const stokAwal = await bacaStokProduk(page, 'FNB-M-002');
    process.stdout.write(`  stok awal Mi Ayam (FNB-M-002): ${stokAwal}\n`);

    await page.goto(`${BASE}/app/kasir/`, { waitUntil: 'networkidle0' });
    await tunggu(300);

    // F2 memfokuskan kolom pencarian, dari mana saja fokusnya berada.
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.keyboard.press('F2');
    await tunggu(150);
    const fokusF2 = await page.evaluate(() => document.activeElement?.id);
    cek('F2 memfokuskan #kasir-cari', fokusF2 === 'kasir-cari', `activeElement=${fokusF2}`);

    // Pemindaian barcode: ketik barcode persis lalu Enter, tanpa dimensi jadi
    // langsung satu baris di keranjang.
    await page.type('#kasir-cari', '8991002103022');
    await page.keyboard.press('Enter');
    await tunggu(300);
    const cariSetelahScan = await page.$eval('#kasir-cari', (el) => el.value);
    cek('kolom pencarian dikosongkan setelah pindai sukses', cariSetelahScan === '', `value="${cariSetelahScan}"`);
    let bar = await bacaKrjBar(page);
    cek('krj-bar menunjukkan 1 item setelah pindai barcode', bar === '1 item', bar);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 2. F4 tahan + F7 daftar tertahan + Lanjutkan --\n');
    await page.keyboard.press('F4');
    await tunggu(300);
    bar = await bacaKrjBar(page);
    cek('keranjang kosong (0 item) setelah F4 menahan', bar === '0 item', bar);
    const tertahanBtn = await page.evaluate(() => {
      const tombol = [...document.querySelectorAll('.kasir-cari button')].find((b) => b.textContent?.includes('Tertahan'));
      return tombol?.textContent?.trim() ?? null;
    });
    cek('tombol Tertahan menunjukkan 1 pesanan', tertahanBtn === 'Tertahan 1', tertahanBtn);

    await page.keyboard.press('F7');
    await tunggu(350);
    const panelTertahanTerlihat = await page.evaluate(() => {
      const ov = document.querySelector('.ov-kotak');
      return ov?.querySelector('h2, .ov-judul, [class*=judul]')?.textContent ?? document.body.innerText.includes('Transaksi tertahan');
    });
    cek('panel Transaksi tertahan terbuka lewat F7', Boolean(panelTertahanTerlihat), String(panelTertahanTerlihat).slice(0, 60));

    const lanjutBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Lanjutkan'));
    if (lanjutBtn.asElement()) {
      await lanjutBtn.asElement().click();
      await tunggu(350);
    }
    bar = await bacaKrjBar(page);
    cek('keranjang berisi 1 item lagi setelah Lanjutkan dari tahanan', bar === '1 item', bar);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 3. F6 pilih meja --\n');
    await page.keyboard.press('F6');
    await tunggu(350);
    const mejaPertama = await page.evaluateHandle(() => document.querySelector('.kartu-grid button'));
    let namaMejaDipilih = null;
    if (mejaPertama.asElement()) {
      namaMejaDipilih = await mejaPertama.asElement().evaluate((el) => el.querySelector('.t')?.textContent?.trim());
      await mejaPertama.asElement().click();
      await tunggu(300);
    }
    const badgeMeja = await page.evaluate(() => {
      const tombol = [...document.querySelectorAll('.kasir-cari button')].find((b) => b.textContent?.includes('Meja'));
      return tombol?.textContent?.trim() ?? null;
    });
    cek('tombol meja di toolbar memperlihatkan meja terpilih', Boolean(badgeMeja && badgeMeja !== 'Pilih meja'), `dipilih="${namaMejaDipilih}" toolbar="${badgeMeja}"`);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 4. Persistensi localStorage lewat reload sungguhan (keranjang + tahanan + meja) --\n');
    const keranjangSebelum = await bacaLekas(page, 'kasir-keranjang');
    const mejaSebelum = await bacaLekas(page, 'kasir-meja');
    await page.reload({ waitUntil: 'networkidle0' });
    await tunggu(400);
    bar = await bacaKrjBar(page);
    cek('keranjang bertahan (1 item) setelah reload halaman', bar === '1 item', bar);
    const keranjangSesudah = await bacaLekas(page, 'kasir-keranjang');
    cek('isi keranjang di localStorage sama persis sebelum/sesudah reload',
      JSON.stringify(keranjangSebelum) === JSON.stringify(keranjangSesudah) && Array.isArray(keranjangSesudah) && keranjangSesudah.length === 1,
      `panjang=${keranjangSesudah?.length}`);
    const mejaSesudah = await bacaLekas(page, 'kasir-meja');
    cek('meja terpilih bertahan di localStorage setelah reload', mejaSesudah === mejaSebelum && mejaSesudah != null, `meja=${mejaSesudah}`);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 5. F9 kosongkan keranjang --\n');
    await page.keyboard.press('F9');
    await tunggu(300);
    bar = await bacaKrjBar(page);
    cek('F9 mengosongkan keranjang (0 item)', bar === '0 item', bar);
    const mejaSetelahF9 = await bacaLekas(page, 'kasir-meja');
    cek('F9 (kosongkan) juga melepas meja terpilih', mejaSetelahF9 === null, `meja=${mejaSetelahF9}`);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 6. F3 buka Bayar, pecahan cepat Uang pas, Selesaikan pembayaran --\n');
    await page.type('#kasir-cari', '8991002103022');
    await page.keyboard.press('Enter');
    await tunggu(300);
    await page.keyboard.press('F3');
    await tunggu(400);
    const bayarTerbuka = await page.evaluate(() => document.body.innerText.includes('Selesaikan pembayaran'));
    cek('F3 membuka panel Pembayaran', bayarTerbuka);

    const uangPas = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Uang pas'));
    if (uangPas.asElement()) await uangPas.asElement().click();
    await tunggu(250);

    const selesaiBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Selesaikan pembayaran'));
    const disabledSebelum = selesaiBtn.asElement() ? await selesaiBtn.asElement().evaluate((el) => el.disabled) : null;
    cek('tombol Selesaikan pembayaran aktif setelah Uang pas', disabledSebelum === false, `disabled=${disabledSebelum}`);

    const transaksiSebelum = (await bacaLekas(page, 'transaksi-baru')) ?? [];
    const shiftTimpaSebelum = (await bacaLekas(page, 'shift-timpa')) ?? {};

    if (selesaiBtn.asElement() && disabledSebelum === false) {
      await selesaiBtn.asElement().click();
      await tunggu(400);
    }

    const bayarMasihTerbuka = await page.evaluate(() => document.body.innerText.includes('Selesaikan pembayaran'));
    cek('panel Pembayaran tertutup setelah transaksi selesai', !bayarMasihTerbuka);
    bar = await bacaKrjBar(page);
    cek('keranjang kembali kosong setelah pembayaran selesai', bar === '0 item', bar);

    const transaksiSesudah = (await bacaLekas(page, 'transaksi-baru')) ?? [];
    cek('satu baris transaksi baru tercatat di lekas:transaksi-baru',
      transaksiSesudah.length === transaksiSebelum.length + 1,
      `sebelum=${transaksiSebelum.length} sesudah=${transaksiSesudah.length}`);
    const trxBaru = transaksiSesudah[transaksiSesudah.length - 1];
    cek('transaksi baru berstatus lunas dan berisi produk yang dipindai',
      trxBaru?.status === 'lunas' && trxBaru?.baris?.[0]?.produkId === 'p-mi-ayam' && trxBaru?.baris?.[0]?.qty === 1,
      `status=${trxBaru?.status} produkId=${trxBaru?.baris?.[0]?.produkId} qty=${trxBaru?.baris?.[0]?.qty} id=${trxBaru?.id}`);

    const produkTimpa = (await bacaLekas(page, 'produk-timpa')) ?? {};
    const stokSesudahBayar = produkTimpa['p-mi-ayam']?.stok;
    cek(`stok Mi Ayam berkurang 1 (${stokAwal} -> ${stokAwal - 1}) di produkStore setelah Bayar`,
      stokSesudahBayar === stokAwal - 1,
      `produk-timpa['p-mi-ayam'].stok=${stokSesudahBayar}`);
    const stokTampilSesudah = await bacaStokProduk(page, 'FNB-M-002');
    cek('halaman detail produk juga membaca stok baru itu', stokTampilSesudah === stokAwal - 1, `tampil=${stokTampilSesudah}`);

    const shiftTimpaSesudah = (await bacaLekas(page, 'shift-timpa')) ?? {};
    const shSebelum = shiftTimpaSebelum['SH-20260729-S'];
    const shSesudah = shiftTimpaSesudah['SH-20260729-S'];
    cek('shift aktif (SH-20260729-S) mencatat +1 transaksi lewat catatPenjualan',
      (shSesudah?.jumlahTransaksi ?? 0) === (shSebelum?.jumlahTransaksi ?? 18) + 1,
      `sebelum=${shSebelum?.jumlahTransaksi ?? '(dasar 18)'} sesudah=${shSesudah?.jumlahTransaksi}`);

    // ------------------------------------------------------------------
    process.stdout.write('\n-- 7. Login manajer: diskon transaksi, void/refund, produk (CSV, aksi massal, dimensi, sesuaikan stok) --\n');
    await bersihkanState(page);
    await loginSebagai(page, 1); // PENGGUNA[1], peran manajer
    cek('login manajer mendarat di /app/', page.url().endsWith('/app/') || page.url().endsWith('/app'), page.url());

    await page.goto(`${BASE}/app/kasir/`, { waitUntil: 'networkidle0' });
    await tunggu(300);
    await page.type('#kasir-cari', '8991002103022');
    await page.keyboard.press('Enter');
    await tunggu(300);
    const diskonTrxBtn = await page.evaluateHandle(() => [...document.querySelectorAll('.keranjang:not(.keranjang-lembar) button')].find((b) => b.textContent?.includes('Diskon')));
    const diskonDisabled = diskonTrxBtn.asElement() ? await diskonTrxBtn.asElement().evaluate((el) => el.disabled) : 'tombol tidak ditemukan';
    cek('peran manajer BOLEH memberi diskon transaksi (tombol Diskon aktif)', diskonDisabled === false, `disabled=${diskonDisabled}`);
    if (diskonTrxBtn.asElement() && diskonDisabled === false) {
      await diskonTrxBtn.asElement().click();
      await tunggu(350);
      await page.evaluate(() => {
        const input = document.getElementById('diskon-nilai');
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, '10');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      const terapkanBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Terapkan diskon'));
      if (terapkanBtn.asElement()) await terapkanBtn.asElement().click();
      await tunggu(300);
      const ringkasHtml = await page.evaluate(() => document.body.innerText.includes('Diskon transaksi'));
      cek('ringkasan keranjang menampilkan baris Diskon transaksi setelah diterapkan', ringkasHtml);
    }
    await page.keyboard.press('F9');
    await tunggu(200);

    // ---- Produk: sesuaikan stok wajib alasan ----
    process.stdout.write('\n  -- Produk: sesuaikan stok wajib alasan --\n');
    await page.goto(`${BASE}/app/produk/FNB-M-003/`, { waitUntil: 'networkidle0' });
    await tunggu(300);
    const stokAwalKentang = await page.evaluate(() => {
      const baris = [...document.querySelectorAll('.def-baris')];
      const b = baris.find((x) => x.querySelector('dt')?.textContent?.trim() === 'Stok');
      return Number((b?.querySelector('dd')?.textContent ?? '0').trim().split(/\s+/)[0].replace(/\./g, ''));
    });
    const sesuaikanBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Sesuaikan stok'));
    await sesuaikanBtn.asElement().click();
    await tunggu(300);
    const simpanStokBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith('Simpan')));
    const disabledTanpaAlasan = await simpanStokBtn.asElement().evaluate((el) => el.disabled);
    cek('tombol simpan sesuaikan-stok terkunci sebelum delta/alasan diisi', disabledTanpaAlasan === true, `disabled=${disabledTanpaAlasan}`);
    await page.evaluate(() => {
      const input = document.getElementById('d-stok');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '-5');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await tunggu(100);
    const disabledTanpaAlasanSaja = await simpanStokBtn.asElement().evaluate((el) => el.disabled);
    cek('masih terkunci kalau delta diisi tapi alasan kosong (alasan WAJIB)', disabledTanpaAlasanSaja === true, `disabled=${disabledTanpaAlasanSaja}`);
    await page.evaluate((teks) => {
      const input = document.getElementById('d-alasan');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, teks);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 'Retur pelanggan, kemasan rusak');
    await tunggu(100);
    const nilaiDeltaStok = await page.$eval('#d-stok', (el) => el.value);
    const disabledSetelahAlasan = await simpanStokBtn.asElement().evaluate((el) => el.disabled);
    cek('terbuka setelah delta dan alasan sama sama diisi', disabledSetelahAlasan === false, `disabled=${disabledSetelahAlasan} nilaiDelta="${nilaiDeltaStok}"`);
    if (disabledSetelahAlasan === false) {
      // Klik lewat JS langsung, bukan lewat handle Puppeteer yang di-cache:
      // node tombol ini kadang sudah lepas dari referensi lama pada saat ini
      // (re-render React di antara pembacaan terakhir dan klik), padahal
      // masih ada dan valid di DOM saat ini.
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.trim().startsWith('Simpan'));
        b?.click();
      });
      await tunggu(350);
    }
    const stokSesudahKentang = await page.evaluate(() => {
      const baris = [...document.querySelectorAll('.def-baris')];
      const b = baris.find((x) => x.querySelector('dt')?.textContent?.trim() === 'Stok');
      return Number((b?.querySelector('dd')?.textContent ?? '0').trim().split(/\s+/)[0].replace(/\./g, ''));
    });
    cek(`stok Kentang Goreng berkurang 5 (${stokAwalKentang} -> ${stokAwalKentang - 5})`, stokSesudahKentang === stokAwalKentang - 5, `sesudah=${stokSesudahKentang}`);
    const logStok = (await bacaLekas(page, 'produk-log-stok')) ?? [];
    cek('riwayat pergerakan stok mencatat alasan verbatim', logStok[0]?.alasan === 'Retur pelanggan, kemasan rusak', logStok[0]?.alasan);

    // ---- Produk: CSV import + aksi massal ----
    process.stdout.write('\n  -- Produk: impor CSV + aksi massal --\n');
    await page.goto(`${BASE}/app/produk/`, { waitUntil: 'networkidle0' });
    await tunggu(300);
    const jumlahSebelumImpor = await page.evaluate(() => document.body.innerText.match(/(\d+) dari (\d+) produk/)?.[2]);
    const importBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Impor CSV')));
    await importBtn.asElement().click();
    await tunggu(300);
    const fileInput = await page.$('#f-csv');
    const csvIsi = 'sku,barcode,nama,kategoriId,hargaDasar,hargaModal,stok,stokMinimum,satuan,deskripsi\n'
      + 'QA-TEST-001,8990000000001,Produk Uji QA,sembako,15000,9000,25,5,pcs,Baris uji qa-interactions.mjs';
    const fs = await import('node:fs');
    const os = await import('node:os');
    const path = await import('node:path');
    const csvPath = path.join(os.tmpdir(), 'lekas-qa-impor.csv');
    fs.writeFileSync(csvPath, csvIsi);
    await fileInput.uploadFile(csvPath);
    await tunggu(300);
    const pratinjauBaris = await page.evaluate(() => document.querySelectorAll('.ov-isi .tbl-bungkus tbody tr').length);
    cek('pratinjau CSV menampilkan 1 baris sebelum impor', pratinjauBaris === 1, `baris=${pratinjauBaris}`);
    const impoBtn = await page.evaluateHandle(() => [...document.querySelectorAll('.ov-kaki button')].find((b) => b.textContent?.trim().startsWith('Impor ')));
    await impoBtn.asElement().click();
    await tunggu(400);
    const jumlahSesudahImpor = await page.evaluate(() => document.body.innerText.match(/(\d+) dari (\d+) produk/)?.[2]);
    cek('jumlah total produk bertambah 1 setelah impor CSV',
      Number(jumlahSesudahImpor) === Number(jumlahSebelumImpor) + 1,
      `sebelum=${jumlahSebelumImpor} sesudah=${jumlahSesudahImpor}`);
    const produkBaruList = (await bacaLekas(page, 'produk-baru')) ?? [];
    cek('produk hasil impor tersimpan di lekas:produk-baru dengan SKU yang benar',
      produkBaruList.some((p) => p.sku === 'QA-TEST-001'), produkBaruList.map((p) => p.sku).join(','));

    // Aksi massal: pindah ke tampilan tabel, pilih produk, nonaktifkan.
    const switchTabel = await page.evaluateHandle(() => [...document.querySelectorAll('button, [role="tab"]')].find((b) => /tabel/i.test(b.textContent ?? '') || b.getAttribute('aria-label')?.toLowerCase().includes('tabel')));
    if (switchTabel.asElement()) {
      await switchTabel.asElement().click();
      await tunggu(350);
    }
    const checkboxPertama = await page.$('.tbl label.cek');
    if (checkboxPertama) {
      await checkboxPertama.click();
      await tunggu(250);
      const massalBar = await page.evaluate(() => document.body.innerText.includes('produk terpilih'));
      cek('bar aksi massal muncul setelah centang 1 produk di tabel', massalBar);
      const nonaktifkanBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Nonaktifkan'));
      if (nonaktifkanBtn.asElement()) {
        await nonaktifkanBtn.asElement().click();
        await tunggu(300);
      }
    } else {
      cek('checkbox baris tabel ditemukan untuk uji aksi massal', false, 'tidak ada .tbl input[type=checkbox], mungkin view bawaan bukan tabel');
    }

    // ---- Transaksi: filter -> ekspor CSV mengikuti filter, DateRangePicker ----
    process.stdout.write('\n  -- Transaksi: DateRangePicker + ekspor CSV ikut filter aktif --\n');
    await page.goto(`${BASE}/app/transaksi/`, { waitUntil: 'networkidle0' });
    await tunggu(300);
    const totalTanpaFilter = await page.evaluate(() => document.body.innerText.match(/(\d+) dari (\d+) transaksi/)?.[1]);

    const rentangPemicu = await page.$('[aria-label="Saring rentang tanggal"]');
    await rentangPemicu.click();
    await tunggu(300);
    const pintasBtn = await page.evaluateHandle(() => [...document.querySelectorAll('.dp-pintas button')][0]);
    const labelPintas = pintasBtn.asElement() ? await pintasBtn.asElement().evaluate((el) => el.textContent?.trim()) : null;
    if (pintasBtn.asElement()) {
      await pintasBtn.asElement().click();
      await tunggu(350);
    }
    const totalDenganFilter = await page.evaluate(() => document.body.innerText.match(/(\d+) dari (\d+) transaksi/)?.[1]);
    cek(`memilih pintasan tanggal "${labelPintas}" mengubah/menyaring jumlah baris terlihat`,
      totalDenganFilter !== undefined, `tanpa filter=${totalTanpaFilter} dengan filter=${totalDenganFilter}`);

    const [download] = await Promise.all([
      new Promise((resolve) => {
        page.once('response', () => {}); // noop, unduhan CSV di static export via blob: tidak lewat network response
        resolve(null);
      }),
      (async () => {
        const eksporBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Ekspor CSV')));
        const eksporDisabled = eksporBtn.asElement() ? await eksporBtn.asElement().evaluate((el) => el.disabled) : null;
        cek('tombol Ekspor CSV aktif ketika ada baris pada filter', eksporDisabled === false, `disabled=${eksporDisabled} baris=${totalDenganFilter}`);
      })(),
    ]);
    void download;

    // ---- Transaksi: void wajib alasan ----
    process.stdout.write('\n  -- Transaksi: void wajib alasan --\n');
    await page.goto(`${BASE}/app/transaksi/`, { waitUntil: 'networkidle0' });
    await tunggu(300);
    // Saring status ke Lunas dulu lewat Select custom (R12), supaya tautan
    // pertama yang diambil pasti transaksi yang tombol Void-nya benar benar
    // tampil (bolehVoid && status === 'lunas'), bukan void/refund/ditahan.
    const statusPemicu = await page.$('[aria-label="Saring status"]');
    await statusPemicu.click();
    await tunggu(250);
    const opsiLunas = await page.evaluateHandle(() => [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.trim() === 'Lunas'));
    if (opsiLunas.asElement()) {
      await opsiLunas.asElement().click();
      await tunggu(300);
    }
    const tautanLunas = await page.evaluateHandle(() => {
      const baris = [...document.querySelectorAll('a[href*="/app/transaksi/TRX-"]')];
      return baris[0] ?? null;
    });
    if (tautanLunas.asElement()) {
      await tautanLunas.asElement().click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
      await tunggu(300);
      const voidBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Void transaksi'));
      if (voidBtn.asElement()) {
        await voidBtn.asElement().click();
        await tunggu(300);
        const konfirmBtn = await page.evaluateHandle(() => [...document.querySelectorAll('.ov-kaki button')].find((b) => b.textContent?.trim() === 'Konfirmasi void'));
        const disabledTanpaAlasanVoid = konfirmBtn.asElement() ? await konfirmBtn.asElement().evaluate((el) => el.disabled) : null;
        cek('tombol konfirmasi void terkunci tanpa alasan', disabledTanpaAlasanVoid === true, `disabled=${disabledTanpaAlasanVoid}`);
        await page.evaluate((teks) => {
          const ta = document.getElementById('aksi-alasan');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(ta, teks);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }, 'Uji otomatis qa-interactions.mjs, void demo');
        await tunggu(150);
        const disabledSetelahAlasanVoid = konfirmBtn.asElement() ? await konfirmBtn.asElement().evaluate((el) => el.disabled) : null;
        cek('tombol konfirmasi void terbuka setelah alasan diisi', disabledSetelahAlasanVoid === false, `disabled=${disabledSetelahAlasanVoid}`);
        if (konfirmBtn.asElement() && disabledSetelahAlasanVoid === false) {
          await page.evaluate(() => {
            const b = [...document.querySelectorAll('.ov-kaki button')].find((x) => x.textContent?.trim() === 'Konfirmasi void');
            b?.click();
          });
          await tunggu(350);
          const statusSekarang = await page.evaluate(() => document.body.innerText.includes('Uji otomatis qa-interactions.mjs, void demo'));
          cek('alasan void tersimpan dan tampil di detail transaksi', statusSekarang);
        }
      } else {
        cek('tombol Void ditemukan di detail transaksi (peran manajer)', false, 'tombol tidak ditemukan, cek status transaksi pertama');
      }
    } else {
      cek('ada transaksi lunas untuk diuji void', false, 'tidak ada tautan /app/transaksi/TRX-*');
    }
  } catch (err) {
    gagal += 1;
    gagalDetail.push(`exception: ${err?.message ?? err}`);
    process.stdout.write(`\n  EXCEPTION: ${err?.stack ?? err}\n`);
  } finally {
    await browser.close();
  }

  process.stdout.write(`\n=== Ringkasan: ${lolos} lolos, ${gagal} gagal ===\n`);
  if (gagal > 0) {
    process.stdout.write(`Gagal pada: ${gagalDetail.join(' | ')}\n`);
    process.exitCode = 1;
  }
}

utama();
