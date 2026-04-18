import Link from 'next/link';
import { getProjects } from '@/lib/data';
import ProjectsTable from '@/components/Admin/ProjectsTable';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'СМР | WAG Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>СМР</h1>
          <p className={styles.pageSubtitle}>{projects.length} проектов в базе</p>
        </div>
        <Link href="/admin/projects/new" className={styles.btnPrimary}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Новый проект
        </Link>
      </div>

      <ProjectsTable projects={projects} />
    </>
  );
}
