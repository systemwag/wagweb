import type { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import sharp from 'sharp';

/* ─────────────────────────────────────────────────────────────────
   Print-only image toning for the v2 brochure:
     /portfolio/print/v2/img?src=/portfolio/design/x.png&tone=blueprint
   Drawings lose their white paper and take the page's own background, so
   they sit on the page without a frame:
     blueprint  — light lines on the dark page, red (проектируемые) lines
                  in brand gold; for dark sheets
     paper      — graphite lines on the cream page, project lines in deep
                  gold; for light sheets
     mono-light — partner logos as one warm light tone (dark partners page)
   Photos are returned as they are; photo insets inside a drawing keep
   their colours (see photoMask).
   The page colours below must match --c-dark / --c-cream in
   print.module.css, otherwise the image's edge would show.
   Output is lossless PNG; build-pdf.mjs then fits it to its placed size.
   ───────────────────────────────────────────────────────────────── */

const PUBLIC = join(process.cwd(), 'public');
const ALLOWED_PREFIXES = ['/portfolio/design/', '/partners/'];
const MAX_EDGE = 3000;

type RGB = [number, number, number];
const PAGE_DARK: RGB = [4, 6, 12];        // --c-dark  #04060C
const PAGE_CREAM: RGB = [239, 226, 203];  // --c-cream #EFE2CB
const INK_LIGHT: RGB = [222, 229, 242];
const INK_GRAPHITE: RGB = [46, 42, 36];
const GOLD_ON_DARK: RGB = [230, 190, 87];
const GOLD_ON_LIGHT: RGB = [154, 107, 16];
const LOGO_LIGHT: RGB = [233, 228, 216];

const TONES = new Set(['blueprint', 'paper', 'mono-light']);

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

/** Share of mid-tone pixels: line drawings are mostly paper + thin ink, a
    photo is nearly all mid-tones. A sheet with a photo on part of it (≈0.65)
    goes through toneDrawing, which keeps the photo and tones the paper. */
function isPhotoLike(px: Buffer) {
  let mid = 0, n = 0;
  for (let i = 0; i < px.length; i += 3 * 37) {
    const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    if (l > 0.12 && l < 0.82) mid++;
    n++;
  }
  return mid / n > 0.8;
}

/* Photo insets inside a drawing (a satellite crop next to a site plan, a
   satellite sheet with a stamp) keep their colours instead of turning into
   a negative. Found on a grid of 32 px blocks:
     1. a block is photo when it is mostly mid-tones with almost no white
        paper and its neighbouring pixels differ by small amounts — the
        grain of a photo. Flat fills don't differ at all, hatching and
        lines differ in sharp jumps (measured: photo blocks ≥0.48 small
        steps, hatched fills ≤0.42);
     2. opening by 3×3 blocks drops anything thinner than ~100 px, then the
        surviving regions take back their connected blocks; enclosed gaps
        (light roofs, flat fields) are filled;
     3. the one-block ring around a region keeps only its non-paper pixels,
        so the photo's edge stays whole without a white margin. */
const BLOCK = 32;
const PHOTO = 1, EDGE = 2;
const lumOf = (px: Buffer, i: number) => (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;

function photoMask(px: Buffer, width: number, height: number) {
  const bw = Math.ceil(width / BLOCK), bh = Math.ceil(height / BLOCK);
  const at = (m: Uint8Array, x: number, y: number) => (x >= 0 && x < bw && y >= 0 && y < bh ? m[y * bw + x] : 0);
  const raw = new Uint8Array(bw * bh);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let mid = 0, paper = 0, grain = 0, n = 0;
      for (let y = by * BLOCK; y < Math.min(height, (by + 1) * BLOCK); y += 2) {
        for (let x = bx * BLOCK; x < Math.min(width - 1, (bx + 1) * BLOCK); x += 2) {
          const i = (y * width + x) * 3;
          const l = lumOf(px, i), d = Math.abs(l - lumOf(px, i + 3));
          if (l > 0.12 && l < 0.82) mid++;
          if (l > 0.88) paper++;
          if (d > 2 / 255 && d < 0.06) grain++;
          n++;
        }
      }
      raw[by * bw + bx] = n > 0 && mid > n * 0.5 && paper < n * 0.05 && grain > n * 0.45 ? 1 : 0;
    }
  }
  const morph = (src: Uint8Array, all: boolean) => {
    const out = new Uint8Array(bw * bh);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        let hit = all;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const v = at(src, x + dx, y + dy) === 1;
            hit = all ? hit && v : hit || v;
          }
        }
        out[y * bw + x] = hit ? 1 : 0;
      }
    }
    return out;
  };
  const core = morph(morph(raw, true), false);
  const stack: number[] = [];
  for (let b = 0; b < core.length; b++) if (core[b]) stack.push(b);
  while (stack.length) {
    const b = stack.pop()!;
    const x = b % bw, y = (b - x) / bw;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nb = (y + dy) * bw + x + dx;
        if (at(raw, x + dx, y + dy) && !core[nb]) { core[nb] = 1; stack.push(nb); }
      }
    }
  }
  // Gaps not reachable from the image border are inside a photo.
  const outside = new Uint8Array(bw * bh);
  for (let x = 0; x < bw; x++) stack.push(x, (bh - 1) * bw + x);
  for (let y = 0; y < bh; y++) stack.push(y * bw, y * bw + bw - 1);
  while (stack.length) {
    const b = stack.pop()!;
    if (outside[b] || core[b]) continue;
    outside[b] = 1;
    const x = b % bw, y = (b - x) / bw;
    if (x > 0) stack.push(b - 1);
    if (x < bw - 1) stack.push(b + 1);
    if (y > 0) stack.push(b - bw);
    if (y < bh - 1) stack.push(b + bw);
  }
  for (let b = 0; b < core.length; b++) if (!outside[b]) core[b] = 1;
  // Photos on a drawing sheet are rectangles: a region that mostly fills its
  // bounding box takes all of it, so flat patches on its edge stay photo.
  const seen = new Uint8Array(bw * bh);
  for (let start = 0; start < core.length; start++) {
    if (!core[start] || seen[start]) continue;
    let x0 = bw, y0 = bh, x1 = -1, y1 = -1, count = 0;
    seen[start] = 1;
    stack.push(start);
    while (stack.length) {
      const b = stack.pop()!;
      const x = b % bw, y = (b - x) / bw;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      count++;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nb = (y + dy) * bw + x + dx;
          if (at(core, x + dx, y + dy) && !seen[nb]) { seen[nb] = 1; stack.push(nb); }
        }
      }
    }
    if (count < (x1 - x0 + 1) * (y1 - y0 + 1) * 0.6) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { core[y * bw + x] = 1; seen[y * bw + x] = 1; }
  }
  const ring = morph(core, false);
  const mask = new Uint8Array(bw * bh);
  for (let b = 0; b < mask.length; b++) mask[b] = core[b] ? PHOTO : ring[b] ? EDGE : 0;
  return (x: number, y: number) => mask[Math.floor(y / BLOCK) * bw + Math.floor(x / BLOCK)];
}

