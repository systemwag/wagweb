/**
 * Dedupe + auto-categorize Tilda images.
 *
 * - Strips "tild<hash>_" and "504x_" prefixes to find duplicate base names.
 * - For each base name, keeps only the largest file.
 * - Moves into category subfolders by filename patterns.
 */
import { readdir, stat, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC     = path.join(process.cwd(), 'tilda-images');
const SORTED  = path.join(process.cwd(), 'tilda-sorted');

const CATEGORIES = [
  'photos', 'letters', 'logos', 'documents', 'thumbnails',
  'partners-logos', 'duplicates',
];

function baseName(name) {
  /* Strip "tildXXXX-...-XXXX_" prefix + "504x_" prefix */
  return name
    .replace(/^tild[0-9a-f-]+_/i, '')
    .replace(/^504x_/, '')
    .replace(/^20x__?/, '');
}

function categorize(base) {
  const n = base.toLowerCase();

  /* Partner logos — known brand names */
  if (/metprom|nsslogo|russian_copper|ktzh|qb_|footer-logo|west_arlan_group/i.test(n)) {
    return 'partners-logos';
  }
  /* General logos / favicons */
  if (/^logo\.|favicon/i.test(n)) return 'logos';

  /* Documents — multi-page scans */
  if (/_page\d+|gcp|wag_1_page|rjvgfybb/i.test(n)) return 'documents';

  /* Policy / license docs */
  if (/politika|licence|licens/i.test(n)) return 'documents';

  /* WhatsApp imports = photos from people */
  if (/whatsapp_image/i.test(n)) return 'photos';

  /* Apple device UUID-style names = photos */
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(n)) return 'photos';

  /* ChatGPT / AI-generated imagery */
  if (/chatgpt_image|noroot/i.test(n)) return 'photos';

  /* Stock photos from tilda templates */
  if (/^(cherrylaithang|jorgenhaland|samuelzeller|chrisbarbalis)/i.test(n)) {
    return 'duplicates'; /* These are Tilda stock, not company's — skip */
  }
  if (/^photo-?1/.test(n)) return 'duplicates'; /* Unsplash stock */

  /* Raw numeric IDs = user-uploaded photos */
  if (/^\d{6,}\.(jpe?g|png)/i.test(n)) return 'photos';
  if (/^\d+\.(jpe?g|png)/i.test(n)) return 'photos';

  /* Short numeric / random names = probably photos or simple uploads */
  if (/^\d+\.(jpe?g|png)/i.test(n)) return 'photos';

  return 'photos'; /* default */
}

async function main() {
  await Promise.all(CATEGORIES.map((c) => mkdir(path.join(SORTED, c), { recursive: true })));

  const files = await readdir(SRC);
  const groups = new Map(); /* baseName -> [{ name, size, fullPath }] */

  for (const f of files) {
    const full = path.join(SRC, f);
    const st = await stat(full);
    if (!st.isFile()) continue;
    const base = baseName(f);
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push({ name: f, size: st.size, base });
  }

  console.log(`Found ${files.length} files in ${groups.size} unique groups.`);

  let moved = 0, duped = 0;
  for (const [base, variants] of groups) {
    /* Keep largest, move the rest to "duplicates" */
    variants.sort((a, b) => b.size - a.size);
    const keeper = variants[0];
    const losers = variants.slice(1);

    /* Is the keeper a 504x thumbnail only? → thumbnails */
    const cat = keeper.name.startsWith('504x_') ? 'thumbnails' : categorize(base);

    await rename(
      path.join(SRC, keeper.name),
      path.join(SORTED, cat, base),
    );
    moved++;

    for (const l of losers) {
      await rename(
        path.join(SRC, l.name),
        path.join(SORTED, 'duplicates', l.name),
      );
      duped++;
    }
  }

  console.log(`Moved ${moved} unique files, ${duped} duplicates set aside.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
