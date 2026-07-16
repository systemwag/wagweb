import Link from 'next/link';
import styles from './Footer.module.css';
import { WAG_LOGO_PATH } from '@/lib/wag-logo';

const navColumns = [
  {
    title: 'Компания',
    links: [
      { label: 'О нас',                    href: '/about'      },
      { label: 'Лицензии и аккредитации',  href: '/licenses'   },
      { label: 'Заказчикам',               href: '/zakazchikam' },
      { label: 'Отзывы клиентов',          href: '/testimonials' },
      { label: 'Портфолио (PDF)',          href: '/portfolio.pdf' },
      { label: 'Контакты',                 href: '/contacts'   },
    ],
  },
  {
    title: 'Направления',
    links: [
      { label: 'Проектирование', href: '/design'      },
      { label: 'Строительство',  href: '/projects'    },
      { label: 'Обслуживание',   href: '/maintenance' },
      { label: 'Все услуги',     href: '/services'    },
    ],
  },
  {
    title: 'Услуги',
    links: [
      { label: 'Изыскания и проектирование',    href: '/services#proektnaya'   },
      { label: 'Строительно-монтажные работы',  href: '/services#stroitelnaya' },
      { label: 'Инженерные сети',               href: '/services#vidy-rabot'   },
      { label: 'Содержание и ремонт путей',     href: '/maintenance'           },
      { label: 'Технадзор и обследование',      href: '/licenses#akkreditacii' },
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
              <Link href="/" className={styles.logo}>
                <div className={styles.logoMark}>
                  <svg width="44" height="40" viewBox="0 0 719.49 635.66" fill="none">
                    <path fill="url(#fg)" d={WAG_LOGO_PATH}/>
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
              </Link>
              <p className={styles.brandDesc}>
                Проектирование и строительство инженерной и транспортной
                инфраструктуры в Казахстане. Качество. Надёжность. Опыт.
              </p>
            </div>

            {/* Nav columns */}
            {navColumns.map((col) => (
              <div key={col.title} className={styles.navCol}>
                <h4 className={styles.colTitle}>{col.title}</h4>
                <ul className={styles.colList}>
                  {col.links.map((link) => {
                    // Внутренние маршруты → <Link> (client-nav + prefetch);
                    // файлы (.pdf), tel:/mailto:/внешние → обычный <a>.
                    const internal = link.href.startsWith('/') && !link.href.includes('.');
                    return (
                      <li key={link.label}>
                        {internal ? (
                          <Link href={link.href} className={styles.colLink}>{link.label}</Link>
                        ) : (
                          <a href={link.href} className={styles.colLink}>{link.label}</a>
                        )}
                      </li>
                    );
                  })}
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
            <span>БИН: 100340009758</span>
            <div className={styles.bottomLinks}>
              <Link href="/privacy">Политика конфиденциальности</Link>
              <Link href="/terms">Условия использования</Link>
              <Link href="/admin/login">Администрирование</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
