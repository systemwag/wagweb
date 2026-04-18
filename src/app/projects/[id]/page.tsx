import type { Metadata } from 'next';
import { notFound }         from 'next/navigation';
import Link                  from 'next/link';
import Footer                from '@/components/Footer/Footer';
import { getProjectBySlug, getProjectSlugs } from '@/lib/data';
import styles                from './project.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectBySlug(id);
  if (!project) return { title: 'Проект не найден | West Arlan Group' };

  return {
    title: `${project.title} | West Arlan Group`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((id) => ({ id }));
}

export default async function ProjectPage({ params }: Props) {
  const { id }  = await params;
  const project = await getProjectBySlug(id);

  if (!project) notFound();

  return (
    <>

      <main className={styles.main}>

        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <div className="container">
            <nav className={styles.breadcrumbNav} aria-label="Навигация">
              <Link href="/"        className={styles.breadcrumbLink}>Главная</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/projects" className={styles.breadcrumbLink}>Проекты</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{project.title}</span>
            </nav>
          </div>
        </div>

        {/* ── Project hero ── */}
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.category}>{project.category}</span>
            <h1 className={`heading-1 ${styles.title}`}>{project.title}</h1>

            <div className={styles.metaBar}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Год</span>
                <span className={styles.metaValue}>{project.year}</span>
              </div>
              <div className={styles.metaSep} />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Регион</span>
                <span className={styles.metaValue}>{project.location}</span>
              </div>
              {project.length && (
                <>
                  <div className={styles.metaSep} />
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Масштаб</span>
                    <span className={styles.metaValue}>{project.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.contentGrid}>

              {/* Main text */}
              <div className={styles.contentMain}>
                {/* Project images */}
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
                      <span className={styles.imagePlaceholderYear}>{project.year}</span>
                      <span className={styles.imagePlaceholderLabel}>{project.category}</span>
                    </div>
                  </div>
                )}

                <h2 className={`heading-3 ${styles.sectionHeading}`}>Описание проекта</h2>
                <p className={styles.description}>{project.description}</p>

                <h2 className={`heading-3 ${styles.sectionHeading}`}>Выполненные работы</h2>
                <p className={styles.description}>
                  В рамках данного проекта специалисты West Arlan Group выполнили полный комплекс
                  работ от предпроектной подготовки до сдачи объекта заказчику. На всех этапах
                  осуществлялся строгий контроль качества в соответствии с требованиями
                  нормативно-технической документации РК.
                </p>
              </div>

              {/* Sidebar */}
              <aside className={styles.sidebar}>
                {/* Tags */}
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

                {/* Project info */}
                <div className={`glass-card ${styles.sideCard}`}>
                  <h3 className={styles.sideTitle}>Информация</h3>
                  <dl className={styles.infoList}>
                    <dt className={styles.infoKey}>Заказчик</dt>
                    <dd className={styles.infoVal}>Конфиденциально</dd>
                    <dt className={styles.infoKey}>Год завершения</dt>
                    <dd className={styles.infoVal}>{project.year}</dd>
                    <dt className={styles.infoKey}>Локация</dt>
                    <dd className={styles.infoVal}>{project.location}</dd>
                    {project.length && (
                      <>
                        <dt className={styles.infoKey}>Масштаб</dt>
                        <dd className={styles.infoVal}>{project.length}</dd>
                      </>
                    )}
                    <dt className={styles.infoKey}>Категория</dt>
                    <dd className={styles.infoVal}>{project.category}</dd>
                  </dl>
                </div>

                {/* CTA */}
                <div className={styles.sideCta}>
                  <p className={styles.sideCtaText}>
                    Похожий проект? Свяжитесь с нами — обсудим детали.
                  </p>
                  <a href="/contacts" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Обсудить проект
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Back link ── */}
        <div className={styles.back}>
          <div className="container">
            <Link href="/projects" className="btn btn-outline">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Все проекты
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}
