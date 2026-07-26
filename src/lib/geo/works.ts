import type { Project, MaintenanceProject, DesignProject } from '@/lib/types';
import { WORK_TYPE_LABELS } from '@/lib/types';
import { HUB_BY_ID, PLACE_BY_ID, pinnedPlace, resolvePlace, type Place } from './places';
import { project as projectPoint } from './projection';
import { regionAtPoint } from './regions';

/* ── Модель ────────────────────────────────────────────────────────────────── */

export type WorkKind = 'build' | 'maintenance' | 'design';

export const KIND_META: Record<WorkKind, { label: string; short: string; color: string }> = {
  build:       { label: 'Строительно-монтажные работы', short: 'СМР',            color: '#D4A843' },
  maintenance: { label: 'Содержание и ремонт путей',    short: 'Содержание',     color: '#00C4A7' },
  design:      { label: 'Проектирование и изыскания',   short: 'Проектирование', color: '#4F84FF' },
};

export const KIND_ORDER: WorkKind[] = ['build', 'maintenance', 'design'];

export interface GeoWork {
  key: string;
  kind: WorkKind;
  title: string;
  /** Заказчик или тип работ — вторая строка в списке */
  meta: string | null;
  href: string;
  year: string | null;
  place: Place;
}

export interface PlaceGroup {
  place: Place;
  works: GeoWork[];
}

export interface HubAgg {
  id: string;
  label: string;
  x: number;
  y: number;
  rank: 1 | 2;
  total: number;
  byKind: Record<WorkKind, number>;
  regionCode: string;
  groups: PlaceGroup[];
}

export interface RegionAgg {
  code: string;
  total: number;
  byKind: Record<WorkKind, number>;
}

export interface UnresolvedWork {
  kind: WorkKind;
  title: string;
  location: string | null;
}

/** Строка диагностики — по одной на КАЖДУЮ запись, включая не попавшие на карту */
export interface GeoResolution {
  kind: WorkKind;
  id: number;
  title: string;
  location: string | null;
  place: Place | null;
  onMap: boolean;
  /** Почему не на карте: адрес не разобран либо у ПД нет чертежей */
  reason: 'unresolved' | 'no-drawings' | null;
  editHref: string;
}

export interface GeoIndex {
  hubs: HubAgg[];
  regions: RegionAgg[];
  works: GeoWork[];
  unresolved: UnresolvedWork[];
  resolutions: GeoResolution[];
  totals: Record<WorkKind, number>;
  /** Сколько строк каждого типа вообще есть в источнике — для честной сноски */
  sourceTotals: Record<WorkKind, number>;
  /** Всего проектных работ в реестре (включая те, что без чертежей) */
  designTotal: number;
}

const zero = (): Record<WorkKind, number> => ({ build: 0, maintenance: 0, design: 0 });

/* ── Нормализация трёх сущностей в одну ────────────────────────────────────── */

/**
 * Где стоит объект. Ручная точка (`lat`/`lon` из админки) главнее справочника:
 * её проставили осознанно, зная, что адрес разобрать нечем.
 */
export function resolveGeo(
  row: { id: number; location?: string | null; lat?: number | null; lon?: number | null },
  key: string,
  label: string,
): Place | null {
  if (row.lat != null && row.lon != null) {
    const region = regionAtPoint(row.lat, row.lon);
    return pinnedPlace(key, label, row.lat, row.lon, region?.code ?? 'OUT');
  }
  return resolvePlace(row.location);
}

interface Row {
  work: GeoWork | null;
  res: GeoResolution;
}

function rowFor(
  kind: WorkKind, id: number, title: string, location: string | null,
  place: Place | null, meta: string | null, href: string, year: string | null,
  editHref: string, skipped: 'no-drawings' | null = null,
): Row {
  const onMap = !skipped && place !== null;
  return {
    work: onMap ? { key: `${kind}:${id}`, kind, title, meta, href, year, place: place! } : null,
    res: {
      kind, id, title, location, place,
      onMap,
      reason: skipped ?? (place ? null : 'unresolved'),
      editHref,
    },
  };
}

function fromProjects(rows: Project[]): Row[] {
  return rows.map(p => rowFor(
    'build', p.id, p.title, p.location ?? null,
    resolveGeo(p, `build-${p.id}`, p.location || p.title),
    p.category, `/projects/${p.slug}`, p.year ? String(p.year) : null,
    `/admin/projects/${p.id}`,
  ));
}

function fromMaintenance(rows: MaintenanceProject[]): Row[] {
  return rows.map(m => rowFor(
    'maintenance', m.id, m.title, m.location ?? null,
    resolveGeo(m, `maintenance-${m.id}`, m.location || m.title),
    WORK_TYPE_LABELS[m.work_type] ?? null, `/maintenance/${m.slug}`, m.period || null,
    `/admin/maintenance/${m.id}`,
  ));
}

