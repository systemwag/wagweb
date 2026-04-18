import Link from 'next/link';
import DesignProjectForm from '@/components/Admin/DesignProjectForm';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Новая запись | Проектная деятельность | WAG Admin' };

export default function NewDesignProjectPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Новая запись</h1>
          <p className={styles.pageSubtitle}>Проектная деятельность</p>
        </div>
        <Link href="/admin/design" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <DesignProjectForm />
    </>
  );
}
