'use client';

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

// ── Compass — LEFT side ────────────────────────────────────────────────────────
const CX = 155;
const CY = 270;
const R  = 115;
const SWEEP_AX = (CX + R * Math.sin(-Math.PI / 3)).toFixed(1);
const SWEEP_AY = (CY - R * Math.cos(-Math.PI / 3)).toFixed(1);

// ── Panel layout — two panels stacked vertically in one column ─────────────────
// Both panels: width=280, height=115, same x, gap=10px
const PANEL_X  = 840;
const PANEL_W  = 280;
const PANEL_H  = 115;
const PANEL_A_Y = 450;
const PANEL_B_Y = PANEL_A_Y + PANEL_H + 10; // 575
const PANEL_A_CY = PANEL_A_Y + PANEL_H / 2; // 507.5
const PANEL_B_BASELINE = PANEL_B_Y + PANEL_H - 10; // 680

// ── Panel A: animated sine wave (cy = center of panel A) ─────────────────────
const SINE_PATH_PANEL = buildSinePath(12, 100, 18, PANEL_A_CY);

// ── Panel B: terrain elevation — computed relative to PANEL_X ─────────────────
// Original x: 80–1380 (range 1300), original y: 753–815 (baseline 815, range 62)
const SRC_TERRAIN: [number, number][] = [
  [80, 803], [200, 773], [340, 788], [480, 758], [620, 774],
  [760, 753], [900, 768], [1040, 756], [1160, 769], [1280, 755], [1380, 762],
];
const terrainX0 = PANEL_X + 5;
const terrainW  = PANEL_W - 10;
const MINI_TERRAIN_PTS = SRC_TERRAIN.map(([x, y]): [number, number] => [
  terrainX0 + (x - 80) * terrainW / 1300,
  PANEL_B_BASELINE - (815 - y) * 50 / 62,
]);
const MINI_TERRAIN_PATH = MINI_TERRAIN_PTS
  .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(' ');
const lastX = MINI_TERRAIN_PTS[MINI_TERRAIN_PTS.length - 1][0].toFixed(1);
const MINI_TERRAIN_PATH_CLOSED = MINI_TERRAIN_PATH + ` L ${lastX} ${PANEL_B_BASELINE} L ${terrainX0} ${PANEL_B_BASELINE} Z`;
const MINI_TERRAIN_LEN = 420;

// ── GPS survey nodes ──────────────────────────────────────────────────────────
const SURVEY_PTS = [
  { x: 130,  y: 100, label: 'N:4840612', delay: '0s'   },
  { x: 1380, y: 88,  label: 'N:4840718', delay: '1.5s' },
  { x: 1395, y: 360, label: 'N:4840583', delay: '0.8s' },
  { x: 150,  y: 715, label: 'N:4840544', delay: '2.2s' },
];

