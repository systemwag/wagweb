'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export interface AdminContact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string | null; // 'new' | 'processed' (null = legacy rows → 'new')
  created_at: string;
}

export default function ContactsTable({ contacts }: { contacts: AdminContact[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function setStatus(id: number, status: 'new' | 'processed') {
    setBusyId(id);
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm('Удалить заявку безвозвратно?')) return;
    setBusyId(id);
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
    setBusyId(null);
    router.refresh();
  }

  if (contacts.length === 0) {
    return <p className={styles.pageSubtitle}>Заявок пока нет.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Имя</th>
            <th>Контакты</th>
            <th>Сообщение</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => {
            const isNew = (c.status ?? 'new') === 'new';
            return (
              <tr key={c.id}>
                <td>{new Date(c.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{c.name}</td>
                <td>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                  {c.phone ? <><br />{c.phone}</> : null}
                </td>
                <td className={styles.contactsMessage}>{c.message}</td>
                <td>{isNew ? 'Новая' : 'Обработана'}</td>
                <td>
                  <button
                    className={styles.contactsAction}
                    disabled={busyId === c.id}
                    onClick={() => setStatus(c.id, isNew ? 'processed' : 'new')}
                  >
                    {isNew ? 'В обработано' : 'Вернуть в новые'}
                  </button>
                  <button
                    className={`${styles.contactsAction} ${styles.contactsActionDanger}`}
                    disabled={busyId === c.id}
                    onClick={() => remove(c.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
