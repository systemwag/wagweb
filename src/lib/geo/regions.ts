import { KZ_REGIONS, type KzRegion } from './kz-geo.generated';
import { project } from './projection';

/* Разбор сгенерированного path'а в кольца. Формат ровно тот, что пишет
   scripts/build-kz-geo.mjs: `M x y L x y … Z` подряд, без пробелов между
   подпутями. Результат кэшируется — колец под 3500 точек. */
const RINGS_CACHE = new Map<string, number[][][]>();

export function ringsOfPath(d: string): number[][][] {
  const cached = RINGS_CACHE.get(d);
  if (cached) return cached;
  const rings = d.split('M').slice(1).map(seg =>
    seg.replace(/Z\s*$/, '').split('L').map(pair => {
      const [x, y] = pair.trim().split(' ');
      return [Number(x), Number(y)];
    }),
  );
  RINGS_CACHE.set(d, rings);
  return rings;
}

/** even-odd: точка внутри, если пересечений нечётное число (анклавы работают сами) */
export function pointInPath(d: string, x: number, y: number): boolean {
  let inside = false;
  for (const ring of ringsOfPath(d)) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/**
 * В какую область РК попадает точка. Города республиканского значения
 * проверяются первыми: Астана лежит внутри Акмолинской, Шымкент — внутри
 * Туркестанской, и по общему порядку побеждала бы область.
 */
export function regionAtPoint(lat: number, lon: number): KzRegion | null {
  const [x, y] = project(lat, lon);
  const cities = KZ_REGIONS.filter(r => r.city);
  const oblasts = KZ_REGIONS.filter(r => !r.city);
  for (const r of [...cities, ...oblasts]) {
    if (pointInPath(r.d, x, y)) return r;
  }
  return null;
}
