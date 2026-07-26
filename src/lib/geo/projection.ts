import { PROJECTION, VIEWBOX } from './kz-geo.generated';

const D2R = Math.PI / 180;

/**
 * lat/lon → координаты VIEWBOX карты.
 * Та же равновеликая коническая Альберса, что и в scripts/build-kz-geo.mjs,
 * с теми же подогнанными scale/tx/ty — точки ложатся ровно на полигоны.
 */
export function project(lat: number, lon: number): [number, number] {
  const { n, c, rho0, lon0, scale, tx, ty } = PROJECTION;
  const rho = Math.sqrt(c - 2 * n * Math.sin(lat * D2R)) / n;
  const th = n * (lon - lon0) * D2R;
  return [
    rho * Math.sin(th) * scale + tx,
    (rho * Math.cos(th) - rho0) * scale + ty,
  ];
}

/**
 * Обратная проекция: точка на карте → lat/lon.
 * Нужна пикеру в админке — админ кликает по карте, а в БД уходят настоящие
 * координаты, а не пиксели (ровно та ошибка, от которой ушли с x_map/y_map).
 */
export function unproject(x: number, y: number): [number, number] {
  const { n, c, rho0, lon0, scale, tx, ty } = PROJECTION;
  const px = (x - tx) / scale;
  const py = (y - ty) / scale + rho0;
  const rho = Math.hypot(px, py);
  const theta = Math.atan2(px, py);
  const sinPhi = (c - rho * rho * n * n) / (2 * n);
  const lat = Math.asin(Math.max(-1, Math.min(1, sinPhi))) / D2R;
  const lon = lon0 + theta / D2R / n;
  return [lat, lon];
}

export { VIEWBOX };
