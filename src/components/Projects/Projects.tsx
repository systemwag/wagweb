import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/data';
import type { Project } from '@/lib/types';
import styles from './Projects.module.css';

const COLOR_CYCLE = ['gold', 'teal', 'blue'] as const;

export default async function Projects() {
  const projects = await getFeaturedProjects();

  return (
    <section className={styles.section} id="projects">
      <div className="container">

        <div className={styles.header}>
          <span className="section-label">Наши проекты</span>
          <div className={styles.headerRow}>
            <h2 className={`heading-2 ${styles.title}`}>
              Реализованные<br />
              <span className="text-gradient-gold">объекты</span>
            </h2>
            <p className={styles.subtitle}>
              Отбираем знаковые проекты, которые отражают<br />
              весь масштаб нашей деятельности.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {projects.map((project: Project, idx: number) => {
            const color = COLOR_CYCLE[idx % 3];
            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className={`${styles.card} ${styles[`card_${color}`]}`}
                style={{
                  animationDelay: `${idx * 0.08}s`,
                  ...((project.image_url || (project.images && project.images.length > 0)) ? {
                    backgroundImage: `linear-gradient(to bottom, rgba(4,6,12,0.55) 0%, rgba(4,6,12,0.82) 55%, rgba(4,6,12,0.97) 100%), url(${project.image_url ?? project.images![0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : {}),
                }}
              >
                <div className={`${styles.cardStripe} ${styles[`stripe_${color}`]}`} />

                <div className={styles.cardTop}>
                  <span className={`${styles.category} ${styles[`cat_${color}`]}`}>
                    {project.category}
                  </span>
                  <span className={styles.year}>{project.year}</span>
                </div>

                <h3 className={styles.cardTitle}>{project.title}</h3>
                <p className={styles.cardDesc}>{project.description}</p>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 4 4.5 8.5 4.5 8.5S12.5 10 12.5 6C12.5 3.5 10.5 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    {project.location}
                  </div>
                  {project.length && (
                    <div className={styles.metaItem}>
                      <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                        <path d="M3 8h10M3 4h6M3 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      {project.length}
                    </div>
                  )}
                </div>

                {project.tags && (
                  <div className={styles.tags}>
                    {project.tags.map((tag) => (
                      <span key={tag} className={`${styles.tag} ${styles[`tag_${color}`]}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className={styles.cta}>
          <Link href="/projects" className="btn btn-outline">
            Все проекты
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
