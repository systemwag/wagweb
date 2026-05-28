import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { getMaintenanceProjectBySlug, getMaintenanceSlugs } from '@/lib/data';
import { WORK_TYPE_LABELS } from '@/lib/types';
import styles from '../../projects/[id]/project.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getMaintenanceProjectBySlug(slug);
  if (!project) return { title: 'Проект не найден | West Arlan Group' };

  return {
    title: `${project.title} | West Arlan Group`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  const slugs = await getMaintenanceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function MaintenanceDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getMaintenanceProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <main className={styles.main}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className="container">
            <nav className={styles.breadcrumbNav} aria-label="Навигация">
              <Link href="/" className={styles.breadcrumbLink}>Главная</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/maintenance" className={styles.breadcrumbLink}>Обслуживание</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{project.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section
          className={styles.hero}
          style={{ viewTransitionName: `maintenance-${project.slug}` }}
        >
          <div className="container">
            <span className={styles.category}>{WORK_TYPE_LABELS[project.work_type]}</span>
            <h1 className={`heading-1 ${styles.title}`}>{project.title}</h1>

            <div className={styles.metaBar}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Период</span>
                <span className={styles.metaValue}>{project.period}</span>
              </div>
              <div className={styles.metaSep} />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Регион</span>
                <span className={styles.metaValue}>{project.location}</span>
              </div>
              {project.client && (
                <>
                  <div className={styles.metaSep} />
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Заказчик</span>
                    <span className={styles.metaValue}>{project.client}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.contentGrid}>

              <div className={styles.contentMain}>
                {project.images && project.images.length > 0 ? (
                  <div className={styles.imageGallery}>
                    <div className={styles.imageMain}>
                      <img
                        src={project.image_url ?? project.images[0]}
                        alt={project.title}
                        className={styles.imageMainImg}
                      />
                    </div>
                    {project.images.length > 1 && (
                      <div className={styles.imageThumbs}>
                        {project.images.map((img, idx) => (
                          <div key={img} className={styles.imageThumbWrap}>
                            <img
                              src={img}
                              alt={`${project.title} — фото ${idx + 1}`}
                              className={styles.imageThumbImg}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : project.image_url ? (
                  <div className={styles.imageGallery}>
                    <div className={styles.imageMain}>
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className={styles.imageMainImg}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.imageBlock} aria-hidden="true">
                    <div className={styles.imagePlaceholder}>
                      <span className={styles.imagePlaceholderYear}>{project.period}</span>
                      <span className={styles.imagePlaceholderLabel}>{WORK_TYPE_LABELS[project.work_type]}</span>
                    </div>
                  </div>
                )}

                <h2 className={`heading-3 ${styles.sectionHeading}`}>Описание работ</h2>
                <p className={styles.description}>{project.description}</p>
              </div>

              {/* Sidebar */}
              <aside className={styles.sidebar}>
                {project.tags && project.tags.length > 0 && (
                  <div className={`glass-card ${styles.sideCard}`}>
                    <h3 className={styles.sideTitle}>Виды работ</h3>
                    <div className={styles.tags}>
                      {project.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`glass-card ${styles.sideCard}`}>
                  <h3 className={styles.sideTitle}>Информация</h3>
                  <dl className={styles.infoList}>
                    {project.client && (
                      <>
                        <dt className={styles.infoKey}>Заказчик</dt>
                        <dd className={styles.infoVal}>{project.client}</dd>
                      </>
                    )}
                    <dt className={styles.infoKey}>Период</dt>
                    <dd className={styles.infoVal}>{project.period}</dd>
                    <dt className={styles.infoKey}>Локация</dt>
                    <dd className={styles.infoVal}>{project.location}</dd>
                    <dt className={styles.infoKey}>Тип работ</dt>
                    <dd className={styles.infoVal}>{WORK_TYPE_LABELS[project.work_type]}</dd>
                    <dt className={styles.infoKey}>Статус</dt>
                    <dd className={styles.infoVal}>
                      {project.status === 'completed' ? 'Завершён' : 'Текущий (в работе)'}
                    </dd>
                  </dl>
                </div>

                <div className={styles.sideCta}>
                  <p className={styles.sideCtaText}>
                    Нужно регулярное обслуживание ваших путей? Свяжитесь с нами.
                  </p>
                  <a href="/contacts" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Обсудить контракт
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className={styles.back}>
          <div className="container">
            <Link href="/maintenance" className="btn btn-outline">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Все проекты обслуживания
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}
