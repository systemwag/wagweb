import type { HubAgg } from './works';
import { KZ_REGIONS } from './kz-geo.generated';
import { VIEWBOX } from './projection';
import { pointInPath } from './regions';

const REGION_BY_CODE = new Map(KZ_REGIONS.map(r => [r.code, r]));

/**
 * Раскладка узлов карты. Живёт отдельно от компонента, потому что ту же карту
 * рисует печатная брошюра — расхождение в размерах и раздвижке сразу бросалось
 * бы в глаза при сравнении сайта и PDF.
 */

export interface PlacedHub extends HubAgg {
  /** Координаты отрисовки — после раздвижки */
  px: number;
  py: number;
  /** Насколько уехали от настоящей точки (0 — не двигали) */
  offset: number;
}

/**
 * Радиус узла. `m` — компенсация ширины: на телефоне карта сжимается до ~390 px,
 * и маркер в 10 единиц viewBox превращается в 4 px — ни увидеть, ни нажать.
 */
export const hubRadius = (total: number, m = 1) =>
  Math.min(27, 7 + 3.1 * Math.sqrt(total)) * m;

/**
 * Раздвижка перекрывающихся узлов.
 * Итеративно расталкиваем круги и на каждом шаге притягиваем обратно к истинной
 * координате — маркер уходит ровно настолько, насколько мешает соседу, и не
 * дальше. Крупные узлы почти не двигаются: их положение важнее.
 */
export function relaxHubs(hubs: HubAgg[], m = 1): PlacedHub[] {
  const nodes = hubs.map(h => ({ h, x: h.x, y: h.y, r: hubRadius(h.total, m) + 3.5 }));

  for (let iter = 0; iter < 90; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r;
        if (d >= min) continue;
        if (d < 0.001) { dx = (i % 2 ? 1 : -1) * 0.4; dy = 0.3; d = 0.5; }
        const push = (min - d) * 0.5;
        const ux = dx / d, uy = dy / d;
        /* Крупный сдвигается меньше — вес обратно пропорционален радиусу */
        const wa = b.r / (a.r + b.r), wb = a.r / (a.r + b.r);
        a.x -= ux * push * wa; a.y -= uy * push * wa;
        b.x += ux * push * wb; b.y += uy * push * wb;
        moved = true;
      }
    }
    for (const n of nodes) {
      n.x += (n.h.x - n.x) * 0.08;
      n.y += (n.h.y - n.y) * 0.08;
    }
    if (!moved) break;
  }

  return nodes.map(n => ({
    ...n.h,
    px: Math.round(n.x * 10) / 10,
    py: Math.round(n.y * 10) / 10,
    offset: Math.hypot(n.x - n.h.x, n.y - n.h.y),
  }));
}

/* Ступени заливки — по ДОЛЕ от всех работ, не по абсолютному числу.
   Пороги «25 / 10 / 4 объекта» врали: Мангистауская с одним объектом занимает
   пол-экрана и красилась почти как ЗКО с одиннадцатью, хотя площадь области
   к объёму работ отношения не имеет. Нижняя ступень намеренно почти невидима —
   единичное присутствие обозначает узел, а не заливка континента. */
export const TIERS = [
  { min: 0.20, key: 'core',   fill: 'rgba(212,168,67,0.34)', stroke: 'rgba(240,200,90,0.70)' },
  { min: 0.05, key: 'strong', fill: 'rgba(212,168,67,0.15)', stroke: 'rgba(212,168,67,0.45)' },
  { min: 0,    key: 'some',   fill: 'rgba(212,168,67,0.05)', stroke: 'rgba(212,168,67,0.24)' },
];

/** Область без работ — всё равно «суша»: должна отличаться от фона за границей. */
export const EMPTY_TIER = {
  key: 'none',
  fill: 'rgba(28,38,62,0.55)',
  stroke: 'rgba(255,255,255,0.09)',
};

export const tierFor = (n: number, total: number) =>
  n === 0 ? EMPTY_TIER : (TIERS.find(t => n / Math.max(total, 1) > t.min) ?? TIERS[2]);

/* ── Раскладка подписей ───────────────────────────────────────────────────
   Тоже общая с брошюрой: без выбора свободной позиции подписи узлов в
   актюбинском кластере наезжают друг на друга. */
type Box = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Box, b: Box) =>
  !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);

type Anchor = 'middle' | 'start' | 'end';
interface HubLabel {
  id: string; x: number; y: number; text: string;
  strong: boolean; order: number; anchor: Anchor; box: Box;
}

/**
 * Подписи узлов. Каждая пробует четыре позиции — снизу, сверху, справа, слева —
 * и занимает первую свободную. Без этого подпись «Новотроицк» терялась только
 * потому, что снизу под ней оказывался маркер Хромтау.
 */
