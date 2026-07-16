'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import styles from './HeroCycler.module.css';
import { WAG_LOGO_PATH as WAG_PATH } from '@/lib/wag-logo';

type Word = {
  lines: string[];
  size: string;
};

/* Sizes are tuned so every word fits inside .container at any viewport.
   Outfit 900 at -0.02em tracking ≈ 0.85em per cyrillic char. Caps match
   the 1280-container max (content ≈ 1152px); vw rates and floors hold
   even on 320px screens (content ≈ 272px). */
const WORDS: Word[] = [
  { lines: ['ПРОЕКТИРУЕМ'],                    size: 'clamp(28px, 9vw, 120px)' },
  { lines: ['СТРОИМ'],                          size: 'clamp(50px, 16vw, 220px)' },
  { lines: ['ОБСЛУЖИВАЕМ'],                    size: 'clamp(28px, 9vw, 120px)' },
  { lines: ['ОБСЛЕДУЕМ ЗДАНИЯ', 'И СООРУЖЕНИЯ'], size: 'clamp(16px, 5.2vw, 72px)' },
];

const CYCLE_MS = 3400;

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
        Мы проектируем, строим, обслуживаем инфраструктуру и проводим техническое
        обследование зданий и сооружений по всему Казахстану.
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
