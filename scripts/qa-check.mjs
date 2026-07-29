#!/usr/bin/env node
/**
 * Harness QA terukur untuk Lekas.
 *
 * Disalin dari `portfolio-derap` dan `portfolio-jaring`, yang sudah
 * membuktikan resepnya di runtime ini, lalu disesuaikan pada dua titik saja:
 * daftar kata berkapital sah dan pola rute contoh. Menulis ulang dari nol akan
 * mengulang penemuan yang sama dengan risiko melewatkan salah satu jebakannya.
 *
 * Setiap aturan di sini diperiksa dengan MENGUKUR di browser sungguhan, bukan
 * dengan membaca source. Itu bukan gaya, itu sebabnya: pada R50, R53, R57,
 * R58, dan R60, source yang benar dan source yang rusak terbaca sama persis,
 * jadi grep dan pembacaan stylesheet tidak akan pernah membedakannya.
 *
 * Daftar rute diambil dari hasil build `out/`, bukan ditulis tangan, supaya
 * rute baru otomatis ikut terperiksa dan tidak ada halaman yang luput.
 *
 * Pemakaian:
 *   node scripts/qa-check.mjs                 semua rute, semua breakpoint
 *   node scripts/qa-check.mjs --rute /app/    satu rute saja
 *   node scripts/qa-check.mjs --shot          plus tangkapan layar ke qa-shots/
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { siapkanBrowser } from './qa-setup.mjs';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(AKAR, 'out');
const LEBAR = [375, 480, 768, 1025, 1440];
const PORT = 4317;

const argv = process.argv.slice(2);
const ruteTerpilih = argv.includes('--rute') ? argv[argv.indexOf('--rute') + 1] : null;
const ambilShot = argv.includes('--shot');

/* Kapital di dalam kata yang memang begitu adanya. R50 mencari `[a-z][A-Z]`
   dalam SATU baris ter-render, jadi nama seperti WhatsApp harus dikecualikan
   secara eksplisit, bukan dengan melemahkan regex-nya. */
const KATA_KAPITAL_SAH = [
  'WhatsApp', 'YouTube', 'iPhone', 'JavaScript', 'GitHub', 'TypeScript', 'macOS', 'iOS',
  // Istilah yang memang ditulis begitu di antarmuka dan data demo Lekas.
  'localStorage', 'QRIS', 'NPWP', 'UMKM', 'Xprinter', 'himaystudio',
];

