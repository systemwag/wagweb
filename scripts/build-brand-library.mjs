/**
 * Build generated assets for brand-library/:
 *   - 02-colors/wag-web.ase, wag-print.ase, wag-print-cmyk.ase (Adobe Swatch Exchange)
 *   - 02-colors/palette-web.svg, palette-print.svg, gradients.svg (eyedropper sheets)
 *   - 02-colors/palette-sheet.pdf (vector, 3 pages, via Puppeteer)
 *   - 01-logos/pdf/*.pdf   (vector PDF per logo SVG)
 *   - 01-logos/png/*.png   (transparent raster, 512/1024/2048 px)
 *   - 05-graphics/qr-*.svg (vector QR codes)
 *
 * Usage: node scripts/build-brand-library.mjs
 * No dev server required.
 */

import { writeFileSync, readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIB = join(ROOT, 'brand-library');

/* ════════════════════════════════════════════════════════════════
   PALETTES (source of truth: src/app/globals.css +
   src/app/portfolio/print/print.module.css)
   ════════════════════════════════════════════════════════════════ */

const WEB_PALETTE = [
  { name: 'WAG Web/bg-primary',     hex: '#04060C', note: 'основной тёмный фон' },
  { name: 'WAG Web/bg-secondary',   hex: '#070B16', note: 'вторичный фон секций' },
  { name: 'WAG Web/gold',           hex: '#D4A843', note: 'основной золотой' },
  { name: 'WAG Web/gold-light',     hex: '#F0C85A', note: 'светлый золотой' },
  { name: 'WAG Web/gold-dark',      hex: '#C49A30', note: 'тёмный стоп градиента' },
  { name: 'WAG Web/teal',           hex: '#00C4A7', note: 'вторичный акцент' },
  { name: 'WAG Web/teal-light',     hex: '#00DDB8', note: 'светлый teal' },
  { name: 'WAG Web/blue',           hex: '#4F84FF', note: 'третичный акцент' },
  { name: 'WAG Web/error',          hex: '#FF5050', note: 'ошибки/предупреждения' },
  { name: 'WAG Web/text-primary',   hex: '#F0F2F8', note: 'основной текст' },
  { name: 'WAG Web/text-secondary', hex: '#8892A4', note: 'вторичный текст' },
  { name: 'WAG Web/text-muted',     hex: '#4A5568', note: 'приглушённый текст' },
];

const PRINT_PALETTE = [
  { name: 'WAG Print/dark',         hex: '#04060C', note: 'тёмные полосы/обложка' },
  { name: 'WAG Print/dark-2',       hex: '#0A1124', note: 'боксы на тёмном' },
  { name: 'WAG Print/cream',        hex: '#EFE2CB', note: 'основной кремовый фон' },
  { name: 'WAG Print/cream-card',   hex: '#F8EFE0', note: 'карточки на кремовом' },
  { name: 'WAG Print/cream-card-2', hex: '#F2E6CF', note: 'альтернативный тон карточек' },
  { name: 'WAG Print/ink',          hex: '#1A1A1A', note: 'основной текст на светлом' },
  { name: 'WAG Print/ink-2',        hex: '#4A4032', note: 'вторичный текст' },
  { name: 'WAG Print/muted',        hex: '#8A7B5C', note: 'приглушённый текст' },
  { name: 'WAG Print/gold',         hex: '#C9941F', note: 'печатный золотой (paper-safe)' },
  { name: 'WAG Print/gold-2',       hex: '#B07F1C', note: 'тёмный золотой' },
  { name: 'WAG Print/gold-soft',    hex: '#E6BE57', note: 'мягкий золотой' },
  { name: 'WAG Print/teal',         hex: '#00A88E', note: 'печатный teal' },
  { name: 'WAG Print/teal-soft',    hex: '#1AC2A6', note: 'мягкий teal' },
  { name: 'WAG Print/blue',         hex: '#4F84FF', note: 'третичный синий' },
  { name: 'WAG Print/meta',         hex: '#6E6555', note: 'служебные подписи' },
  { name: 'WAG Print/meta-soft',    hex: '#9D9181', note: 'светлые служебные подписи' },
];

/* ════════════════════════════════════════════════════════════════
   Color helpers
   ════════════════════════════════════════════════════════════════ */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToCmyk([r, g, b]) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const k = 1 - Math.max(rf, gf, bf);
  if (k >= 1) return [0, 0, 0, 1];
  return [
    (1 - rf - k) / (1 - k),
    (1 - gf - k) / (1 - k),
    (1 - bf - k) / (1 - k),
    k,
  ];
}

