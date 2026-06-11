import { createServiceClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/data';
import type { Partner } from '@/lib/types';
import PartnersAdmin from '@/components/Admin/PartnersAdmin';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Партнёры | WAG Admin' };
export const dynamic = 'force-dynamic';

async function getPartnerRows(): Promise<{ rows: Partner[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: 'Supabase не настроен — управление партнёрами недоступно (сайт показывает встроенные seed-данные).' };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    return {
      rows: [],
      error:
        error.code === '42P01'
          ? 'Таблица partners не создана — выполните supabase/rls-policies.sql в SQL-редакторе Supabase.'
          : 'Не удалось загрузить партнёров.',
    };
  }
  return { rows: (data ?? []) as Partner[], error: null };
}

export default async function AdminPartnersPage() {
  const { rows, error } = await getPartnerRows();
  const published = rows.filter((p) => p.published).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Партнёры</h1>
          <p className={styles.pageSubtitle}>
            {error ? error : `${rows.length} логотипов, ${published} опубликовано`}
          </p>
        </div>
      </div>

      {!error && <PartnersAdmin partners={rows} />}
    </>
  );
}
