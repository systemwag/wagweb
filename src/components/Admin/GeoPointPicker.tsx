'use client';

import { useRef } from 'react';
import styles from './GeoPointPicker.module.css';
import { KZ_REGIONS, KZ_NEIGHBORS, KZ_OUTLINE, VIEWBOX } from '@/lib/geo/kz-geo.generated';
import { project, unproject } from '@/lib/geo/projection';
import { regionAtPoint } from '@/lib/geo/regions';

interface Props {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number | null, lon: number | null) => void;
}

/**
 * Ставит ручную точку объекта. В отличие от старого MapPicker сохраняет НЕ
 * пиксели контура, а настоящие широту/долготу — их можно проверить, показать
 * в любом масштабе и переиспользовать где угодно.
 */
export default function GeoPointPicker({ lat, lon, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    /* viewBox вписан через xMidYMid meet — считаем реальный масштаб и поля */
    const scale = Math.min(rect.width / VIEWBOX.w, rect.height / VIEWBOX.h);
    const offX = (rect.width - VIEWBOX.w * scale) / 2;
    const offY = (rect.height - VIEWBOX.h * scale) / 2;
    const vx = (e.clientX - rect.left - offX) / scale;
    const vy = (e.clientY - rect.top - offY) / scale;
    const [nlat, nlon] = unproject(vx, vy);
    onChange(Math.round(nlat * 1e5) / 1e5, Math.round(nlon * 1e5) / 1e5);
  };

  const point = lat != null && lon != null ? project(lat, lon) : null;
  const region = lat != null && lon != null ? regionAtPoint(lat, lon) : null;

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleClick}
      >
        <g className={styles.neighbors}>
          {KZ_NEIGHBORS.map(n => <path key={n.code} d={n.d} />)}
        </g>
        <g className={styles.regions}>
          {KZ_REGIONS.map(r => (
            <path key={r.code} d={r.d} fillRule="evenodd" data-active={region?.code === r.code}>
              <title>{r.name}</title>
            </path>
          ))}
        </g>
        <path className={styles.outline} d={KZ_OUTLINE} fillRule="evenodd" />
        {point && (
          <g className={styles.pin} transform={`translate(${point[0]} ${point[1]})`}>
            <circle r="13" className={styles.pinHalo} />
            <circle r="4.5" className={styles.pinCore} />
            <line x1="-9" y1="0" x2="9" y2="0" />
            <line x1="0" y1="-9" x2="0" y2="9" />
          </g>
        )}
      </svg>

      <div className={styles.readout}>
        {lat != null && lon != null ? (
          <>
            <span className={styles.coords}>
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
            <span className={styles.region}>
              {region ? region.name : 'за пределами Казахстана'}
            </span>
            <button type="button" className={styles.clear} onClick={() => onChange(null, null)}>
              Убрать точку
            </button>
          </>
        ) : (
          <span className={styles.hint}>Кликните по карте, чтобы поставить точку вручную</span>
        )}
      </div>
    </div>
  );
}
