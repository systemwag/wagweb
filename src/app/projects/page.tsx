import type { Metadata } from 'next';
import Footer  from '@/components/Footer/Footer';
import KazakhstanMap from '@/components/Map/KazakhstanMap';
import { getProjects, getProjectCategories, getMapProjects } from '@/lib/data';
import styles from './projects.module.css';
import Link   from 'next/link';

export const metadata: Metadata = {
  title: 'Строительные работы | West Arlan Group',
  description: 'Выполненные строительные работы West Arlan Group: железнодорожные пути, инженерные коммуникации и промышленные объекты по всему Казахстану.',
};

const STATUS_LABEL: Record<string, string> = {
  'completed':   'Завершён',
  'in-progress': 'В процессе',
  'planned':     'Планируется',
};

/* Accent colour per category — used as CSS custom property on each card */
const CATEGORY_COLOR: Record<string, string> = {
  'Железнодорожная инфраструктура': '#D4A843',
  'Инженерные изыскания':           '#00C4A7',
  'Промышленные объекты':           '#4F84FF',
  'Коммуникации':                   '#00C4A7',
  'Геодезия':                       '#F0C85A',
  'Проектирование':                  '#D4A843',
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params   = await searchParams;
  const category = params.category;

  const [projects, allProjects, categories, mapProjects] = await Promise.all([
    getProjects(category),
    getProjects(),
    Promise.resolve(getProjectCategories()),
    getMapProjects(),
  ]);

  /* Stats count ALL projects; map shows only projects with coords */
  const completed  = allProjects.filter(p => p.status === 'completed').length;
  const inProgress = allProjects.filter(p => p.status === 'in-progress').length;
  const planned    = allProjects.filter(p => p.status === 'planned').length;

  return (
    <>

      <main className={styles.main}>

        {/* ── Hero ───────────────────────────────────── */}
        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">Строительная деятельность</span>
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              Выполненные<br />
              <span className="text-gradient-gold">строительные работы</span>
            </h1>
            <p className={styles.heroDesc}>
              Железнодорожные пути, инженерные коммуникации
              и промышленные объекты — реализуем «под ключ»
              по всему Казахстану.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{projects.length}+</span>
                <span className={styles.statLabel}>Объектов</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{categories.length}</span>
                <span className={styles.statLabel}>Направлений</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>15+</span>
                <span className={styles.statLabel}>Лет опыта</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{completed}</span>
                <span className={styles.statLabel}>Завершено</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Map ────────────────────────────────────── */}
        <section className={styles.mapSection}>
          <div className="container">
            <KazakhstanMap
              projects={mapProjects}
              stats={{ completed, inProgress, planned }}
            />
          </div>
        </section>

        {/* ── Filters ────────────────────────────────── */}
        <div className={styles.filtersWrap}>
          <div className="container">
            <div className={styles.filters}>
              <Link
                href="/projects"
                className={`${styles.filterBtn} ${!category ? styles.filterActive : ''}`}
              >
                Все
                <span className={styles.filterCount}>{mapProjects.length}</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/projects?category=${encodeURIComponent(cat)}`}
                  className={`${styles.filterBtn} ${category === cat ? styles.filterActive : ''}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────── */}
        <section className={styles.gridSection}>
          <div className="container">
            {projects.length === 0 ? (
              <div className={styles.empty}>
                <p>По выбранной категории проектов не найдено.</p>
                <Link href="/projects" className="btn btn-outline">Показать все</Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {projects.map((project, index) => {
                  const statusClass =
                    project.status === 'completed'   ? styles.statusCompleted  :
                    project.status === 'in-progress' ? styles.statusInProgress :
                    styles.statusPlanned;

                  const accentColor = CATEGORY_COLOR[project.category] ?? '#D4A843';

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className={`${styles.card} ${index === 0 ? styles.cardFeatured : ''}`}
                      style={{
                        '--card-accent': accentColor,
                        animationDelay: `${index * 0.05}s`,
                      } as React.CSSProperties}
                    >
                      {/* Image / visual area */}
                      <div className={styles.cardImage}>
                        {(project.image_url || (project.images && project.images.length > 0)) ? (
                          <img
                            src={project.image_url ?? project.images![0]}
                            alt={project.title}
                            className={styles.cardImageReal}
                          />
                        ) : (
                          <div className={styles.cardImageInner} />
                        )}

                        {/* Overlay gradient for text readability */}
                        <div className={styles.cardImageOverlay} aria-hidden="true" />

                        {/* Sequential index */}
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
                          <span className={styles.cardCategory}>{project.category}</span>
                          <span className={styles.cardYear2}>{project.year}</span>
                        </div>

                        <h2 className={styles.cardTitle}>{project.title}</h2>
                        <p className={styles.cardDesc}>{project.description}</p>

                        <div className={styles.cardMeta}>
                          <span className={styles.metaItem}>
                            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                              <path d="M7 1C4.8 1 3 2.8 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
                              <circle cx="7" cy="5" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                            {project.location}
                          </span>
                          {project.length && (
                            <span className={styles.metaItem}>
                              <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                                <path d="M2 7h10M2 4h5M2 10h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                              </svg>
                              {project.length}
                            </span>
                          )}
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
