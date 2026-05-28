/**
 * Single-page PDF render for iterative review.
 *
 * Sister script to build-pdf.mjs — same Puppeteer flow, but:
 *  - uses pageRanges to extract just one page (PAGE env)
 *  - writes to versions/<file> by default
 *  - still runs optimize-pdf.py for fidelity with the final brochure
 *
 * Requires `npm run dev` to be already running.
 *
 * Usage:
 *   PAGE=1 OUT_PDF=versions/v01_cover-text-rework.pdf node scripts/build-pdf-page.mjs
 *   PAGE=3 OUT_PDF=versions/v02_about-headline.pdf       node scripts/build-pdf-page.mjs
 *
 * Env:
 *   PAGE       — 1-based page index in the brochure (default: 1)
 *   OUT_PDF    — output path relative to repo root (default: versions/v<PAGE>_preview.pdf)
 *   PRINT_URL  — print source URL (default: http://localhost:3000/portfolio/print)
 *   RASTERIZE  — 0|1, forwarded to optimize-pdf.py (default: 1)
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PAGE = String(process.env.PAGE ?? '1');
const OUT = process.env.OUT_PDF
  ? join(ROOT, process.env.OUT_PDF)
  : join(ROOT, 'versions', `v${PAGE.padStart(2, '0')}_preview.pdf`);
const URL = process.env.PRINT_URL || 'http://localhost:3000/portfolio/print';

async function waitForServer(url, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server not reachable at ${url}: ${lastErr?.message ?? 'timeout'}`);
}

async function main() {
  console.log(`[page-pdf] Source: ${URL}`);
  console.log(`[page-pdf] Page:   ${PAGE}`);
  console.log(`[page-pdf] Out:    ${OUT}`);

  try {
    await waitForServer(URL);
  } catch (err) {
    console.error(`\n[page-pdf] ERROR: ${err.message}`);
    console.error('[page-pdf] Start the Next.js server first: npm run dev');
    process.exit(1);
  }

  console.log('[page-pdf] Launching headless Chromium...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });
    await page.emulateMediaType('print');

    console.log('[page-pdf] Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120_000 });

    console.log('[page-pdf] Waiting for fonts and images...');
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener('load', res, { once: true });
                img.addEventListener('error', res, { once: true });
              }),
        ),
      );
    });

    console.log(`[page-pdf] Rendering page ${PAGE}...`);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      tagged: false,
      outline: false,
      pageRanges: PAGE,
    });

    mkdirSync(dirname(OUT), { recursive: true });
    const tmp = join(dirname(OUT), `.${basename(OUT)}.tmp-${Date.now()}`);
    writeFileSync(tmp, pdfBuffer);
    try {
      if (existsSync(OUT)) unlinkSync(OUT);
      renameSync(tmp, OUT);
    } catch (err) {
      console.warn(`[page-pdf] Could not replace ${OUT} (likely open in a viewer).`);
      console.warn(`[page-pdf] PDF saved to: ${tmp}`);
      throw err;
    }

    const sizeKb = Math.round(pdfBuffer.length / 1024);
    console.log(`[page-pdf] OK: ${OUT}  (${sizeKb} KB)`);
  } finally {
    await browser.close();
  }

  console.log('[page-pdf] Optimizing...');
  const py = spawnSync(
    process.platform === 'win32' ? 'python' : 'python3',
    [join(__dirname, 'optimize-pdf.py'), OUT],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        RASTERIZE: process.env.RASTERIZE ?? '1',
      },
    },
  );
  if (py.status !== 0) {
    console.warn('[page-pdf] WARNING: optimization step failed (PDF still produced).');
  }
}

main().catch((err) => {
  console.error('[page-pdf] Failed:', err);
  process.exit(1);
});
