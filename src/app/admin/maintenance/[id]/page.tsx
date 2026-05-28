import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMaintenanceProjectBySlug, getMaintenanceProjects } from '@/lib/data';
import MaintenanceForm from '@/components/Admin/MaintenanceForm';
import styles from '@/components/Admin/admin.module.css';

export const dynamic = 'force-dynamic';

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const all = await getMaintenanceProjects();
  const project = all.find(p => String(p.id) === id) ?? await getMaintenanceProjectBySlug(id);

  if (!project) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Редактировать проект</h1>
          <p className={styles.pageSubtitle}>{project.title}</p>
        </div>
        <Link href="/admin/maintenance" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <MaintenanceForm project={project} />
    </>
  );
}