export default function HeroEngineeringAnim() {
  const clipInnerX = PANEL_X + 5;
  const clipW      = PANEL_W - 10;
  const clipInnerH = PANEL_H - 28; // leave room for top/bottom labels

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <defs>
          {/* Clip for Panel A — waveform */}
          <clipPath id="engWaveClip">
            <rect x={clipInnerX} y={PANEL_A_Y + 20} width={clipW} height={clipInnerH} />
          </clipPath>
          {/* Clip for Panel B — terrain */}
          <clipPath id="engTerrainClip">
            <rect x={clipInnerX} y={PANEL_B_Y + 20} width={clipW} height={clipInnerH} />
          </clipPath>
        </defs>

        {/* ══════════════════════════════════════════════════════════
            ТЕОДОЛИТ / COMPASS — LEFT side
            ══════════════════════════════════════════════════════════ */}

        <circle cx={CX} cy={CY} r={R}
          stroke="var(--teal)" strokeWidth="1" strokeDasharray="8 5" strokeOpacity="0.45">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
            dur="40s" repeatCount="indefinite" />
        </circle>

        <circle cx={CX} cy={CY} r={90}
          stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.18" />

        <circle cx={CX} cy={CY} r={64}
          stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.28" />

        {Array.from({ length: 24 }).map((_, i) => {
          const angleDeg = i * 15;
          const angleRad = (angleDeg * Math.PI) / 180;
          const isCardinal = angleDeg % 90 === 0;
          const is30      = angleDeg % 30 === 0;
          const rInner    = isCardinal ? 97 : is30 ? 106 : 110;
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
          const rLabel = 132;
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

        <g>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
            dur="20s" repeatCount="indefinite" />
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

        <line x1={CX - 16} y1={CY} x2={CX + 16} y2={CY}
          stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.65" />
        <line x1={CX} y1={CY - 16} x2={CX} y2={CY + 16}
          stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.65" />
        <circle cx={CX} cy={CY} r={4}
          fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={1.5} fill="var(--gold)" />

        <line x1={CX} y1={CY - R - 10} x2={CX} y2={CY - R + 6}
          stroke="var(--teal)" strokeWidth="2" strokeOpacity="0.7" />

        <text x={CX + R + 18} y={CY - 8}
          fill="var(--teal)" fontSize="10" fontFamily="monospace"
          textAnchor="start" opacity="0.55" letterSpacing="2px">
          ТЕОДОЛИТ T-02
        </text>
        <text x={CX + R + 18} y={CY + 10}
          fill="var(--gold)" fontSize="11" fontFamily="monospace"
          textAnchor="start" letterSpacing="1px">
          α = 247.3°
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.8s" repeatCount="indefinite" />
        </text>

        {/* ══════════════════════════════════════════════════════════
            PANEL A — WAVEFORM MONITOR (top panel)
            ══════════════════════════════════════════════════════════ */}

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

        <text x={PANEL_X + 8} y={PANEL_A_Y + 15}
          fill="var(--teal)" fontSize="9" fontFamily="monospace"
          opacity="0.55" letterSpacing="0.5px">
          ДИНАМИЧЕСКАЯ НАГРУЗКА
        </text>
        <text x={PANEL_X + PANEL_W - 4} y={PANEL_A_Y + 15}
          fill="var(--gold)" fontSize="10" fontFamily="monospace"
          textAnchor="end" letterSpacing="0.5px">
          124 kN
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
        </text>
        <text x={PANEL_X + 8} y={PANEL_A_Y + PANEL_H - 6}
          fill="var(--text-secondary)" fontSize="8" fontFamily="monospace"
          opacity="0.35" letterSpacing="0.3px">
          ЧАСТОТА: 2.4 Гц · АМПЛИТУДА: 0.8 мм · СТАТУС: НОРМА
        </text>

        {/* ══════════════════════════════════════════════════════════
            PANEL B — TERRAIN ELEVATION PROFILE (bottom panel)
            ══════════════════════════════════════════════════════════ */}

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
          <path d={MINI_TERRAIN_PATH}
            stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.8"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={MINI_TERRAIN_LEN}>
            <animate attributeName="stroke-dashoffset"
              values={`${MINI_TERRAIN_LEN};0;0;${MINI_TERRAIN_LEN}`}
              keyTimes="0;0.5;0.8;1"
              dur="12s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.25 0.1 0.25 1;0 0 1 1;0.8 0 1 0.2" />
          </path>
        </g>

        <text x={PANEL_X + 8} y={PANEL_B_Y + 15}
          fill="var(--teal)" fontSize="9" fontFamily="monospace"
          opacity="0.55" letterSpacing="0.5px">
          ПРОДОЛЬНЫЙ ПРОФИЛЬ
        </text>
        <text x={PANEL_X + PANEL_W - 4} y={PANEL_B_Y + 15}
          fill="var(--gold)" fontSize="10" fontFamily="monospace"
          textAnchor="end" letterSpacing="0.5px">
          447 м
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3.1s" repeatCount="indefinite" />
        </text>
        <text x={PANEL_X + 8} y={PANEL_B_Y + PANEL_H - 6}
          fill="var(--text-secondary)" fontSize="8" fontFamily="monospace"
          opacity="0.35" letterSpacing="0.3px">
          ПК 108–113 · ОТМЕТКА: 438–447 м · УКЛОН: ‰
        </text>

        {/* ══════════════════════════════════════════════════════════
            GPS SURVEY NODES
            ══════════════════════════════════════════════════════════ */}
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
              fill="var(--teal)" fontSize="9" fontFamily="monospace" opacity="0.5">
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
