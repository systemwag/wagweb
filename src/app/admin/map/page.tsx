import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import { buildGeoIndex } from '@/lib/geo/works';
import GeoDiagnostics from '@/components/Admin/GeoDiagnostics';
import styles from '@/components/Admin/admin.module.css';

export const metadata = { title: 'Карта | WAG Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminMapPage() {
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  const index = buildGeoIndex(projects, maintenance, design);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Карта</h1>
          <p className={styles.pageSubtitle}>
            Координаты выводятся из поля «Местоположение» — расставлять точки вручную больше не нужно.
            Здесь видно, у кого адрес не разобрался и кто из-за этого не попадёт на карту.
          </p>
        </div>
      </div>

      <GeoDiagnostics index={index} />

    </>
  );
}
