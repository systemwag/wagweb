/**
 * Download Noto Sans TTF files (full Cyrillic incl. Kazakh + Latin).
 *
 * Why Noto Sans (not Inter, not Roboto):
 *   - Inter ships only as OTF/CFF — fontkit's subsetter fails ("Offset is
 *     outside the bounds of the DataView")
 *   - Roboto has standard Russian Cyrillic but is missing Kazakh letters
 *     (Қ, ұ, і) used in partner names like «Қазақстан Темір Жолы» and
 *     «АлтынНұран». Same fontkit error on missing-glyph encode.
 *   - Noto Sans is Google's "no tofu" universal font — every character
 *     used in the WAG content has a real glyph.
 *
 * One-time setup — saves to public/fonts/noto/.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'fonts', 'noto');

const NOTO_BASE = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans';
const NOTO_FILES = [
  'NotoSans-Regular.ttf', 'NotoSans-Medium.ttf', 'NotoSans-SemiBold.ttf',
  'NotoSans-Bold.ttf', 'NotoSans-ExtraBold.ttf', 'NotoSans-Black.ttf',
  'NotoSans-Italic.ttf', 'NotoSans-MediumItalic.ttf',
  'NotoSans-BoldItalic.ttf', 'NotoSans-ExtraBoldItalic.ttf',
];

// Display font — Onest (modern geometric, full Cyrillic + Kazakh, variable TTF)
const ONEST = {
  dir: join(__dirname, '..', 'public', 'fonts', 'onest'),
  url:  'https://raw.githubusercontent.com/google/fonts/main/ofl/onest/Onest%5Bwght%5D.ttf',
  file: 'Onest.ttf',
  // Onest doesn't ship italic; we use Noto Sans italic where italic is needed.
};

// Monospace — JetBrains Mono (technical / engineering feel)
const MONO_BASE = 'https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf';
const MONO_FILES = ['JetBrainsMono-Regular.ttf', 'JetBrainsMono-Medium.ttf', 'JetBrainsMono-Bold.ttf'];

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(ONEST.dir, { recursive: true });
const monoDir = join(__dirname, '..', 'public', 'fonts', 'mono');
mkdirSync(monoDir, { recursive: true });

async function dl(url, dest, label) {
  if (existsSync(dest)) {
    console.log(`[fonts] skip (exists): ${label}`);
    return;
  }
  console.log(`[fonts] GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(`[fonts] saved ${label}  (${Math.round(buf.length / 1024)} KB)`);
}

for (const f of NOTO_FILES) await dl(`${NOTO_BASE}/${f}`, join(OUT_DIR, f), f);
await dl(ONEST.url, join(ONEST.dir, ONEST.file), ONEST.file);
for (const f of MONO_FILES) await dl(`${MONO_BASE}/${f}`, join(monoDir, f), f);
console.log('[fonts] done');
