// Convert supabase_migration_projects.sql -> TS Project[] for src/lib/data.ts
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const sql = fs.readFileSync(path.join(ROOT, 'supabase_migration_projects.sql'), 'utf-8');

// Find the VALUES block: between "VALUES" and final ";"
const valuesStart = sql.indexOf('VALUES');
const block = sql.slice(valuesStart + 'VALUES'.length);

// Split by top-level "),"  --- a value-row ends with closing ")" followed by "," or ";"
// We rely on the parens being balanced inside each row (no nested parens here except ARRAY[...])
const rows = [];
let depth = 0;
let cur = '';
let inString = false;
let inLineComment = false;
for (let i = 0; i < block.length; i++) {
  const ch = block[i];
  // Skip SQL line comments "-- ..." until newline
  if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
  if (!inString && ch === '-' && block[i + 1] === '-') { inLineComment = true; i++; continue; }
  if (inString) {
    if (ch === "'" && block[i + 1] === "'") { if (depth > 0) cur += "''"; i++; continue; }
    if (ch === "'") { inString = false; if (depth > 0) cur += ch; continue; }
    if (depth > 0) cur += ch;
    continue;
  }
  if (ch === "'") { inString = true; if (depth > 0) cur += ch; continue; }
  if (ch === '(') { if (depth === 0) { cur = ''; depth = 1; continue; } depth++; }
  else if (ch === ')') { depth--; if (depth === 0) { rows.push(cur); cur = ''; continue; } }
  if (depth > 0) cur += ch;
}

console.log(`Found ${rows.length} project rows`);

function splitTopLevel(s) {
  // split by commas that are not inside [] or quotes
  const out = [];
  let buf = '';
  let inSq = false; // single-quote string
  let bracket = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inSq) {
      if (ch === "'" && s[i + 1] === "'") { buf += "''"; i++; continue; }
      if (ch === "'") { inSq = false; buf += ch; continue; }
      buf += ch; continue;
    }
    if (ch === "'") { inSq = true; buf += ch; continue; }
    if (ch === '[') { bracket++; buf += ch; continue; }
    if (ch === ']') { bracket--; buf += ch; continue; }
    if (ch === ',' && bracket === 0) { out.push(buf.trim()); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function parseSqlString(s) {
  s = s.trim();
  if (s.toUpperCase() === 'NULL') return null;
  if (s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1).replace(/''/g, "'");
  }
  return null;
}

function parseArray(s) {
  s = s.trim();
  if (s.toUpperCase() === 'NULL') return null;
  if (!s.startsWith('ARRAY[')) return null;
  const inner = s.slice('ARRAY['.length, -1);
  // split by top-level commas inside the array
  const parts = splitTopLevel(inner);
  return parts.map(parseSqlString).filter(Boolean);
}

function parseNumber(s) {
  s = s.trim();
  if (s.toUpperCase() === 'NULL') return null;
  return Number(s);
}

const projects = rows.map((row, idx) => {
  const cells = splitTopLevel(row);
  // 17 cells:
  // 0 slug, 1 title, 2 description, 3 category, 4 location, 5 year, 6 length,
  // 7 tags, 8 image_url, 9 images, 10 status, 11 featured,
  // 12 x_map, 13 y_map, 14 coords_label, 15 date_start, 16 date_end
  return {
    id: idx + 1,
    slug: parseSqlString(cells[0]),
    title: parseSqlString(cells[1]),
    description: parseSqlString(cells[2]),
    category: parseSqlString(cells[3]),
    location: parseSqlString(cells[4]),
    year: parseNumber(cells[5]),
    length: parseSqlString(cells[6]),
    tags: parseArray(cells[7]),
    image_url: parseSqlString(cells[8]),
    images: parseArray(cells[9]),
    status: parseSqlString(cells[10]),
    featured: cells[11].trim().toLowerCase() === 'true',
    x_map: parseNumber(cells[12]),
    y_map: parseNumber(cells[13]),
    coords_label: parseSqlString(cells[14]),
    created_at: '',
  };
});

// Output as a TS-friendly literal
const out = `// AUTO-GENERATED from supabase_migration_projects.sql via scripts/sql-to-seed.mjs
// Edit the SQL or rerun the script — do not hand-edit unless you know what you're doing.
import type { Project } from './types';

export const SQL_PROJECTS: Project[] = ${JSON.stringify(projects, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, 'src/lib/sql-projects.ts'), out, 'utf-8');
console.log(`Wrote src/lib/sql-projects.ts (${projects.length} projects)`);
