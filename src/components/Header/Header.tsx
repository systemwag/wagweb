'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';

const navLinks = [
  { label: 'О компании',     href: '/about',        num: '01' },
  { label: 'Услуги',         href: '/services',     num: '02' },
  { label: 'Проектирование', href: '/design',       num: '03' },
  { label: 'Строительство',  href: '/projects',     num: '04' },
  { label: 'Лицензии',       href: '/licenses',     num: '05' },
  { label: 'Отзывы',         href: '/testimonials', num: '06' },
  { label: 'Контакты',       href: '/contacts',     num: '07' },
];

export default function Header() {
  const [scrolled, setScrolled]     = useState(false);
  const [scrollPct, setScrollPct]   = useState(0);
  const [menuOpen, setMenuOpen]     = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? (y / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return base === pathname || (base !== '/' && pathname.startsWith(base));
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>

      {/* Scroll progress bar */}
      <div
        className={styles.progressBar}
        style={{ '--pct': `${scrollPct}%` } as React.CSSProperties}
        aria-hidden="true"
      />

      <div className={styles.inner}>

        {/* ── Logo ──────────────────────────────────── */}
        <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <div className={styles.wagIconWrap}>
            <svg
              className={styles.wagIcon}
              viewBox="0 0 719.49 635.66"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="var(--gold)"
                d="M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z"
              />
            </svg>
          </div>

        </Link>

        {/* ── Desktop nav ────────────────────────────── */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.navNum}>{link.num}</span>
              <span className={styles.navLabel}>{link.label}</span>
              <span className={styles.navBar} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* ── CTA ────────────────────────────────────── */}
        <div className={styles.ctaGroup}>
          <div className={styles.ctaDivider} aria-hidden="true" />
          <Link href="/contacts" className={`btn btn-primary ${styles.ctaBtn}`}>
            Связаться
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* ── Hamburger ──────────────────────────────── */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────── */}
      <>
        <div
          className={`${styles.drawerOverlay} ${menuOpen ? styles.drawerOverlayOpen : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-label="Мобильная навигация">
          <div className={styles.drawerHead}>
            <span className={styles.drawerTitle}>Навигация</span>
            <button className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label="Закрыть">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <nav className={styles.drawerNav}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.drawerLink} ${isActive(link.href) ? styles.drawerLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className={styles.drawerNum}>{link.num}</span>
                <span className={styles.drawerLabel}>{link.label}</span>
                <svg className={styles.drawerArrow} viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </nav>

          <div className={styles.drawerFooter}>
            <Link href="/contacts" className={`btn btn-primary ${styles.drawerCta}`} onClick={() => setMenuOpen(false)}>
              Связаться с нами
            </Link>
            <span className={styles.drawerCopy}>West Arlan Group · Казахстан</span>
          </div>
        </aside>
      </>
    </header>
  );
}
