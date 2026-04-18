'use client';

import { useState, useEffect, useRef } from 'react';
import type { Project } from '@/lib/types';
import styles from './ProjectShowcase.module.css';

/* ── Timing ────────────────────────────────────────────────────────────────── */
const T_DRAW    = 900;
const T_VISIBLE = 4500;
const T_FADE    = 550;

type Phase = 'idle' | 'drawing' | 'visible' | 'fading';

/* ── Palette ───────────────────────────────────────────────────────────────── */
const FILL: Record<string, string> = {
  'completed':   '#D4A843',
  'in-progress': '#00C4A7',
  'planned':     '#4F84FF',
};
const GLOW: Record<string, string> = {
  'completed':   'rgba(212,168,67,0.25)',
  'in-progress': 'rgba(0,196,167,0.22)',
  'planned':     'rgba(79,132,255,0.22)',
};
const STATUS_LABEL: Record<string, string> = {
  'completed':   'Завершён',
  'in-progress': 'В процессе',
  'planned':     'Планируется',
};

/* ── SVG geometry (viewBox 0 0 100 100, preserveAspectRatio=none) ────────── */
const SRC_X = 12, SRC_Y = 50;
const TIP_X = 28, TIP_Y = 50;   // left edge of card, vertically centred

/* Bezier: starts at source dot, gently arcs up to card tip */
const CURVE =
  `M ${SRC_X},${SRC_Y} C 19,37 24,49 ${TIP_X},${TIP_Y}`;

/* CSS positions that correspond to the SVG geometry above */
const CARD_LEFT   = '28%';
const CARD_TOP    = '8%';
const CARD_WIDTH  = '70%';
const CARD_HEIGHT = '84%';

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function ShowcaseStage({ projects }: { projects: Project[] }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [idx,   setIdx]   = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Trigger on scroll into view */
  useEffect(() => {
    if (!projects.length) return;
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPhase('drawing'); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [projects.length]);

  /* State machine */
  useEffect(() => {
    if (phase === 'idle' || !projects.length) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'drawing') {
      t = setTimeout(() => setPhase('visible'), T_DRAW);
    } else if (phase === 'visible') {
      t = setTimeout(() => setPhase('fading'), T_VISIBLE);
    } else if (phase === 'fading') {
      t = setTimeout(() => {
        setIdx(prev => (prev + 1) % projects.length);
        setPhase('drawing');
      }, T_FADE);
    }
    return () => clearTimeout(t);
  }, [phase, projects.length]);

  const p    = projects[idx];
  if (!p) return null;
  const fill = FILL[p.status] ?? '#fff';
  const glow = GLOW[p.status] ?? 'transparent';

  const cardClass =
    phase === 'drawing' ? styles.cardHide :
    phase === 'visible' ? styles.cardShow :
    styles.cardFade;

  return (
    <div ref={wrapRef} className={styles.stage}>

      {/* ── Atmospheric glow behind card ─────────────────────────── */}
      <div
        className={styles.atmoGlow}
        style={{ background: `radial-gradient(ellipse 55% 90% at 75% 50%, ${glow}, transparent)` }}
      />

      {/* ── SVG: animated line + source dot ─────────────────────── */}
      <svg
        className={styles.lineSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* subtle grid */}
        <defs>
          <pattern id="scGrid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5,0 L0,0 L0,5" fill="none" stroke="rgba(212,168,67,0.035)" strokeWidth="0.15"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#scGrid)" />

        {/* animated bezier */}
        {phase !== 'idle' && (
          <path
            key={`line-${idx}`}
            d={CURVE}
            fill="none"
            stroke={fill}
            strokeWidth="0.5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            vectorEffect="non-scaling-stroke"
            className={phase === 'fading' ? styles.scLineFade : styles.scLineDraw}
          />
        )}

        {/* source dot pulse rings */}
        <circle cx={SRC_X} cy={SRC_Y} r="1.2" fill={fill}>
          <animate attributeName="r" from="1.8" to="5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={SRC_X} cy={SRC_Y} r="1.2" fill={fill}>
          <animate attributeName="r" from="1.5" to="3.5" dur="3s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0" dur="3s" begin="0.8s" repeatCount="indefinite" />
        </circle>

        {/* source dot glow halo */}
        <circle cx={SRC_X} cy={SRC_Y} r="2.2" fill={fill} opacity="0.22" />

        {/* source dot core */}
        <circle
          cx={SRC_X} cy={SRC_Y} r="1.2"
          fill={fill}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.3"
          vectorEffect="non-scaling-stroke"
        />

        {/* line-tip dot */}
        {(phase === 'visible' || phase === 'fading') && (
          <circle
            key={`tip-${idx}`}
            cx={TIP_X} cy={TIP_Y} r="1.2"
            fill={fill}
            vectorEffect="non-scaling-stroke"
            className={phase === 'fading' ? styles.scTipFade : styles.scTipShow}
          />
        )}
      </svg>

      {/* ── Left: origin / location info ─────────────────────────── */}
      <div className={styles.origin}>
        {p.coords_label && (
          <span className={styles.originCoords}>{p.coords_label}</span>
        )}
        <span className={styles.originLocation}>{p.location}</span>
        {p.year && (
          <span className={styles.originYear}>{p.year}</span>
        )}
      </div>

      {/* ── Right: project card ──────────────────────────────────── */}
      {phase !== 'idle' && (
        <div
          key={`card-${idx}`}
          className={`${styles.card} ${cardClass}`}
          style={{
            left:   CARD_LEFT,
            top:    CARD_TOP,
            width:  CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          {/* image bg */}
          {p.image_url && (
            <div
              className={styles.cardImg}
              style={{ backgroundImage: `url(${p.image_url})` }}
            />
          )}

          {/* gradient overlay */}
          <div className={styles.cardOverlay} style={{ '--accent': fill } as React.CSSProperties} />

          {/* left accent stripe */}
          <div className={styles.cardStripe} style={{ background: fill }} />

          {/* content */}
          <div className={styles.cardContent}>
            <div className={styles.cardTop}>
              <span className={styles.cardCategory}>{p.category}</span>
              {p.year && <span className={styles.cardYear}>{p.year}</span>}
            </div>

            <h3 className={styles.cardTitle}>{p.title}</h3>
            <p className={styles.cardDesc}>{p.description}</p>

            {p.tags && p.tags.length > 0 && (
              <div className={styles.cardTags}>
                {p.tags.slice(0, 4).map(tag => (
                  <span key={tag} className={styles.cardTag}>{tag}</span>
                ))}
              </div>
            )}

            <div className={styles.cardFooter}>
              <div className={styles.cardStatus}>
                <span
                  className={styles.cardStatusDot}
                  style={{ background: fill, boxShadow: `0 0 8px ${fill}` }}
                />
                <span className={styles.cardStatusText}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>

              <div className={styles.cardMeta}>
                {p.length && (
                  <span className={styles.cardMetaItem}>
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M1,6 L11,6 M8,3 L11,6 L8,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {p.length}
                  </span>
                )}
                <span className={styles.cardCounter}>
                  {(idx % projects.length) + 1} / {projects.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress dots ─────────────────────────────────────────── */}
      <div className={styles.dotsRow}>
        {projects.map((proj, i) => (
          <button
            key={proj.id}
            aria-label={`Проект ${i + 1}`}
            className={`${styles.dot} ${i === idx ? styles.dotActive : ''}`}
            style={i === idx ? { background: fill, boxShadow: `0 0 8px ${fill}` } : {}}
            onClick={() => { setIdx(i); setPhase('drawing'); }}
          />
        ))}
      </div>
    </div>
  );
}
