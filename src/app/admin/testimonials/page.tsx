import { createServiceClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/data';
import type { Testimonial } from '@/lib/types';
import TestimonialsAdmin from '@/components/Admin/TestimonialsAdmin';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Отзывы | WAG Admin' };
export const dynamic = 'force-dynamic';

async function getTestimonialRows(): Promise<{ rows: Testimonial[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: 'Supabase не настроен — управление отзывами недоступно (сайт показывает встроенные seed-данные).' };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    return {
      rows: [],
      error:
        error.code === '42P01'
          ? 'Таблица testimonials не создана — выполните supabase/rls-policies.sql в SQL-редакторе Supabase.'
          : 'Не удалось загрузить отзывы.',
    };
  }
  return { rows: (data ?? []) as Testimonial[], error: null };
}

export default async function AdminTestimonialsPage() {
  const { rows, error } = await getTestimonialRows();
  const published = rows.filter((t) => t.published).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Отзывы</h1>
          <p className={styles.pageSubtitle}>
            {error ? error : `${rows.length} писем, ${published} опубликовано`}
          </p>
        </div>
      </div>

      {!error && <TestimonialsAdmin testimonials={rows} />}
    </>
  );
}
