/**
 * Upload tilda-sorted/photos/*.{png,jpg,jpeg} to Supabase Storage
 * and update `images[]` (+ `image_url` if null) on matching projects.
 *
 * File naming: <slug>.ext  or  <slug>-NN.ext  (e.g. amk-estakada-puti-14-16.png, ...-02.png)
 *
 * Usage: node upload_project_photos.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const PHOTOS_DIR = path.join(process.cwd(), 'tilda-sorted', 'photos');
const BUCKET     = 'project-images';
const ENV_PATH   = path.join(process.cwd(), '.env.local');

/* ── Load .env.local manually (avoid dotenv dep) ─────────────── */
if (!existsSync(ENV_PATH)) { console.error('.env.local not found'); process.exit(1); }
for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].trim();
}

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const key = svcKey || anonKey;
if (!url || !key) { console.error('Missing Supabase env vars'); process.exit(1); }
if (!svcKey) {
  console.warn('⚠  SUPABASE_SERVICE_ROLE_KEY not set — Storage writes may fail (RLS).\n');
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

function parseFilename(name, validSlugs) {
  const ext  = name.split('.').pop().toLowerCase();
  const base = name.slice(0, -ext.length - 1);

  /* Try exact slug match first */
  if (validSlugs.has(base)) return { slug: base, order: 1, ext };

  /* Else strip trailing "-NN" (2-digit index) and retry */
  const m = base.match(/^(.+)-(\d{2})$/);
  if (m && validSlugs.has(m[1])) {
    return { slug: m[1], order: parseInt(m[2], 10), ext };
  }

  /* Else strip trailing single digit (like "amk-otstoy-vagonov-rudnaya1") */
  const m2 = base.match(/^(.+?)(\d)$/);
  if (m2 && validSlugs.has(m2[1])) {
    return { slug: m2[1], order: parseInt(m2[2], 10), ext };
  }

  return { slug: base, order: 1, ext, unmatched: true };
}

async function main() {
  /* 1. Fetch projects first — need slug set for parsing */
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select('id, slug, image_url, images');
  if (projErr) { console.error('Cannot load projects:', projErr.message); process.exit(1); }

  const bySlug    = new Map(projects.map((p) => [p.slug, p]));
  const validSlugs = new Set(projects.map((p) => p.slug));
  console.log(`Loaded ${projects.length} projects from DB.`);

  /* 2. Enumerate files */
  const files = (await readdir(PHOTOS_DIR))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => ({ file: f, ...parseFilename(f, validSlugs) }))
    .sort((a, b) => a.slug.localeCompare(b.slug) || a.order - b.order);

  console.log(`Found ${files.length} files.\n`);

  /* 3. Upload & collect URLs per project */
  const uploadsByProject = new Map(); // projectId -> [{ url, order }]
  const unmatched = [];

  for (const f of files) {
    const proj = bySlug.get(f.slug);
    if (!proj) { unmatched.push(f.file); continue; }

    const buf       = await readFile(path.join(PHOTOS_DIR, f.file));
    const storagePath = `project-${proj.id}/${f.slug}-${String(f.order).padStart(2, '0')}-${Date.now()}.${f.ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: MIME[f.ext] ?? 'image/png', upsert: false });

    if (upErr) { console.log(`  ✗ ${f.file}: ${upErr.message}`); continue; }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    console.log(`  ✓ ${f.file}  →  project ${proj.id} (${proj.slug})`);

    if (!uploadsByProject.has(proj.id)) uploadsByProject.set(proj.id, []);
    uploadsByProject.get(proj.id).push({ url: pub.publicUrl, order: f.order });
  }

  /* 4. Update each project's images[] and image_url */
  console.log('\nUpdating projects…');
  for (const [pid, uploads] of uploadsByProject) {
    const proj = projects.find((p) => p.id === pid);
    uploads.sort((a, b) => a.order - b.order);
    const newUrls = uploads.map((u) => u.url);
    const merged  = [...(proj.images ?? []), ...newUrls];

    const patch = { images: merged };
    if (!proj.image_url) patch.image_url = newUrls[0];

    const { error: updErr } = await supabase.from('projects').update(patch).eq('id', pid);
    if (updErr) console.log(`  ✗ project ${pid}: ${updErr.message}`);
    else        console.log(`  ✓ project ${pid} (${proj.slug}) +${newUrls.length} img${!proj.image_url ? ' + cover' : ''}`);
  }

  if (unmatched.length) {
    console.log('\nFiles without matching project slug:');
    unmatched.forEach((f) => console.log(`  - ${f}`));
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
