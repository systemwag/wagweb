/**
 * Render a print page (/portfolio/print/*) into a vector PDF.
 *
 * Usage (the Next.js server must already run: `npm run dev`):
 *   npm run build:pdf                     RU brochure → public/portfolio.pdf
 *   npm run build:pdf:en                  EN brochure → public/portfolio/portfolio-en.pdf
 *   PAGE=3 OUT_PDF=versions/v42_map.pdf node scripts/build-pdf.mjs   one page, for review
 *
 * Env:
 *   PRINT_URL   page to render              (default http://localhost:3000/portfolio/print)
 *   OUT_PDF     output, relative to repo or absolute (default public/portfolio.pdf,
 *               or versions/v<PAGE>_preview.pdf when PAGE is set)
 *   PAGE        render only this 1-based page
 *   PDF_TITLE   document title shown by viewers
 *   PDF_DPI     image resolution at placed size   (default 300 — print grade)
 *   PDF_JPEG_Q  JPEG quality of fitted images     (default 90)
 *   PDF_MAX_MB  size budget, build fails above it (default 20)
 *   ALLOW_SEED  =1 to publish even if the counts don't match Supabase
 *   PDF_OUTLINE =1 to add bookmarks built from the page headings
 *
 * Why it works this way (measured 2026-10-19 on the 38-page RU brochure):
 * - Chromium embeds every <img> at its source resolution: 42.5 of the 45 MB
 *   raw PDF were drawings at 400–1776 dpi. Each image is therefore re-encoded
 *   to its largest placed size at PDF_DPI before Chromium sees it — ~13 MB,
 *   same detail as before (rasterising every page to a 300 dpi JPEG was the
 *   old workaround: 25 MB, no text, and the slowest file to open).
 * - Resampling happens here, not in post-processing: PyMuPDF's
 *   rewrite_images() breaks the image patterns Chromium writes.
 * - The output is checked before it replaces the public file: missing
 *   assets, clipped text, seed data instead of Supabase, and (in
 *   optimize-pdf.py) Type3 / fallback fonts, soft masks, page count, size.
 */

import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SOURCE_URL = process.env.PRINT_URL || 'http://localhost:3000/portfolio/print';
const PAGE = process.env.PAGE;
const outArg = process.env.OUT_PDF
  || (PAGE ? `versions/v${PAGE.padStart(2, '0')}_preview.pdf` : 'public/portfolio.pdf');
const OUT = isAbsolute(outArg) ? outArg : join(ROOT, outArg);
const DPI = Number(process.env.PDF_DPI || 300);
const JPEG_Q = Number(process.env.PDF_JPEG_Q || 90);
const ALLOW_SEED = process.env.ALLOW_SEED === '1';
const OUTLINE = process.env.PDF_OUTLINE === '1';

const CSS_PX_PER_INCH = 96;

async function waitForServer(url, timeoutMs) {
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

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
  });
}

/* Bytes of a same-origin image: the public/ file when it is a plain static
   asset, otherwise whatever the server answers (e.g. the v2 brochure's
   /portfolio/print/v2/img toning route). */
async function loadImage(url) {
  const u = new URL(url);
  const file = join(PUBLIC, decodeURIComponent(u.pathname));
  if (!u.search && existsSync(file)) return readFileSync(file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/* Re-encode one image for its largest placed box. Returns null to let the
   original through untouched: transparent PNGs (QR codes, logos — tiny,
   and resampling would soften QR modules) and anything already at or below
   DPI, so nothing is ever upscaled or recompressed for no gain. */
async function fitImage(src, box) {
  if (!box.w || !box.h) return null;
  const meta = await sharp(src).metadata();
  const { width, height } = meta.autoOrient ?? meta;
  if (meta.hasAlpha || !width || !height) return null;
  // Pixels the placed bitmap needs: with object-fit: contain the image only
  // fills the box in one direction (min), otherwise it covers it (max).
  const fitScale = box.contain ? Math.min : Math.max;
  const scale = fitScale(
    (box.w / CSS_PX_PER_INCH) * DPI / width,
    (box.h / CSS_PX_PER_INCH) * DPI / height,
  );
  // Already small enough: keep it, unless it is a heavy opaque PNG (e.g. a
  // toned drawing from the v2 route) — those embed losslessly and bloat.
  if (scale >= 1 && !(meta.format === 'png' && src.length > 200 * 1024)) return null;
  const body = await sharp(src)
    .rotate() // apply EXIF orientation, as the browser does
    .resize({ width: Math.max(1, Math.round(width * Math.min(1, scale))), kernel: 'lanczos3' })
    // Baseline JPEG: progressive ones decode slower in every PDF viewer.
    .jpeg({ quality: JPEG_Q, progressive: false, chromaSubsampling: '4:4:4', trellisQuantisation: true, overshootDeringing: true, optimiseCoding: true })
    .toBuffer();
  return { body, before: src.length };
}

/* Row counts straight from Supabase REST — the same tables data.ts reads. */
async function dbRowCounts(tables) {
  try { process.loadEnvFile(join(ROOT, '.env.local')); } catch { /* optional */ }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const counts = {};
  for (const table of tables) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
    });
    const total = res.headers.get('content-range')?.split('/')[1];
    if (!res.ok || !total || total === '*') throw new Error(`${table}: HTTP ${res.status}`);
    counts[table] = Number(total);
  }
  return counts;
}

