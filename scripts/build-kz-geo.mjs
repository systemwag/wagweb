#!/usr/bin/env node
/**
 * build-kz-geo.mjs — генерирует src/lib/geo/kz-geo.generated.ts
 *
 * Источник: OpenStreetMap (Overpass API), admin_level=4 — актуальное деление РК
 * после реформы 2022 г. (17 областей + 3 города респ. значения). Публичные
 * наборы (Natural Earth, geoBoundaries) отдают старые 16 единиц — без Абайской,
 * Жетысуской, Улытауской и Шымкента, поэтому тянем прямо из OSM.
 *
 * Что делает:
 *   1. качает relation'ы (кэш в .cache/geo/, повторный запуск офлайн);
 *   2. сшивает way-члены в замкнутые кольца (outer + inner-анклавы);
 *   3. упрощает (Douglas–Peucker в градусах);
 *   4. проецирует (равновеликая коническая Альберса под широты РК);
 *   5. вписывает в viewBox и пишет TS-модуль с path'ами + параметрами проекции.
 *
 * Запуск: node scripts/build-kz-geo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT      = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'geo');
const OUT_FILE  = path.join(ROOT, 'src', 'lib', 'geo', 'kz-geo.generated.ts');

/* ── Реестр регионов ────────────────────────────────────────────────────────
   OSM relation id → наш код + названия. Порядок = порядок в выдаче. */
const KZ_REGIONS = [
  { osm: 215683,   code: 'AKT', name: 'Актюбинская область',          short: 'Актюбинская' },
  { osm: 215441,   code: 'ZKO', name: 'Западно-Казахстанская область', short: 'ЗКО' },
  { osm: 214834,   code: 'ATY', name: 'Атырауская область',            short: 'Атырауская' },
  { osm: 215686,   code: 'MAN', name: 'Мангистауская область',         short: 'Мангистауская' },
  { osm: 215727,   code: 'KZY', name: 'Кызылординская область',        short: 'Кызылординская' },
  { osm: 1288730,  code: 'KUS', name: 'Костанайская область',          short: 'Костанайская' },
  { osm: 215743,   code: 'AKM', name: 'Акмолинская область',           short: 'Акмолинская' },
  { osm: 215760,   code: 'SEV', name: 'Северо-Казахстанская область',  short: 'СКО' },
  { osm: 215772,   code: 'PAV', name: 'Павлодарская область',          short: 'Павлодарская' },
  { osm: 215776,   code: 'KAR', name: 'Карагандинская область',        short: 'Карагандинская' },
  { osm: 14312737, code: 'ULY', name: 'Улытауская область',            short: 'Улытауская' },
  { osm: 215699,   code: 'VKO', name: 'Восточно-Казахстанская область', short: 'ВКО' },
  { osm: 14243026, code: 'ABA', name: 'Абайская область',              short: 'Абайская' },
  { osm: 14312169, code: 'ZHE', name: 'Жетысуская область',            short: 'Жетысуская' },
  { osm: 215718,   code: 'ALA', name: 'Алматинская область',           short: 'Алматинская' },
  { osm: 215722,   code: 'ZHA', name: 'Жамбылская область',            short: 'Жамбылская' },
  { osm: 215739,   code: 'TUR', name: 'Туркестанская область',         short: 'Туркестанская' },
  { osm: 3087155,  code: 'AST', name: 'Астана',                        short: 'Астана',  city: true },
  { osm: 2465058,  code: 'ALM', name: 'Алматы',                        short: 'Алматы',  city: true },
  { osm: 3389772,  code: 'SHY', name: 'Шымкент',                       short: 'Шымкент', city: true },
];

