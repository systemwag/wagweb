'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MaintenanceProject, WorkType } from '@/lib/types';
import { WORK_TYPE_LABELS } from '@/lib/types';
import ImageUploader from './ImageUploader';
import { slugify } from './form-utils';
import styles from './ProjectForm.module.css';
import adminStyles from './admin.module.css';

const WORK_TYPES: WorkType[] = [
  'current_maintenance',
  'current_repair',
  'medium_repair',
  'capital_repair',
  'inspection',
  'reconstruction',
];

type FormState = Omit<MaintenanceProject, 'id' | 'created_at'>;

function blank(): FormState {
  return {
    slug: '', title: '', description: '', client: null, location: '',
    period: String(new Date().getFullYear()),
    work_type: 'current_maintenance',
    tags: [], image_url: null, images: null, status: 'completed', featured: false,
  };
}

interface Props { project?: MaintenanceProject }

export default function MaintenanceForm({ project }: Props) {
  const router = useRouter();
  const isEdit = !!project;

  const [form, setForm] = useState<FormState>(
    project
      ? { slug: project.slug, title: project.title, description: project.description,
          client: project.client, location: project.location, period: project.period,
          work_type: project.work_type, tags: project.tags ?? [],
          image_url: project.image_url, images: project.images ?? [],
          status: project.status, featured: project.featured,
        }
      : blank()
  );

  const [tagsInput, setTagsInput] = useState((project?.tags ?? []).join(', '));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!isEdit) set('slug', slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images && form.images.length > 0 ? form.images : null,
      client: form.client?.trim() || null,
    };
    try {
      const url = isEdit ? `/api/admin/maintenance/${project!.id}` : '/api/admin/maintenance';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Ошибка сохранения');
      router.push('/admin/maintenance');
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={`${adminStyles.alert} ${adminStyles.alertErr}`}>{error}</div>}

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Название *</label>
          <input className={styles.input} value={form.title}
            onChange={e => handleTitleChange(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Slug (URL)</label>
          <input className={styles.input} value={form.slug}
            onChange={e => set('slug', e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание *</label>
        <textarea className={styles.textarea} rows={4} value={form.description}
          onChange={e => set('description', e.target.value)} required />
      </div>

      <div className={styles.grid3}>
        <div className={styles.field}>
          <label className={styles.label}>Тип работ</label>
          <select className={styles.select} value={form.work_type}
            onChange={e => set('work_type', e.target.value as WorkType)}>
            {WORK_TYPES.map(t => <option key={t} value={t}>{WORK_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Статус</label>
          <select className={styles.select} value={form.status}
            onChange={e => set('status', e.target.value as MaintenanceProject['status'])}>
            <option value="completed">Завершён</option>
            <option value="ongoing">Текущий (в работе)</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Период</label>
          <input className={styles.input} value={form.period}
            onChange={e => set('period', e.target.value)}
            placeholder="2020 или 2018–2020 или с 2020" />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Заказчик</label>
          <input className={styles.input} value={form.client ?? ''}
            onChange={e => set('client', e.target.value)}
            placeholder="ТОО «...», ИП ...., и т.п." />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Местоположение</label>
          <input className={styles.input} value={form.location}
            onChange={e => set('location', e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Теги (через запятую)</label>
        <input className={styles.input} value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="Содержание пути, Обслуживание" />
      </div>

      <div className={styles.field}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={form.featured}
            onChange={e => set('featured', e.target.checked)} />
          Показывать на главной (featured)
        </label>
      </div>

      {/* Images */}
      <ImageUploader
        label="Фотографии"
        images={form.images ?? []}
        mainImage={form.image_url}
        projectId={project?.id}
        onImagesChange={imgs => set('images', imgs)}
        onMainChange={url => set('image_url', url)}
        onUploadingChange={setUploading}
        onError={setError}
      />

      <div className={styles.formActions}>
        <button type="button" className={adminStyles.btnSecondary}
          onClick={() => router.push('/admin/maintenance')}>
          Отмена
        </button>
        <button type="submit" className={adminStyles.btnPrimary} disabled={saving || uploading}>
          {saving ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
