import { getProjects } from '@/lib/data';
import KazakhstanMap from './KazakhstanMap';
import styles from './Geography.module.css';

export default async function Geography() {
  /* Counters count ALL projects, while the map only shows ones with coords */
  const allProjects = await getProjects();
  const mapProjects = allProjects.filter(p => p.x_map != null && p.y_map != null);
  const completed  = allProjects.filter(p => p.status === 'completed').length;
  const inProgress = allProjects.filter(p => p.status === 'in-progress').length;
  const planned    = allProjects.filter(p => p.status === 'planned').length;

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
              Реализованные объекты охватывают все ключевые промышленные
              и транзитные коридоры страны. Многолетний опыт работы
              в разных климатических и логистических условиях позволяет
              браться за проекты любой сложности.
            </p>
          </div>
        </div>

        <KazakhstanMap
          projects={mapProjects}
          stats={{ completed, inProgress, planned }}
        />
      </div>
    </section>
  );
}
