'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import styles from './HeroCycler.module.css';

type Word = {
  lines: string[];
  size: string;
};

/* Sizes are tuned so every word fits inside .container at any viewport.
   Outfit 900 at -0.02em tracking ≈ 0.85em per cyrillic char. Caps match
   the 1280-container max (content ≈ 1152px); vw rates and floors hold
   even on 320px screens (content ≈ 272px). */
const WORDS: Word[] = [
  { lines: ['ПРОЕКТИРУЕМ'],                  size: 'clamp(28px, 9vw, 120px)' },
  { lines: ['СТРОИМ'],                        size: 'clamp(50px, 16vw, 220px)' },
  { lines: ['ОБСЛУЖИВАЕМ'],                  size: 'clamp(28px, 9vw, 120px)' },
  { lines: ['ДЕЛАЕМ ТЕХНИЧЕСКИЙ', 'АУДИТ'],  size: 'clamp(16px, 5.2vw, 72px)' },
];

const CYCLE_MS = 3400;

/* WAG triangle logo — same path as AboutHeroAnim / Header. */
const WAG_PATH =
  'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0' +
  'h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07' +
  'l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02' +
  'l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,' +
  '13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42' +
  'c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02' +
  '-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79' +
  ',3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,' +
  '36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,' +
  '19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

export default function HeroCycler() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % WORDS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.wrap}>
      {/* Semantic H1 for SEO / screen-readers — visual is decorative */}
      <h1 className={styles.sr}>
        Мы проектируем, строим, обслуживаем и проводим технический аудит инфраструктуры Казахстана.
      </h1>
      <div className={styles.stage} aria-hidden="true">
        <Cycle key={i} word={WORDS[i]} />
      </div>
    </div>
  );
}

function Cycle({ word }: { word: Word }) {
  const uid = useId();
  return (
    <div
      className={styles.word}
      style={{ '--word-size': word.size } as CSSProperties}
    >
      {word.lines.map((line, idx) => {
        const gradId = `wag-grad-${uid.replace(/:/g, '')}-${idx}`;
        return (
          <div
            key={idx}
            className={styles.line}
            style={{ '--line-idx': idx } as CSSProperties}
          >
            <span className={styles.outline}>{line}</span>
            <span className={styles.fill}>{line}</span>
            <svg
              className={styles.beam}
              viewBox="0 0 719.49 635.66"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#D4A843" />
                  <stop offset="55%"  stopColor="#F0C85A" />
                  <stop offset="100%" stopColor="#FAE08A" />
                </linearGradient>
              </defs>
              <path d={WAG_PATH} fill={`url(#${gradId})`} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