/**
 * ПД попадают на карту только с чертежами: из 100 строк адрес заполнен у 23,
 * а чертежи — ровно у тех 19, у которых адрес точно известен и подтверждён
 * материалами проекта. Остальное на карте было бы догадкой.
 */
function fromDesign(rows: DesignProject[]): Row[] {
  return rows.map(d => {
    const hasDrawings = Array.isArray(d.images) && d.images.length > 0;
    const title = d.works[0] ?? d.client;
    return rowFor(
      'design', d.id, title, d.location ?? null,
      resolveGeo(d, `design-${d.id}`, d.location || d.client),
      d.client, `/design/${d.id}`, d.year ? String(d.year) : null,
      `/admin/design/${d.id}`,
      hasDrawings ? null : 'no-drawings',
    );
  });
}

/* ── Сборка индекса ────────────────────────────────────────────────────────── */

export function buildGeoIndex(
  projects: Project[],
  maintenance: MaintenanceProject[],
  design: DesignProject[],
): GeoIndex {
  const designWithDrawings = design.filter(d => Array.isArray(d.images) && d.images.length > 0);

  const rows = [...fromProjects(projects), ...fromMaintenance(maintenance), ...fromDesign(design)];
  const works = rows.map(r => r.work).filter((w): w is GeoWork => w !== null);
  const resolutions = rows.map(r => r.res);
  const unresolved: UnresolvedWork[] = resolutions
    .filter(r => r.reason === 'unresolved')
    .map(r => ({ kind: r.kind, title: r.title, location: r.location }));

  /* Хабы собираются из самих работ, а не из статического списка HUBS:
     ручная точка образует собственный узел, которого в справочнике нет. */
  const byHub = new Map<string, GeoWork[]>();
  for (const w of works) {
    const list = byHub.get(w.place.hub);
    if (list) list.push(w);
    else byHub.set(w.place.hub, [w]);
  }

  const hubs: HubAgg[] = [];
  for (const [hubId, list] of byHub) {
    const meta = HUB_BY_ID.get(hubId);
    const anchor = (meta ? PLACE_BY_ID.get(meta.anchor) : null) ?? list[0].place;
    const [x, y] = projectPoint(anchor.lat, anchor.lon);

    const byKind = zero();
    const byPlace = new Map<string, GeoWork[]>();
    for (const w of list) {
      byKind[w.kind]++;
      const g = byPlace.get(w.place.id);
      if (g) g.push(w);
      else byPlace.set(w.place.id, [w]);
    }

    const groups: PlaceGroup[] = [...byPlace.entries()]
      .map(([id, ws]) => ({ place: PLACE_BY_ID.get(id) ?? ws[0].place, works: sortWorks(ws) }))
      .sort((a, b) => b.works.length - a.works.length);

    hubs.push({
      id: hubId,
      label: meta?.label ?? anchor.label,
      x, y,
      rank: meta?.rank ?? 2,
      total: list.length, byKind, regionCode: anchor.region, groups,
    });
  }
  hubs.sort((a, b) => b.total - a.total);

  const totals = zero();
  for (const w of works) totals[w.kind]++;

  return {
    hubs, regions: aggregateRegions(hubs), works, unresolved, resolutions, totals,
    sourceTotals: {
      build: projects.length,
      maintenance: maintenance.length,
      design: designWithDrawings.length,
    },
    designTotal: design.length,
  };
}

/** Внутри места: сначала СМР, потом содержание, потом ПД; свежее выше. */
function sortWorks(ws: GeoWork[]): GeoWork[] {
  return [...ws].sort((a, b) => {
    const k = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
    if (k !== 0) return k;
    return (b.year ?? '').localeCompare(a.year ?? '');
  });
}

function aggregateRegions(hubs: HubAgg[]): RegionAgg[] {
  const map = new Map<string, RegionAgg>();
  for (const h of hubs) {
    for (const g of h.groups) for (const w of g.works) {
      let agg = map.get(w.place.region);
      if (!agg) { agg = { code: w.place.region, total: 0, byKind: zero() }; map.set(w.place.region, agg); }
      agg.total++;
      agg.byKind[w.kind]++;
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Пересчёт агрегатов под включённые фильтры — без повторного разбора адресов. */
export function filterIndex(index: GeoIndex, kinds: Set<WorkKind>): {
  hubs: HubAgg[];
  regions: RegionAgg[];
  total: number;
} {
  const hubs: HubAgg[] = [];
  for (const h of index.hubs) {
    const groups = h.groups
      .map(g => ({ place: g.place, works: g.works.filter(w => kinds.has(w.kind)) }))
      .filter(g => g.works.length);
    const total = groups.reduce((s, g) => s + g.works.length, 0);
    if (!total) continue;
    const byKind = zero();
    for (const g of groups) for (const w of g.works) byKind[w.kind]++;
    hubs.push({ ...h, groups, total, byKind });
  }
  hubs.sort((a, b) => b.total - a.total);

  return {
    hubs,
    regions: aggregateRegions(hubs),
    total: hubs.reduce((s, h) => s + h.total, 0),
  };
}
