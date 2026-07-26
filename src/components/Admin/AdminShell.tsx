'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.css';

const NAV = [
  {
    href: '/admin/projects',
    label: 'СМР',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: '/admin/design',
    label: 'Проектные работы',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <rect x="2" y="2" width="12" height="2" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="2" y="7" width="9"  height="2" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="2" y="12" width="6" height="2" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: '/admin/maintenance',
    label: 'Обслуживание',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <path d="M10.5 2.5l3 3-7 7-3-3 7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M2 14l1.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="13" cy="3" r="1.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/admin/contacts',
    label: 'Заявки',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/testimonials',
    label: 'Отзывы',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v6a1.5 1.5 0 01-1.5 1.5H8l-3.5 3v-3h-1A1.5 1.5 0 012 9.5v-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 5.5h6M5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/partners',
    label: 'Партнёры',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 7l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/map',
    label: 'Карта',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 10v5M5 7a3 3 0 016 0c0 3-3 7-3 7s-3-4-3-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/portfolio',
    label: 'Портфолио PDF',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <path d="M3 1.5h7l3 3V14a.5.5 0 01-.5.5h-9A.5.5 0 013 14V2a.5.5 0 010-.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M10 1.5V4.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.5 8.5h5M5.5 11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoText}>Панель управления</span>
          <span className={styles.sidebarBrand}>WAG Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.active : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className={styles.navSep} />
        </nav>

        <Link href="/" className={styles.navBackLink}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          На сайт
        </Link>

        <button onClick={handleLogout} className={styles.navBackLink} style={{ border: 'none', background: 'none', cursor: 'pointer', paddingTop: '8px' }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Выйти
        </button>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
