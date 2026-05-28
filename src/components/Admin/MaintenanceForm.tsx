'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MaintenanceProject, WorkType } from '@/lib/types';
import { WORK_TYPE_LABELS } from '@/lib/types';
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

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[а-яёa-z0-9]+/gi, m =>
      [...m].map(c => {
        const map: Record<string, string> = {
          а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',
          л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',
          ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
        };
        return map[c] ?? c;
      }).join('')
    )
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function urlToPath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/project-images\/(.+)$/);
  return match ? match[1] : null;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [dragOver, setDragOver] = useState(false);

  const images = form.images ?? [];

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!isEdit) set('slug', slugify(val));
  };

  /* Image upload */
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setUploading(true);
    setError('');
    const newUrls: string[] = [];
    for (const file of fileArr) {
      const fd = new FormData();
      fd.append('file', file);
      if (project?.id) fd.append('projectId', String(project.id));
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        newUrls.push(json.url);
      } catch (err) {
        setError(`Ошибка загрузки ${file.name}: ${err}`);
      }
    }
    if (newUrls.length > 0) {
      const updated = [...(form.images ?? []), ...newUrls];
      set('images', updated);
      if (!form.image_url) set('image_url', updated[0]);
    }
    setUploading(false);
  }, [form.images, form.image_url, project?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = '';
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };
  const handleRemoveImage = async (url: string) => {
    const path = urlToPath(url);
    if (path) {
      try {
        await fetch('/api/admin/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        });
      } catch { /* ignore */ }
    }
    const updated = images.filter(u => u !== url);
    set('images', updated);
    if (form.image_url === url) set('image_url', updated[0] ?? null);
  };
  const handleSetMain = (url: string) => set('image_url', url);
  const handleMoveImage = (idx: number, dir: -1 | 1) => {
    const arr = [...images];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    set('images', arr);
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
      <div className={styles.field}>
        <label className={styles.label}>Фотографии</label>
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className={styles.dropZoneContent}>
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            {uploading ? <span>Загрузка...</span> : <span>Перетащите фото сюда или нажмите</span>}
            <span className={styles.dropZoneHint}>JPEG, PNG, WebP, AVIF. Макс. 10 МБ</span>
          </div>
        </div>

        {images.length > 0 && (
          <div className={styles.imageGrid}>
            {images.map((url, idx) => (
              <div key={url} className={`${styles.imageThumb} ${form.image_url === url ? styles.imageThumbMain : ''}`}>
                <img src={url} alt={`Фото ${idx + 1}`} className={styles.imageThumbImg} />
                <div className={styles.imageThumbOverlay}>
                  <div className={styles.imageThumbActions}>
                    {form.image_url !== url && (
                      <button type="button" className={styles.imageBtn} title="Главная"
                        onClick={() => handleSetMain(url)}>
                        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                          <path d="M8 2l2 4h4l-3.2 2.8 1.2 4.2L8 10.5 3.8 13l1.2-4.2L2 6h4z" fill="currentColor"/>
                        </svg>
                      </button>
                    )}
                    {idx > 0 && (
                      <button type="button" className={styles.imageBtn} title="Влево"
                        onClick={() => handleMoveImage(idx, -1)}>
                        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button type="button" className={styles.imageBtn} title="Вправо"
                        onClick={() => handleMoveImage(idx, 1)}>
                        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                    <button type="button" className={`${styles.imageBtn} ${styles.imageBtnDanger}`}
                      title="Удалить" onClick={() => handleRemoveImage(url)}>
                      <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  {form.image_url === url && (
                    <span className={styles.mainBadge}>Главная</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