/* Соседи — только фон/контекст (Новотроицк РФ у нас в портфолио). */
const NEIGHBORS = [
  { osm: 77669,  code: 'RU-ORE', name: 'Оренбургская обл.' },
  { osm: 112819, code: 'RU-AST', name: 'Астраханская обл.' },
  { osm: 140290, code: 'RU-KGN', name: 'Курганская обл.' },
  { osm: 140291, code: 'RU-TYU', name: 'Тюменская обл.' },
  { osm: 140292, code: 'RU-OMS', name: 'Омская обл.' },
  { osm: 140294, code: 'RU-NVS', name: 'Новосибирская обл.' },
  { osm: 144764, code: 'RU-ALT', name: 'Алтайский край' },
  { osm: 153310, code: 'CN-XJ',  name: 'Синьцзян' },
  { osm: 178025, code: 'KG-Y',   name: 'Иссык-Кульская обл.' },
  { osm: 178026, code: 'KG-C',   name: 'Чуйская обл.' },
];

/* ── Overpass ──────────────────────────────────────────────────────────────── */
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchRelations(ids, cacheName) {
  const cacheFile = path.join(CACHE_DIR, cacheName);
  if (fs.existsSync(cacheFile)) {
    console.log(`  кэш: ${cacheName}`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  const query = `[out:json][timeout:600];\nrel(id:${ids.join(',')});\nout geom;`;
  let lastErr;
  for (const url of ENDPOINTS) {
    try {
      console.log(`  качаю ${ids.length} relation'ов с ${new URL(url).host}…`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: query }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.json();
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(text));
      return text;
    } catch (e) { lastErr = e; console.warn(`  ${url} → ${e.message}`); }
  }
  throw lastErr;
}

/* ── Сшивка way-членов в замкнутые кольца ───────────────────────────────────
   Overpass отдаёт relation как набор кусков границы. Склеиваем по совпадению
   концов; направление куска может быть любым. */
const EPS = 1e-7;
const same = (a, b) => Math.abs(a.lat - b.lat) < EPS && Math.abs(a.lon - b.lon) < EPS;

function stitchRings(ways) {
  const pool = ways.filter(w => w.length > 1).map(w => w.slice());
  const rings = [];
  while (pool.length) {
    let ring = pool.shift();
    let guard = 0;
    while (!same(ring[0], ring[ring.length - 1]) && guard++ < 100000) {
      const tail = ring[ring.length - 1];
      let hit = -1, reversed = false;
      for (let i = 0; i < pool.length; i++) {
        if (same(pool[i][0], tail))                        { hit = i; reversed = false; break; }
        if (same(pool[i][pool[i].length - 1], tail))        { hit = i; reversed = true;  break; }
      }
      if (hit === -1) break;                 // разомкнутый остаток — отбрасываем
      const piece = reversed ? pool[hit].slice().reverse() : pool[hit];
      pool.splice(hit, 1);
      ring = ring.concat(piece.slice(1));
    }
    if (same(ring[0], ring[ring.length - 1]) && ring.length > 3) rings.push(ring);
  }
  return rings;
}

/* ── Упрощение (Douglas–Peucker) ───────────────────────────────────────────── */
function perpDist(p, a, b) {
  const dx = b.lon - a.lon, dy = b.lat - a.lat;
  const den = dx * dx + dy * dy;
  if (den === 0) return Math.hypot(p.lon - a.lon, p.lat - a.lat);
  const t = ((p.lon - a.lon) * dx + (p.lat - a.lat) * dy) / den;
  const cl = Math.max(0, Math.min(1, t));
  return Math.hypot(p.lon - (a.lon + cl * dx), p.lat - (a.lat + cl * dy));
}
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return simplify(pts.slice(0, idx + 1), tol).slice(0, -1).concat(simplify(pts.slice(idx), tol));
}

/* Площадь кольца в кв. градусах — для отбрасывания мусорных островков. */
function ringArea(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    a += (r[j].lon + r[i].lon) * (r[j].lat - r[i].lat);
  }
  return Math.abs(a / 2);
}

/* ── Проекция: равновеликая коническая Альберса ─────────────────────────────
   Стандартные параллели подобраны под широтный размах РК (40–56° N). */
