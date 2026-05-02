import Link from 'next/link';
import styles from './Services.module.css';

interface Direction {
  id: string;
  label: string;
  href: string;
  color: 'gold' | 'teal';
  icon: React.ReactNode;
  description: string;
  workCount: number;
  industries?: string[];
  services: string[];
}

const directions: Direction[] = [
  {
    id: 'design',
    label: 'Проектная деятельность',
    href: '/design',
    color: 'gold',
    icon: (
      <svg className="svg-draw" viewBox="0 0 64 64" fill="none" width="64" height="64">
        {/* Document outline */}
        <rect x="10" y="8" width="40" height="48" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        {/* Title block */}
        <path d="M16 16h28M16 22h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Coordinate axes */}
        <path d="M18 46V32M18 46h22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Plotted curve */}
        <path d="M18 42 L22 38 L26 40 L30 34 L34 36 L38 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Plot points */}
        <circle cx="22" cy="38" r="1.2" fill="currentColor"/>
        <circle cx="26" cy="40" r="1.2" fill="currentColor"/>
        <circle cx="30" cy="34" r="1.2" fill="currentColor"/>
        <circle cx="34" cy="36" r="1.2" fill="currentColor"/>
        <circle cx="38" cy="30" r="1.2" fill="currentColor"/>
        {/* Compass mark */}
        <circle cx="46" cy="36" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M46 32v8M42 36h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
    description:
      'Полный цикл изысканий и разработки проектной документации для объектов любой сложности.',
    workCount: 8,
    services: [
      'Инженерно-геодезические изыскания',
      'Инженерно-геологические изыскания',
      'Инженерно-гидрологические изыскания',
      'Разработка проектной документации',
      'BIM-проектирование',
      'Экспертиза проектов',
    ],
  },
  {
    id: 'construction',
    label: 'Строительная деятельность',
    href: '/projects',
    color: 'teal',
    icon: (
      <svg className="svg-draw" viewBox="0 0 64 64" fill="none" width="64" height="64">
        {/* Ground line */}
        <path d="M6 54h52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Crane mast */}
        <path d="M16 54V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Crane truss (X-pattern) */}
        <path d="M16 14h28M16 22l28 0M16 30l28 0" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M16 14L44 22M44 14L16 22M16 22L44 30M44 22L16 30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        {/* Crane jib */}
        <path d="M44 14V8H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* Hook */}
        <path d="M40 8v14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
        <rect x="38" y="22" width="4" height="3" stroke="currentColor" strokeWidth="1.2"/>
        {/* Building blocks at base */}
        <rect x="22" y="46" width="6" height="8" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="30" y="42" width="6" height="12" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="38" y="38" width="6" height="16" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="46" y="34" width="6" height="20" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    description:
      'Выполняем строительство «под ключ» в 5 отраслях инфраструктуры — от подготовки территории до сдачи объекта в эксплуатацию.',
    workCount: 11,
    industries: ['Дороги', 'Трубопроводы', 'ЛЭП', 'Промышленность', 'Сети'],
    services: [
      'Автомобильные и железные дороги',
      'Магистральные трубопроводы и резервуары',
      'Линии электропередач и связи',
      'Промышленные объекты и сооружения',
      'Инженерные сети, СЦБ, контактная сеть',
      'Земляные и специальные работы в грунтах',
    ],
  },
];


export default function Services() {
  return (
    <section className={styles.section} id="services">
      <div className="container">

        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <span className="section-label">Направления деятельности</span>
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Два ключевых<br />
              <span className="text-gradient-gold">направления группы</span>
            </h2>
          </div>

          <div className={styles.sectionHeaderRight}>
            <div className={styles.sideStat}>
              <span className={styles.sideStatNum}>2</span>
              <span className={styles.sideStatLabel}>направления</span>
            </div>
            <div className={styles.sideStatDivider} aria-hidden="true" />
            <div className={styles.sideStat}>
              <span className={styles.sideStatNum}>19+</span>
              <span className={styles.sideStatLabel}>видов работ</span>
            </div>
            <div className={styles.sideStatDivider} aria-hidden="true" />
            <div className={styles.sideStat}>
              <span className={styles.sideStatNum}>5</span>
              <span className={styles.sideStatLabel}>отраслей</span>
            </div>
          </div>
        </div>

        {/* Directions */}
        <div className={styles.directions} id="directions">
          {directions.map((dir) => (
            <div key={dir.id} className={`${styles.dirCard} ${styles[`dirCard_${dir.color}`]}`}>
              <div className={styles.dirCardGlow} aria-hidden="true" />

              <div className={`${styles.dirIcon} ${styles[`dirIcon_${dir.color}`]}`}>
                {dir.icon}
              </div>

              <div className={styles.dirLabel}>{dir.label}</div>
              <p className={styles.dirDesc}>{dir.description}</p>

              <Link
                href={dir.href}
                className={`${styles.proofBadge} ${styles[`proofBadge_${dir.color}`]}`}
              >
                +{dir.workCount} видов работ
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              {dir.industries && (
                <div className={styles.industryChips}>
                  {dir.industries.map((c) => (
                    <span key={c} className={`${styles.industryChip} ${styles[`industryChip_${dir.color}`]}`}>
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <ul className={styles.dirList}>
                {dir.services.map((s) => (
                  <li key={s} className={styles.dirListItem}>
                    <span className={`${styles.dirListDot} ${styles[`dot_${dir.color}`]}`} />
                    {s}
                  </li>
                ))}
              </ul>

              <Link
                href={dir.href}
                className={`btn ${dir.color === 'gold' ? 'btn-primary' : styles.btnTeal}`}
              >
                Подробнее
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* ── Catalog CTA strip — full button with animated border ── */}
        <div className={styles.catalogStrip}>
          <span className={styles.catalogLine} aria-hidden="true" />
          <Link href="/services" className={`btn btn-outline ${styles.catalogBtn}`}>
            Полный каталог услуг и видов работ
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className={styles.catalogLine} aria-hidden="true" />
        </div>

      </div>
    </section>
  );
}
