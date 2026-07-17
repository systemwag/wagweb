'use client';

/* View — скролл-драйвер и оверлеи 3D-полигона.

   Скролл = время стройки (дорожка 1000vh, sticky-канвас). Прогресс живёт
   в progressRef и раздаётся сцене без ре-рендеров; React-стейт меняется
   только на границах этапов. Поверх канваса: инженерный HUD с пикетажем,
   карточка этапа со спецификациями, КЛИКАБЕЛЬНАЯ рельса навигации
   (+ клавиши ← →), прогресс с насечками этапов.

   Канвас рендерится только пока история на экране (frameloop='never'
   за пределами) и уважает prefers-reduced-motion. */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer/Footer';
import { PHASES } from './phases';
import styles from './claude3d.module.css';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className={styles.canvasFallback}>Загрузка цифрового полигона…</div>,
});

/** Длина «трассы» для пикетажа HUD, м */
const TRACK_M = 340;

type LenisLike = { scrollTo: (target: number, opts?: { duration?: number }) => void };

export default function View() {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const pkRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(true);
  const [allowMotion, setAllowMotion] = useState(true);

  /* prefers-reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAllowMotion(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Рендерим WebGL только пока история на экране */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), {
      rootMargin: '80px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Скролл → прогресс (без ре-рендеров, кроме смены этапа) */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = stageRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(1, total)));
      progressRef.current = p;

      if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (pkRef.current) {
        const m = p * TRACK_M;
        pkRef.current.textContent = `ПК ${Math.floor(m / 100)}+${String(Math.floor(m % 100)).padStart(2, '0')}`;
      }
      if (pctRef.current) pctRef.current.textContent = `ГОТОВНОСТЬ ${(p * 100).toFixed(0)}%`;

      const idx = PHASES.findIndex(ph => p < ph.end);
      setPhaseIdx(idx === -1 ? PHASES.length - 1 : idx);
      if (p > 0.015) setStarted(true);
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

  /* Переход к этапу: рельса + клавиатура */
  const scrollToPhase = useCallback((i: number) => {
    const el = stageRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const mid = (PHASES[i].start + PHASES[i].end) / 2;
    const top = el.getBoundingClientRect().top + window.scrollY + mid * total;
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) lenis.scrollTo(top, { duration: 1.4 });
    else window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inView) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      e.preventDefault();
      const idx = PHASES.findIndex(ph => progressRef.current < ph.end);
      const cur = idx === -1 ? PHASES.length - 1 : idx;
      const next = e.key === 'ArrowRight' ? Math.min(cur + 1, PHASES.length - 1) : Math.max(cur - 1, 0);
      scrollToPhase(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, scrollToPhase]);

  const phase = PHASES[phaseIdx];

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.visuallyHidden}>
          3D-полигон West Arlan Group: полный цикл строительства — от изысканий до ГосЭкспертизы
        </h1>

        <div className={styles.stage} ref={stageRef}>
          <div className={styles.sticky}>
            <div className={styles.canvasWrap}>
              <Scene progressRef={progressRef} active={inView} allowMotion={allowMotion} />
            </div>

            <div className={styles.vignette} aria-hidden="true" />

            {/* Приборная строка */}
            <div className={styles.overlayTop}>
              <div className={styles.hudGroup}>
                <span className="section-label">WAG · Цифровой полигон</span>
                <span ref={pkRef} className={styles.hudPk}>ПК 0+00</span>
                <span ref={pctRef} className={styles.hudPct}>ГОТОВНОСТЬ 0%</span>
              </div>
              <span className={styles.counter}>
                {phase.label}
                <span className={styles.counterTotal}> / {String(PHASES.length).padStart(2, '0')}</span>
              </span>
            </div>

            {/* Карточка этапа */}
            <div className={styles.phaseCardWrap} key={phase.id}>
              <div className={`glass-card ${styles.phaseCard}`}>
                <span className={styles.phaseKicker}>Этап {phase.label}</span>
                <h2 className={styles.phaseTitle}>{phase.title}</h2>
                <p className={styles.phaseDesc}>{phase.desc}</p>
                <div className={styles.specRow}>
                  {phase.specs.map(s => (
                    <span key={s} className={styles.specChip}>{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Кликабельная рельса этапов */}
            <nav className={styles.rail} aria-label="Этапы строительства">
              {PHASES.map((ph, i) => (
                <button
                  key={ph.id}
                  type="button"
                  onClick={() => scrollToPhase(i)}
                  className={`${styles.railItem} ${i === phaseIdx ? styles.railActive : ''} ${i < phaseIdx ? styles.railDone : ''}`}
                  aria-current={i === phaseIdx ? 'step' : undefined}
                >
                  <span className={styles.railDot} />
                  <span className={styles.railLabel}>{ph.title}</span>
                </button>
              ))}
            </nav>

            {/* Подсказки */}
            <div className={`${styles.scrollHint} ${started ? styles.scrollHintHidden : ''}`}>
              <span>Скролл — и полигон оживёт</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v12M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.keysHint} aria-hidden="true">
              <kbd>←</kbd><kbd>→</kbd> этапы
            </div>

            {/* Прогресс с насечками этапов */}
            <div className={styles.progressTrack}>
              <div ref={barRef} className={styles.progressBar} />
              <div className={styles.progressNotches} aria-hidden="true">
                {PHASES.slice(1).map(ph => (
                  <span key={ph.id} className={styles.progressNotch} style={{ left: `${ph.start * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Финал */}
        <section className={styles.final}>
          <div className="container">
            <span className="section-label">Полный цикл</span>
            <h2 className="heading-2">
              Один подрядчик —<br />
              <span className="text-gradient-gold">от первого репера до штампа</span>
            </h2>
            <p className={styles.finalDesc}>
              Всё, что построилось на этом полигоне, мы делаем в реальности: изыскания
              и проектирование, дороги и ж/д пути с переездами, инженерные сети,
              промышленные объекты — и сопровождение ГосЭкспертизы до положительного
              заключения. Один договор — один ответственный.
            </p>
            <div className={styles.finalActions}>
              <Link href="/contacts" className="btn btn-primary">
                Обсудить проект
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/projects" className="btn btn-outline">
                Выполненные объекты
              </Link>
            </div>
            <p className={styles.techNote}>
              WebGL · three.js · react-three-fiber · рендер в реальном времени, техника работает по графику стройки
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