const D2R = Math.PI / 180;
const LON0 = 68, LAT0 = 48, LAT1 = 44, LAT2 = 54;
const N    = (Math.sin(LAT1 * D2R) + Math.sin(LAT2 * D2R)) / 2;
const C    = Math.cos(LAT1 * D2R) ** 2 + 2 * N * Math.sin(LAT1 * D2R);
const RHO0 = Math.sqrt(C - 2 * N * Math.sin(LAT0 * D2R)) / N;

/* Y инвертирован относительно канонической формулы: в SVG ось Y растёт вниз,
   а у Альберса — на север. */
function albers(lat, lon) {
  const rho = Math.sqrt(C - 2 * N * Math.sin(lat * D2R)) / N;
  const th  = N * (lon - LON0) * D2R;
  return [rho * Math.sin(th), rho * Math.cos(th) - RHO0];
}

/* ── Сборка ────────────────────────────────────────────────────────────────── */
function ringsOf(el) {
  const outer = [], inner = [];
  for (const m of el.members ?? []) {
    if (m.type !== 'way' || !m.geometry) continue;
    (m.role === 'inner' ? inner : outer).push(m.geometry);
  }
  return { outer: stitchRings(outer), inner: stitchRings(inner) };
}

function toPaths(el, tol, minArea) {
  const { outer, inner } = ringsOf(el);
  return [...outer, ...inner]
    .filter(r => ringArea(r) >= minArea)
    .map(r => simplify(r, tol))
    .filter(r => r.length > 3);
}

const fmt = (v) => (Math.round(v * 100) / 100).toString();

/** relation границы РК целиком — нужен для контура страны поверх областей */
const KZ_COUNTRY_OSM = 214665;

