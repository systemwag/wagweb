'use client';

import { useCallback, useRef, useState } from 'react';
import { urlToPath } from './form-utils';
import styles from './ProjectForm.module.css';

/**
 * Self-contained image gallery for the admin forms: drag-and-drop upload to
 * Supabase Storage, reorder, set-main, delete. The parent owns `images` and
 * `mainImage` state and receives updates via callbacks.
 *
 * Extracted verbatim from ProjectForm/MaintenanceForm, which duplicated this
 * ~175-line block.
 */
interface Props {
  images: string[];
  mainImage: string | null;
  projectId?: number;
  label?: string;
  onImagesChange: (images: string[]) => void;
  onMainChange: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onError?: (msg: string) => void;
}

export default function ImageUploader({
  images, mainImage, projectId, label = 'Фотографии',
  onImagesChange, onMainChange, onUploadingChange, onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setUploadingState = (v: boolean) => {
    setUploading(v);
    onUploadingChange?.(v);
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    setUploadingState(true);
    onError?.('');

    const newUrls: string[] = [];
    for (const file of fileArr) {
      const fd = new FormData();
      fd.append('file', file);
      if (projectId) fd.append('projectId', String(projectId));
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        newUrls.push(json.url);
      } catch (err) {
        onError?.(`Ошибка загрузки ${file.name}: ${err}`);
      }
    }

    if (newUrls.length > 0) {
      const updated = [...images, ...newUrls];
      onImagesChange(updated);
      if (!mainImage) onMainChange(updated[0]);
    }
    setUploadingState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, mainImage, projectId]);

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
      } catch { /* ignore — file may already be deleted */ }
    }
    const updated = images.filter(u => u !== url);
    onImagesChange(updated);
    if (mainImage === url) onMainChange(updated[0] ?? null);
  };

  const handleMoveImage = (idx: number, dir: -1 | 1) => {
    const arr = [...images];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onImagesChange(arr);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>

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
          {uploading ? (
            <span>Загрузка...</span>
          ) : (
            <span>Перетащите фото сюда или нажмите для выбора</span>
          )}
          <span className={styles.dropZoneHint}>JPEG, PNG, WebP, AVIF. Макс. 10 МБ</span>
        </div>
      </div>

      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((url, idx) => (
            <div key={url} className={`${styles.imageThumb} ${mainImage === url ? styles.imageThumbMain : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Фото ${idx + 1}`} className={styles.imageThumbImg} />
              <div className={styles.imageThumbOverlay}>
                <div className={styles.imageThumbActions}>
                  {mainImage !== url && (
                    <button type="button" className={styles.imageBtn} title="Сделать главной"
                      onClick={() => onMainChange(url)}>
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
                {mainImage === url && (
                  <span className={styles.mainBadge}>Главная</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
