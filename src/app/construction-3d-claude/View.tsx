'use client';

/* View — транспорт воспроизведения и оверлеи 3D-полигона.

   Страница больше НЕ скроллится покадрово. Клиент смотрит этап, читает
   карточку и жмёт «Далее» — это презентация, а не аттракцион.

   Транспорт (useTransport) — единственный, кто пишет в progressRef:
     playing  — этап идёт, p линейно растёт со скоростью 1/TOTAL_SEC;
     held     — этап доигран, стоим на финальной картинке;
     seeking  — переход: p доводится до цели с ease, мир при этом
                проигрывается ускоренно (это и есть перемотка).
   Мир остаётся чистой функцией p, поэтому прыжок на любой этап — просто
   установка цели: всё построенное до него уже готово.

   Канвас рендерится только пока сцена на экране, и там же замирает
   воспроизведение — клиент не должен пропустить этап, листая мимо. */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Footer from '@/components/Footer/Footer';
import { PHASES, TOTAL_SEC, clamp01, ease } from './phases';
import styles from './claude3d.module.css';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className={styles.canvasFallback}>Загрузка цифрового полигона…</div>,
});

/** Длина «трассы» для пикетажа HUD, м */
const TRACK_M = 340;
/** Переход к соседнему этапу вперёд, с */
const SEEK_NEAR = 0.9;
/** Дальний или обратный прыжок, с — идёт через короткое затемнение */
const SEEK_FAR = 1.25;
/** Пауза на готовой картинке перед автопереходом, с */
const AUTOPLAY_HOLD = 1.6;

type Mode = 'playing' | 'held' | 'seeking';

/** Счётчики реестров — те же, что на /design, /projects и /maintenance */
export interface RegistryCounts {
  build: number;
  service: number;
  design: number;
}

/** Подстановка чисел реестра в текст карточки */
const fill = (text: string, c: RegistryCounts) =>
  text
    .replace('{build}', String(c.build))
    .replace('{service}', String(c.service))
    .replace('{design}', String(c.design));