async function main() {
  console.log('▸ Геометрия регионов РК');
  const kzRaw  = await fetchRelations(KZ_REGIONS.map(r => r.osm), 'kz-adm1.json');
  const nbRaw  = await fetchRelations(NEIGHBORS.map(r => r.osm), 'kz-neighbors.json');
  const ctRaw  = await fetchRelations([KZ_COUNTRY_OSM], 'kz-outline.json');

  const byId = new Map();
  for (const el of [...kzRaw.elements, ...nbRaw.elements, ...ctRaw.elements]) byId.set(el.id, el);

  /* Регионы РК — умеренное упрощение, соседи — грубое (это только фон). */
  const kz = KZ_REGIONS.map(r => {
    const el = byId.get(r.osm);
    if (!el) throw new Error(`relation ${r.osm} (${r.name}) не найден в выдаче`);
    const rings = toPaths(el, r.city ? 0.004 : 0.02, r.city ? 0.0005 : 0.02);
    if (!rings.length) throw new Error(`${r.name}: не собралось ни одного кольца`);
    return { ...r, rings };
  });
  const nb = NEIGHBORS.map(r => ({ ...r, rings: toPaths(byId.get(r.osm), 0.12, 1.5) }))
                      .filter(r => r.rings.length);
  const outline = toPaths(byId.get(KZ_COUNTRY_OSM), 0.02, 0.05);
  if (!outline.length) throw new Error('контур страны не собрался');

  /* Проецируем + считаем bbox ТОЛЬКО по РК (соседей обрежем клипом). */
  const proj = (rings) => rings.map(r => r.map(p => albers(p.lat, p.lon)));
  const kzXY = kz.map(r => ({ ...r, xy: proj(r.rings) }));
  const nbXY = nb.map(r => ({ ...r, xy: proj(r.rings) }));
  const outlineXY = proj(outline);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of kzXY) for (const ring of r.xy) for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }

  /* Вписываем в 1000 × H с полем PAD. */
  const PAD = 24, W = 1000;
  const scale = (W - PAD * 2) / (maxX - minX);
  const H = Math.round((maxY - minY) * scale + PAD * 2);
  const tx = PAD - minX * scale;
  const ty = PAD - minY * scale;

  const place = ([x, y]) => [x * scale + tx, y * scale + ty];
  const toPath = (xy) => xy
    .map(ring => 'M' + ring.map(p => { const [x, y] = place(p); return `${fmt(x)} ${fmt(y)}`; }).join('L') + 'Z')
    .join('');

  /* Центроид по площади — для подписей и «якорей» области. */
  const centroid = (xy) => {
    const ring = xy.reduce((a, b) => (ringArea(a.map(([lon, lat]) => ({ lon, lat }))) >
                                      ringArea(b.map(([lon, lat]) => ({ lon, lat }))) ? a : b));
    let cx = 0, cy = 0, a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x0, y0] = ring[j], [x1, y1] = ring[i];
      const f = x0 * y1 - x1 * y0;
      a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    a *= 0.5;
    return place(Math.abs(a) < 1e-12 ? ring[0] : [cx / (6 * a), cy / (6 * a)]);
  };

  const regions = kzXY.map(r => {
    const [cx, cy] = centroid(r.xy);
    return { code: r.code, name: r.name, short: r.short, city: !!r.city,
             d: toPath(r.xy), cx: +fmt(cx), cy: +fmt(cy) };
  });
  const neighbors = nbXY.map(r => ({ code: r.code, name: r.name, d: toPath(r.xy) }));

  const outlinePath = toPath(outlineXY);

  const stats = {
    kzPts: kzXY.reduce((s, r) => s + r.xy.reduce((t, g) => t + g.length, 0), 0),
    nbPts: nbXY.reduce((s, r) => s + r.xy.reduce((t, g) => t + g.length, 0), 0),
    outPts: outlineXY.reduce((t, g) => t + g.length, 0),
  };

  const out = `/* AUTO-GENERATED — не редактировать руками.
 * Источник: OpenStreetMap admin_level=4 (деление РК после реформы 2022 г.).
 * Пересборка: node scripts/build-kz-geo.mjs
 * Проекция: равновеликая коническая Альберса, стандартные параллели ${LAT1}°/${LAT2}° N.
 * Точек: РК ${stats.kzPts}, соседи ${stats.nbPts}.
 */

export interface KzRegion {
  code: string;
  name: string;
  short: string;
  city: boolean;
  /** SVG path (fill-rule="evenodd" — внутренние кольца дают анклавы) */
  d: string;
  /** Центроид крупнейшего кольца, в координатах VIEWBOX */
  cx: number;
  cy: number;
}

export interface KzNeighbor { code: string; name: string; d: string }

/** Параметры проекции — нужны, чтобы класть точки по lat/lon в ту же систему. */
export const PROJECTION = {
  lon0: ${LON0}, lat0: ${LAT0}, lat1: ${LAT1}, lat2: ${LAT2},
  n: ${N}, c: ${C}, rho0: ${RHO0},
  scale: ${scale}, tx: ${tx}, ty: ${ty},
} as const;

export const VIEWBOX = { x: 0, y: 0, w: ${W}, h: ${H} } as const;

/** Контур страны целиком — рисуется поверх областей, чтобы силуэт читался. */
export const KZ_OUTLINE = ${JSON.stringify(outlinePath)};

export const KZ_REGIONS: KzRegion[] = ${JSON.stringify(regions, null, 2)};

export const KZ_NEIGHBORS: KzNeighbor[] = ${JSON.stringify(neighbors, null, 2)};
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, out, 'utf8');
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0);
  console.log(`▸ ${path.relative(ROOT, OUT_FILE)} — ${regions.length} регионов, ${neighbors.length} соседей, ${kb} КБ`);
  console.log(`  viewBox 0 0 ${W} ${H}; точек: РК ${stats.kzPts}, фон ${stats.nbPts}`);
}

main().catch(e => { console.error(e); process.exit(1); });
