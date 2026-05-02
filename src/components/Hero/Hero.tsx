'use client';

import Image from 'next/image';
import styles from './Hero.module.css';
import HeroAnimatedBackground from './HeroAnimatedBackground';
import HeroEngineeringAnim from './HeroEngineeringAnim';

// Trust strip uses PNGs only (transparent backgrounds).
// JPG partners (Тенгизшевройл, Khorgos) live in the lower Partners marquee.
const trustLogos = [
  { file: '9.png',                          name: 'Қазақстан Темір Жолы' },
  { file: '1.png',                          name: 'Русская Медная Компания' },
  { file: 'metprom-logo-rus-Photoroom.png', name: 'Метпром' },
  { file: 'QB_-01_1__.png',                 name: 'Qazaq Bitum' },
  { file: '4.png',                          name: 'Shubarkol Premium' },
];

export default function Hero() {

  return (
    <section className={styles.hero}>
      <HeroAnimatedBackground />
      <HeroEngineeringAnim />
      {/* Radial glow orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.brandEyebrow}>
          <span className={styles.brandName}>West Arlan Group</span>
          <span className={styles.brandDot} aria-hidden="true">·</span>
          <span className={styles.brandSince}>с 2010 года</span>
        </div>

        <h1 className={`heading-1 ${styles.title}`}>
          Проектируем. Строим. Обслуживаем.
        </h1>

        <div className={styles.subtitle}>
          <p className={styles.subtitleLead}>
            Полный цикл — от изысканий до сдачи объекта под&nbsp;ключ.
          </p>

          <p className={styles.subtitleCategories}>
            <span className={styles.subtitleCategoriesLabel}>Инфраструктура любого типа:</span>
            <span className={styles.subtitleCategoriesList}>
              трубопроводы, ЛЭП, автодороги, железные дороги, промышленные объекты.
            </span>
          </p>

          <div className={styles.subtitleStats}>
            <span className={styles.subtitleStat}>
              <span className={styles.subtitleStatNum}>+300</span>
              <span className={styles.subtitleStatLabel}>проектов</span>
            </span>
            <span className={styles.subtitleStatSep} aria-hidden="true" />
            <span className={styles.subtitleStat}>
              <span className={styles.subtitleStatNum}>+50</span>
              <span className={styles.subtitleStatLabel}>под ключ</span>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <a href="/contacts" className="btn btn-primary">
            Обсудить проект
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="/portfolio/print" target="_blank" rel="noopener" className={`btn btn-outline ${styles.downloadBtn}`}>
            <svg className={styles.downloadIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <g className={styles.downloadArrow}>
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </g>
            </svg>
            Скачать PDF
          </a>
          <a href="tel:+77132538288" className={styles.phoneCta}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span className={styles.phoneText}>
              <span className={styles.phoneNumber}>+7 7132 538-288</span>
              <span className={styles.phoneHours}>с 9:00 до 18:00</span>
            </span>
          </a>
        </div>

        <div className={styles.trustStrip} aria-label="Наши клиенты">
          <span className={styles.trustStripLabel}>Нам доверяют</span>
          <div className={styles.trustStripDivider} aria-hidden="true" />
          <div className={styles.trustStripLogos}>
            {trustLogos.map((c) => (
              <div key={c.file} className={styles.trustLogoBox} title={c.name}>
                <Image
                  src={`/partners/${encodeURIComponent(c.file)}`}
                  alt={c.name}
                  width={160}
                  height={52}
                  className={styles.trustLogo}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Big WAG triangle — decorative center */}
      <div className={styles.heroLogo} aria-hidden="true">
        <svg
          viewBox="0 0 719.49 635.66"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.heroLogoSvg}
        >
          <path
            fill="var(--gold)"
            d="M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z"
          />
        </svg>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Прокрутите вниз</span>
      </div>

      {/* Bottom fade */}
      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  );
}
