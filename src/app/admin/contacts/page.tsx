import { createServiceClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/data';
import ContactsTable, { type AdminContact } from '@/components/Admin/ContactsTable';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Заявки | WAG Admin' };
export const dynamic = 'force-dynamic';

async function getContacts(): Promise<{ contacts: AdminContact[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { contacts: [], error: 'Supabase не настроен — заявки недоступны.' };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return {
      contacts: [],
      error:
        error.code === '42P01'
          ? 'Таблица contacts не создана — выполните supabase/rls-policies.sql в SQL-редакторе Supabase.'
          : 'Не удалось загрузить заявки.',
    };
  }
  return { contacts: (data ?? []) as AdminContact[], error: null };
}

export default async function AdminContactsPage() {
  const { contacts, error } = await getContacts();
  const fresh = contacts.filter((c) => (c.status ?? 'new') === 'new').length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Заявки</h1>
          <p className={styles.pageSubtitle}>
            {error ? error : `${contacts.length} заявок, ${fresh} новых`}
          </p>
        </div>
      </div>

      {!error && <ContactsTable contacts={contacts} />}
    </>
  );
}
