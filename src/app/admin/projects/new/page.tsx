import Link from 'next/link';
import ProjectForm from '@/components/Admin/ProjectForm';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Новый проект | WAG Admin' };

export default function NewProjectPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Новый проект</h1>
          <p className={styles.pageSubtitle}>Заполните поля и поставьте точку на карте</p>
        </div>
        <Link href="/admin/projects" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <ProjectForm />
    </>
  );
}
