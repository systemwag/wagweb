/**
 * Generate static PDF brochure from /portfolio/print page.
 *
 * Usage:
 *   1. Start dev (or prod) server in another terminal:  npm run dev
 *   2. In a separate terminal:                          npm run pdf
 *
 * Output: public/portfolio.pdf
 *
 * Override the source URL with env PRINT_URL if your server runs elsewhere.
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = process.env.OUT_PDF
  ? join(ROOT, process.env.OUT_PDF)
  : join(ROOT, 'public', 'portfolio.pdf');
const URL = process.env.PRINT_URL || 'http://localhost:3000/portfolio/print';

async function waitForServer(url, timeoutMs = 30_000) {
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
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not reachable at ${url}: ${lastErr?.message ?? 'timeout'}`);
}

async function main() {
  console.log(`[pdf] Source: ${URL}`);
  console.log('[pdf] Checking server...');
  try {
    await waitForServer(URL, 5_000);
  } catch (err) {
    console.error(`\n[pdf] ERROR: ${err.message}`);
    console.error('[pdf] Start the Next.js server first: npm run dev');
    process.exit(1);
  }

  console.log('[pdf] Launching headless Chromium...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });

    // Emulate print media so @media print rules apply (hides PrintButtons,
    // sets cream background overrides, etc.).
    await page.emulateMediaType('print');

    console.log('[pdf] Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120_000 });

    console.log('[pdf] Waiting for fonts and images...');
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

    console.log('[pdf] Rendering PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      tagged:  false,      // skip accessibility tag tree → smaller file
      outline: false,      // no bookmark outline tree
    });

    mkdirSync(dirname(OUT), { recursive: true });
    // Write to a temp file first, then atomically replace.
    // This works even if the target is locked by a PDF viewer.
    const tmp = join(dirname(OUT), `.${basename(OUT)}.tmp-${Date.now()}`);
    writeFileSync(tmp, pdfBuffer);
    try {
      if (existsSync(OUT)) unlinkSync(OUT);
      renameSync(tmp, OUT);
    } catch (err) {
      console.warn(`[pdf] Could not replace ${OUT} (likely open in a viewer).`);
      console.warn(`[pdf] PDF saved to: ${tmp}`);
      console.warn('[pdf] Close the viewer and rename the temp file, or rerun.');
      throw err;
    }

    const sizeKb = Math.round(pdfBuffer.length / 1024);
    console.log(`[pdf] OK: ${OUT}  (${sizeKb} KB)`);
  } finally {
    await browser.close();
  }

  // Post-process: rasterize heavy pages + linearize for fast viewer rendering.
  // RASTERIZE=1 by default — turns the dark-bg pages (cover/scale/map/direction/contacts)
  // into single JPEGs at 200 DPI. Trade-off: text on those pages stops being
  // selectable, but the file shrinks ~2× and opens instantly.
  // Pass RASTERIZE=0 in env to opt out.
  console.log('[pdf] Optimizing for fast viewer rendering...');
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
    console.warn('[pdf] WARNING: optimization step failed (PDF still produced).');
    console.warn('[pdf] Make sure Python with pymupdf is installed: pip install pymupdf');
  }
}

main().catch((err) => {
  console.error('[pdf] Failed:', err);
  process.exit(1);
});
