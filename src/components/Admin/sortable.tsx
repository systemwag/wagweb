'use client';

import { useMemo, useState } from 'react';
import styles from './admin.module.css';

/**
 * Shared sorting primitives for the admin tables (Projects / Design /
 * Maintenance). Each table previously duplicated the SortIcon, the
 * sortKey/sortDir state machine, and the comparator verbatim.
 */

export type SortDir = 'asc' | 'desc';

export function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={styles.sortIcon}>
      <span className={styles.up}   style={{ opacity: active && dir === 'asc'  ? 1 : 0.3 }} />
      <span className={styles.down} style={{ opacity: active && dir === 'desc' ? 1 : 0.3 }} />
    </span>
  );
}

/**
 * Clickable sortable `<th>` matching the Projects/Design header style
 * (`thSortable` + `thInner` wrapper). Maintenance uses a different header
 * markup and keeps its own.
 */
export function SortableTh<K extends string>({
  sortKey, activeKey, dir, onSort, label,
}: {
  sortKey: K;
  activeKey: string;
  dir: SortDir;
  onSort: (key: K) => void;
  label: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th
      className={`${styles.thSortable} ${active ? styles.thSortActive : ''}`}
      onClick={() => onSort(sortKey)}
    >
      <span className={styles.thInner}>
        {label}
        <SortIcon active={active} dir={dir} />
      </span>
    </th>
  );
}

/**
 * Sort state + memoized sorted array. `accessor` maps an item + key to a
 * comparable value; define it at module scope so it stays referentially
 * stable across renders.
 */
export function useSortable<T, K extends string>(
  items: T[],
  accessor: (item: T, key: K) => string | number,
  initialKey: K,
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: K) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const aVal = accessor(a, sortKey);
      const bVal = accessor(b, sortKey);
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [items, accessor, sortKey, sortDir]);

  return { sortKey, sortDir, handleSort, sorted };
}
