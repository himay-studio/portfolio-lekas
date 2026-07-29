#!/usr/bin/env node
/** Tangkapan layar tambahan untuk kondisi terburuk (R51): dropdown terbuka,
 * laci mobile terbuka, dan panel pembayaran terbuka. Pelengkap qa-probe.mjs. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { siapkanBrowser } from './qa-setup.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = join(process.cwd(), 'qa-shots', 'ekstra');
mkdirSync(OUT, { recursive: true });

function tunggu(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function utama() {
  const { chrome } = siapkanBrowser();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'shell',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });
  const page = await browser.newPage();

  // Dropdown Select terbuka, desktop 1025px.
  await page.setViewport({ width: 1025, height: 900 });
  await page.goto(`${BASE}/app/produk/`, { waitUntil: 'networkidle0' });
  await tunggu(400);
  const pemicu = await page.$('[aria-haspopup="listbox"]');
  if (pemicu) { await pemicu.click(); await tunggu(300); }
  await page.screenshot({ path: join(OUT, 'produk-dropdown-1025.png') });

  // Laci navigasi mobile terbuka, 375px.
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/app/transaksi/`, { waitUntil: 'networkidle0' });
  await tunggu(400);
  const hamburger = await page.$('.tb-hamburger');
  if (hamburger) { await hamburger.click(); await tunggu(400); }
  await page.screenshot({ path: join(OUT, 'laci-mobile-375.png') });
  if (hamburger) { await page.keyboard.press('Escape'); await tunggu(300); }

  // Panel Bayar terbuka di Kasir, desktop 1440px.
  await page.setViewport({ width: 1440, height: 960 });
  await page.goto(`${BASE}/app/kasir/`, { waitUntil: 'networkidle0' });
  await tunggu(400);
  await page.type('#kasir-cari', '8991002103022');
  await page.keyboard.press('Enter');
  await tunggu(300);
  await page.keyboard.press('F3');
  await tunggu(400);
  await page.screenshot({ path: join(OUT, 'bayar-terbuka-1440.png') });

  // Detail produk (galeri thumbnail R18) di 768px.
  await page.setViewport({ width: 768, height: 900 });
  await page.goto(`${BASE}/app/produk/FNB-K-001/`, { waitUntil: 'networkidle0' });
  await tunggu(400);
  await page.screenshot({ path: join(OUT, 'detail-produk-768.png') });

  await browser.close();
  process.stdout.write('Tangkapan layar ekstra tersimpan di qa-shots/ekstra/\n');
}

utama();
