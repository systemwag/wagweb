'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './GeoDiagnostics.module.css';
import { KIND_META, KIND_ORDER, type GeoIndex, type GeoResolution, type WorkKind } from '@/lib/geo/works';
import { REGION_SHORT } from '@/lib/geo/labels';

const PRECISION_LABEL = {
  exact:    'точная',
  approx:   'площадка рядом',
  district: 'центр района',
  region:   'только область',
} as const;

type Tab = 'problems' | 'all' | WorkKind;

/**
 * Диагностика карты. Заменяет перетаскивание маркеров: координаты теперь
 * выводятся из адреса, и настраивать нечего — зато нужно видеть, у кого адрес
 * не разобрался, иначе объект тихо пропадёт с карты.
 */
export default function GeoDiagnostics({ index }: { index: GeoIndex }) {
  const [tab, setTab] = useState<Tab>('problems');
  const [query, setQuery] = useState('');

  const problems = useMemo(
    () => index.resolutions.filter(r => r.reason === 'unresolved'),
    [index.resolutions],
  );

  const rows = useMemo(() => {
    const base = tab === 'problems' ? problems
      : tab === 'all' ? index.resolutions
      : index.resolutions.filter(r => r.kind === tab);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(r =>
      r.title.toLowerCase().includes(q)
      || (r.location ?? '').toLowerCase().includes(q)
      || (r.place?.label ?? '').toLowerCase().includes(q));
  }, [tab, query, problems, index.resolutions]);

  const onMap = index.resolutions.filter(r => r.onMap).length;
  const pinned = index.resolutions.filter(r => r.place?.source === 'pin').length;
  const noDrawings = index.resolutions.filter(r => r.reason === 'no-drawings').length;

  return (
    <div className={styles.root}>
      {/* Сводка */}
      <div className={styles.summary}>
        <Stat value={onMap} label="на карте" tone="ok" />
        <Stat value={problems.length} label="адрес не разобран" tone={problems.length ? 'bad' : 'ok'} />
        <Stat value={pinned} label="ручных точек" tone="gold" />
        <Stat value={noDrawings} label="ПД без чертежей" tone="muted" />
      </div>

      {problems.length > 0 && (
        <p className={styles.alert}>
          У {problems.length}{' '}
          {problems.length === 1 ? 'объекта' : 'объектов'} адрес не распознан — на карту они не попадут.
          Приведите адрес к знакомому виду либо поставьте точку вручную в карточке объекта.
        </p>
      )}

      {/* Фильтры */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          <Tab id="problems" tab={tab} set={setTab} count={problems.length} tone="bad">Проблемы</Tab>
          <Tab id="all" tab={tab} set={setTab} count={index.resolutions.length}>Все</Tab>
          {KIND_ORDER.map(k => (
            <Tab key={k} id={k} tab={tab} set={setTab}
              count={index.resolutions.filter(r => r.kind === k).length}>
              {KIND_META[k].short}
            </Tab>
          ))}
        </div>
        <input
          className={styles.search}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию или адресу"
        />
      </div>

      {/* Таблица */}
      {rows.length === 0 ? (
        <p className={styles.empty}>
          {tab === 'problems' ? 'Все адреса разобраны — на карте всё, что должно быть.' : 'Ничего не найдено.'}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Тип</th>
                <th>Объект</th>
                <th>Адрес в базе</th>
                <th>Распознано как</th>
                <th>Область</th>
                <th>Точность</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => <Row key={`${r.kind}-${r.id}`} r={r} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ r }: { r: GeoResolution }) {
  return (
    <tr data-problem={r.reason === 'unresolved'}>
      <td>
        <span className={styles.kind} data-kind={r.kind}>{KIND_META[r.kind].short}</span>
      </td>
      <td className={styles.title}>{r.title}</td>
      <td className={styles.raw}>{r.location || <span className={styles.none}>— пусто —</span>}</td>
      <td>
        {r.place
          ? <span className={styles.place}>
              {r.place.label}
              {r.place.source === 'pin' && <span className={styles.pinTag}>точка вручную</span>}
            </span>
          /* «Нет чертежей» — сознательное правило, а не ошибка данных:
             красным его подсвечивать не за что. */
          : r.reason === 'no-drawings'
            ? <span className={styles.muted}>не участвует</span>
            : <span className={styles.bad}>не распознан</span>}
      </td>
      <td className={styles.region}>{r.place ? REGION_SHORT[r.place.region] ?? r.place.region : '—'}</td>
      <td className={styles.precision}>
        {r.place ? PRECISION_LABEL[r.place.precision] : '—'}
      </td>
      <td>
        {!r.onMap && r.reason === 'no-drawings'
          ? <span className={styles.muted}>нет чертежей</span>
          : <Link href={r.editHref} className={styles.edit}>Открыть</Link>}
      </td>
    </tr>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className={styles.stat} data-tone={tone}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function Tab({ id, tab, set, count, tone, children }: {
  id: Tab; tab: Tab; set: (t: Tab) => void; count: number; tone?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.tab}
      data-on={tab === id}
      data-tone={count > 0 ? tone : undefined}
      onClick={() => set(id)}
    >
      {children}<span className={styles.tabCount}>{count}</span>
    </button>
  );
}
