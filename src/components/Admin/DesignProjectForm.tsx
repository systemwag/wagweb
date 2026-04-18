'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DesignProject, DesignCategory } from '@/lib/types';
import styles from './DesignProjectForm.module.css';
import adminStyles from './admin.module.css';

interface Props {
  project?: DesignProject;
}

const CATEGORY_OPTIONS: { value: DesignCategory; label: string }[] = [
  { value: 'full-cycle',    label: 'Полный цикл' },
  { value: 'design',        label: 'Рабочий проект' },
  { value: 'documentation', label: 'Документация' },
  { value: 'feasibility',   label: 'Тех. возможность' },
];

export default function DesignProjectForm({ project }: Props) {
  const router = useRouter();
  const isEdit = !!project;

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [works, setWorks]     = useState<string[]>(project?.works ?? ['']);

  const addWork  = () => setWorks(prev => [...prev, '']);
  const removeWork = (i: number) => setWorks(prev => prev.filter((_, idx) => idx !== i));
  const updateWork = (i: number, val: string) => setWorks(prev => prev.map((w, idx) => idx === i ? val : w));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = e.currentTarget;
    const get  = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value.trim() ?? '';

    const payload = {
      number:      Number(get('number'))   || null,
      client:      get('client'),
      works:       works.filter(w => w.trim()),
      category:    get('category'),
      location:    get('location')     || null,
      year:        Number(get('year')) || null,
      status:      get('status'),
      slug:        get('slug'),
      description: get('description') || null,
      featured:    (form.elements.namedItem('featured') as HTMLInputElement)?.checked ?? false,
    };

    if (!payload.client || !payload.slug) {
      setError('Заполните обязательные поля: Заказчик, Slug');
      setSaving(false);
      return;
    }

    try {
      const url    = isEdit ? `/api/admin/design/${project!.id}` : '/api/admin/design';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json   = await res.json();
      if (!json.ok) throw new Error(json.error);
      router.push('/admin/design');
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const slugDefault = project?.slug ?? '';

  return (
    <form className={adminStyles.form} onSubmit={handleSubmit}>

      {/* Number + Client */}
      <div className={adminStyles.formRow}>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>№ объекта</label>
          <input name="number" className={adminStyles.input} type="number" defaultValue={project?.number ?? ''} placeholder="92" />
        </div>
        <div className={`${adminStyles.field} ${adminStyles.fieldWide}`}>
          <label className={adminStyles.label}>Заказчик *</label>
          <input name="client" className={adminStyles.input} defaultValue={project?.client ?? ''} placeholder="ТОО «Название компании»" required />
        </div>
      </div>

      {/* Slug + Category */}
      <div className={adminStyles.formRow}>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>Slug * (URL)</label>
          <input name="slug" className={adminStyles.input} defaultValue={slugDefault} placeholder="design-92" required />
        </div>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>Категория</label>
          <select name="category" className={adminStyles.input} defaultValue={project?.category ?? 'documentation'}>
            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>Статус</label>
          <select name="status" className={adminStyles.input} defaultValue={project?.status ?? 'completed'}>
            <option value="completed">Завершён</option>
            <option value="in-progress">В процессе</option>
          </select>
        </div>
      </div>

      {/* Location + Year */}
      <div className={adminStyles.formRow}>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>Местоположение</label>
          <input name="location" className={adminStyles.input} defaultValue={project?.location ?? ''} placeholder="Актобе, Актюбинская область" />
        </div>
        <div className={adminStyles.field}>
          <label className={adminStyles.label}>Год</label>
          <input name="year" className={adminStyles.input} type="number" defaultValue={project?.year ?? ''} placeholder="2024" />
        </div>
      </div>

      {/* Description */}
      <div className={adminStyles.field}>
        <label className={adminStyles.label}>Описание</label>
        <textarea name="description" className={adminStyles.textarea} rows={2} defaultValue={project?.description ?? ''} placeholder="Краткое описание проекта..." />
      </div>

      {/* Works list */}
      <div className={adminStyles.field}>
        <label className={adminStyles.label}>Перечень выполненных работ</label>
        <div className={styles.worksList}>
          {works.map((w, i) => (
            <div key={i} className={styles.workRow}>
              <input
                className={adminStyles.input}
                value={w}
                onChange={e => updateWork(i, e.target.value)}
                placeholder={`Работа ${i + 1}`}
              />
              {works.length > 1 && (
                <button type="button" className={styles.removeBtn} onClick={() => removeWork(i)}>×</button>
              )}
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={addWork}>
            + Добавить работу
          </button>
        </div>
      </div>

      {/* Featured */}
      <label className={adminStyles.checkLabel}>
        <input name="featured" type="checkbox" defaultChecked={project?.featured ?? false} className={adminStyles.checkbox} />
        Отображать в избранном
      </label>

      {error && <div className={adminStyles.error}>{error}</div>}

      <div className={adminStyles.formActions}>
        <button type="submit" className={adminStyles.btnPrimary} disabled={saving}>
          {saving ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать проект'}
        </button>
        <button type="button" className={adminStyles.btnSecondary} onClick={() => router.back()}>
          Отмена
        </button>
      </div>

    </form>
  );
}
