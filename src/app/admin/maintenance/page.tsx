import Link from 'next/link';
import { getMaintenanceProjects } from '@/lib/data';
import MaintenanceTable from '@/components/Admin/MaintenanceTable';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Обслуживание и текущий ремонт | WAG Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminMaintenancePage() {
  const projects = await getMaintenanceProjects();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Обслуживание и текущий ремонт</h1>
          <p className={styles.pageSubtitle}>{projects.length} проектов в базе</p>
        </div>
        <Link href="/admin/maintenance/new" className={styles.btnPrimary}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Новый проект
        </Link>
      </div>

      <MaintenanceTable projects={projects} />
    </>
  );
}
