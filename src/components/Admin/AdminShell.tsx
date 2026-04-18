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
    href: '/admin/map',
    label: 'Калибровка карты',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 10v5M5 7a3 3 0 016 0c0 3-3 7-3 7s-3-4-3-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
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
