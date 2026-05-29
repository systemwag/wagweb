'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DesignProject, DesignCategory } from '@/lib/types';
import styles from './admin.module.css';
import { SortableTh, useSortable } from './sortable';

const CATEGORY_LABEL: Record<DesignCategory, string> = {
  'full-cycle':    'Полный цикл',
  'design':        'Рабочий проект',
  'documentation': 'Документация',
  'feasibility':   'Тех. возможность',
};

type SortKey = 'id' | 'client' | 'category' | 'year' | 'status';

const sortValue = (p: DesignProject, key: SortKey): string | number =>
  key === 'year' ? (p.year ?? 0) : (p[key] as string | number);

export default function DesignProjectsTable({ projects: initial }: { projects: DesignProject[] }) {
  const router = useRouter();
  const [projects, setProjects]     = useState(initial);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { sortKey, sortDir, handleSort, sorted } = useSortable<DesignProject, SortKey>(projects, sortValue, 'id');

  const handleDelete = async (id: number, client: string) => {
    if (!confirm(`Удалить запись «${client}»?`)) return;
    setDeletingId(id);
    try {
      const res  = await fetch(`/api/admin/design/${id}`, { method: 'DELETE' });
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
    return <div className={styles.noData}>Записей нет. Создайте первую!</div>;
  }

  const th = (key: SortKey, label: string) => (
    <SortableTh sortKey={key} activeKey={sortKey} dir={sortDir} onSort={handleSort} label={label} />
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {th('id',       'ID')}
            {th('client',   'Заказчик')}
            {th('category', 'Категория')}
            {th('year',     'Год')}
            {th('status',   'Статус')}
            <th>Featured</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.id}>
              <td style={{ color: 'rgba(221,228,240,0.35)', fontSize: '0.75rem' }}>{p.id}</td>
              <td>
                <div style={{ fontWeight: 600, color: '#dde4f0', fontSize: '0.84rem' }}>{p.client}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(221,228,240,0.4)', marginTop: 2 }}>
                  {p.works[0] ? `${p.works[0].slice(0, 60)}…` : ''}
                </div>
              </td>
              <td style={{ fontSize: '0.75rem', color: 'rgba(221,228,240,0.55)' }}>
                {CATEGORY_LABEL[p.category]}
              </td>
              <td style={{ fontSize: '0.8rem' }}>{p.year ?? '—'}</td>
              <td>
                <span className={`${styles.statusBadge} ${p.status === 'completed' ? styles.completed : styles.inProgress}`}>
                  <span className={`${styles.dot} ${p.status === 'completed' ? styles.completed : styles.inProgress}`} />
                  {p.status === 'completed' ? 'Завершён' : 'В процессе'}
                </span>
              </td>
              <td style={{ fontSize: '0.8rem', color: p.featured ? '#d4a843' : 'rgba(221,228,240,0.25)' }}>
                {p.featured ? '★' : '—'}
              </td>
              <td>
                <div className={styles.actions}>
                  <Link href={`/admin/design/${p.id}`} className={styles.btnEdit}>Ред.</Link>
                  <button
                    className={styles.btnDanger}
                    onClick={() => handleDelete(p.id, p.client)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? '...' : 'Удалить'}
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
