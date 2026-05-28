'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { MaintenanceProject } from '@/lib/types';
import { WORK_TYPE_LABELS } from '@/lib/types';
import styles from './admin.module.css';

const STATUS_LABEL: Record<string, string> = {
  'completed': 'Завершён',
  'ongoing':   'Текущий',
};
const STATUS_CLASS: Record<string, string> = {
  'completed': styles.completed,
  'ongoing':   styles.inProgress,
};

type SortKey = 'id' | 'title' | 'work_type' | 'period' | 'status';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={styles.sortIcon}>
      <span className={styles.up}   style={{ opacity: active && dir === 'asc'  ? 1 : 0.3 }} />
      <span className={styles.down} style={{ opacity: active && dir === 'desc' ? 1 : 0.3 }} />
    </span>
  );
}

interface Props { projects: MaintenanceProject[] }

export default function MaintenanceTable({ projects: initial }: Props) {
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
      if (sortKey === 'id')        { aVal = a.id;        bVal = b.id; }
      if (sortKey === 'title')     { aVal = a.title;     bVal = b.title; }
      if (sortKey === 'work_type') { aVal = a.work_type; bVal = b.work_type; }
      if (sortKey === 'period')    { aVal = a.period;    bVal = b.period; }
      if (sortKey === 'status')    { aVal = a.status;    bVal = b.status; }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [projects, sortKey, sortDir]);

  /* Toggle featured inline */
  const toggleFeatured = async (p: MaintenanceProject) => {
    if (toggling === p.id) return;
    setToggling(p.id);
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x));
    try {
      const res = await fetch(`/api/admin/maintenance/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !p.featured }),
      });
      const json = await res.json();
      if (!json.ok) {
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

  const handleDelete = async (p: MaintenanceProject) => {
    if (!confirm(`Удалить «${p.title}»?\nЭто действие нельзя отменить.`)) return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/maintenance/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setProjects(prev => prev.filter(x => x.id !== p.id));
        router.refresh();
      } else {
        alert(`Ошибка: ${json.error}`);
      }
    } catch (e) {
      alert(`Ошибка: ${e}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Пока нет ни одного проекта обслуживания.</p>
        <Link href="/admin/maintenance/new" className={styles.btnPrimary}>
          Создать первый
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className={styles.sortable}>
              ID <SortIcon active={sortKey === 'id'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('title')} className={styles.sortable}>
              Название <SortIcon active={sortKey === 'title'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('work_type')} className={styles.sortable}>
              Тип работ <SortIcon active={sortKey === 'work_type'} dir={sortDir} />
            </th>
            <th>Заказчик</th>
            <th onClick={() => handleSort('period')} className={styles.sortable}>
              Период <SortIcon active={sortKey === 'period'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('status')} className={styles.sortable}>
              Статус <SortIcon active={sortKey === 'status'} dir={sortDir} />
            </th>
            <th>Главная</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id}>
              <td className={styles.tdMuted}>{p.id}</td>
              <td className={styles.tdTitle}>
                <Link href={`/admin/maintenance/${p.id}`} className={styles.tableLink}>
                  {p.title}
                </Link>
              </td>
              <td className={styles.tdMuted}>{WORK_TYPE_LABELS[p.work_type] ?? p.work_type}</td>
              <td className={styles.tdMuted}>{p.client ?? '—'}</td>
              <td className={styles.tdMuted}>{p.period}</td>
              <td>
                <span className={`${styles.statusBadge} ${STATUS_CLASS[p.status]}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => toggleFeatured(p)}
                  disabled={toggling === p.id}
                  className={`${styles.toggleBtn} ${p.featured ? styles.toggleOn : ''}`}
                  title={p.featured ? 'Убрать с главной' : 'Показать на главной'}
                >
                  <svg viewBox="0 0 16 16" fill={p.featured ? 'currentColor' : 'none'} width="14" height="14">
                    <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11.2 4.4 13l.7-4L2.2 6.2l4-.6L8 2z"
                      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </button>
              </td>
              <td>
                <div className={styles.tableActions}>
                  <Link href={`/admin/maintenance/${p.id}`} className={styles.iconBtn} title="Редактировать">
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    title="Удалить"
                  >
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <path d="M3 4h10M6 4V2h4v2M5 4l1 10h4l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
