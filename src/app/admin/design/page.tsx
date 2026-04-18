import Link from 'next/link';
import { getDesignProjects } from '@/lib/data';
import DesignProjectsTable from '@/components/Admin/DesignProjectsTable';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Проектная деятельность | WAG Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminDesignPage() {
  const projects = await getDesignProjects();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Проектная деятельность</h1>
          <p className={styles.pageSubtitle}>{projects.length} записей в базе</p>
        </div>
        <Link href="/admin/design/new" className={styles.btnPrimary}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Новая запись
        </Link>
      </div>
      <DesignProjectsTable projects={projects} />
    </>
  );
}
