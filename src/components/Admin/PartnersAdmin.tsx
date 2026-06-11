'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Partner } from '@/lib/types';
import styles from './admin.module.css';

type FormState = {
  name: string;
  logo_url: string;
  order_index: number;
  published: boolean;
};

const EMPTY_FORM: FormState = { name: '', logo_url: '', order_index: 0, published: true };

export default function PartnersAdmin({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const startNew = () => {
    setForm({ ...EMPTY_FORM, order_index: partners.length });
    setEditingId('new');
    setError(null);
  };

  const startEdit = (p: Partner) => {
    setForm({ name: p.name, logo_url: p.logo_url, order_index: p.order_index, published: p.published });
    setEditingId(p.id);
    setError(null);
  };

  const cancel = () => { setEditingId(null); setError(null); };

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(
      editingId === 'new' ? '/api/admin/partners' : `/api/admin/partners/${editingId}`,
      {
        method: editingId === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      },
    ).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (!json?.ok) {
      setError(json?.error ?? 'Не удалось сохранить партнёра.');
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function togglePublished(p: Partner) {
    setBusyId(p.id);
    await fetch(`/api/admin/partners/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm('Удалить партнёра безвозвратно?')) return;
    setBusyId(id);
    await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
    setBusyId(null);
    if (editingId === id) setEditingId(null);
    router.refresh();
  }

  return (
    <>
      {editingId === null && (
        <p className={styles.adminToolbar}>
          <button className={styles.btnPrimary} onClick={startNew}>+ Добавить партнёра</button>
        </p>
      )}

      {editingId !== null && (
        <div className={`${styles.form} ${styles.formBlock}`}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Название *</label>
              <input className={styles.input} value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Қазақстан Темір Жолы" />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label}>Логотип (URL) *</label>
              <input className={styles.input} value={form.logo_url}
                onChange={(e) => set({ logo_url: e.target.value })}
                placeholder="/partners/logo.png или https://…supabase.co/…" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Порядок</label>
              <input className={styles.input} type="number" value={form.order_index}
                onChange={(e) => set({ order_index: Number(e.target.value) || 0 })} />
            </div>
          </div>

          {form.logo_url.trim() !== '' && (
            <div className={styles.field}>
              <label className={styles.label}>Предпросмотр</label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logo_url} alt={form.name || 'Логотип'} className={styles.logoPreview} />
            </div>
          )}

          <label className={styles.checkLabel}>
            <input type="checkbox" className={styles.checkbox} checked={form.published}
              onChange={(e) => set({ published: e.target.checked })} />
            Опубликован на сайте
          </label>

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} onClick={save} disabled={busy}>
              {busy ? 'Сохранение…' : editingId === 'new' ? 'Создать' : 'Сохранить'}
            </button>
            <button className={styles.btnSecondary} onClick={cancel} disabled={busy}>Отмена</button>
          </div>
        </div>
      )}

      {partners.length === 0 ? (
        <p className={styles.pageSubtitle}>Партнёров пока нет.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Логотип</th>
                <th>Название</th>
                <th>URL</th>
                <th>Публикация</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.order_index}</td>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.logo_url} alt={p.name} className={styles.logoThumb} loading="lazy" />
                  </td>
                  <td>{p.name}</td>
                  <td className={styles.urlCell}>{p.logo_url}</td>
                  <td>
                    <button
                      className={`${styles.inlineToggle} ${p.published ? styles.inlineToggleOn : styles.inlineToggleOff}`}
                      disabled={busyId === p.id}
                      onClick={() => togglePublished(p)}
                    >
                      <span className={styles.inlineToggleLabel}>{p.published ? 'Виден' : 'Скрыт'}</span>
                    </button>
                  </td>
                  <td>
                    <button
                      className={styles.contactsAction}
                      disabled={busyId === p.id}
                      onClick={() => startEdit(p)}
                    >
                      Изменить
                    </button>
                    <button
                      className={`${styles.contactsAction} ${styles.contactsActionDanger}`}
                      disabled={busyId === p.id}
                      onClick={() => remove(p.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
