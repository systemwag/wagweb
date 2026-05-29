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

// TEMP: until the arlan-gr.kz domain is pointed at the Vercel deployment, the
// QR codes resolve to the live Vercel host. The brochure still PRINTS the
// arlan-gr.kz labels — only the encoded link differs. Switch back to
// arlan-gr.kz here (and re-bake) once the domain is migrated.
const targets = [
  { url: 'https://wagweb.vercel.app/projects',    file: 'qr-projects.png'    },
  { url: 'https://wagweb.vercel.app/maintenance', file: 'qr-maintenance.png' },
  { url: 'https://wagweb.vercel.app/design',      file: 'qr-design.png'      },
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
