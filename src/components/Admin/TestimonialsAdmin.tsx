'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial } from '@/lib/types';
import styles from './admin.module.css';

type FormState = {
  client: string;
  signatory: string;
  role: string;
  date_label: string;
  category: string;
  project: string;
  quote: string;
  order_index: number;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  client: '', signatory: '', role: '', date_label: '',
  category: '', project: '', quote: '', order_index: 0, published: true,
};

export default function TestimonialsAdmin({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const startNew = () => {
    setForm({ ...EMPTY_FORM, order_index: testimonials.length });
    setEditingId('new');
    setError(null);
  };

  const startEdit = (t: Testimonial) => {
    setForm({
      client: t.client, signatory: t.signatory, role: t.role,
      date_label: t.date_label ?? '', category: t.category,
      project: t.project, quote: t.quote,
      order_index: t.order_index, published: t.published,
    });
    setEditingId(t.id);
    setError(null);
  };

  const cancel = () => { setEditingId(null); setError(null); };

  async function save() {
    setBusy(true);
    setError(null);
    const payload = { ...form, date_label: form.date_label.trim() === '' ? null : form.date_label };
    const res = await fetch(
      editingId === 'new' ? '/api/admin/testimonials' : `/api/admin/testimonials/${editingId}`,
      {
        method: editingId === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    ).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (!json?.ok) {
      setError(json?.error ?? 'Не удалось сохранить отзыв.');
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function togglePublished(t: Testimonial) {
    setBusyId(t.id);
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !t.published }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm('Удалить отзыв безвозвратно?')) return;
    setBusyId(id);
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    setBusyId(null);
    if (editingId === id) setEditingId(null);
    router.refresh();
  }

  return (
    <>
      {editingId === null && (
        <p className={styles.adminToolbar}>
          <button className={styles.btnPrimary} onClick={startNew}>+ Добавить отзыв</button>
        </p>
      )}

      {editingId !== null && (
        <div className={`${styles.form} ${styles.formBlock}`}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formRow}>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label}>Заказчик *</label>
              <input className={styles.input} value={form.client}
                onChange={(e) => set({ client: e.target.value })}
                placeholder="ТОО «Компания»" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Подписант</label>
              <input className={styles.input} value={form.signatory}
                onChange={(e) => set({ signatory: e.target.value })}
                placeholder="Иванов И. И." />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Должность</label>
              <input className={styles.input} value={form.role}
                onChange={(e) => set({ role: e.target.value })}
                placeholder="Директор" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Дата (текст)</label>
              <input className={styles.input} value={form.date_label}
                onChange={(e) => set({ date_label: e.target.value })}
                placeholder="5 января 2020" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Категория</label>
              <input className={styles.input} value={form.category}
                onChange={(e) => set({ category: e.target.value })}
                placeholder="Строительство · 500 м" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Порядок</label>
              <input className={styles.input} type="number" value={form.order_index}
                onChange={(e) => set({ order_index: Number(e.target.value) || 0 })} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Объект / выполненные работы</label>
            <textarea className={styles.textarea} rows={3} value={form.project}
              onChange={(e) => set({ project: e.target.value })} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Цитата (без кавычек) *</label>
            <textarea className={styles.textarea} rows={5} value={form.quote}
              onChange={(e) => set({ quote: e.target.value })} />
          </div>

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

      {testimonials.length === 0 ? (
        <p className={styles.pageSubtitle}>Отзывов пока нет.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Заказчик</th>
                <th>Подписант</th>
                <th>Категория</th>
                <th>Публикация</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td>{t.order_index}</td>
                  <td>{t.client}</td>
                  <td>{t.signatory}<br /><span className={styles.subtleText}>{t.role}</span></td>
                  <td>{t.category}</td>
                  <td>
                    <button
                      className={`${styles.inlineToggle} ${t.published ? styles.inlineToggleOn : styles.inlineToggleOff}`}
                      disabled={busyId === t.id}
                      onClick={() => togglePublished(t)}
                    >
                      <span className={styles.inlineToggleLabel}>{t.published ? 'Виден' : 'Скрыт'}</span>
                    </button>
                  </td>
                  <td>
                    <button
                      className={styles.contactsAction}
                      disabled={busyId === t.id}
                      onClick={() => startEdit(t)}
                    >
                      Изменить
                    </button>
                    <button
                      className={`${styles.contactsAction} ${styles.contactsActionDanger}`}
                      disabled={busyId === t.id}
                      onClick={() => remove(t.id)}
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