export default function View({ counts }: { counts: RegistryCounts }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  /* DOM-выходы, которые обновляются каждый кадр без ре-рендера */
  const barRef = useRef<HTMLDivElement>(null);
  const pkRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<Mode>('playing');
  const [autoplay, setAutoplay] = useState(false);
  const [inView, setInView] = useState(true);
  const [allowMotion, setAllowMotion] = useState(true);

  /* Внутреннее состояние транспорта живёт в ref: rAF-цикл не должен
     зависеть от замыканий на стейт и пересоздаваться на каждый кадр. */
  const tr = useRef({
    stage: 0,
    mode: 'playing' as Mode,
    seekFrom: 0,
    seekTo: 0,
    seekT: 0,
    seekDur: SEEK_NEAR,
    seekFar: false,
    seekStage: 0,
    heldFor: 0,
    autoplay: false,
    motion: true,
    active: true,
  });

  /* Зеркалим стейт в ref: rAF-цикл читает только его и потому не
     пересоздаётся на каждый ре-рендер */
  useEffect(() => { tr.current.autoplay = autoplay; }, [autoplay]);
  useEffect(() => { tr.current.motion = allowMotion; }, [allowMotion]);
  useEffect(() => { tr.current.active = inView; }, [inView]);

  /* prefers-reduced-motion: без анимации показываем сразу готовый этап */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAllowMotion(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Рендерим и проигрываем только пока сцена на экране */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(e => setInView(e[0].isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Запустить переход к началу этапа i */
  const seekTo = useCallback((i: number) => {
    const s = tr.current;
    const target = clamp01(PHASES[i].start);
    const far = i !== s.stage + 1 || target < progressRef.current;
    if (!s.motion) {
      // reduced-motion: без проигрывания — сразу готовая картинка этапа
      progressRef.current = PHASES[i].end;
      s.stage = i;
      s.mode = 'held';
      s.heldFor = 0;
      setStage(i);
      setMode('held');
      return;
    }
    s.seekFrom = progressRef.current;
    s.seekTo = target;
    s.seekT = 0;
    s.seekDur = far ? SEEK_FAR : SEEK_NEAR;
    s.seekFar = far;
    s.seekStage = i;
    s.mode = 'seeking';
    setMode('seeking');
  }, []);

  const goTo = useCallback((i: number) => {
    const j = Math.max(0, Math.min(PHASES.length - 1, i));
    if (j === tr.current.stage && tr.current.mode === 'playing') return;
    seekTo(j);
  }, [seekTo]);

  const next = useCallback(() => goTo(tr.current.stage + 1), [goTo]);
  const prev = useCallback(() => goTo(tr.current.stage - 1), [goTo]);

  /** Повтор текущего этапа с начала */
  const replay = useCallback(() => {
    const s = tr.current;
    if (!s.motion) return;
    s.seekFrom = progressRef.current;
    s.seekTo = PHASES[s.stage].start;
    s.seekT = 0;
    s.seekDur = 0.5;
    s.seekFar = true;
    s.seekStage = s.stage;
    s.mode = 'seeking';
    setMode('seeking');
  }, []);

  /* ── Главный цикл транспорта ──────────────────────────────────────── */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudPk = '';
    let hudPct = -1;
    const RING = 2 * Math.PI * 15; // длина окружности индикатора

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = tr.current;

      if (s.active) {
        if (s.mode === 'seeking') {
          s.seekT += dt;
          const k = ease(clamp01(s.seekT / s.seekDur));
          progressRef.current = s.seekFrom + (s.seekTo - s.seekFrom) * k;
          // затемнение на дальних и обратных прыжках — иначе стройка
          // эффектно, но бессмысленно «разбирается» задом наперёд
          if (fadeRef.current) {
            const tri = s.seekFar ? Math.sin(clamp01(s.seekT / s.seekDur) * Math.PI) : 0;
            fadeRef.current.style.opacity = (tri * 0.85).toFixed(3);
          }
          if (s.seekT >= s.seekDur) {
            progressRef.current = s.seekTo;
            s.stage = s.seekStage;
            s.mode = 'playing';
            s.heldFor = 0;
            if (fadeRef.current) fadeRef.current.style.opacity = '0';
            setStage(s.stage);
            setMode('playing');
          }
        } else if (s.mode === 'playing') {
          const end = PHASES[s.stage].end;
          // без анимации этап показывается сразу готовой картинкой
          progressRef.current = s.motion
            ? Math.min(end, progressRef.current + dt / TOTAL_SEC)
            : end;
          if (progressRef.current >= end - 1e-6) {
            progressRef.current = end;
            s.mode = 'held';
            s.heldFor = 0;
            setMode('held');
          }
        } else if (s.mode === 'held') {
          s.heldFor += dt;
          if (s.autoplay && s.stage < PHASES.length - 1 && s.heldFor > AUTOPLAY_HOLD) {
            seekTo(s.stage + 1);
          }
        }
      }

      /* Приборная строка и индикаторы — прямая запись в DOM */
      const p = progressRef.current;
      if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      const m = p * TRACK_M;
      const pk = `ПК ${Math.floor(m / 100)}+${String(Math.floor(m % 100)).padStart(2, '0')}`;
      if (pk !== hudPk) {
        hudPk = pk;
        if (pkRef.current) pkRef.current.textContent = pk;
      }
      const pct = Math.round(p * 100);
      if (pct !== hudPct) {
        hudPct = pct;
        if (pctRef.current) pctRef.current.textContent = `ГОТОВНОСТЬ ${pct}%`;
      }
      if (ringRef.current) {
        const ph = PHASES[s.stage];
        const local = clamp01((p - ph.start) / (ph.end - ph.start));
        ringRef.current.style.strokeDashoffset = `${(RING * (1 - local)).toFixed(2)}`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seekTo]);

  /* Клавиатура: ← → этапы, пробел — повтор */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inView) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === ' ') { e.preventDefault(); replay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, next, prev, replay]);

  /* Свайп по канвасу на тач-устройствах */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let x0 = 0;
    let y0 = 0;
    const start = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) next(); else prev();
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchend', end);
    };
  }, [next, prev]);

  const phase = PHASES[stage];
  const isLast = stage === PHASES.length - 1;
  const total = useMemo(() => String(PHASES.length).padStart(2, '0'), []);

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.visuallyHidden}>
          3D-полигон West Arlan Group: полный цикл — от инженерных изысканий до обслуживания объекта
        </h1>

        <div className={styles.stage} ref={rootRef}>
          <div className={styles.canvasWrap}>
            <Scene progressRef={progressRef} active={inView} allowMotion={allowMotion} />
          </div>

          <div className={styles.vignette} aria-hidden="true" />
          <div ref={fadeRef} className={styles.seekFade} aria-hidden="true" />

          {/* Приборная строка */}
          <div className={styles.overlayTop}>
            <div className={styles.hudGroup}>
              <span className="section-label">WAG · Цифровой полигон</span>
              <span ref={pkRef} className={styles.hudPk}>ПК 0+00</span>
              <span ref={pctRef} className={styles.hudPct}>ГОТОВНОСТЬ 0%</span>
            </div>
            <span className={styles.counter}>
              {phase.label}
              <span className={styles.counterTotal}> / {total}</span>
            </span>
          </div>

          {/* Карточка этапа. Все тексты держим в DOM для индексации,
              видимым остаётся только текущий. */}
          <div className={styles.phaseCardWrap}>
            {PHASES.map((ph, i) => (
              <article
                key={ph.id}
                className={`glass-card ${styles.phaseCard} ${i === stage ? styles.phaseCardOn : ''}`}
                aria-hidden={i === stage ? undefined : true}
              >
                <span className={styles.phaseKicker}>Этап {ph.label}</span>
                <h2 className={styles.phaseTitle}>{ph.title}</h2>
                <p className={styles.phaseDesc}>{fill(ph.desc, counts)}</p>
                <div className={styles.specRow}>
                  {ph.specs.map(sp => (
                    <span key={sp} className={styles.specChip}>{sp}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Кликабельная рельса этапов */}
          <nav className={styles.rail} aria-label="Этапы строительства">
            {PHASES.map((ph, i) => (
              <button
                key={ph.id}
                type="button"
                onClick={() => goTo(i)}
                className={`${styles.railItem} ${i === stage ? styles.railActive : ''} ${i < stage ? styles.railDone : ''}`}
                aria-current={i === stage ? 'step' : undefined}
              >
                <span className={styles.railDot} />
                <span className={styles.railLabel}>{ph.title}</span>
              </button>
            ))}
          </nav>

          {/* Пульт воспроизведения */}
          <div className={styles.transport}>
            <button
              type="button"
              onClick={prev}
              className={styles.tButton}
              disabled={stage === 0}
              aria-label="Предыдущий этап"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button type="button" onClick={replay} className={styles.tButton} aria-label="Повторить этап">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5V5.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={next}
              className={`${styles.tNext} ${mode === 'held' && !isLast ? styles.tNextReady : ''}`}
              disabled={isLast}
            >
              <span className={styles.tRing} aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 34 34">
                  <circle cx="17" cy="17" r="15" className={styles.tRingTrack} />
                  <circle ref={ringRef} cx="17" cy="17" r="15" className={styles.tRingFill} />
                </svg>
              </span>
              <span>{isLast ? 'Полигон построен' : 'Далее'}</span>
              {!isLast && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAutoplay(a => !a)}
              className={`${styles.tToggle} ${autoplay ? styles.tToggleOn : ''}`}
              aria-pressed={autoplay}
            >
              Авто
            </button>
          </div>

          <div className={styles.keysHint} aria-hidden="true">
            <kbd>←</kbd><kbd>→</kbd> этапы · <kbd>Space</kbd> повтор
          </div>

          {/* Общий прогресс с насечками этапов */}
          <div className={styles.progressTrack}>
            <div ref={barRef} className={styles.progressBar} />
            <div className={styles.progressNotches} aria-hidden="true">
              {PHASES.slice(1).map(ph => (
                <span key={ph.id} className={styles.progressNotch} style={{ left: `${ph.start * 100}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Финал */}
        <section className={styles.final}>
          <div className="container">
            <span className="section-label">Полный цикл</span>
            <h2 className="heading-2">
              Один подрядчик —<br />
              <span className="text-gradient-gold">от первого репера до обслуживания</span>
            </h2>
            <p className={styles.finalDesc}>
              Всё, что построилось на этом полигоне, мы делаем в реальности: инженерные
              изыскания и проектирование по лицензии I категории, сопровождение
              ГосЭкспертизы до положительного заключения, автомобильные дороги
              и рельсовые пути, инженерные сети, промышленные объекты — и текущее
              содержание объекта после сдачи. Один договор — один ответственный.
            </p>
            <div className={styles.finalActions}>
              <Link href="/contacts" className="btn btn-primary">
                Обсудить проект
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/services" className="btn btn-outline">
                Все услуги
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
