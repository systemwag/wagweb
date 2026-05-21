/**
 * Tilda image scraper
 * Usage: node scrape_tilda.mjs
 *
 * Crawls arlan-gr.kz, finds all images on tildacdn.com, downloads to ./tilda-images/
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

const START_URL   = 'https://arlan-gr.kz/';
const OUT_DIR     = path.join(process.cwd(), 'tilda-images');
const MAX_PAGES   = 60;
const CONCURRENCY = 6;

const visited = new Set();
const toVisit = [START_URL];
const images  = new Set();

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (scraper)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function extractImages(html) {
  /* Tilda CDN patterns: https://static.tildacdn.com/... , https://thb.tildacdn.com/... */
  const re = /https?:\/\/(?:static|thb|optim)\.tildacdn\.(?:com|one|net|ru|info|biz|pro|info)\/[^\s"'<>)]+\.(?:jpe?g|png|webp|gif|svg)/gi;
  return html.match(re) ?? [];
}

function extractLinks(html, baseUrl) {
  const re = /href=["']([^"']+)["']/gi;
  const links = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const u = new URL(m[1], baseUrl);
      if (u.hostname === new URL(START_URL).hostname) {
        u.hash = '';
        links.push(u.href);
      }
    } catch {}
  }
  return links;
}

async function downloadImage(url) {
  try {
    const u = new URL(url);
    /* Preserve CDN subpath so names don't collide */
    const name = u.pathname.split('/').filter(Boolean).slice(-2).join('_');
    const filePath = path.join(OUT_DIR, name);
    if (existsSync(filePath)) return { url, skipped: true };
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(filePath, buf);
    return { url, filePath, bytes: buf.length };
  } catch (e) {
    return { url, error: e.message };
  }
}

async function runPool(items, worker, size = CONCURRENCY) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  /* ── 1. Crawl pages ──────────────────────────── */
  console.log('Crawling pages…');
  while (toVisit.length && visited.size < MAX_PAGES) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await fetchText(url);
      const imgs  = extractImages(html);
      const links = extractLinks(html, url);
      imgs.forEach((i) => images.add(i));
      links.forEach((l) => { if (!visited.has(l)) toVisit.push(l); });
      console.log(`  [${visited.size}] ${url} → +${imgs.length} imgs, +${links.length} links`);
    } catch (e) {
      console.log(`  ✗ ${url}: ${e.message}`);
    }
  }

  console.log(`\nFound ${images.size} unique images across ${visited.size} pages.`);

  /* ── 2. Download images ──────────────────────── */
  console.log('\nDownloading…');
  const list = [...images];
  const results = await runPool(list, async (url, idx) => {
    const r = await downloadImage(url);
    const status = r.skipped ? 'skip' : r.error ? `ERR ${r.error}` : `${(r.bytes/1024).toFixed(0)}kb`;
    console.log(`  [${idx + 1}/${list.length}] ${status}  ${url.split('/').pop()}`);
    return r;
  });

  const ok      = results.filter((r) => !r.error && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed  = results.filter((r) => r.error).length;
  console.log(`\nDone: ${ok} downloaded, ${skipped} already present, ${failed} failed.`);
  console.log(`Output: ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