function toneDrawing(px: Buffer, width: number, height: number, dark: boolean) {
  const out = Buffer.alloc(px.length);
  const bg = dark ? PAGE_DARK : PAGE_CREAM;
  const region = photoMask(px, width, height);
  for (let i = 0; i < px.length; i += 3) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const p = i / 3;
    const m = region(p % width, (p - (p % width)) / width);
    if (m === PHOTO || (m === EDGE && lumOf(px, i) <= 0.88)) {
      out[i] = r; out[i + 1] = g; out[i + 2] = b;
      continue;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const chroma = (max - min) / 255;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // Paper → 0, line → 1; thin anti-aliased strokes are thickened — more on
    // the dark page, where a faint grey hairline would vanish after the
    // drawing is scaled down to its placed size.
    const ink0 = clamp01((1 - lum - 0.05) / 0.95);
    const ink = 1 - (1 - ink0) ** (dark ? 2.8 : 1.8);
    let hue = 0;
    if (max !== min) {
      if (max === r) hue = (60 * ((g - b) / (max - min)) + 360) % 360;
      else if (max === g) hue = 60 * ((b - r) / (max - min)) + 120;
      else hue = 60 * ((r - g) / (max - min)) + 240;
    }
    const accent = chroma > 0.28 && (hue < 35 || hue > 320);
    const fg = accent ? (dark ? GOLD_ON_DARK : GOLD_ON_LIGHT) : dark ? INK_LIGHT : INK_GRAPHITE;
    const t = accent ? clamp01(Math.max(ink, chroma) * 1.4) : ink;
    out[i] = mix(bg[0], fg[0], t);
    out[i + 1] = mix(bg[1], fg[1], t);
    out[i + 2] = mix(bg[2], fg[2], t);
  }
  return out;
}

function toneLogo(px: Buffer) {
  const out = Buffer.alloc(px.length);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3] / 255;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const ink = clamp01(Math.max(1 - lum, chroma * 0.9) * 1.3 - 0.05);
    out[i] = LOGO_LIGHT[0]; out[i + 1] = LOGO_LIGHT[1]; out[i + 2] = LOGO_LIGHT[2];
    out[i + 3] = Math.round(255 * ink * a);
  }
  return out;
}

/* A brochure render asks for ~45 drawings at once, and build-pdf.mjs fetches
   each again to fit it: tone at most 4 at a time and keep the latest results.
   The cache stays small — the dev server already runs close to its 4 GB
   heap limit, and repeats come within one build anyway. */
const MAX_PARALLEL = 4;
const CACHE_LIMIT = 24;
const cache = new Map<string, Promise<Buffer>>();
let running = 0;
const queue: (() => void)[] = [];
async function limited<T>(job: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((resolve) => queue.push(resolve));
  running++;
  try {
    return await job();
  } finally {
    running--;
    queue.shift()?.();
  }
}

async function render(file: string, tone: string): Promise<Buffer> {
  const input = await readFile(file);
  const base = sharp(input).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });
  if (tone === 'mono-light') {
    const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return sharp(toneLogo(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  }
  const { data, info } = await base.flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = isPhotoLike(data) ? data : toneDrawing(data, info.width, info.height, tone === 'blueprint');
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } }).png({ compressionLevel: 6 }).toBuffer();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const src = params.get('src') ?? '';
  const tone = params.get('tone') ?? '';
  if (!TONES.has(tone) || !ALLOWED_PREFIXES.some((p) => src.startsWith(p))) {
    return new Response('bad request', { status: 400 });
  }
  // After resolving `..`, the file must still sit inside an allowed folder.
  const file = normalize(join(PUBLIC, src));
  if (!ALLOWED_PREFIXES.some((p) => file.startsWith(normalize(join(PUBLIC, p))))) {
    return new Response('bad request', { status: 400 });
  }

  const key = `${tone}|${file}`;
  if (!cache.has(key)) {
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
    cache.set(key, limited(() => render(file, tone)));
  }
  let body: Buffer;
  try {
    body = await cache.get(key)!;
  } catch {
    cache.delete(key);
    return new Response('not found', { status: 404 });
  }
  return new Response(new Uint8Array(body), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
}
