import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDesignProjectById } from '@/lib/data';
import DesignProjectForm from '@/components/Admin/DesignProjectForm';
import styles from '@/components/Admin/admin.module.css';

export const dynamic = 'force-dynamic';

export default async function EditDesignProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getDesignProjectById(Number(id));
  if (!project) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Редактировать запись</h1>
          <p className={styles.pageSubtitle}>{project.client}</p>
        </div>
        <Link href="/admin/design" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <DesignProjectForm project={project} />
    </>
  );
}
