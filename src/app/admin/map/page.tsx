import { getProjects } from '@/lib/data';
import MapCalibrator from '@/components/Admin/MapCalibrator';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Калибровка карты | WAG Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminMapPage() {
  const projects = await getProjects();
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Калибровка карты</h1>
          <p className={styles.pageSubtitle}>Перетащите точки, скопируйте координаты в data.ts</p>
        </div>
      </div>
      <MapCalibrator projects={projects} />
    </>
  );
}
