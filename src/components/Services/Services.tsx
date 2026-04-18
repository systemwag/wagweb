import styles from './Services.module.css';

const directions = [
  {
    id: 'design',
    label: 'Проектная деятельность',
    href: '/design',
    color: 'gold',
    icon: (
      <svg className="svg-draw" viewBox="0 0 48 48" fill="none" width="40" height="40">
        <rect x="6" y="8" width="36" height="32" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 18h20M14 24h14M14 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="38" cy="34" r="7" fill="var(--bg-secondary)" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M35 34l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    services: [
      'Инженерно-геодезические изыскания',
      'Инженерно-геологические изыскания',
      'Инженерно-гидрологические изыскания',
      'Разработка проектной документации',
      'BIM-проектирование',
      'Экспертиза проектов',
    ],
    description:
      'Полный цикл изысканий и разработки проектной документации для объектов любой сложности.',
  },
  {
    id: 'construction',
    label: 'Строительная деятельность',
    href: '/projects',
    color: 'teal',
    icon: (
      <svg className="svg-draw" viewBox="0 0 48 48" fill="none" width="40" height="40">
        <path d="M8 40h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 40V22l12-10 12 10v18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="20" y="30" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 22l16-14 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    services: [
      'Строительство ж/д путей и станций',
      'Укладка и ремонт верхнего строения пути',
      'Земляные работы и устройство насыпей',
      'Строительство инженерных коммуникаций',
      'Монтаж контактной сети и СЦБ',
      'Благоустройство и рекультивация',
    ],
    description:
      'Выполняем строительство "под ключ" — от подготовки территории до сдачи объекта в эксплуатацию.',
  },
];


export default function Services() {
  return (
    <section className={styles.section} id="services">
      <div className="container">

        <div className={styles.sectionHeader}>
          <span className="section-label">Направления деятельности</span>
          <h2 className={`heading-2 ${styles.sectionTitle}`}>
            Два ключевых<br />
            <span className="text-gradient-gold">направления группы</span>
          </h2>
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
              <ul className={styles.dirList}>
                {dir.services.map((s) => (
                  <li key={s} className={styles.dirListItem}>
                    <span className={`${styles.dirListDot} ${styles[`dot_${dir.color}`]}`} />
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href={dir.href}
                className={`btn ${dir.color === 'gold' ? 'btn-primary' : styles.btnTeal}`}
              >
                Наши проекты
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
