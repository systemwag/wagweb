import styles from './About.module.css';

const services = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Изыскания',
    desc: 'Выполнение инженерных геодезических, геологических, экологических, гидрологических и археологических изысканий любой сложности.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 14h24M12 8V6M20 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 20l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Проектирование I категории',
    desc: 'Технологическое проектирование объектов производственного, жилищно-гражданского назначения, транспортной инфраструктуры, инженерных систем и сетей.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M4 28h24M8 28V14l8-10 8 10v14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 28v-8h4v8M12 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Строительно-монтажные работы',
    desc: 'Устройство инженерных сетей, строительство автомобильных и железных дорог, специальные работы в грунтах, возведение конструкций.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 10v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 4l2 4M22 4l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Инжиниринг',
    desc: 'Авторский и технический надзор за строительством, техническое обследование зданий и сопровождение строительно-монтажных работ под ключ.',
  },
];

const designWorks = [
  'Технологическое проектирование объектов производственного назначения',
  'Проектирование объектов инфраструктуры транспорта, связи и коммуникаций',
  'Архитектурное проектирование зданий I, II и III уровня ответственности',
  'Строительное проектирование реконструкции и усиления конструкций',
  'Проектирование инженерных систем и сетей',
];

const constructionWorks = [
  'Устройство инженерных сетей и систем, включая капитальный ремонт и реконструкцию',
  'Строительство автомобильных и железных дорог, включая капитальный ремонт и реконструкцию',
  'Специальные работы в грунтах',
  'Возведение несущих и ограждающих конструкций зданий и сооружений',
  'Прокладка линейных сооружений, включая капитальный ремонт и реконструкцию',
];

const licenses = [
  'Проектирование — I категория',
  'Строительно-монтажные работы — I категория',
  'Лицензия на геодезические и изыскательские работы',
  'Сертификат ISO 9001:2015',
  'Сертификат ISO 14001:2015',
  'Допуск СРО к видам работ',
];

export default function About() {
  return (
    <section className={styles.section} id="about">
      <div className="container">

        {/* Section header */}
        <div className={styles.header}>
          <span className="section-label">О компании</span>
          <h2 className={`heading-2 ${styles.title}`}>
            Строим Казахстан —<br />
            <span className="text-gradient-gold">с опытом и гордостью</span>
          </h2>
          <p className={styles.description}>
            West Arlan Group (i.e. West Altyn Kyran) — группа компаний, выполняющая полный цикл работ: от инженерных
            изысканий и проектирования до строительства и сдачи объектов под ключ. Мы специализируемся
            на промышленных объектах, транспортной инфраструктуре, железных дорогах и инженерных сетях.
          </p>
        </div>

        {/* 4 service cards — full width row */}
        <div className={styles.servicesRow}>
          {services.map((v) => (
            <div key={v.title} className={`glass-card ${styles.serviceCard}`}>
              <div className={styles.serviceIcon}>{v.icon}</div>
              <h3 className={styles.serviceTitle}>{v.title}</h3>
              <p className={styles.serviceDesc}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Detail blocks — 3-column grid */}
        <div className={styles.detailGrid}>

          <div className={`glass-card ${styles.infoBlock}`}>
            <h3 className={`heading-3 ${styles.blockTitle}`}>
              Проектирование — I категория
            </h3>
            <ul className={styles.licenseList}>
              {designWorks.map((item) => (
                <li key={item} className={styles.licenseItem}>
                  <span className={styles.licenseIcon}>
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <circle cx="8" cy="8" r="7" stroke="var(--teal)" strokeWidth="1.2"/>
                      <path d="M5 8l2 2 4-4" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`glass-card ${styles.infoBlock}`}>
            <h3 className={`heading-3 ${styles.blockTitle}`}>
              СМР — I категория
            </h3>
            <ul className={styles.licenseList}>
              {constructionWorks.map((item) => (
                <li key={item} className={styles.licenseItem}>
                  <span className={styles.licenseIcon}>
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <circle cx="8" cy="8" r="7" stroke="var(--teal)" strokeWidth="1.2"/>
                      <path d="M5 8l2 2 4-4" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`glass-card ${styles.infoBlock}`}>
            <h3 className={`heading-3 ${styles.blockTitle}`}>
              Лицензии и сертификаты
            </h3>
            <ul className={styles.licenseList}>
              {licenses.map((lic) => (
                <li key={lic} className={styles.licenseItem}>
                  <span className={styles.licenseIcon}>
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                      <circle cx="8" cy="8" r="7" stroke="var(--gold)" strokeWidth="1.2"/>
                      <path d="M5 8l2 2 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {lic}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
