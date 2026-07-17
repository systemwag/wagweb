'use client';

/**
 * ConstructionView — обёртка 3D-истории: скролл = время стройки.
 *
 * Высокий .stage (800vh) даёт «дорожку» скролла, .sticky держит канвас
 * и оверлеи на экране. Прогресс хранится в progressRef (без ре-рендеров),
 * React-стейт меняется только при смене этапа.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer/Footer';
import { PHASES } from './phases';
import styles from './construction.module.css';

const ConstructionScene = dynamic(() => import('./ConstructionScene'), {
  ssr: false,
  loading: () => <div className={styles.canvasFallback}>Загрузка 3D-сцены…</div>,
});

export default function ConstructionView() {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = stageRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(1, total)));
      progressRef.current = p;
      if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      const idx = PHASES.findIndex(ph => p < ph.end);
      setPhaseIdx(idx === -1 ? PHASES.length - 1 : idx);
      if (p > 0.02) setStarted(true);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const phase = PHASES[phaseIdx];

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.visuallyHidden}>
          3D-визуализация строительства инфраструктуры — West Arlan Group
        </h1>

        <div className={styles.stage} ref={stageRef}>
          <div className={styles.sticky}>
            <div className={styles.canvasWrap}>
              <ConstructionScene progressRef={progressRef} />
            </div>

            {/* Верхняя плашка */}
            <div className={styles.overlayTop}>
              <span className="section-label">WAG · Цифровой двойник</span>
              <span className={styles.counter}>
                {phase.label}<span className={styles.counterTotal}> / {String(PHASES.length).padStart(2, '0')}</span>
              </span>
            </div>

            {/* Карточка этапа */}
            <div className={styles.phaseCardWrap} key={phase.id}>
              <div className={`glass-card ${styles.phaseCard}`}>
                <span className={styles.phaseKicker}>Этап {phase.label}</span>
                <h2 className={styles.phaseTitle}>{phase.title}</h2>
                <p className={styles.phaseDesc}>{phase.desc}</p>
              </div>
            </div>

            {/* Рельса этапов (десктоп) */}
            <nav className={styles.rail} aria-label="Этапы строительства">
              {PHASES.map((ph, i) => (
                <div
                  key={ph.id}
                  className={`${styles.railItem} ${i === phaseIdx ? styles.railActive : ''} ${i < phaseIdx ? styles.railDone : ''}`}
                >
                  <span className={styles.railDot} />
                  <span className={styles.railLabel}>{ph.title}</span>
                </div>
              ))}
            </nav>

            {/* Подсказка скролла */}
            <div className={`${styles.scrollHint} ${started ? styles.scrollHintHidden : ''}`}>
              <span>Скролльте — стройка оживёт</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Прогресс всей истории */}
            <div className={styles.progressTrack}>
              <div ref={barRef} className={styles.progressBar} />
            </div>
          </div>
        </div>

        {/* Финал */}
        <section className={styles.final}>
          <div className="container">
            <span className="section-label">Полный цикл</span>
            <h2 className="heading-2">
              От цифровой модели —<br />
              <span className="text-gradient-gold">к объекту «под ключ»</span>
            </h2>
            <p className={styles.finalDesc}>
              Всё, что вы видели в этой 3D-истории, — ежедневная работа нашей группы:
              изыскания и ПСД, СМР любой сложности, сопровождение ГосЭкспертизы
              и сдача объекта в эксплуатацию. Один договор — один ответственный.
            </p>
            <div className={styles.finalActions}>
              <Link href="/contacts" className="btn btn-primary">
                Обсудить проект
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/projects" className="btn btn-outline">
                Смотреть выполненные объекты
              </Link>
            </div>
            <p className={styles.techNote}>
              WebGL · three.js · react-three-fiber — рендерится в вашем браузере в реальном времени
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
