'use client';

import styles from './Hero.module.css';

export default function HeroAnimatedBackground() {
  return (
    <div className={styles.svgWrapper} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" />
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
          </pattern>
          <pattern id="blueprint-grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#blueprint-grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>
          
          <mask id="drawMaskBottom">
            <path d="M -100 800 C 400 900 1000 700 1600 850" stroke="#FFF" strokeWidth="100" fill="none" strokeDasharray="3000" strokeDashoffset="3000">
              <animate id="animBottom" attributeName="stroke-dashoffset" from="3000" to="0" dur="8s" begin="0.2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0; 1" />
            </path>
          </mask>
          
          <mask id="drawMaskTop">
            <path d="M 600 -100 C 900 200 1200 100 1600 350" stroke="#FFF" strokeWidth="100" fill="none" strokeDasharray="2000" strokeDashoffset="2000">
               <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="6s" begin="1.7s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0; 1" />
            </path>
          </mask>
        </defs>

        <rect width="100%" height="100%" fill="url(#blueprint-grid-large)" className={styles.gridFadeIn} />

        {/* =========================================
            НИЖНЯЯ ВЕТВЬ (Под текстом) - Золотая
            ========================================= */}
        <g stroke="var(--gold)" mask="url(#drawMaskBottom)">
          {/* Оси (Тонкие) */}
          <path d="M -100 805 C 400 905 1000 705 1600 855" strokeWidth="1" strokeDasharray="20 10" strokeOpacity="0.3" />
          
          {/* Шпалы (Sleepers) */}
          <path d="M -100 805 C 400 905 1000 705 1600 855" strokeWidth="18" strokeDasharray="2 18" strokeOpacity="0.2" />
          
          {/* Рельсы */}
          <path d="M -100 796 C 400 896 1000 696 1600 846" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M -100 814 C 400 914 1000 714 1600 864" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>

        <g className={styles.popNodeDelay1}>
          <circle cx="900" cy="742" r="5" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.5" />
          <circle cx="900" cy="742" r="14" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.6" />
          <text x="920" y="735" fill="var(--gold)" fontSize="10" fontFamily="monospace" letterSpacing="1px" strokeOpacity="0.8">R=1200.0</text>
        </g>

        {/* =========================================
            ВЕРХНЯЯ ВЕТВЬ (Над текстом справа) - Бирюзовая
            ========================================= */}
        <g stroke="var(--teal)" mask="url(#drawMaskTop)">
          {/* Оси (Тонкие) */}
          <path d="M 600 -100 C 900 200 1200 100 1600 350" strokeWidth="1" strokeDasharray="20 10" strokeOpacity="0.3" />
          
          {/* Шпалы */}
          <path d="M 600 -100 C 900 200 1200 100 1600 350" strokeWidth="16" strokeDasharray="2 18" strokeOpacity="0.2" />
          
          {/* Рельсы */}
          <path d="M 600 -108 C 900 192 1200 92 1600 342" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M 600 -92 C 900 208 1200 108 1600 358" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>

        <g className={styles.popNodeDelay2}>
          <circle cx="1150" cy="118" r="4" fill="var(--teal)" />
          <line x1="1130" y1="118" x2="1170" y2="118" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="1150" y1="98" x2="1150" y2="138" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.4" />
          <text x="1165" y="110" fill="var(--teal)" fontSize="10" fontFamily="monospace" opacity="0.8">ПК 112+50</text>
        </g>

        {/* =========================================
            Движущиеся Поезда (Train Lights)
            ========================================= */}
        <g className={styles.trainGlow}>
          <circle r="6" fill="var(--gold)" filter="blur(3px)" stroke="none" />
          <circle r="2" fill="#FFF" stroke="none" />
          <animateMotion dur="16s" repeatCount="indefinite" path="M -100 805 C 400 905 1000 705 1600 855" />
        </g>

        <g className={styles.trainGlowDelay}>
          <circle r="5" fill="var(--teal)" filter="blur(2px)" stroke="none" />
          <circle r="2" fill="#FFF" stroke="none" />
          <animateMotion dur="14s" repeatCount="indefinite" path="M 1600 350 C 1200 100 900 200 600 -100" />
        </g>

      </svg>
    </div>
  );
}
