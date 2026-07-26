import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import { buildGeoIndex } from '@/lib/geo/works';
import GeoMap from '@/components/GeoMap/GeoMap';
import styles from './Geography.module.css';

export default async function Geography() {
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  const index = buildGeoIndex(projects, maintenance, design);
  const regions = index.regions.length;

  return (
    <section className={styles.section} id="geography">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className="section-label">География работ</span>
            <h2 className={`heading-2 ${styles.title}`}>
              Реализуем проекты{' '}
              <span className="text-gradient-gold">по всему Казахстану</span>{' '}
              и ближнему зарубежью
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.desc}>
              Объекты — в {regions} регионах: от нефтегаза Прикаспия и горнорудных
              предприятий Актюбинской области до транспортных узлов на востоке
              страны и площадок заказчиков в России.
            </p>
          </div>
        </div>

        <GeoMap index={index} />
      </div>
    </section>
  );
}
