import { getProjects } from '@/lib/data';
import ShowcaseStage from './ShowcaseStage';
import styles from './ProjectShowcase.module.css';

export default async function ProjectShowcase() {
  const all = await getProjects();

  /* Projects with map coords, featured first */
  const mapped = all.filter(p => p.x_map != null && p.y_map != null);
  const display = [
    ...mapped.filter(p => p.featured),
    ...mapped.filter(p => !p.featured).sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
  ];

  if (!display.length) return null;

  return (
    <section className={styles.section} id="showcase">
      <div className="container">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Избранные объекты</span>
          <h2 className={`section-title ${styles.title}`}>
            Хроника наших работ
          </h2>
          <p className={styles.subtitle}>
            Реализованные объекты железнодорожной инфраструктуры,<br />
            строительства и инженерных изысканий по всему Казахстану
          </p>
        </div>

        {/* ── Animated stage ───────────────────────────────────────── */}
        <ShowcaseStage projects={display} />

      </div>
    </section>
  );
}
