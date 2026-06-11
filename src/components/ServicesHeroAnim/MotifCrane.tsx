import type * as React from 'react';
import styles from './ServicesHeroAnim.module.css';

interface MotifCraneProps {
  crane: {
    baseX: number;
    baseY: number;
    mastH: number;
    jibLen: number;
    counterLen: number;
    color: string;
    tag: string;
    label: string;
  };
  unit: number;
  labelY: number;
  drawGen: number;
  /** Crossfade opacity style supplied by the orchestrator (motifStyle). */
  style: React.CSSProperties;
}

/* ─────────────────────────────────────────
    02 — TOWER CRANE (Construction)
───────────────────────────────────────── */
export default function MotifCrane({ crane, unit, labelY, drawGen, style }: MotifCraneProps) {
  const { baseX, baseY, mastH, jibLen, counterLen, color: st } = crane;
  const mastTop = baseY - mastH;
  const halfMast = Math.max(6, unit * 0.12);
  const trolleyT = 0.62;
  const trolleyX = baseX + jibLen * trolleyT;
  const cabH = Math.max(16, unit * 0.36);
  const cabW = Math.max(20, unit * 0.42);
  const segments = 9;

  /* Pivot (slew platform) + jib truss geometry */
  const pivotX = baseX;
  const pivotY = mastTop - cabH;
  const jibH   = Math.max(9, unit * 0.18);   // truss depth
  const topY   = pivotY - jibH;              // top chord
  const botY   = pivotY;                     // bottom chord (trolley runs here)
  const apexY  = topY - unit * 0.52;         // A-frame apex
  const nF     = 7;                          // front-jib panels
  const nC     = 3;                          // counter-jib panels
  const cwW    = Math.max(10, counterLen * 0.32);
  const cwH    = jibH * 1.6;
  const cableMin = unit * 0.55;
  const cableMax = unit * 1.55;
  const hoist = `${botY + cableMin}; ${botY + cableMax}; ${botY + cableMax}; ${botY + cableMin}; ${botY + cableMin}`;

  /* C — structure rising under the working zone */
  const groundY = baseY;
  const floors  = 4;
  const flH     = Math.max(7, unit * 0.22);
  const flW     = unit * 0.7;
  const flX     = trolleyX - flW / 2;

  return (
    <g key="crane" style={style}>
      {/* Remount on each activation → CSS assemble-on replays. */}
      <g key={drawGen}>
        {/* Ground line */}
        <line x1={baseX - counterLen * 1.1} y1={groundY} x2={trolleyX + flW * 0.7} y2={groundY}
          stroke={st} strokeWidth="0.6" strokeOpacity="0.4" />

        {/* C — rising structure (faint), grows from the ground */}
        <g className={styles.craneRise} style={{ animationDelay: '0.15s' }}>
          {Array.from({ length: floors }).map((_, i) => {
            const top = i === floors - 1;
            return (
              <rect key={`fl${i}`}
                x={flX} y={groundY - (i + 1) * flH} width={flW} height={flH - 1}
                fill="rgba(0,196,167,0.05)"
                stroke={st} strokeWidth="0.5"
                strokeOpacity={top ? 0.35 : 0.45}
                strokeDasharray={top ? '3 3' : undefined} />
            );
          })}
        </g>

        {/* ── Mast (lattice tower) + foundation — rises bottom→top ── */}
        <g className={styles.craneRise}>
          <line x1={baseX - halfMast} y1={baseY} x2={baseX - halfMast} y2={mastTop}
            stroke={st} strokeWidth="1.3" strokeOpacity="0.78" />
          <line x1={baseX + halfMast} y1={baseY} x2={baseX + halfMast} y2={mastTop}
            stroke={st} strokeWidth="1.3" strokeOpacity="0.78" />
          {/* Horizontal struts */}
          {Array.from({ length: segments + 1 }).map((_, i) => {
            const y = baseY - (i * mastH) / segments;
            return (
              <line key={`s${i}`} x1={baseX - halfMast} y1={y} x2={baseX + halfMast} y2={y}
                stroke={st} strokeWidth="0.5" strokeOpacity="0.5" />
            );
          })}
          {/* Cross bracing */}
          {Array.from({ length: segments }).map((_, i) => {
            const y0 = baseY - (i * mastH) / segments;
            const y1 = baseY - ((i + 1) * mastH) / segments;
            return (
              <g key={`x${i}`}>
                <line x1={baseX - halfMast} y1={y0} x2={baseX + halfMast} y2={y1}
                  stroke={st} strokeWidth="0.45" strokeOpacity="0.4" />
                <line x1={baseX + halfMast} y1={y0} x2={baseX - halfMast} y2={y1}
                  stroke={st} strokeWidth="0.45" strokeOpacity="0.4" />
              </g>
            );
          })}
          {/* Foundation tick */}
          <line x1={baseX - unit * 0.28} y1={baseY} x2={baseX + unit * 0.28} y2={baseY}
            stroke={st} strokeWidth="1.1" strokeOpacity="0.75" />
          <line x1={baseX - unit * 0.36} y1={baseY + 3} x2={baseX + unit * 0.36} y2={baseY + 3}
            stroke={st} strokeWidth="0.5" strokeOpacity="0.35" />
        </g>

        {/* Operator cabin — appears once the mast is up */}
        <rect className={styles.craneCab}
          x={baseX - cabW / 2} y={pivotY} width={cabW} height={cabH}
          fill="rgba(0,196,167,0.10)" stroke={st} strokeWidth="0.7" strokeOpacity="0.7" />

        {/* ── Jib (lattice truss) — fades in, then gentle ambient slew ── */}
        <g className={styles.craneJib}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`-5 ${pivotX} ${pivotY}; 5 ${pivotX} ${pivotY}; -5 ${pivotX} ${pivotY}`}
              keyTimes="0; 0.5; 1"
              dur="11s"
              repeatCount="indefinite"
            />

            {/* === Front jib truss === */}
            {/* Chords */}
            <line x1={pivotX} y1={topY} x2={pivotX + jibLen} y2={topY}
              stroke={st} strokeWidth="1.3" strokeOpacity="0.9" />
            <line x1={pivotX} y1={botY} x2={pivotX + jibLen} y2={botY}
              stroke={st} strokeWidth="1.3" strokeOpacity="0.9" />
            {/* Verticals */}
            {Array.from({ length: nF + 1 }).map((_, i) => {
              const x = pivotX + (i * jibLen) / nF;
              return <line key={`fv${i}`} x1={x} y1={topY} x2={x} y2={botY}
                stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />;
            })}
            {/* Diagonals (zigzag) */}
            {Array.from({ length: nF }).map((_, i) => {
              const x0 = pivotX + (i * jibLen) / nF;
              const xn = pivotX + ((i + 1) * jibLen) / nF;
              return <line key={`fd${i}`} x1={x0} y1={botY} x2={xn} y2={topY}
                stroke={st} strokeWidth="0.45" strokeOpacity="0.5" />;
            })}

            {/* === Counter jib truss === */}
            <line x1={pivotX - counterLen} y1={topY} x2={pivotX} y2={topY}
              stroke={st} strokeWidth="1.3" strokeOpacity="0.9" />
            <line x1={pivotX - counterLen} y1={botY} x2={pivotX} y2={botY}
              stroke={st} strokeWidth="1.3" strokeOpacity="0.9" />
            {Array.from({ length: nC + 1 }).map((_, i) => {
              const x = pivotX - (i * counterLen) / nC;
              return <line key={`cv${i}`} x1={x} y1={topY} x2={x} y2={botY}
                stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />;
            })}
            {Array.from({ length: nC }).map((_, i) => {
              const x0 = pivotX - (i * counterLen) / nC;
              const xn = pivotX - ((i + 1) * counterLen) / nC;
              return <line key={`cd${i}`} x1={x0} y1={botY} x2={xn} y2={topY}
                stroke={st} strokeWidth="0.45" strokeOpacity="0.5" />;
            })}

            {/* === A-frame + pendant ties === */}
            <line x1={pivotX - jibH * 0.8} y1={topY} x2={pivotX} y2={apexY}
              stroke={st} strokeWidth="0.9" strokeOpacity="0.75" />
            <line x1={pivotX + jibH * 0.8} y1={topY} x2={pivotX} y2={apexY}
              stroke={st} strokeWidth="0.9" strokeOpacity="0.75" />
            {/* Front pendants */}
            <line x1={pivotX} y1={apexY} x2={pivotX + jibLen * 0.55} y2={topY}
              stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />
            <line x1={pivotX} y1={apexY} x2={pivotX + jibLen * 0.97} y2={topY}
              stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />
            {/* Counter pendant */}
            <line x1={pivotX} y1={apexY} x2={pivotX - counterLen * 0.92} y2={topY}
              stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />

            {/* Counterweight block at the counter-jib end */}
            <rect x={pivotX - counterLen - cwW / 2} y={botY} width={cwW} height={cwH}
              fill={st} opacity="0.5" stroke={st} strokeOpacity="0.8" strokeWidth="0.6" />

            {/* ── Trolley + hook + load — appears last, hoists a load ── */}
            <g className={styles.craneHook}>
              <rect x={trolleyX - 5} y={botY - 2} width={10} height={4}
                fill={st} opacity="0.85" />
              {/* Hoist cable */}
              <line x1={trolleyX} y1={botY} x2={trolleyX}
                stroke={st} strokeWidth="0.5" strokeOpacity="0.7">
                <animate attributeName="y2" values={hoist}
                  keyTimes="0; 0.3; 0.5; 0.8; 1" dur="6s" repeatCount="indefinite" />
              </line>
              {/* Load block */}
              <rect x={trolleyX - 7} width={14} height={7}
                fill={st} opacity="0.55" stroke={st} strokeOpacity="0.9" strokeWidth="0.6">
                <animate attributeName="y" values={hoist}
                  keyTimes="0; 0.3; 0.5; 0.8; 1" dur="6s" repeatCount="indefinite" />
              </rect>
              {/* Weight tag riding with the load */}
              <text x={trolleyX} dy="-2.5" fill={st} fontSize="5.5"
                fontFamily="monospace" fontWeight="bold" textAnchor="middle" opacity="0.8">
                5 т
                <animate attributeName="y" values={hoist}
                  keyTimes="0; 0.3; 0.5; 0.8; 1" dur="6s" repeatCount="indefinite" />
              </text>
            </g>
          </g>
        </g>
      </g>

      {/* Tag (top-left, clear of the cables) + bottom label */}
      <text x={baseX - counterLen - unit * 0.05} y={apexY - 6}
        fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
        opacity="0.85" letterSpacing="0.5px">{crane.tag}</text>
      <text x={baseX} y={labelY}
        fill={st} fontSize="12.5" fontFamily="monospace"
        textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
        {crane.label}
      </text>
    </g>
  );
}