const cmykLabel = (hex) =>
  rgbToCmyk(hexToRgb(hex)).map((v) => Math.round(v * 100)).join(' ');

/* ════════════════════════════════════════════════════════════════
   ASE writer (Adobe Swatch Exchange)
   Format: "ASEF" | ver u16 u16 | blockCount u32 | blocks…
   Block:  type u16 (0xC001 group start / 0x0001 color / 0xC002 end)
           length u32 | data
   Color:  nameLen u16 (chars incl. NUL) | UTF-16BE name | NUL |
           model 4 bytes ("RGB " / "CMYK") | floats BE | type u16
   ════════════════════════════════════════════════════════════════ */

function utf16be(str) {
  const buf = Buffer.alloc((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) buf.writeUInt16BE(str.charCodeAt(i), i * 2);
  return buf; // includes trailing NUL
}

function aseColorBlock(name, values, model) {
  const nameBuf = utf16be(name);
  const floats = Buffer.alloc(values.length * 4);
  values.forEach((v, i) => floats.writeFloatBE(v, i * 4));
  const data = Buffer.concat([
    Buffer.from([(name.length + 1) >> 8, (name.length + 1) & 0xff]),
    nameBuf,
    Buffer.from(model, 'ascii'), // "RGB " or "CMYK"
    floats,
    Buffer.from([0x00, 0x00]),   // 0 = global swatch
  ]);
  const head = Buffer.alloc(6);
  head.writeUInt16BE(0x0001, 0);
  head.writeUInt32BE(data.length, 2);
  return Buffer.concat([head, data]);
}

function aseGroupStart(name) {
  const nameBuf = utf16be(name);
  const data = Buffer.concat([
    Buffer.from([(name.length + 1) >> 8, (name.length + 1) & 0xff]),
    nameBuf,
  ]);
  const head = Buffer.alloc(6);
  head.writeUInt16BE(0xc001, 0);
  head.writeUInt32BE(data.length, 2);
  return Buffer.concat([head, data]);
}

function aseGroupEnd() {
  const b = Buffer.alloc(6);
  b.writeUInt16BE(0xc002, 0);
  b.writeUInt32BE(0, 2);
  return b;
}

function buildAse(groupName, colors, mode /* 'rgb' | 'cmyk' */) {
  const blocks = [aseGroupStart(groupName)];
  for (const c of colors) {
    const shortName = c.name.split('/').pop();
    if (mode === 'cmyk') {
      blocks.push(aseColorBlock(shortName, rgbToCmyk(hexToRgb(c.hex)), 'CMYK'));
    } else {
      blocks.push(aseColorBlock(shortName, hexToRgb(c.hex).map((v) => v / 255), 'RGB '));
    }
  }
  blocks.push(aseGroupEnd());
  const body = Buffer.concat(blocks);
  const header = Buffer.alloc(12);
  header.write('ASEF', 0, 'ascii');
  header.writeUInt16BE(1, 4);
  header.writeUInt16BE(0, 6);
  header.writeUInt32BE(blocks.length, 8);
  return Buffer.concat([header, body]);
}

/* ════════════════════════════════════════════════════════════════
   Palette sheet SVG (A4, eyedropper-ready squares)
   ════════════════════════════════════════════════════════════════ */

const A4W = 794, A4H = 1123; // 96 dpi px

function paletteSheetSvg({ title, subtitle, colors, dark }) {
  const bg = dark ? '#04060C' : '#F8EFE0';
  const fgTitle = dark ? '#F0F2F8' : '#1A1A1A';
  const fgLabel = dark ? '#8892A4' : '#4A4032';
  const accent = dark ? '#D4A843' : '#C9941F';
  const cols = 3, sw = 190, sh = 130, gapX = 42, gapY = 92;
  const startX = 64, startY = 150;

  let cells = '';
  colors.forEach((c, i) => {
    const x = startX + (i % cols) * (sw + gapX);
    const y = startY + Math.floor(i / cols) * (sh + gapY);
    const border = dark ? 'rgba(255,255,255,0.18)' : 'rgba(26,26,26,0.18)';
    const [r, g, b] = hexToRgb(c.hex);
    cells += `
  <g>
    <rect x="${x}" y="${y}" width="${sw}" height="${sh}" fill="${c.hex}" stroke="${border}" stroke-width="1"/>
    <text x="${x}" y="${y + sh + 22}" fill="${fgTitle}" font-size="14" font-weight="700" letter-spacing="0.5">${c.name.split('/').pop()}</text>
    <text x="${x}" y="${y + sh + 41}" fill="${accent}" font-size="13" font-family="Courier New, monospace">${c.hex.toUpperCase()}</text>
    <text x="${x}" y="${y + sh + 58}" fill="${fgLabel}" font-size="11">RGB ${r} ${g} ${b} · CMYK ${cmykLabel(c.hex)}</text>
    <text x="${x}" y="${y + sh + 74}" fill="${fgLabel}" font-size="11">${c.note}</text>
  </g>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${A4W} ${A4H}" font-family="Onest, Arial, sans-serif">
  <rect width="${A4W}" height="${A4H}" fill="${bg}"/>
  <text x="64" y="72" fill="${fgTitle}" font-size="30" font-weight="700" letter-spacing="3">${title}</text>
  <text x="64" y="100" fill="${fgLabel}" font-size="14">${subtitle}</text>
  <line x1="64" y1="118" x2="${A4W - 64}" y2="118" stroke="${accent}" stroke-width="1.5" opacity="0.6"/>
  ${cells}
  <text x="64" y="${A4H - 40}" fill="${fgLabel}" font-size="11">West Arlan Group · Brand Library · CMYK — ориентир (уточнить по профилю типографии)</text>
</svg>`;
}

/* ════════════════════════════════════════════════════════════════
   Gradients sheet SVG
   ════════════════════════════════════════════════════════════════ */

function gradientsSheetSvg() {
  const rows = [
    {
      id: 'g1', title: 'Logo Gold — фирменный градиент знака (135°)',
      stops: [['0%', '#D4A843'], ['50%', '#F0C85A'], ['100%', '#C49A30']],
      spec: '#D4A843 → 50% #F0C85A → #C49A30 · linear 135°',
    },
    {
      id: 'g2', title: 'Text Gold — градиент заголовков (135°)',
      stops: [['0%', '#D4A843'], ['60%', '#F0C85A'], ['100%', '#FAE08A']],
      spec: '#D4A843 → 60% #F0C85A → #FAE08A · linear 135°',
    },
    {
      id: 'g3', title: 'Text Teal — teal-акцент (135°)',
      stops: [['0%', '#00C4A7'], ['100%', '#00DDB8']],
      spec: '#00C4A7 → #00DDB8 · linear 135°',
    },
    {
      id: 'g4', title: 'Print CTA Gold — кнопки/плашки в печати (135°)',
      stops: [['0%', '#C9941F'], ['100%', '#F0C85A']],
      spec: '#C9941F → #F0C85A · linear 135°',
    },
    {
      id: 'g5', title: 'Button Beam — «луч» бордюра кнопки (развёртка conic)',
      stops: [['0%', 'rgba(0,196,167,0)'], ['55%', 'rgba(0,196,167,0)'], ['74%', 'rgba(0,196,167,0.9)'], ['88%', 'rgba(212,168,67,0.95)'], ['100%', 'rgba(212,168,67,0)']],
      spec: 'conic: transparent 55% → teal 90% @74% → gold 95% @88% → transparent · вращение 3.2s',
      checker: true,
    },
    {
      id: 'g6', title: 'Glass Stripe — золотая линия карточек (90°)',
      stops: [['0%', '#D4A843'], ['65%', 'rgba(212,168,67,0)']],
      spec: '#D4A843 → transparent 65% · linear 90° · высота 2px',
      checker: true,
    },
    {
      id: 'g7', title: 'Dark Background — фоновая заливка секций (180°)',
      stops: [['0%', '#04060C'], ['100%', '#070B16']],
      spec: '#04060C → #070B16 · linear 180°',
    },
  ];

  let defs = '', bars = '';
  rows.forEach((r, i) => {
    const y = 150 + i * 128;
    defs += `<linearGradient id="${r.id}" x1="0%" y1="0%" x2="100%" y2="0%">${r.stops
      .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
      .join('')}</linearGradient>`;
    const checker = r.checker
      ? `<rect x="64" y="${y + 24}" width="${A4W - 128}" height="44" fill="#04060C"/>`
      : '';
    bars += `
  <text x="64" y="${y}" fill="#F0F2F8" font-size="15" font-weight="700">${r.title}</text>
  <text x="64" y="${y + 18}" fill="#8892A4" font-size="11.5" font-family="Courier New, monospace">${r.spec}</text>
  ${checker}
  <rect x="64" y="${y + 24}" width="${A4W - 128}" height="44" fill="url(#${r.id})" stroke="rgba(255,255,255,0.15)" stroke-width="0.75"/>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${A4W} ${A4H}" font-family="Onest, Arial, sans-serif">
  <defs>${defs}</defs>
  <rect width="${A4W}" height="${A4H}" fill="#04060C"/>
  <text x="64" y="72" fill="#F0F2F8" font-size="30" font-weight="700" letter-spacing="3">WAG · GRADIENTS</text>
  <text x="64" y="100" fill="#8892A4" font-size="14">Точные стопы фирменных градиентов. В Illustrator собираются скриптом scripts/setup-illustrator.jsx</text>
  <line x1="64" y1="118" x2="${A4W - 64}" y2="118" stroke="#D4A843" stroke-width="1.5" opacity="0.6"/>
  ${bars}
  <text x="64" y="${A4H - 40}" fill="#8892A4" font-size="11">West Arlan Group · Brand Library · углы указаны в CSS-конвенции (135° = ↘)</text>
</svg>`;
}

/* ════════════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════════════ */

async function main() {
  const colorsDir = join(LIB, '02-colors');
  const logosDir = join(LIB, '01-logos');
  const graphicsDir = join(LIB, '05-graphics');
  mkdirSync(colorsDir, { recursive: true });
  mkdirSync(join(logosDir, 'pdf'), { recursive: true });
  mkdirSync(join(logosDir, 'png'), { recursive: true });
  mkdirSync(graphicsDir, { recursive: true });

  /* 1 ── ASE */
  writeFileSync(join(colorsDir, 'wag-web.ase'), buildAse('WAG Web (RGB)', WEB_PALETTE, 'rgb'));
  writeFileSync(join(colorsDir, 'wag-print.ase'), buildAse('WAG Print (RGB)', PRINT_PALETTE, 'rgb'));
  writeFileSync(join(colorsDir, 'wag-print-cmyk.ase'), buildAse('WAG Print (CMYK)', PRINT_PALETTE, 'cmyk'));
  console.log('[brand] ASE x3 written');

  /* 2 ── Palette sheets */
  const webSheet = paletteSheetSvg({
    title: 'WAG · WEB PALETTE',
    subtitle: 'Экранная палитра сайта (RGB). Квадраты — под инструмент «Пипетка».',
    colors: WEB_PALETTE,
    dark: true,
  });
  const printSheet = paletteSheetSvg({
    title: 'WAG · PRINT PALETTE',
    subtitle: 'Печатная палитра брошюры (крем/золото). Для КП, визиток, полиграфии.',
    colors: PRINT_PALETTE,
    dark: false,
  });
  const gradSheet = gradientsSheetSvg();
  writeFileSync(join(colorsDir, 'palette-web.svg'), webSheet);
  writeFileSync(join(colorsDir, 'palette-print.svg'), printSheet);
  writeFileSync(join(colorsDir, 'gradients.svg'), gradSheet);
  console.log('[brand] palette sheets written');

  /* 3 ── QR codes (vector SVG) */
  const qrTargets = [
    ['qr-site', 'https://westarlangroup.kz'],
    ['qr-projects', 'https://westarlangroup.kz/projects'],
    ['qr-design', 'https://westarlangroup.kz/design'],
  ];
  for (const [name, url] of qrTargets) {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 0,
      color: { dark: '#1A1A1AFF', light: '#00000000' },
    });
    writeFileSync(join(graphicsDir, `${name}.svg`), svg.replace('<svg ', `<!-- ${url} -->\n<svg `));
  }
  console.log('[brand] QR x3 written');

  /* 4 ── PNG exports (sharp) */
  const logoFiles = readdirSync(logosDir).filter((f) => f.endsWith('.svg') && f !== 'clearspace-guide.svg');
  for (const f of logoFiles) {
    const svgPath = join(logosDir, f);
    const svg = readFileSync(svgPath);
    const vbMatch = svg.toString().match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if (!vbMatch) { console.warn(`[brand] no viewBox in ${f}, skipping PNG`); continue; }
    const vbW = parseFloat(vbMatch[1]);
    for (const width of [512, 1024, 2048]) {
      const density = (72 * width) / vbW;
      await sharp(svg, { density })
        .resize({ width })
        .png()
        .toFile(join(logosDir, 'png', f.replace('.svg', `-${width}px.png`)));
    }
  }
  console.log(`[brand] PNG exports written (${logoFiles.length} logos x3 sizes)`);

  /* 5 ── PDF via Puppeteer (vector) */
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();

    // 5a: palette sheet PDF — 3 A4 pages
    const paletteHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
      @page { size: A4 portrait; margin: 0; }
      html,body { margin: 0; padding: 0; }
      .pg { width: 210mm; height: 297mm; page-break-after: always; overflow: hidden; }
      .pg svg { display: block; width: 210mm; height: 297mm; }
    </style></head><body>
      <div class="pg">${webSheet.replace(/^<\?xml[^>]*\?>/, '')}</div>
      <div class="pg">${printSheet.replace(/^<\?xml[^>]*\?>/, '')}</div>
      <div class="pg">${gradSheet.replace(/^<\?xml[^>]*\?>/, '')}</div>
    </body></html>`;
    await page.setContent(paletteHtml, { waitUntil: 'networkidle0' });
    const palettePdf = await page.pdf({
      format: 'A4', printBackground: true, preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    writeFileSync(join(colorsDir, 'palette-sheet.pdf'), palettePdf);
    console.log('[brand] palette-sheet.pdf written');

    // 5b: logo PDFs — page sized to logo aspect, 180mm wide
    for (const f of [...logoFiles, 'clearspace-guide.svg']) {
      const svg = readFileSync(join(logosDir, f), 'utf8');
      const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      if (!vb) continue;
      const ratio = parseFloat(vb[2]) / parseFloat(vb[1]);
      const wMm = 180, hMm = Math.round(wMm * ratio * 100) / 100;
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>
        @page { size: ${wMm}mm ${hMm}mm; margin: 0; }
        html,body { margin: 0; padding: 0; }
        svg { display: block; width: ${wMm}mm; height: ${hMm}mm; }
      </style></head><body>${svg.replace(/^<\?xml[^>]*\?>/, '')}</body></html>`;
      await page.setContent(html, { waitUntil: 'load', timeout: 90_000 });
      const pdf = await page.pdf({
        width: `${wMm}mm`, height: `${hMm}mm`, printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      writeFileSync(join(logosDir, 'pdf', f.replace('.svg', '.pdf')), pdf);
    }
    console.log('[brand] logo PDFs written');
  } finally {
    await browser.close();
  }

  console.log('[brand] DONE');
}

main().catch((err) => {
  console.error('[brand] Failed:', err);
  process.exit(1);
});
