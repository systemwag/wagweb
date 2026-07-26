import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer/Footer';
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd';
import { getDesignProjectById } from '@/lib/data';
import type { DesignCategory } from '@/lib/types';
import styles from './design-detail.module.css';

const CATEGORY_LABEL: Record<DesignCategory, string> = {
  'full-cycle':    'Полный цикл',
  'design':        'Рабочий проект',
  'documentation': 'Документация',
  'feasibility':   'Тех. возможность',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getDesignProjectById(Number(id));
  if (!project) return { title: 'Проект не найден' };
  return {
    // Суффикс «| West Arlan Group» добавит title.template из корневого layout.
    title: `Проектирование: ${project.client}`,
    description:
      project.description ??
      `Проектные работы West Arlan Group для ${project.client}: ${project.works.slice(0, 3).join(', ')}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getDesignProjectById(Number(id));
  if (!project) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Проектная деятельность', path: '/design' },
          { name: project.client },
        ]}
      />
      <main className={styles.main}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className="container">
            <nav className={styles.breadNav}>
              <Link href="/">Главная</Link>
              <span>/</span>
              <Link href="/design">Проектная деятельность</Link>
              <span>/</span>
              <span>{project.client}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroMeta}>
              <span className={`${styles.badge} ${styles[`badge_${project.category}`]}`}>
                {CATEGORY_LABEL[project.category]}
              </span>
              {project.number && (
                <span className={styles.heroNum}>Объект №{project.number}</span>
              )}
            </div>
            <h1 className={`heading-1 ${styles.heroTitle}`}>{project.client}</h1>
            {project.description && (
              <p className={styles.heroDesc}>{project.description}</p>
            )}
            <div className={styles.heroInfo}>
              {project.location && (
                <div className={styles.infoItem}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {project.location}
                </div>
              )}
              {project.year && (
                <div className={styles.infoItem}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M2 7h12M6 2v2M10 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {project.year} г.
                </div>
              )}
              <div className={styles.infoItem}>
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Завершён
              </div>
            </div>
          </div>
          <div className={styles.heroGlow} />
        </section>

        {/* Works */}
        <section className={styles.worksSection}>
          <div className="container">
            <div className={styles.worksCard}>
              <h2 className={`heading-3 ${styles.worksTitle}`}>Состав выполненных работ</h2>
              <ul className={styles.worksList}>
                {project.works.map((work, i) => (
                  <li key={i} className={styles.workItem}>
                    <span className={styles.workDot}>
                      <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                        <circle cx="6" cy="6" r="5" stroke="var(--teal)" strokeWidth="1"/>
                        <path d="M3.5 6l1.5 1.5 3-3" stroke="var(--teal)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Чертежи проекта. Листы широкие (планы М1:1000 и продольные
                профили), поэтому вписываем целиком через object-fit: contain —
                кадрировать их нельзя, теряется содержание. */}
            {project.images.length > 0 && (
              <div className={styles.drawingsCard}>
                <h2 className={`heading-3 ${styles.worksTitle}`}>
                  Чертежи проекта
                  <span className={styles.drawingsCount}>{project.images.length}</span>
                </h2>
                <div className={styles.drawingsGrid}>
                  {project.images.map((src, i) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.drawingFrame}
                    >
                      <Image
                        src={src}
                        alt={`${project.client} — чертёж ${i + 1} из ${project.images.length}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.drawingImg}
                      />
                      <span className={styles.drawingZoom} aria-hidden>
                        <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M10.5 10.5L14 14M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.backRow}>
              <Link href="/design" className="btn btn-outline">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Все проектные работы
              </Link>
              <Link href="/contacts" className="btn btn-primary">
                Обсудить проект
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
