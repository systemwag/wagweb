import { describe, it, expect } from 'vitest';
import { project, unproject, VIEWBOX } from '@/lib/geo/projection';
import { regionAtPoint } from '@/lib/geo/regions';
import { PLACES } from '@/lib/geo/places';

describe('проекция', () => {
  it('обратная проекция возвращает исходные координаты', () => {
    for (const p of PLACES) {
      const [x, y] = project(p.lat, p.lon);
      const [lat, lon] = unproject(x, y);
      expect(lat, p.id).toBeCloseTo(p.lat, 6);
      expect(lon, p.id).toBeCloseTo(p.lon, 6);
    }
  });

  it('все места справочника попадают в кадр карты', () => {
    for (const p of PLACES) {
      if (p.region.startsWith('RU-')) continue; // зарубежье может выходить за рамку
      const [x, y] = project(p.lat, p.lon);
      expect(x, p.id).toBeGreaterThan(0);
      expect(x, p.id).toBeLessThan(VIEWBOX.w);
      expect(y, p.id).toBeGreaterThan(0);
      expect(y, p.id).toBeLessThan(VIEWBOX.h);
    }
  });
});

describe('regionAtPoint', () => {
  it('область по координате совпадает с указанной в справочнике', () => {
    const mismatched: string[] = [];
    for (const p of PLACES) {
      if (p.region.startsWith('RU-')) continue;
      const region = regionAtPoint(p.lat, p.lon);
      if (region?.code !== p.region) {
        mismatched.push(`${p.id}: справочник ${p.region}, геометрия ${region?.code ?? '—'}`);
      }
    }
    expect(mismatched, mismatched.join('\n')).toEqual([]);
  });

  it('города респ. значения выигрывают у охватывающей области', () => {
    expect(regionAtPoint(51.1605, 71.4704)?.code).toBe('AST');
    expect(regionAtPoint(42.3417, 69.5901)?.code).toBe('SHY');
  });

  it('точка за пределами РК не даёт области', () => {
    expect(regionAtPoint(51.2, 58.31)).toBeNull(); // Новотроицк, РФ
  });
});