export function layoutHubLabels(
  hubs: PlacedHub[], activeId: string | null, reserved: Box[] = [], m = 1,
): HubLabel[] {
  const boxes: Box[] = [...reserved];
  const out: HubLabel[] = [];

  hubs.forEach((h, order) => {
    const r = hubRadius(h.total, m);
    const strong = h.rank === 1 || h.total >= 5 || h.id === activeId;
    const w = (h.label.length * 4.8 + 6) * m;

    const candidates: Array<{ x: number; y: number; anchor: Anchor }> = [
      { x: h.px,           y: h.py + r + 11 * m, anchor: 'middle' },
      { x: h.px,           y: h.py - r - 6 * m,  anchor: 'middle' },
      { x: h.px + r + 6 * m, y: h.py + 3.5 * m,  anchor: 'start' },
      { x: h.px - r - 6 * m, y: h.py + 3.5 * m,  anchor: 'end' },
      { x: h.px + r * 0.8, y: h.py + r + 15 * m, anchor: 'start' },
      { x: h.px - r * 0.8, y: h.py + r + 15 * m, anchor: 'end' },
      { x: h.px + r * 0.8, y: h.py - r - 9 * m,  anchor: 'start' },
      { x: h.px - r * 0.8, y: h.py - r - 9 * m,  anchor: 'end' },
      { x: h.px,           y: h.py + r + 22 * m, anchor: 'middle' },
    ];

    for (const c of candidates) {
      const x1 = c.anchor === 'middle' ? c.x - w / 2 : c.anchor === 'start' ? c.x : c.x - w;
      const box = { x1, y1: c.y - 8 * m, x2: x1 + w, y2: c.y + 3 * m };

      if (box.x1 < 2 || box.x2 > VIEWBOX.w - 2 || box.y1 < 2 || box.y2 > VIEWBOX.h - 2) continue;
      if (boxes.some(b => overlaps(box, b))) continue;
      /* Подпись не должна лечь на чужой маркер */
      if (hubs.some(o => o !== h && boxHitsCircle(box, o.px, o.py, hubRadius(o.total, m) + 2))) continue;

      boxes.push(box);
      out.push({ id: h.id, x: c.x, y: c.y, text: h.label, strong, order, anchor: c.anchor, box });
      return;
    }
  });

  return out;
}

function boxHitsCircle(b: Box, cx: number, cy: number, r: number) {
  const nx = Math.max(b.x1, Math.min(cx, b.x2));
  const ny = Math.max(b.y1, Math.min(cy, b.y2));
  return Math.hypot(cx - nx, cy - ny) < r;
}

/* Проверка «подпись внутри своей области» — общая с админкой геометрия,
   чтобы «АКТЮБИНСКАЯ» не уехала к соседям, когда центроид занят маркерами. */

const REGION_LABEL_OFFSETS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (const dx of [0, -55, 55, -110, 110]) {
    for (const dy of [0, 34, -34, 68, -68, 102]) out.push([dx, dy]);
  }
  return out.sort((a, b) => Math.hypot(a[0], a[1] * 1.4) - Math.hypot(b[0], b[1] * 1.4));
})();

/**
 * Названия ВСЕХ областей — карта должна читаться как карта Казахстана, а не как
 * набор подписанных пятен. Области с работами раскладываются первыми (им место
 * достаётся в приоритете) и подписаны ярче; остальные — приглушённо.
 */
export function layoutRegionLabels(
  regions: Array<{ code: string; total: number }>, hubs: PlacedHub[], m = 1,
) {
  const counts = new Map(regions.map(r => [r.code, r.total]));
  const ordered = [...KZ_REGIONS]
    .filter(r => !r.city)
    .sort((a, b) => (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0));

  const taken: Box[] = [];
  const out: Array<{ code: string; x: number; y: number; text: string; has: boolean; box: Box }> = [];

  /* Сетка кандидатов вокруг центроида, от ближних к дальним: в плотно занятой
     Актюбинской области подпись иначе не находит места вовсе. */
  const OFFSETS = REGION_LABEL_OFFSETS;

  for (const meta of ordered) {
    const text = meta.short.toUpperCase();
    const w = (text.length * 5.6 + 8) * m;

    for (const [ox, oy] of OFFSETS) {
      const x = meta.cx + ox, y = meta.cy + oy;
      const box = { x1: x - w / 2, y1: y - 7 * m, x2: x + w / 2, y2: y + 4 * m };

      if (!pointInPath(meta.d, x, y)) continue;
      if (!pointInPath(meta.d, box.x1 + 2, y) || !pointInPath(meta.d, box.x2 - 2, y)) continue;
      if (hubs.some(h => boxHitsCircle(box, h.px, h.py, hubRadius(h.total, m) + 4))) continue;
      if (taken.some(b => overlaps(box, b))) continue;

      taken.push(box);
      out.push({ code: meta.code, x, y, text, has: (counts.get(meta.code) ?? 0) > 0, box });
      break;
    }
  }
  return out;
}

