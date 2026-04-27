import styles from './Footer.module.css';

const navColumns = [
  {
    title: 'Компания',
    links: [
      { label: 'О нас',               href: '/about'      },
      { label: 'Миссия и ценности',   href: '/about'      },
      { label: 'Лицензии',            href: '/licenses'   },
      { label: 'Проекты',             href: '/projects'   },
      { label: 'Портфолио (PDF)',     href: '/portfolio/print' },
      { label: 'Контакты',            href: '/contacts'   },
    ],
  },
  {
    title: 'Направления',
    links: [
      { label: 'Проектная деятельность',    href: '/services' },
      { label: 'Строительная деятельность', href: '/services' },
      { label: 'Инженерные изыскания',      href: '/services' },
      { label: 'Инжиниринг и надзор',       href: '/services' },
    ],
  },
  {
    title: 'Услуги',
    links: [
      { label: 'Геодезические изыскания',   href: '/services' },
      { label: 'Геологические изыскания',   href: '/services' },
      { label: 'Строительство ж/д путей',   href: '/services' },
      { label: 'Инженерные коммуникации',   href: '/services' },
      { label: 'Промышленное строительство',href: '/services' },
    ],
  },
  {
    title: 'Контакты',
    links: [
      { label: '8(7132) 538-288',             href: 'tel:+77132538288' },
      { label: 'west_arlan-group@mail.ru',  href: 'mailto:west_arlan-group@mail.ru' },
      { label: 'arlan-gr.kz',              href: 'https://arlan-gr.kz' },
      { label: 'г. Актобе, ул. Казангапа 57В, оф. 34', href: '/contacts' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer} id="contacts">
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.contactItem}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 8l7 5 7-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <a href="mailto:west_arlan-group@mail.ru">west_arlan-group@mail.ru</a>
            </div>
            <div className={styles.contactItem}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M4 4h3l1.5 4-2 1.5C7.5 12 9 13.5 11.5 14.5L13 12.5l4 1.5v3C10 18.5 2 11.5 4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              <a href="tel:+77132538288">8(7132) 538-288</a>
            </div>
            <div className={styles.contactItem}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M10 2C7.2 2 5 4.2 5 7c0 5 5 11 5 11s5-6 5-11c0-2.8-2.2-5-5-5z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="10" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span>г. Актобе, ул. Казангапа дом 57В, офис 34</span>
            </div>
            <div className={styles.contactItem}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>Пн–Пт: 09:00–18:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.mainInner}>

            {/* Brand */}
            <div className={styles.brand}>
              <a href="#" className={styles.logo}>
                <div className={styles.logoMark}>
                  <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                    <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
                      stroke="url(#fg)" strokeWidth="1.5" fill="none"/>
                    <polygon points="18,8 28,13 28,23 18,28 8,23 8,13"
                      fill="url(#fg)" opacity="0.12"/>
                    <text x="18" y="22" textAnchor="middle"
                      fontFamily="Outfit, sans-serif" fontWeight="800"
                      fontSize="11" fill="url(#fg)">W</text>
                    <defs>
                      <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#D4A843"/>
                        <stop offset="100%" stopColor="#F0C85A"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <div className={styles.logoMain}>West Arlan Group</div>
                  <div className={styles.logoSub}>Engineering & Construction</div>
                </div>
              </a>
              <p className={styles.brandDesc}>
                Проектирование и строительство инженерной и железнодорожной
                инфраструктуры в Казахстане. Качество. Надёжность. Опыт.
              </p>
              <div className={styles.socials}>
                {[
                  { label: 'LinkedIn', href: '#', icon: 'in' },
                  { label: 'Telegram', href: '#', icon: 'tg' },
                  { label: 'Instagram', href: '#', icon: 'ig' },
                ].map((s) => (
                  <a key={s.label} href={s.href} className={styles.socialBtn} aria-label={s.label}>
                    <span className={styles.socialIcon}>{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {navColumns.map((col) => (
              <div key={col.title} className={styles.navCol}>
                <h4 className={styles.colTitle}>{col.title}</h4>
                <ul className={styles.colList}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className={styles.colLink}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <span>© 2010–{new Date().getFullYear()} West Arlan Group. Все права защищены.</span>
            <span>БИН: 090940003245 | Лицензия МИО РК №123456</span>
            <div className={styles.bottomLinks}>
              <a href="#">Политика конфиденциальности</a>
              <a href="#">Условия использования</a>
              <a href="/admin/login">Администрирование</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
