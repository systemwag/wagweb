'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './Partners.module.css';

const partners = [
  { file: '9.png',          name: 'Қазақстан Темір Жолы' },
  { file: '1.png',          name: 'Русская Медная Компания' },
  { file: '5554453.png',    name: 'Урал Синтез' },
  { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Группа Синтез' },
  { file: '4.png',          name: 'Shubarkol Premium' },
  { file: '7.png',          name: 'Altynex' },
  { file: 'metprom-logo-rus-Photoroom.png',             name: 'Метпром' },
  { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg',  name: 'Тенізшевройл' },
  { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg',  name: 'Khorgos Gateway' },
  { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
  { file: '5.png',          name: 'NSS' },
  { file: '3.png',          name: 'Синe Мидас Строй' },
  { file: '6.png',          name: 'Актобе Стекло' },
  { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'СПК «Актобе»' },
  { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg',  name: 'СПС Энерго' },
  { file: '2.png',          name: 'Зерде Керамика' },
];

const src = (file: string) =>
  `/partners/${file.split('/').map(encodeURIComponent).join('/')}`;

const track = [...partners, ...partners];

const CARD_W   = 120;
const GAP      = 20;
const CARD_STEP = CARD_W + GAP;
const SET_WIDTH = partners.length * CARD_STEP; // 16 × 140 = 2240px

export default function Partners() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);
  const xRef      = useRef(-SET_WIDTH); // start showing second set, scroll right toward 0
  const pausedRef = useRef(false);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const step = () => {
      if (!pausedRef.current) {
        xRef.current += 0.5;                          // scroll right
        if (xRef.current >= 0) xRef.current = -SET_WIDTH; // seamless reset
      }

      const trackEl = trackRef.current;
      const wrapEl  = wrapRef.current;
      if (!trackEl || !wrapEl) { rafRef.current = requestAnimationFrame(step); return; }

      trackEl.style.transform = `translateX(${xRef.current}px)`;

      /* ── Per-card scale + neighbor push ── */
      const wrapW    = wrapEl.offsetWidth;
      const centerX  = wrapW / 2;
      const cards    = trackEl.children;
      const N        = cards.length;

      // 1. Compute scale (t) for every card
      const scales = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const cardCX = xRef.current + i * CARD_STEP + CARD_STEP / 2;
        const dist   = Math.abs(cardCX - centerX);
        const radius = wrapW * 0.30;
        const t      = Math.max(0, 1 - dist / radius);
        scales[i]    = 1 + t; // 1× → 2× at center
      }

      // 2. Compute horizontal push: scaled card expands and nudges neighbors away
      const pushX = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const extraHalf = (scales[i] - 1) * CARD_STEP * 0.55; // extra half-width
        if (extraHalf < 0.5) continue;
        for (let d = 1; d <= 3; d++) {
          const decay = 1 / d;
          if (i - d >= 0) pushX[i - d] -= extraHalf * decay;
          if (i + d < N)  pushX[i + d] += extraHalf * decay;
        }
      }

      // 3. Apply transforms
      for (let i = 0; i < N; i++) {
        const s     = scales[i];
        const liftY = -(s - 1) * 12;               // lifts up as it scales
        const ox    = pushX[i];
        (cards[i] as HTMLElement).style.transform =
          `translateX(${ox.toFixed(1)}px) translateY(${liftY.toFixed(1)}px) scale(${s.toFixed(4)})`;
        (cards[i] as HTMLElement).style.zIndex = s > 1.05 ? String(Math.round((s - 1) * 10)) : '0';
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Партнёры</span>
          <h2 className={`heading-2 ${styles.title}`}>
            Нам доверяют<br />
            <span className="text-gradient-gold">ведущие компании</span>
          </h2>
          <p className={styles.subtitle}>
            Работаем с государственными структурами, национальными компаниями
            и частными инвесторами по всему Казахстану.
          </p>
        </div>
      </div>

      {/* ── Full-width infinite marquee ───────────────────────────── */}
      <div
        ref={wrapRef}
        className={styles.marqueeWrap}
        aria-hidden="true"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div ref={trackRef} className={styles.track}>
          {track.map((p, i) => (
            <div key={`${p.file}-${i}`} className={styles.logoCard}>
              <div className={styles.logoBox}>
                <Image
                  src={src(p.file)}
                  alt={p.name}
                  width={192}
                  height={80}
                  className={styles.logoImg}
                  unoptimized
                />
              </div>
              <span className={styles.logoName}>
                {p.name.split(' ').map((word, wi) => (
                  <span key={wi}>{word}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="container">
        <div className={styles.cta}>
          <div className={styles.ctaContent}>
            <h3 className={`heading-3 ${styles.ctaTitle}`}>
              Готовы обсудить ваш проект?
            </h3>
            <p className={styles.ctaDesc}>
              Свяжитесь с нами — и мы подготовим индивидуальное предложение
              в течение 24 часов.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a href="#contacts" className="btn btn-primary">
              Оставить заявку
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="tel:+77172000000" className="btn btn-outline">
              +7 (717) 200-00-00
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
