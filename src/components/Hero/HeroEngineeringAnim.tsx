'use client';

/**
 * HeroEngineeringAnim — приборное окружение хиро (ambient instrument cluster).
 *
 *   • ТЕОДОЛИТ-компас — следит стрелкой-визиром за курсором;
 *   • PANEL A — осциллограф динамической нагрузки;
 *   • PANEL B — продольный профиль рельефа (статичный + скан-курсор);
 *   • спектр-монитор сигнала — столбики переменной высоты;
 *   • съёмочные GPS-узлы с пульсирующими прицелами.
 *
 * Чистая декорация (aria-hidden). Полностью отключается при
 * prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';
import styles from './HeroEngineeringAnim.module.css';

function buildSinePath(cycles: number, period: number, amplitude: number, cy: number): string {
  const L = period / 2;
  let d = `M 0 ${cy}`;
  for (let i = 0; i < cycles; i++) {
    const x = i * period;
    d += ` C ${(x + L * 0.3).toFixed(1)} ${cy - amplitude} ${(x + L * 0.7).toFixed(1)} ${cy - amplitude} ${(x + L).toFixed(1)} ${cy}`;
    d += ` C ${(x + L * 1.3).toFixed(1)} ${cy + amplitude} ${(x + L * 1.7).toFixed(1)} ${cy + amplitude} ${(x + period).toFixed(1)} ${cy}`;
  }
  return d;
}

// ── Compass / теодолит — отцентрован над двумя панелями графиков ──────────────
// CX = центр панелей (PANEL_X + PANEL_W/2 = 880 + 95). CY опущен на 30px.
const CX = 975;
const CY = 310;
const R  = 62;
const SWEEP_AX = (CX + R * Math.sin(-Math.PI / 3)).toFixed(1);
const SWEEP_AY = (CY - R * Math.cos(-Math.PI / 3)).toFixed(1);

// ── Panel layout — две панели стопкой (правый нижний угол) ────────────────────
const PANEL_X  = 880;
const PANEL_W  = 190;   // шире, чтобы подписи помещались в рамку
const PANEL_H  = 56;
const PANEL_A_Y = 470;
const PANEL_B_Y = PANEL_A_Y + PANEL_H + 8;  // 534
const PANEL_A_CY = PANEL_A_Y + PANEL_H / 2; // 498
const PANEL_B_BASELINE = PANEL_B_Y + PANEL_H - 8; // 582

const SINE_PATH_PANEL = buildSinePath(14, 70, 9, PANEL_A_CY);

const SRC_TERRAIN: [number, number][] = [
  [80, 803], [200, 773], [340, 788], [480, 758], [620, 774],
  [760, 753], [900, 768], [1040, 756], [1160, 769], [1280, 755], [1380, 762],
];
const terrainX0 = PANEL_X + 5;
const terrainW  = PANEL_W - 10;
const MINI_TERRAIN_PTS = SRC_TERRAIN.map(([x, y]): [number, number] => [
  terrainX0 + (x - 80) * terrainW / 1300,
  PANEL_B_BASELINE - (815 - y) * 24 / 62,
]);
const MINI_TERRAIN_PATH = MINI_TERRAIN_PTS
  .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(' ');
const lastX = MINI_TERRAIN_PTS[MINI_TERRAIN_PTS.length - 1][0].toFixed(1);
const MINI_TERRAIN_PATH_CLOSED = MINI_TERRAIN_PATH + ` L ${lastX} ${PANEL_B_BASELINE} L ${terrainX0} ${PANEL_B_BASELINE} Z`;

// ── Спектр-монитор — столбики переменной высоты ───────────────────────────────
const SPEC_X = 1230;
const SPEC_BASE = 175;
const SPEC_BAR_W = 6;
const SPEC_GAP = 5;
const SPEC_BARS = [
  { h: 14, peak: 30, dur: '1.4s' },
  { h: 26, peak: 44, dur: '1.0s' },
  { h: 18, peak: 52, dur: '1.7s' },
  { h: 34, peak: 60, dur: '0.9s' },
  { h: 22, peak: 40, dur: '1.3s' },
  { h: 30, peak: 50, dur: '1.1s' },
  { h: 16, peak: 36, dur: '1.6s' },
];

// ── GPS survey nodes — правая визуальная зона (X > 800) ───────────────────────
const SURVEY_PTS = [
  { x: 820,  y: 110, label: 'N:4840612', delay: '0s'   },
  { x: 1380, y: 88,  label: 'N:4840718', delay: '1.5s' },
  { x: 1395, y: 420, label: 'N:4840583', delay: '0.8s' },
  { x: 1280, y: 820, label: 'N:4840544', delay: '2.2s' },
];

export default function HeroEngineeringAnim() {
  const [reduceMotion, setReduceMotion] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const needleGroupRef = useRef<SVGGElement>(null);
  const azimuthTextRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Стрелка теодолита поворачивается за курсором (cursor-driven azimuth tracker)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const svg = svgRef.current;
    const needle = needleGroupRef.current;
    if (!svg || !needle) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(ctm.inverse());

        const dx = svgPt.x - CX;
        const dy = svgPt.y - CY;
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        const normalized = ((angleDeg % 360) + 360) % 360;
        needle.setAttribute('transform', `rotate(${normalized.toFixed(1)} ${CX} ${CY})`);
        if (azimuthTextRef.current) {
          azimuthTextRef.current.textContent = `α = ${normalized.toFixed(1)}°`;
        }
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  // Ambient-движение чисто декоративно — для reduced-motion не рендерим вовсе.
  if (reduceMotion) return null;

  const clipInnerX = PANEL_X + 5;
  const clipW      = PANEL_W - 10;
  const clipInnerH = PANEL_H - 28;

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <defs>
          <clipPath id="engWaveClip">
            <rect x={clipInnerX} y={PANEL_A_Y + 20} width={clipW} height={clipInnerH} />
          </clipPath>
          <clipPath id="engTerrainClip">
            <rect x={clipInnerX} y={PANEL_B_Y + 20} width={clipW} height={clipInnerH} />
          </clipPath>
        </defs>

        {/* ══ ТЕОДОЛИТ / COMPASS — следит за курсором ══ */}
        <circle cx={CX} cy={CY} r={R}
          stroke="var(--teal)" strokeWidth="1" strokeDasharray="8 5" strokeOpacity="0.45">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
            dur="40s" repeatCount="indefinite" />
        </circle>

        <circle cx={CX} cy={CY} r={59}
          stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.18" />
        <circle cx={CX} cy={CY} r={42}
          stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.28" />

        {Array.from({ length: 24 }).map((_, i) => {
          const angleDeg = i * 15;
          const angleRad = (angleDeg * Math.PI) / 180;
          const isCardinal = angleDeg % 90 === 0;
          const is30      = angleDeg % 30 === 0;
          const rInner    = isCardinal ? 64 : is30 ? 69 : 72;
          const x1 = CX + R * Math.sin(angleRad);
          const y1 = CY - R * Math.cos(angleRad);
          const x2 = CX + rInner * Math.sin(angleRad);
          const y2 = CY - rInner * Math.cos(angleRad);
          return (
            <line key={i}
              x1={x1.toFixed(1)} y1={y1.toFixed(1)}
              x2={x2.toFixed(1)} y2={y2.toFixed(1)}
              stroke={isCardinal ? 'var(--teal)' : 'rgba(0,196,167,0.35)'}
              strokeWidth={isCardinal ? 1.5 : 0.5}
            />
          );
        })}

        {([0, 90, 180, 270] as const).map(deg => {
          const rad    = (deg * Math.PI) / 180;
          const rLabel = 86;
          return (
            <text key={deg}
              x={(CX + rLabel * Math.sin(rad)).toFixed(1)}
              y={(CY - rLabel * Math.cos(rad) + 4).toFixed(1)}
              fill="var(--teal)" fontSize="10" fontFamily="monospace"
              textAnchor="middle" opacity="0.6">
              {deg}°
            </text>
          );
        })}

        <g ref={needleGroupRef}>
          <path
            d={`M ${CX} ${CY} L ${SWEEP_AX} ${SWEEP_AY} A ${R} ${R} 0 0 1 ${CX} ${CY - R} Z`}
            fill="rgba(0,196,167,0.06)"
            stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.35" />
          <line x1={CX} y1={CY} x2={CX} y2={CY - R}
            stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.9" />
          <circle cx={CX} cy={CY - R} r={2.5} fill="var(--gold)" />
          <line x1={CX - 6} y1={CY - R} x2={CX + 6} y2={CY - R}
            stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.5" />
        </g>

        <line x1={CX - 11} y1={CY} x2={CX + 11} y2={CY}
          stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.65" />
        <line x1={CX} y1={CY - 11} x2={CX} y2={CY + 11}
          stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.65" />
        <circle cx={CX} cy={CY} r={3}
          fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={1.2} fill="var(--gold)" />

        <line x1={CX} y1={CY - R - 7} x2={CX} y2={CY - R + 4}
          stroke="var(--teal)" strokeWidth="2" strokeOpacity="0.7" />

        <text x={CX - R - 55} y={CY - 6}
          fill="var(--teal)" fontSize="8" fontFamily="monospace"
          textAnchor="end" opacity="0.55" letterSpacing="1.5px">
          ТЕОДОЛИТ T-02
        </text>
        <text ref={azimuthTextRef} x={CX - R - 55} y={CY + 8}
          fill="var(--gold)" fontSize="9" fontFamily="monospace"
          textAnchor="end" letterSpacing="0.5px">
          α = 0.0°
        </text>

        {/* ══ PANEL A — осциллограф динамической нагрузки ══ */}
        <rect x={PANEL_X} y={PANEL_A_Y} width={PANEL_W} height={PANEL_H}
          fill="rgba(0,196,167,0.02)" stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.28" />

        {[1, 2, 3].map(i => (
          <line key={i}
            x1={PANEL_X + i * (PANEL_W / 4)} y1={PANEL_A_Y}
            x2={PANEL_X + i * (PANEL_W / 4)} y2={PANEL_A_Y + PANEL_H}
            stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.1" />
        ))}

        <line x1={PANEL_X} y1={PANEL_A_CY} x2={PANEL_X + PANEL_W} y2={PANEL_A_CY}
          stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.18" />

        <line x1={PANEL_X + PANEL_W / 2} y1={PANEL_A_Y}
              x2={PANEL_X + PANEL_W / 2} y2={PANEL_A_Y + PANEL_H}
          stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.35" />

        <g clipPath="url(#engWaveClip)">
          <path d={SINE_PATH_PANEL}
            stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.75" fill="none">
            <animateTransform attributeName="transform" type="translate"
              from={`${PANEL_X} 0`} to={`${PANEL_X - 600} 0`}
              dur="6s" repeatCount="indefinite" calcMode="linear" />
          </path>
        </g>

        <text x={PANEL_X + 8} y={PANEL_A_Y + 12}
          fill="var(--teal)" fontSize="7" fontFamily="monospace"
          opacity="0.55" letterSpacing="0.5px">ДИНАМИЧЕСКАЯ НАГРУЗКА</text>
        <text x={PANEL_X + PANEL_W - 4} y={PANEL_A_Y + 12}
          fill="var(--gold)" fontSize="8" fontFamily="monospace"
          textAnchor="end" letterSpacing="0.5px">
          124 kN
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
        </text>
        <text x={PANEL_X + 8} y={PANEL_A_Y + PANEL_H - 5}
          fill="var(--text-secondary)" fontSize="6" fontFamily="monospace"
          opacity="0.35" letterSpacing="0.3px">ЧАСТОТА 2.4 Гц · АМПЛ 0.8 мм · НОРМА</text>

        {/* ══ PANEL B — продольный профиль рельефа ══ */}
        <rect x={PANEL_X} y={PANEL_B_Y} width={PANEL_W} height={PANEL_H}
          fill="rgba(212,168,67,0.02)" stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.28" />

        {[1, 2, 3].map(i => (
          <line key={i}
            x1={PANEL_X + i * (PANEL_W / 4)} y1={PANEL_B_Y}
            x2={PANEL_X + i * (PANEL_W / 4)} y2={PANEL_B_Y + PANEL_H}
            stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.1" />
        ))}

        <line x1={PANEL_X + 5} y1={PANEL_B_BASELINE} x2={PANEL_X + PANEL_W - 5} y2={PANEL_B_BASELINE}
          stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="5 4" strokeOpacity="0.25" />

        <line x1={PANEL_X + PANEL_W / 2} y1={PANEL_B_Y}
              x2={PANEL_X + PANEL_W / 2} y2={PANEL_B_Y + PANEL_H}
          stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.35" />

        <g clipPath="url(#engTerrainClip)">
          <path d={MINI_TERRAIN_PATH_CLOSED} fill="rgba(212,168,67,0.04)" />
          {/* Профиль статичен — линия видна всегда (нет рассинхрона с заливкой) */}
          <path d={MINI_TERRAIN_PATH} fill="none"
            stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.8"
            strokeLinecap="round" strokeLinejoin="round" />
          {/* Бесшовный скан-курсор слева направо (linear translate → идеальный цикл) */}
          <line x1={terrainX0} y1={PANEL_B_Y + 20} x2={terrainX0} y2={PANEL_B_BASELINE}
            stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.55">
            <animateTransform attributeName="transform" type="translate"
              from="0 0" to={`${terrainW} 0`} dur="4s" repeatCount="indefinite" calcMode="linear" />
          </line>
        </g>

        <text x={PANEL_X + 8} y={PANEL_B_Y + 12}
          fill="var(--teal)" fontSize="7" fontFamily="monospace"
          opacity="0.55" letterSpacing="0.5px">ПРОДОЛЬНЫЙ ПРОФИЛЬ</text>
        <text x={PANEL_X + PANEL_W - 4} y={PANEL_B_Y + 12}
          fill="var(--gold)" fontSize="8" fontFamily="monospace"
          textAnchor="end" letterSpacing="0.5px">
          447 м
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3.1s" repeatCount="indefinite" />
        </text>
        <text x={PANEL_X + 8} y={PANEL_B_Y + PANEL_H - 5}
          fill="var(--text-secondary)" fontSize="6" fontFamily="monospace"
          opacity="0.35" letterSpacing="0.3px">ПК 108–113 · ОТМ 438–447 м</text>

        {/* ══ СПЕКТР-МОНИТОР ══ */}
        <text x={SPEC_X} y={SPEC_BASE - SPEC_BARS.length + 8}
          fill="var(--teal)" fontSize="7" fontFamily="monospace"
          opacity="0.5" letterSpacing="0.5px">СПЕКТР · Гц</text>
        <line x1={SPEC_X} y1={SPEC_BASE + 4}
          x2={SPEC_X + SPEC_BARS.length * (SPEC_BAR_W + SPEC_GAP)} y2={SPEC_BASE + 4}
          stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.25" />
        {SPEC_BARS.map((b, i) => {
          const x = SPEC_X + i * (SPEC_BAR_W + SPEC_GAP);
          return (
            <rect key={i} x={x} width={SPEC_BAR_W}
              y={SPEC_BASE - b.h} height={b.h}
              fill="var(--gold)" opacity="0.55">
              <animate attributeName="height" values={`${b.h};${b.peak};${b.h}`}
                dur={b.dur} repeatCount="indefinite" calcMode="spline"
                keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
              <animate attributeName="y" values={`${SPEC_BASE - b.h};${SPEC_BASE - b.peak};${SPEC_BASE - b.h}`}
                dur={b.dur} repeatCount="indefinite" calcMode="spline"
                keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
            </rect>
          );
        })}

        {/* ══ GPS SURVEY NODES ══ */}
        {SURVEY_PTS.map(({ x, y, label, delay }) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={3}
              fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.7">
              <animate attributeName="r" values="3;15;3" dur="4s" begin={delay} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="4s" begin={delay} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={2} fill="var(--gold)" opacity="0.85" />
            <line x1={x - 12} y1={y} x2={x - 4}  y2={y} stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.55" />
            <line x1={x + 4}  y1={y} x2={x + 12} y2={y} stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.55" />
            <line x1={x} y1={y - 12} x2={x} y2={y - 4}  stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.55" />
            <line x1={x} y1={y + 4}  x2={x} y2={y + 12} stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.55" />
            <text x={x + 16} y={y + 4}
              fill="var(--teal)" fontSize="9" fontFamily="monospace" opacity="0.5">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
