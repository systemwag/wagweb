'use client';

import { useMemo, useState } from 'react';
import styles from './LocationField.module.css';
import GeoPointPicker from './GeoPointPicker';
import { resolvePlace } from '@/lib/geo/places';
import { regionAtPoint } from '@/lib/geo/regions';
import { REGION_NAME } from '@/lib/geo/labels';

interface Props {
  /** Имя поля адреса — форма может читать его как обычный input */
  name?: string;
  value: string;
  onChange: (value: string) => void;
  lat: number | null;
  lon: number | null;
  onPoint: (lat: number | null, lon: number | null) => void;
  className?: string;
}

/**
 * Поле адреса с живой проверкой попадания на карту.
 *
 * Смысл: координаты теперь выводятся из текста, поэтому опечатка в адресе
 * тихо убирает объект с карты — раньше пустую точку было видно, теперь нет.
 * Здесь ошибка ловится в момент ввода.
 */
export default function LocationField({
  name, value, onChange, lat, lon, onPoint, className,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const status = useMemo(() => {
    if (lat != null && lon != null) {
      const region = regionAtPoint(lat, lon);
      return {
        kind: 'pin' as const,
        text: `Ручная точка · ${region ? region.name : 'за пределами РК'}`,
      };
    }
    const place = resolvePlace(value);
    if (place) {
      return {
        kind: 'ok' as const,
        text: `${place.label} · ${REGION_NAME[place.region] ?? place.region}`
          + (place.precision === 'exact' ? '' : ` · ${PRECISION_HINT[place.precision]}`),
      };
    }
    return {
      kind: value.trim() ? ('bad' as const) : ('empty' as const),
      text: value.trim()
        ? 'Адрес не распознан — объект не попадёт на карту'
        : 'Адрес не заполнен — объекта не будет на карте',
    };
  }, [value, lat, lon]);

  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <input
        name={name}
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Актобе, ст. Жинишке"
      />

      <div className={styles.status} data-kind={status.kind}>
        <span className={styles.dot} />
        <span className={styles.text}>{status.text}</span>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setPickerOpen(o => !o)}
        >
          {pickerOpen ? 'Свернуть карту' : lat != null ? 'Изменить точку' : 'Поставить точку вручную'}
        </button>
      </div>

      {status.kind === 'bad' && !pickerOpen && (
        <p className={styles.help}>
          Либо приведите адрес к знакомому виду (город, станция, район),
          либо поставьте точку на карте — она перебивает разбор адреса.
        </p>
      )}

      {pickerOpen && (
        <div className={styles.picker}>
          <GeoPointPicker lat={lat} lon={lon} onChange={onPoint} />
          <button type="button" className={styles.done} onClick={() => setPickerOpen(false)}>
            Готово
          </button>
        </div>
      )}
    </div>
  );
}

const PRECISION_HINT = {
  exact:    'точная координата',
  approx:   'координата площадки рядом',
  district: 'по центру района',
  region:   'известна только область',
} as const;