async function main() {
  console.log(`[pdf] Source: ${SOURCE_URL}${PAGE ? `  (page ${PAGE})` : ''}`);
  try {
    await waitForServer(SOURCE_URL, 5_000);
  } catch (err) {
    console.error(`\n[pdf] ERROR: ${err.message}`);
    console.error('[pdf] Start the Next.js server first: npm run dev');
    process.exit(1);
  }

  const problems = [];
  const warnings = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const tmp = join(tmpdir(), `wag-pdf-${process.pid}-${Date.now()}.pdf`);
  let report;

  // Print media: @media print rules apply (hides PrintButtons, etc.).
  const openPage = async (ctx) => {
    const p = await ctx.newPage();
    await p.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });
    await p.emulateMediaType('print');
    return p;
  };

  try {
    // Pass 1 — lay the page out and measure where every image ends up.
    console.log('[pdf] Pass 1: measuring placed image sizes...');
    const measure = await openPage(browser);
    await measure.goto(SOURCE_URL, { waitUntil: 'networkidle0', timeout: 180_000 });
    await settle(measure);
    const boxes = await measure.evaluate(() => {
      const m = {};
      for (const img of document.images) {
        if (!img.currentSrc) continue;
        const u = new URL(img.currentSrc);
        if (u.origin !== location.origin) continue;
        const r = img.getBoundingClientRect();
        const p = decodeURIComponent(u.pathname) + u.search;
        // contain only if every placement contains (the safe direction)
        const contain = ['contain', 'scale-down'].includes(getComputedStyle(img).objectFit) && (m[p]?.contain ?? true);
        m[p] = { w: Math.max(m[p]?.w ?? 0, r.width), h: Math.max(m[p]?.h ?? 0, r.height), contain };
      }
      return m;
    });
    await measure.close();

    // Pass 2 — a fresh browser context (no memory cache: a reload would keep
    // drawing the pass-1 bitmaps of cacheable images), every image fitted.
    console.log(`[pdf] Pass 2: fitting images to ${DPI} dpi and rendering...`);
    const page = await openPage(await browser.createBrowserContext());
    const origin = new URL(SOURCE_URL).origin;
    const fitted = new Map();   // key → Promise<{ before, fit }>
    let bytesBefore = 0, bytesAfter = 0;
    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      const u = new URL(req.url());
      const key = decodeURIComponent(u.pathname) + u.search;
      if (req.resourceType() !== 'image' || u.origin !== origin || !boxes[key]) return req.continue();
      try {
        if (!fitted.has(key)) {
          fitted.set(key, loadImage(req.url()).then(async (src) => ({ before: src.length, fit: await fitImage(src, boxes[key]) })));
        }
        const { fit } = await fitted.get(key);
        if (!fit) return req.continue();
        return req.respond({ status: 200, contentType: 'image/jpeg', body: fit.body });
      } catch (err) {
        warnings.push(`could not fit ${key}: ${err.message} — embedded as is`);
        return req.continue();
      }
    });
    page.on('response', (res) => {
      const type = res.request().resourceType();
      if (res.status() >= 400 && ['document', 'stylesheet', 'image', 'font'].includes(type)) {
        problems.push(`${type} ${res.status()}: ${res.url()}`);
      }
    });
    page.on('requestfailed', (req) => {
      if (['document', 'stylesheet', 'image', 'font'].includes(req.resourceType())) {
        problems.push(`${req.resourceType()} failed: ${req.url()} (${req.failure()?.errorText})`);
      }
    });
    await page.goto(SOURCE_URL, { waitUntil: 'networkidle0', timeout: 180_000 });
    await settle(page);
    for (const p of fitted.values()) {
      const r = await p.catch(() => null);
      if (!r) continue;
      bytesBefore += r.before;
      bytesAfter += r.fit ? r.fit.body.length : r.before;
    }
    console.log(`[pdf] Images: ${(bytesBefore / 1048576).toFixed(1)} MB → ${(bytesAfter / 1048576).toFixed(1)} MB`);

    // Layout checks: every image decoded, no text pushed off an A4 page
    // (pages clip with overflow:hidden, so overflow would silently vanish).
    report = await page.evaluate(() => {
      const A4 = { w: 793.7, h: 1122.5 }; // 210 × 297 mm in CSS px
      const all = [...document.querySelectorAll('body *')];
      const a4 = all.filter((el) => {
        const r = el.getBoundingClientRect();
        return Math.abs(r.width - A4.w) < 2 && Math.abs(r.height - A4.h) < 2;
      });
      const pages = a4.filter((el) => !a4.some((other) => other !== el && other.contains(el)));
      const clipped = [];
      pages.forEach((pg, i) => {
        const pr = pg.getBoundingClientRect();
        for (const el of pg.querySelectorAll('*')) {
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          // Decorative images (alt="" / aria-hidden, e.g. a watermark) may bleed on purpose.
          const contentImg = el.tagName === 'IMG' && el.getAttribute('alt') && !el.closest('[aria-hidden="true"]');
          if (!ownText && !contentImg) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const over = Math.max(r.bottom - pr.bottom, r.right - pr.right, pr.left - r.left, pr.top - r.top);
          const what = contentImg ? `image ${el.getAttribute('alt')}` : `«${el.textContent.trim().slice(0, 50)}»`;
          if (over > 1) clipped.push(`page ${i + 1}: ${what} sticks out by ${over.toFixed(0)}px`);
        }
      });
      const root = document.querySelector('[data-pages]');
      return {
        pages: pages.length,
        clipped,
        broken: [...document.images].filter((img) => img.complete && !img.naturalWidth).map((img) => img.src),
        expectPages: root ? Number(root.dataset.pages) : null,
        // SVG text drawn with an outline (the map's label halos): Chromium can
        // only write it as Type3, so optimize-pdf.py tolerates Type3 for
        // exactly these strings and nothing else.
        strokedText: [...document.querySelectorAll('svg text')]
          .filter((t) => getComputedStyle(t).stroke !== 'none')
          .map((t) => t.textContent.trim())
          .filter(Boolean),
        dbCounts: document.querySelector('[data-db-counts]')?.dataset.dbCounts ?? null,
        // Chromium builds bookmarks from heading text but drops the space at
        // every line wrap; innerText keeps it, optimize-pdf.py swaps them in.
        headings: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
          .map((h) => h.innerText.replace(/\s+/g, ' ').trim()),
      };
    });
    problems.push(...report.clipped, ...report.broken.map((src) => `image did not load: ${src}`));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      // PDF_OUTLINE=1: bookmarks from the page headings (Chromium needs a
      // tagged PDF for that).
      tagged: OUTLINE,
      outline: OUTLINE,
      ...(PAGE ? { pageRanges: PAGE } : {}),
    });
    writeFileSync(tmp, pdfBuffer);
  } finally {
    await browser.close();
  }

  // The counts printed in the brochure must be the live Supabase row counts.
  if (report.dbCounts) {
    const printed = JSON.parse(report.dbCounts);
    try {
      const live = await dbRowCounts(Object.keys(printed));
      if (!live) {
        (ALLOW_SEED ? warnings : problems).push('Supabase is not configured (.env.local) — the brochure shows seed counts');
      } else {
        const off = Object.keys(printed).filter((t) => printed[t] !== live[t]);
        if (off.length) {
          (ALLOW_SEED ? warnings : problems).push(
            `printed counts differ from Supabase (${off.map((t) => `${t}: ${printed[t]} vs ${live[t]}`).join(', ')}) — rendered from the seed fallback?`,
          );
        }
      }
    } catch (err) {
      (ALLOW_SEED ? warnings : problems).push(`could not verify counts against Supabase: ${err.message}`);
    }
  }

  // Pack + verify the PDF itself (fonts, soft masks, page count, size).
  console.log('[pdf] Packing and verifying...');
  const py = spawnSync(
    process.platform === 'win32' ? 'python' : 'python3',
    [join(__dirname, 'optimize-pdf.py'), tmp],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        EXPECT_PAGES: !PAGE && report.expectPages ? String(report.expectPages) : '',
        STROKED_TEXT: JSON.stringify(report.strokedText),
        OUTLINE_TITLES: OUTLINE ? JSON.stringify(report.headings) : '',
      },
    },
  );
  if (py.error || py.status === null) {
    problems.push(`optimize-pdf.py did not run (${py.error?.message ?? 'killed'}) — install Python with: pip install pymupdf`);
  } else if (py.status !== 0) {
    problems.push('optimize-pdf.py rejected the PDF (see above)');
  }

  for (const w of warnings) console.warn(`[pdf] warning: ${w}`);
  if (problems.length) {
    console.error(`\n[pdf] FAILED — ${OUT} was NOT replaced:`);
    for (const p of problems) console.error(`  ✗ ${p}`);
    if (existsSync(tmp)) console.error(`[pdf] Rejected draft kept for inspection: ${tmp}`);
    process.exit(1);
  }

  mkdirSync(dirname(OUT), { recursive: true });
  try {
    copyFileSync(tmp, OUT);
  } catch (err) {
    console.error(`[pdf] Could not replace ${OUT} (likely open in a viewer): ${err.message}`);
    console.error(`[pdf] The finished PDF is at: ${tmp}`);
    process.exit(1);
  }
  unlinkSync(tmp);
  console.log(`[pdf] OK: ${OUT}  (${(statSync(OUT).size / 1048576).toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error('[pdf] Failed:', err);
  process.exit(1);
});
