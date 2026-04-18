'use client';

import styles from './Hero.module.css';
import HeroAnimatedBackground from './HeroAnimatedBackground';
import HeroEngineeringAnim from './HeroEngineeringAnim';

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
        <h1 className={`heading-1 ${styles.title}`}>
          <span className="text-gradient-gold">West Arlan Group</span>
          <br />
          <span className={styles.titleSub}>
            строим
            <br />
            инфраструктуру
            <br />
            будущего
          </span>
        </h1>

        <div className={styles.actions}>
          <a href="#projects" className="btn btn-primary">
            Наши проекты
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#about" className="btn btn-outline">
            О компании
          </a>
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
