import Link from 'next/link';
import MaintenanceForm from '@/components/Admin/MaintenanceForm';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Новый проект | WAG Admin' };

export default function NewMaintenancePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Новый проект обслуживания</h1>
          <p className={styles.pageSubtitle}>Заполните поля проекта</p>
        </div>
        <Link href="/admin/maintenance" className={styles.btnSecondary}>← Назад</Link>
      </div>
      <MaintenanceForm />
    </>
  );
}