function rute() {
  if (!existsSync(OUT)) throw new Error('Folder out/ tidak ada. Jalankan `npm run build` dulu.');
  const hasil = [];
  const jalan = (dir) => {
    for (const nama of readdirSync(dir)) {
      const p = join(dir, nama);
      if (statSync(p).isDirectory()) jalan(p);
      else if (nama === 'index.html') {
        const rel = relative(OUT, dir).split('\\').join('/');
        hasil.push(rel === '' ? '/' : `/${rel}/`);
      }
    }
  };
  jalan(OUT);
  return hasil.sort();
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Server statis buatan sendiri, sengaja tidak memakai pustaka.
 *
 * Percobaan pertama memakai `serve-handler` dan ternyata dia menyajikan
 * DAFTAR ISI DIREKTORI, bukan `index.html`, jadi seluruh sapuan berjalan di
 * atas halaman yang salah dan melaporkan nol temuan pada R19, R20, dan R60.
 * Itu persis jebakan "pemeriksaan berjalan di atas artefak yang salah, jadi
 * lolos padahal cacatnya ikut terkirim". Server ini memetakan `/x/` ke
 * `out/x/index.html` dan tidak pernah menghasilkan daftar direktori.
 */
function server() {
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      const jalur = decodeURIComponent(req.url.split('?')[0]);
      const kandidat = extname(jalur)
        ? join(OUT, jalur)
        : join(OUT, jalur.replace(/\/$/, ''), 'index.html');
      if (!existsSync(kandidat) || statSync(kandidat).isDirectory()) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('404');
        return;
      }
      res.writeHead(200, { 'content-type': MIME[extname(kandidat)] ?? 'application/octet-stream' });
      createReadStream(kandidat).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

const masalah = [];
const catat = (aturan, rute, lebar, pesan) => masalah.push({ aturan, rute, lebar, pesan });

/* -------------------------------------------------------------------------- */

async function periksaHalaman(page, url, lebar, jalur) {
  await page.setViewport({ width: lebar, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  // Beri waktu animasi masuk 260ms selesai supaya opacity sudah final.
  await new Promise((r) => setTimeout(r, 420));

  /* R19 dan R57. Panel TERTUTUP. Panel yang cuma opacity 0 tetap memakan
     layout, jadi overflow di keadaan ini tidak muncul di screenshot mana pun. */
  const geometri = await page.evaluate(() => {
    const lebarDok = document.documentElement.scrollWidth;
    const lebarLayar = window.innerWidth;
    const pelaku = [];
    if (lebarDok > lebarLayar) {
      // Anak di dalam wadah yang memang bergulir horizontal (papan Kanban,
      // timeline, carousel snap) memang menonjol keluar viewport, dan itu
      // BUKAN overflow halaman. Kalau tidak disaring, mereka membanjiri
      // laporan dan menutupi pelaku yang sebenarnya.
      const dalamWadahGulir = (el) => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
        }
        return false;
      };
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (dalamWadahGulir(el)) return;
        if (r.right > lebarLayar + 1 || r.left < -1) {
          pelaku.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
        }
      });
    }
    return { lebarDok, lebarLayar, pelaku: pelaku.slice(0, 6) };
  });
  if (geometri.lebarDok > geometri.lebarLayar) {
    catat('R19/R57', jalur, lebar, `scrollWidth ${geometri.lebarDok} > innerWidth ${geometri.lebarLayar}. Pelaku: ${geometri.pelaku.join(' | ')}`);
  }

  /* R50. innerText per BARIS, bukan textContent. textContent menyambung node
     blok yang secara visual sudah terpisah, jadi memakainya akan melaporkan
     positif palsu pada markup yang justru sudah benar. */
  const glued = await page.evaluate((sah) => {
    const hasil = [];
    // Elemen yang tidak dirender mengembalikan textContent lewat innerText,
    // jadi <style> dan <script> akan menyetorkan seluruh isi CSS dan JS-nya
    // ke sapuan ini kalau tidak disaring lebih dulu.
    const ABAIKAN = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'TITLE', 'META', 'LINK']);
    document.querySelectorAll('body *').forEach((el) => {
      if (ABAIKAN.has(el.tagName)) return;
      // Elemen yang TIDAK dirender juga jatuh ke textContent, jadi sidebar yang
      // display:none di mobile akan melapor seluruh menunya sebagai satu baris
      // menempel. Itu positif palsu. Cacat R50 yang sungguhan selalu terlihat,
      // jadi hanya elemen yang benar benar punya kotak yang diperiksa.
      if (el.getClientRects().length === 0) return;
      if (el.children.length > 3) return;
      const t = el.innerText;
      if (!t) return;
      for (const baris of t.split('\n')) {
        let uji = baris;
        sah.forEach((w) => { uji = uji.split(w).join(''); });
        if (/[a-z][A-Z]/.test(uji)) hasil.push(baris.trim().slice(0, 90));
      }
    });
    return [...new Set(hasil)].slice(0, 8);
  }, KATA_KAPITAL_SAH);
  glued.forEach((b) => catat('R50', jalur, lebar, `Baris ter-render menempel: "${b}"`));

  /* R11 dan R58. Diperiksa pada teks TER-RENDER, bukan grep source, karena
     `&#8212;` adalah teks JSX biasa yang tidak pernah muncul sebagai karakter
     literal di source tapi tetap ter-render sebagai em dash sungguhan. */
  const dash = await page.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/.{0,40}[\u2013\u2014].{0,40}/g);
    return m ? m.slice(0, 5) : [];
  });
  dash.forEach((d) => catat('R11/R58', jalur, lebar, `Em atau en dash ter-render: "${d.trim()}"`));

  /* R20. Sapuan kontras terprogram, latar EFEKTIF ditelusuri ke atas melalui
     rantai leluhur. Membaca background-color elemen itu sendiri hampir selalu
     mengembalikan transparan dan diam diam lolos. */
  const kontras = await page.evaluate(() => {
    const lum = ([r, g, b]) => {
      const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const rasio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const urai = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null; };
    const campur = (atas, bawah, alpha) => atas.map((c, i) => c * alpha + bawah[i] * (1 - alpha));

    const latarEfektif = (el) => {
      let hasil = [255, 255, 255];
      const tumpuk = [];
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const bg = urai(getComputedStyle(n).backgroundColor);
        if (bg && (bg[3] === undefined || bg[3] > 0)) tumpuk.push(bg);
      }
      for (let i = tumpuk.length - 1; i >= 0; i -= 1) {
        const b = tumpuk[i];
        hasil = campur([b[0], b[1], b[2]], hasil, b[3] === undefined ? 1 : b[3]);
      }
      return hasil;
    };

    const gagal = [];
    const kontrol = document.querySelectorAll('button, a, input, select, textarea, [role="option"], [role="switch"], .badge, .chip, .kpi-nilai, h1, h2, h3, p, span, td, th, li');
    kontrol.forEach((el) => {
      // Kontrol nonaktif dikecualikan (WCAG 1.4.3 inactive component).
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.closest('[disabled]')) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.2) return;
      const teks = (el.innerText || '').trim();
      if (!teks) return;
      // Hanya periksa elemen yang benar benar merender teks sendiri.
      const punyaTeksSendiri = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!punyaTeksSendiri) return;

      const fg = urai(cs.color);
      if (!fg) return;
      const bg = latarEfektif(el);
      const size = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const ambang = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      const nilai = rasio([fg[0], fg[1], fg[2]], bg);
      if (nilai < ambang) {
        gagal.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0, 2).join('.')} "${teks.slice(0, 34)}" ${nilai.toFixed(2)}:1 (butuh ${ambang}) fg=${cs.color} bg=rgb(${bg.map(Math.round).join(',')})`);
      }
    });
    return [...new Set(gagal)].slice(0, 10);
  });
  kontras.forEach((k) => catat('R20', jalur, lebar, k));

  /* R60. aria-expanded WAJIB sinkron dengan panel yang benar benar terbuka.
     Membaca salah satu saja akan meloloskan build yang rusak DAN build yang
     benar. Pointer digeser menjauh dulu supaya :hover tidak menutupi keadaan
     state yang sebenarnya. */
  const pemicu = await page.$$('[aria-haspopup]');
  for (let i = 0; i < pemicu.length; i += 1) {
    const el = pemicu[i];
    const terlihat = await el.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!terlihat) continue;

    await el.click();
    await page.mouse.move(2, 2);
    await new Promise((r) => setTimeout(r, 260));

    const keadaan = await el.evaluate((n) => {
      const id = n.getAttribute('aria-controls');
      const panel = id ? document.getElementById(id) : null;
      const cs = panel ? getComputedStyle(panel) : null;
      const r = panel ? panel.getBoundingClientRect() : null;
      return {
        expanded: n.getAttribute('aria-expanded'),
        adaPanel: Boolean(panel),
        tampil: cs ? cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5 && r.height > 4 : false,
        label: (n.innerText || n.getAttribute('aria-label') || '').trim().slice(0, 30),
        kananPanel: r ? Math.round(r.right) : null,
        kiriPanel: r ? Math.round(r.left) : null,
      };
    });

    if (keadaan.adaPanel && keadaan.expanded === 'true' && !keadaan.tampil) {
      catat('R60', jalur, lebar, `Pemicu "${keadaan.label}" aria-expanded=true tapi panel tidak tampil.`);
    }
    if (keadaan.adaPanel && keadaan.tampil && keadaan.expanded !== 'true') {
      catat('R60', jalur, lebar, `Pemicu "${keadaan.label}" panel tampil tapi aria-expanded=${keadaan.expanded}.`);
    }

    /* R16.1 dan R57. Panel TERBUKA tidak boleh keluar viewport di sisi mana pun. */
    if (keadaan.tampil) {
      if (keadaan.kananPanel > lebar + 1) {
        catat('R16.1', jalur, lebar, `Panel "${keadaan.label}" tembus tepi kanan, right=${keadaan.kananPanel} > ${lebar}.`);
      }
      if (keadaan.kiriPanel < -1) {
        catat('R16.1', jalur, lebar, `Panel "${keadaan.label}" tembus tepi kiri, left=${keadaan.kiriPanel}.`);
      }
      const lebarDokBuka = await page.evaluate(() => document.documentElement.scrollWidth);
      if (lebarDokBuka > lebar) {
        catat('R19/R57', jalur, lebar, `Panel "${keadaan.label}" terbuka membuat scrollWidth ${lebarDokBuka} > ${lebar}.`);
      }
    }

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 240));
    const setelahEsc = await el.evaluate((n) => n.getAttribute('aria-expanded'));
    if (keadaan.adaPanel && setelahEsc === 'true') {
      catat('R60', jalur, lebar, `Pemicu "${keadaan.label}" masih aria-expanded=true setelah Escape.`);
    }
  }

  /* R53. Tirai navigasi mobile HARUS setinggi viewport. CSS-nya berbunyi
     `position: fixed; top: 0; bottom: 0` baik pada kasus rusak maupun benar,
     jadi satu satunya cara membedakannya adalah mengukur kotaknya. */
  if (lebar <= 1024 && jalur.startsWith('/app')) {
    const hamburger = await page.$('.tb-hamburger');
    if (hamburger) {
      await hamburger.click();
      await new Promise((r) => setTimeout(r, 320));
      const kotak = await page.evaluate(() => {
        const p = document.querySelector('.mn-panel');
        if (!p) return null;
        const r = p.getBoundingClientRect();
        return { top: Math.round(r.top), tinggi: Math.round(r.height), induk: p.parentElement?.parentElement?.tagName ?? '?' };
      });
      if (!kotak) catat('R53', jalur, lebar, 'Tirai navigasi tidak muncul saat hamburger diklik.');
      else {
        const tinggiLayar = 900;
        if (kotak.tinggi < tinggiLayar * 0.9 || kotak.top > 4) {
          catat('R53', jalur, lebar, `Tirai kolaps, top=${kotak.top} tinggi=${kotak.tinggi} seharusnya sekitar ${tinggiLayar}. Induk ${kotak.induk}.`);
        }
        if (kotak.induk !== 'BODY' && kotak.induk !== 'HTML') {
          // Portal menaruh .mn sebagai anak langsung body, jadi kakek .mn-panel adalah BODY.
          catat('R53', jalur, lebar, `Tirai tidak di-portal ke body, kakeknya ${kotak.induk}.`);
        }
      }
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 240));
    }
  }

  if (ambilShot) {
    const dir = join(AKAR, 'qa-shots', String(lebar));
    mkdirSync(dir, { recursive: true });
    const nama = jalur === '/' ? 'root' : jalur.replace(/^\/|\/$/g, '').split('/').join('_');
    await page.screenshot({ path: join(dir, `${nama}.png`), fullPage: false });
  }
}

/* R59. Semua tautan internal wajib menunjuk rute yang benar benar dibangun,
   dan setiap rute yang dibangun wajib ditautkan dari suatu tempat. */
async function periksaTautan(page, url, semuaRute) {
  await page.setViewport({ width: 1440, height: 900 });
  const kumpulan = new Set();
  for (const jalur of semuaRute) {
    await page.goto(url + jalur, { waitUntil: 'domcontentloaded' });
    const href = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
    );
    href
      .map((h) => h.split('#')[0].split('?')[0])
      // Aset statis (favicon, svg, png) bukan rute halaman, jadi tidak ikut
      // diperiksa sebagai rute. Yang diperiksa hanya tautan navigasi.
      .filter((h) => h && !extname(h))
      .forEach((h) => kumpulan.add(h.endsWith('/') ? h : `${h}/`));
  }
  const set = new Set(semuaRute);
  const rusak = [...kumpulan].filter((h) => h && !set.has(h));
  rusak.forEach((h) => catat('R59', h, 0, `Tautan internal menunjuk rute yang tidak dibangun: ${h}`));

  // `/404/` adalah halaman galat bawaan Next, dijangkau saat alamat tidak
  // dikenal dan memang tidak boleh ditautkan dari mana pun.
  const yatim = semuaRute.filter((r) => r !== '/' && r !== '/404/' && !kumpulan.has(r));
  yatim.forEach((r) => catat('R59', r, 0, `Rute dibangun tapi tidak ditautkan dari mana pun (yatim): ${r}`));
}

/* -------------------------------------------------------------------------- */

async function utama() {
  const { chrome } = siapkanBrowser();

  const semua = rute();
  const dipakai = ruteTerpilih ? semua.filter((r) => r === ruteTerpilih) : semua;
  const srv = await server();
  const url = `http://127.0.0.1:${PORT}`;

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'shell',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });

  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => catat('JS', 'runtime', 0, `Galat JavaScript: ${e.message}`));

    /* Rute unik per pola, supaya sapuan penuh tidak menghabiskan waktu di
       puluhan halaman detail yang markup-nya identik.

       Segmen dinamis di Lekas memakai HURUF BESAR (`FNB-K-001`,
       `TRX-20260729-0007`, `SH-20260729-P`), jadi polanya wajib mencakup A-Z.
       Kalau tidak, tiap SKU dan tiap nomor transaksi terhitung sebagai pola
       tersendiri dan sapuannya jadi puluhan kali lebih lama tanpa menemukan
       apa apa yang baru. */
    const STATIS = /^(app|kasir|pembayaran|produk|transaksi|shift|laporan|pengaturan|pajak|printer|pengguna|login)$/;
    const pola = new Map();
    for (const r of dipakai) {
      const kunci = r.replace(/\/([A-Za-z0-9-]+)\/$/, (m, seg) => (STATIS.test(seg) ? m : '/:x/'));
      if (!pola.has(kunci)) pola.set(kunci, r);
    }
    const contoh = [...pola.values()];

    process.stdout.write(`Memeriksa ${contoh.length} rute contoh dari ${semua.length} rute terbangun.\n`);
    for (const jalur of contoh) {
      for (const lebar of LEBAR) {
        await periksaHalaman(page, url + jalur, lebar, jalur);
      }
      process.stdout.write(`  ${jalur}\n`);
    }

    process.stdout.write('Memeriksa semua tautan internal dan halaman yatim.\n');
    await periksaTautan(page, url, semua);
  } finally {
    await browser.close();
    srv.close();
  }

  if (masalah.length === 0) {
    process.stdout.write('\nSEMUA LOLOS. Tidak ada temuan.\n');
    return;
  }
  process.stdout.write(`\n${masalah.length} TEMUAN\n`);
  const perAturan = new Map();
  masalah.forEach((m) => perAturan.set(m.aturan, [...(perAturan.get(m.aturan) ?? []), m]));
  for (const [aturan, daftar] of perAturan) {
    process.stdout.write(`\n${aturan}, ${daftar.length} temuan\n`);
    daftar.slice(0, 25).forEach((m) => process.stdout.write(`  ${m.rute} @${m.lebar}px  ${m.pesan}\n`));
    if (daftar.length > 25) process.stdout.write(`  ... ${daftar.length - 25} lagi\n`);
  }
  process.exitCode = 1;
}

utama();
