'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import styles from './admin.module.css';

const STATUS_LABEL: Record<string, string> = {
  'completed':   'Завершён',
  'in-progress': 'В процессе',
  'planned':     'Планируется',
};
const STATUS_CLASS: Record<string, string> = {
  'completed':   styles.completed,
  'in-progress': styles.inProgress,
  'planned':     styles.planned,
};

type SortKey = 'id' | 'title' | 'category' | 'year' | 'status';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={styles.sortIcon}>
      <span className={styles.up}   style={{ opacity: active && dir === 'asc'  ? 1 : 0.3 }} />
      <span className={styles.down} style={{ opacity: active && dir === 'desc' ? 1 : 0.3 }} />
    </span>
  );
}

interface Props { projects: Project[] }

export default function ProjectsTable({ projects: initial }: Props) {
  const router = useRouter();
  const [projects, setProjects]     = useState(initial);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [sortKey, setSortKey]       = useState<SortKey>('id');
  const [sortDir, setSortDir]       = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (sortKey === 'id')       { aVal = a.id;       bVal = b.id; }
      if (sortKey === 'title')    { aVal = a.title;     bVal = b.title; }
      if (sortKey === 'category') { aVal = a.category;  bVal = b.category; }
      if (sortKey === 'year')     { aVal = a.year ?? 0; bVal = b.year ?? 0; }
      if (sortKey === 'status')   { aVal = a.status;    bVal = b.status; }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [projects, sortKey, sortDir]);

  /* ── Toggle featured inline ──────────────────────────────────── */
  const toggleFeatured = async (p: Project) => {
    if (toggling === p.id) return;
    setToggling(p.id);
    // Optimistic update
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x));
    try {
      const res = await fetch(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !p.featured }),
      });
      const json = await res.json();
      if (!json.ok) {
        // Rollback on error
        setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: p.featured } : x));
      } else {
        router.refresh();
      }
    } catch {
      setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: p.featured } : x));
    } finally {
      setToggling(null);
    }
  };

  /* ── Toggle map visibility (clear coords) inline ─────────────── */
  const toggleMapVisibility = async (p: Project) => {
    if (toggling === p.id) return;
    if (p.x_map == null) {
      // No coords set — open map calibrator
      router.push('/admin/map');
      return;
    }
    if (!confirm(`Убрать «${p.title}» с карты?\nКоординаты будут сброшены.`)) return;
    setToggling(p.id);
    // Optimistic update
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, x_map: null, y_map: null } : x));
    try {
      const res = await fetch(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x_map: null, y_map: null }),
      });
      const json = await res.json();
      if (!json.ok) {
        setProjects(prev => prev.map(x => x.id === p.id ? { ...x, x_map: p.x_map, y_map: p.y_map } : x));
      } else {
        router.refresh();
      }
    } catch {
      setProjects(prev => prev.map(x => x.id === p.id ? { ...x, x_map: p.x_map, y_map: p.y_map } : x));
    } finally {
      setToggling(null);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────── */
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Удалить проект «${title}»?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        router.refresh();
      } else {
        alert(`Ошибка: ${json.error}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!projects.length) {
    return <div className={styles.noData}>Проектов нет. Создайте первый!</div>;
  }

  const th = (key: SortKey, label: string) => (
    <th
      className={`${styles.thSortable} ${sortKey === key ? styles.thSortActive : ''}`}
      onClick={() => handleSort(key)}
    >
      <span className={styles.thInner}>
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </span>
    </th>
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {th('id',       'ID')}
            {th('title',    'Название')}
            {th('category', 'Категория')}
            {th('year',     'Год')}
            {th('status',   'Статус')}
            <th title="Отображение на карте">Карта</th>
            <th title="Featured — показать на главной">Звезда</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            const isBusy = toggling === p.id;
            return (
              <tr key={p.id}>
                <td style={{ color: 'rgba(221,228,240,0.35)', fontSize: '0.75rem' }}>{p.id}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#dde4f0', fontSize: '0.84rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(221,228,240,0.4)', marginTop: 2 }}>{p.location}</div>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'rgba(221,228,240,0.55)' }}>{p.category}</td>
                <td style={{ fontSize: '0.8rem' }}>{p.year}</td>
                <td>
                  <span className={`${styles.statusBadge} ${STATUS_CLASS[p.status] ?? ''}`}>
                    <span className={`${styles.dot} ${STATUS_CLASS[p.status] ?? ''}`} />
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </td>

                {/* ── Map toggle ─────────────────────────────── */}
                <td>
                  <button
                    className={`${styles.inlineToggle} ${p.x_map != null ? styles.inlineToggleOn : styles.inlineToggleOff}`}
                    onClick={() => toggleMapVisibility(p)}
                    disabled={isBusy}
                    title={p.x_map != null
                      ? `На карте: x=${p.x_map}, y=${p.y_map}. Нажмите чтобы убрать`
                      : 'Нет на карте. Нажмите чтобы открыть калибровку'}
                  >
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <path
                        d="M8 1C5.79 1 4 2.79 4 5c0 3 4 9 4 9s4-6 4-9c0-2.21-1.79-4-4-4z"
                        fill={p.x_map != null ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="5" r="1.5"
                        fill={p.x_map != null ? 'var(--bg, #050810)' : 'none'}
                        stroke={p.x_map != null ? 'none' : 'currentColor'}
                        strokeWidth="1.2"
                      />
                    </svg>
                    <span className={styles.inlineToggleLabel}>
                      {p.x_map != null ? 'На карте' : 'Нет'}
                    </span>
                  </button>
                </td>

                {/* ── Featured (star) toggle ─────────────────── */}
                <td>
                  <button
                    className={`${styles.inlineToggle} ${p.featured ? styles.inlineToggleStar : styles.inlineToggleOff}`}
                    onClick={() => toggleFeatured(p)}
                    disabled={isBusy}
                    title={p.featured ? 'Featured — нажмите чтобы убрать' : 'Не featured — нажмите чтобы добавить'}
                  >
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <path
                        d="M8 1.5l1.75 3.55 3.92.57-2.84 2.77.67 3.91L8 10.35l-3.5 1.95.67-3.91L2.33 5.62l3.92-.57L8 1.5z"
                        fill={p.featured ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.inlineToggleLabel}>
                      {p.featured ? 'Featured' : '—'}
                    </span>
                  </button>
                </td>

                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/projects/${p.id}`} className={styles.btnEdit}>Ред.</Link>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDelete(p.id, p.title)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? '...' : 'Удалить'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
