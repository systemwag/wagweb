import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, getProjects } from '@/lib/data';
import ProjectForm from '@/components/Admin/ProjectForm';
import styles from '@/components/Admin/admin.module.css';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // id can be numeric ID or slug — try both
  const all = await getProjects();
  const project = all.find(p => String(p.id) === id) ?? await getProjectBySlug(id);

  if (!project) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Редактировать проект</h1>
          <p className={styles.pageSubtitle}>{project.title}</p>
        </div>
        <Link href="/admin/projects" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <ProjectForm project={project} />
    </>
  );
}
