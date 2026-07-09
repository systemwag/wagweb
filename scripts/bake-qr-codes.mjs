/**
 * Pre-bake QR codes for the portfolio PDF.
 *
 * The portfolio brochure has two QR cards (СМР projects + design works).
 * Instead of regenerating them on every PDF render, we bake them once
 * here. Both PDF engines (Chromium-based and @react-pdf/renderer-based)
 * read the same PNGs.
 *
 * Re-run only when the destination URLs change.
 *
 * Output:
 *   public/portfolio/qr-projects.png
 *   public/portfolio/qr-design.png
 */
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'portfolio');

// QR card on the brochure sits on a cream surface, so we match that
// colour for the "light" pixels — keeps the code visually integrated.
const COLOR_DARK  = '#1A1A1A';
const COLOR_LIGHT = '#F8EFE0';

// Company domain — the brochures print www.westarlangroup.kz labels and the
// QR codes encode the same host. Re-bake if the domain changes.
const targets = [
  { url: 'https://www.westarlangroup.kz/projects',      file: 'qr-projects.png'    },
  { url: 'https://www.westarlangroup.kz/maintenance',   file: 'qr-maintenance.png' },
  { url: 'https://www.westarlangroup.kz/design',        file: 'qr-design.png'      },
  // Main company brochure — linked from the standalone DESIGN brochure so the
  // reader can jump to the full portfolio (src/app/portfolio/print/design).
  { url: 'https://www.westarlangroup.kz/portfolio.pdf', file: 'qr-portfolio-main.png' },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const t of targets) {
    const buf = await QRCode.toBuffer(t.url, {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 0,
      width: 1024,
      color: { dark: COLOR_DARK, light: COLOR_LIGHT },
    });
    const out = join(OUT_DIR, t.file);
    writeFileSync(out, buf);
    console.log(`[qr] ${t.file}  (${Math.round(buf.length / 1024)} KB)  → ${t.url}`);
  }
}

main().catch((err) => {
  console.error('[qr] Failed:', err);
  process.exit(1);
});
