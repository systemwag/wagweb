'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import MapPicker from './MapPicker';
import ImageUploader from './ImageUploader';
import { slugify } from './form-utils';
import styles from './ProjectForm.module.css';
import adminStyles from './admin.module.css';

const CATEGORIES = [
  'Железнодорожная инфраструктура',
  'Инженерные изыскания',
  'Промышленные объекты',
  'Коммуникации',
  'Геодезия',
  'Проектирование',
];

type FormState = Omit<Project, 'id' | 'created_at'>;

function blank(): FormState {
  return {
    slug: '', title: '', description: '', category: CATEGORIES[0],
    location: '', year: new Date().getFullYear(), length: '',
    tags: [], image_url: null, images: null, status: 'planned', featured: false,
    x_map: null, y_map: null, coords_label: '',
  };
}

interface Props {
  project?: Project;
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const isEdit = !!project;

  const [form, setForm] = useState<FormState>(
    project
      ? { slug: project.slug, title: project.title, description: project.description,
          category: project.category, location: project.location, year: project.year,
          length: project.length ?? '', tags: project.tags ?? [], image_url: project.image_url,
          images: project.images ?? [], status: project.status, featured: project.featured,
          x_map: project.x_map, y_map: project.y_map, coords_label: project.coords_label ?? '',
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

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images && form.images.length > 0 ? form.images : null,
    };

    try {
      const url = isEdit ? `/api/admin/projects/${project!.id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Ошибка сохранения');
      router.push('/admin/projects');
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
        {/* Title */}
        <div className={styles.field}>
          <label className={styles.label}>Название *</label>
          <input className={styles.input} value={form.title}
            onChange={e => handleTitleChange(e.target.value)} required />
        </div>
        {/* Slug */}
        <div className={styles.field}>
          <label className={styles.label}>Slug (URL)</label>
          <input className={styles.input} value={form.slug}
            onChange={e => set('slug', e.target.value)} />
        </div>
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>Описание *</label>
        <textarea className={styles.textarea} rows={3} value={form.description}
          onChange={e => set('description', e.target.value)} required />
      </div>

      <div className={styles.grid3}>
        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label}>Категория</label>
          <select className={styles.select} value={form.category}
            onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Status */}
        <div className={styles.field}>
          <label className={styles.label}>Статус</label>
          <select className={styles.select} value={form.status}
            onChange={e => set('status', e.target.value as Project['status'])}>
            <option value="completed">Завершён</option>
            <option value="in-progress">В процессе</option>
            <option value="planned">Планируется</option>
          </select>
        </div>
        {/* Year */}
        <div className={styles.field}>
          <label className={styles.label}>Год</label>
          <input className={styles.input} type="number" value={form.year}
            onChange={e => set('year', Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Location */}
        <div className={styles.field}>
          <label className={styles.label}>Местоположение</label>
          <input className={styles.input} value={form.location}
            onChange={e => set('location', e.target.value)} />
        </div>
        {/* Length */}
        <div className={styles.field}>
          <label className={styles.label}>Объём / протяжённость</label>
          <input className={styles.input} value={form.length ?? ''}
            onChange={e => set('length', e.target.value)} placeholder="420 км" />
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Tags */}
        <div className={styles.field}>
          <label className={styles.label}>Теги (через запятую)</label>
          <input className={styles.input} value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="Геодезия, BIM, Мониторинг" />
        </div>
        {/* Coords label */}
        <div className={styles.field}>
          <label className={styles.label}>Метка координат</label>
          <input className={styles.input} value={form.coords_label ?? ''}
            onChange={e => set('coords_label', e.target.value)}
            placeholder="51.18° N, 71.45° E" />
        </div>
      </div>

      {/* Featured */}
      <div className={styles.field}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={form.featured}
            onChange={e => set('featured', e.target.checked)} />
          Показывать на главной (featured)
        </label>
      </div>

      {/* ── Images ── */}
      <ImageUploader
        label="Фотографии проекта"
        images={form.images ?? []}
        mainImage={form.image_url}
        projectId={project?.id}
        onImagesChange={imgs => set('images', imgs)}
        onMainChange={url => set('image_url', url)}
        onUploadingChange={setUploading}
        onError={setError}
      />

      {/* Map picker */}
      <div className={styles.field}>
        <label className={styles.label}>Позиция на карте</label>
        <MapPicker
          x={form.x_map}
          y={form.y_map}
          onChange={(x, y) => { set('x_map', x); set('y_map', y); }}
        />
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" className={adminStyles.btnSecondary}
          onClick={() => router.push('/admin/projects')}>
          Отмена
        </button>
        <button type="submit" className={adminStyles.btnPrimary} disabled={saving || uploading}>
          {saving ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать проект'}
        </button>
      </div>
    </form>
  );
}
