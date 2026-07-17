import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { getMaintenanceProjects } from '@/lib/data';
import { WORK_TYPE_LABELS, type WorkType } from '@/lib/types';
import styles from './maintenance.module.css';

export const metadata: Metadata = {
  title: 'Техническое обслуживание и ремонт инфраструктуры',
  description:
    'Текущее содержание, текущий и капитальный ремонт, осмотр и дефектация, реконструкция инженерной и транспортной инфраструктуры в Казахстане. Долгосрочные контракты обслуживания.',
};

const STATUS_LABEL: Record<string, string> = {
  'completed': 'Завершён',
  'ongoing':   'Текущий',
};

const WORK_TYPE_COLOR: Record<WorkType, string> = {
  current_maintenance: '#00C4A7',
  current_repair:      '#D4A843',
  medium_repair:       '#F0C85A',
  capital_repair:      '#FAE08A',
  inspection:          '#4F84FF',
  reconstruction:      '#D4A843',
};

const WORK_TYPES_ORDER: WorkType[] = [
  'current_maintenance',
  'current_repair',
  'medium_repair',
  'capital_repair',
  'inspection',
  'reconstruction',
];

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ work_type?: string }>;
}) {
  const params = await searchParams;
  const workType = params.work_type as WorkType | undefined;

  const [filtered, all] = await Promise.all([
    getMaintenanceProjects(workType),
    getMaintenanceProjects(),
  ]);

  /* Pre-count projects per work_type for filter chips */
  const countByType: Record<string, number> = {};
  for (const p of all) {
    countByType[p.work_type] = (countByType[p.work_type] ?? 0) + 1;
  }

  return (
    <>
      <main className={styles.main}>

        {/* ── Hero ─────────────────────────────────── */}
        <section className={`${styles.hero} filmgrain`}>
          <div className="hero-hairline" aria-hidden="true" />
          <div className="container hero-parallax">
            <span className="section-label hero-reveal-1">Обслуживание инфраструктуры</span>
            <h1 className={`heading-1 ${styles.heroTitle} hero-reveal-2`}>
              Обслуживание<br />
              <span className="text-gradient-gold">и текущий ремонт</span>
            </h1>
            <p className={`${styles.heroDesc} hero-reveal-3`}>
              Долгосрочные контракты содержания, текущий и капитальный ремонт,
              осмотр и дефектация, реконструкция инженерной инфраструктуры.
            </p>

            <div className={`${styles.heroStats} hero-reveal-4`}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{all.length}+</span>
                <span className={styles.statLabel}>Объектов</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{countByType.current_maintenance ?? 0}</span>
                <span className={styles.statLabel}>На содержании</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{(countByType.current_repair ?? 0) + (countByType.medium_repair ?? 0) + (countByType.capital_repair ?? 0)}</span>
                <span className={styles.statLabel}>Ремонтов</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{countByType.reconstruction ?? 0}</span>
                <span className={styles.statLabel}>Реконструкций</span>
              </div>
            </div>
          </div>
          <div className="hero-glow-gold" aria-hidden="true" />
        </section>

        {/* ── Filters ──────────────────────────────── */}
        <div className={styles.filtersWrap}>
          <div className="container">
            <div className={styles.filters}>
              <Link
                href="/maintenance"
                className={`${styles.filterBtn} ${!workType ? styles.filterActive : ''}`}
              >
                Все
                <span className={styles.filterCount}>{all.length}</span>
              </Link>
              {WORK_TYPES_ORDER.map((wt) => (
                countByType[wt] ? (
                  <Link
                    key={wt}
                    href={`/maintenance?work_type=${wt}`}
                    className={`${styles.filterBtn} ${workType === wt ? styles.filterActive : ''}`}
                  >
                    {WORK_TYPE_LABELS[wt]}
                    <span className={styles.filterCount}>{countByType[wt]}</span>
                  </Link>
                ) : null
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────── */}
        <section className={styles.gridSection}>
          <div className="container">
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>По выбранному типу работ проектов не найдено.</p>
                <Link href="/maintenance" className="btn btn-outline">Показать все</Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((project, index) => {
                  const accentColor = WORK_TYPE_COLOR[project.work_type] ?? '#D4A843';
                  const hasImage = Boolean(project.image_url || (project.images && project.images.length > 0));
                  const statusClass = project.status === 'completed'
                    ? styles.statusCompleted
                    : styles.statusInProgress;

                  return (
                    <Link
                      key={project.id}
                      href={`/maintenance/${project.slug}`}
                      data-tilt
                      className={`${styles.card} ${index === 0 ? styles.cardFeatured : ''}`}
                      style={{
                        '--card-accent': accentColor,
                        animationDelay: `${index * 0.05}s`,
                      } as React.CSSProperties}
                    >
                      <div className={`${styles.cardImage} ${hasImage ? '' : styles.cardImageEmpty}`}>
                        {hasImage ? (
                          <img
                            src={project.image_url ?? project.images![0]}
                            alt={project.title}
                            className={styles.cardImageReal}
                          />
                        ) : (
                          <div className={styles.cardImageInner} />
                        )}
                        <div className={styles.cardImageOverlay} aria-hidden="true" />

                        <span className={styles.cardIndex}>
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div className={`${styles.cardStatus} ${statusClass}`}>
                          <span className={styles.statusDot} />
                          {STATUS_LABEL[project.status] ?? project.status}
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <span className={styles.cardCategory}>
                            {WORK_TYPE_LABELS[project.work_type]}
                          </span>
                          <span className={styles.cardYear2}>{project.period}</span>
                        </div>

                        <h2 className={styles.cardTitle}>{project.title}</h2>
                        {project.description && (
                          <p className={styles.cardDesc}>{project.description}</p>
                        )}

                        <div className={styles.cardMeta}>
                          {project.client && (
                            <span className={styles.metaItem}>
                              <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                                <path d="M7 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 13c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.2"/>
                              </svg>
                              {project.client}
                            </span>
                          )}
                          <span className={styles.metaItem}>
                            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                              <path d="M7 1C4.8 1 3 2.8 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
                              <circle cx="7" cy="5" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                            {project.location}
                          </span>
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div className={styles.cardTags}>
                            {project.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        )}

                        <span className={styles.cardArrow}>
                          Подробнее
                          <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
