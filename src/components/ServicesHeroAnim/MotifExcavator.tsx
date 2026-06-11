import type * as React from 'react';
import styles from './ServicesHeroAnim.module.css';

interface MotifExcavatorProps {
  excavator: {
    cx: number;
    cy: number;
    color: string;
    tag: string;
    label: string;
  };
  unit: number;
  tile: number;
  labelY: number;
  drawGen: number;
  /** Crossfade opacity style supplied by the orchestrator (motifStyle). */
  style: React.CSSProperties;
}

/* ─────────────────────────────────────────
    03 — EXCAVATOR (Special equipment)
───────────────────────────────────────── */
export default function MotifExcavator({ excavator, unit, tile, labelY, drawGen, style }: MotifExcavatorProps) {
  const { cx, cy, color: st } = excavator;
  const groundY  = cy + unit * 0.55;
  const trackTop = groundY - unit * 0.22;
  const trackW   = unit * 1.5;
  const cabBottom = trackTop;
  const cabH     = unit * 0.50;
  const cabW     = unit * 0.85;
  const cabLeft  = cx - cabW * 0.55;

  /* Boom pivot point at top-back of cabin */
  const pivotX = cabLeft + cabW * 0.20;
  const pivotY = cabBottom - cabH;
  const boomEndX = pivotX + unit * 0.95;
  const boomEndY = pivotY - unit * 0.85;
  const stickEndX = boomEndX + unit * 0.55;
  const stickEndY = boomEndY + unit * 0.85;

  /* Joint pivots (rest pose) for the articulated dig */
  const u = unit;
  const boomPiv  = `${pivotX} ${pivotY}`;
  const stickPiv = `${boomEndX} ${boomEndY}`;
  const buckPiv  = `${stickEndX} ${stickEndY}`;
  const digKT = '0; 0.25; 0.45; 0.68; 0.85; 1';
  const digDur = '4.6s';
  /* Per-joint angle sequences — reach → scoop → lift → dump → return */
  const boomV  = `0 ${boomPiv}; 7 ${boomPiv}; 7 ${boomPiv}; -12 ${boomPiv}; -12 ${boomPiv}; 0 ${boomPiv}`;
  const stickV = `0 ${stickPiv}; 13 ${stickPiv}; 2 ${stickPiv}; 2 ${stickPiv}; 9 ${stickPiv}; 0 ${stickPiv}`;
  const buckV  = `0 ${buckPiv}; -14 ${buckPiv}; -48 ${buckPiv}; -48 ${buckPiv}; 12 ${buckPiv}; 0 ${buckPiv}`;

  /* C — dig context: trench under the bucket + spoil pile by the tracks */
  const digX    = stickEndX;
  const trenchW = u * 0.8;
  const spoilX  = digX - trenchW * 1.15;   // mound beside the trench

  return (
    <g key="excavator" style={style}>
      {/* Remount on each activation → CSS drive-in replays. */}
      <g key={drawGen}>
        {/* Ground line */}
        <line x1={cx - trackW * 0.75} y1={groundY} x2={digX + trenchW} y2={groundY}
          stroke={st} strokeWidth="0.6" strokeOpacity="0.4" />

        {/* ── C — dig context (trench + spoil), fades in ── */}
        <g className={styles.exCtx}>
          {/* Trench notch where the bucket works */}
          <polyline
            points={
              `${digX - trenchW * 0.6},${groundY} ` +
              `${digX - trenchW * 0.25},${groundY + u * 0.26} ` +
              `${digX + trenchW * 0.25},${groundY + u * 0.26} ` +
              `${digX + trenchW * 0.6},${groundY}`
            }
            fill="rgba(79,132,255,0.07)" stroke={st} strokeWidth="0.6" strokeOpacity="0.5" />
          {/* Trench floor hatching */}
          {Array.from({ length: 4 }).map((_, i) => {
            const hx = digX - trenchW * 0.35 + (i * trenchW * 0.7) / 3;
            return <line key={`th${i}`} x1={hx} y1={groundY + u * 0.05}
              x2={hx - 4} y2={groundY + u * 0.20}
              stroke={st} strokeWidth="0.4" strokeOpacity="0.35" />;
          })}
          {/* Spoil pile (mound) by the tracks */}
          <path
            d={
              `M ${spoilX - u * 0.45} ${groundY} ` +
              `Q ${spoilX - u * 0.15} ${groundY - u * 0.28} ${spoilX} ${groundY - u * 0.20} ` +
              `Q ${spoilX + u * 0.20} ${groundY - u * 0.30} ${spoilX + u * 0.45} ${groundY} Z`
            }
            fill="rgba(79,132,255,0.10)" stroke={st} strokeWidth="0.5" strokeOpacity="0.45" />
        </g>

        {/* ── Machine — drives in from the left, then works ── */}
        <g className={styles.exDrive}
          style={{ ['--ex-in' as string]: `${-tile * 0.55}px` } as React.CSSProperties}>
          {/* Tracks (rounded rect) */}
          <rect x={cx - trackW / 2} y={trackTop} width={trackW} height={groundY - trackTop}
            rx={unit * 0.10}
            fill="rgba(79,132,255,0.10)" stroke={st} strokeWidth="0.9" strokeOpacity="0.75" />
          {/* Wheels inside track */}
          {Array.from({ length: 5 }).map((_, i) => {
            const wx = cx - trackW / 2 + (trackW * (i + 0.5)) / 5;
            const wy = (trackTop + groundY) / 2;
            return (
              <circle key={i} cx={wx} cy={wy} r={unit * 0.07}
                fill="none" stroke={st} strokeWidth="0.6" strokeOpacity="0.6" />
            );
          })}

          {/* Cabin */}
          <rect x={cabLeft} y={cabBottom - cabH} width={cabW} height={cabH}
            fill="rgba(79,132,255,0.10)" stroke={st} strokeWidth="0.9" strokeOpacity="0.8" />
          {/* Window */}
          <rect x={cabLeft + cabW * 0.45} y={cabBottom - cabH + cabH * 0.15}
            width={cabW * 0.45} height={cabH * 0.55}
            fill="rgba(79,132,255,0.18)" stroke={st} strokeWidth="0.5" strokeOpacity="0.6" />
          {/* Cabin to track joint */}
          <line x1={cabLeft} y1={cabBottom} x2={cabLeft + cabW} y2={cabBottom}
            stroke={st} strokeWidth="0.6" strokeOpacity="0.5" />

          {/* ── Articulated arm — fades in, then digs (nested joints) ── */}
          <g className={styles.exArm}>
            {/* BOOM (rotates around base pivot) */}
            <g>
              <animateTransform attributeName="transform" type="rotate"
                values={boomV} keyTimes={digKT} dur={digDur} repeatCount="indefinite" />
              <line x1={pivotX} y1={pivotY} x2={boomEndX} y2={boomEndY}
                stroke={st} strokeWidth="2.4" strokeOpacity="0.9" />
              <line x1={pivotX + 2} y1={pivotY - 2} x2={boomEndX - 2} y2={boomEndY + 2}
                stroke={st} strokeWidth="0.5" strokeOpacity="0.45" />
              {/* Boom hydraulic */}
              <line x1={pivotX + u * 0.10} y1={pivotY - u * 0.18}
                    x2={pivotX + u * 0.55} y2={pivotY - u * 0.55}
                stroke={st} strokeWidth="1.4" strokeOpacity="0.7" />
              <circle cx={pivotX} cy={pivotY} r={u * 0.07}
                fill="var(--bg-primary, #04060c)" stroke={st} strokeWidth="1" />

              {/* STICK (rotates around boom-stick joint) */}
              <g>
                <animateTransform attributeName="transform" type="rotate"
                  values={stickV} keyTimes={digKT} dur={digDur} repeatCount="indefinite" />
                <circle cx={boomEndX} cy={boomEndY} r={u * 0.06}
                  fill="var(--bg-primary, #04060c)" stroke={st} strokeWidth="0.9" />
                <line x1={boomEndX} y1={boomEndY} x2={stickEndX} y2={stickEndY}
                  stroke={st} strokeWidth="1.8" strokeOpacity="0.9" />
                {/* Stick hydraulic */}
                <line x1={boomEndX - u * 0.10} y1={boomEndY - u * 0.05}
                      x2={boomEndX + u * 0.30} y2={boomEndY + u * 0.30}
                  stroke={st} strokeWidth="1.1" strokeOpacity="0.65" />

                {/* BUCKET (curls around stick-bucket joint) */}
                <g>
                  <animateTransform attributeName="transform" type="rotate"
                    values={buckV} keyTimes={digKT} dur={digDur} repeatCount="indefinite" />
                  <circle cx={stickEndX} cy={stickEndY} r={u * 0.05}
                    fill="var(--bg-primary, #04060c)" stroke={st} strokeWidth="0.8" />
                  {(() => {
                    const bx = stickEndX;
                    const by = stickEndY;
                    return (
                      <polyline
                        points={
                          `${bx - u * 0.05},${by} ` +
                          `${bx + u * 0.20},${by + u * 0.05} ` +
                          `${bx + u * 0.32},${by + u * 0.28} ` +
                          `${bx + u * 0.10},${by + u * 0.34} ` +
                          `${bx - u * 0.05},${by + u * 0.18} ` +
                          `${bx - u * 0.05},${by}`
                        }
                        fill="rgba(79,132,255,0.18)"
                        stroke={st} strokeWidth="1.2" strokeOpacity="0.9"
                        strokeLinejoin="round"
                      />
                    );
                  })()}
                  {/* Material in the bucket — visible between scoop and dump */}
                  <path
                    d={
                      `M ${stickEndX + u * 0.00} ${stickEndY + u * 0.10} ` +
                      `Q ${stickEndX + u * 0.14} ${stickEndY + u * 0.02} ` +
                      `${stickEndX + u * 0.26} ${stickEndY + u * 0.12} ` +
                      `L ${stickEndX + u * 0.20} ${stickEndY + u * 0.26} ` +
                      `L ${stickEndX + u * 0.04} ${stickEndY + u * 0.22} Z`
                    }
                    fill={st} opacity="0">
                    <animate attributeName="opacity"
                      values="0; 0; 0.55; 0.55; 0; 0" keyTimes={digKT}
                      dur={digDur} repeatCount="indefinite" />
                  </path>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* Tag + spec line (top-left) + bottom label */}
      <text x={cx - trackW / 2} y={cabBottom - cabH - u * 1.05}
        fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
        opacity="0.85" letterSpacing="0.5px">{excavator.tag}</text>
      <text x={cx - trackW / 2} y={cabBottom - cabH - u * 1.05 + 11}
        fill={st} fontSize="5.5" fontFamily="monospace"
        opacity="0.55" letterSpacing="0.4px">ГУСЕНИЧНЫЙ · 20 Т</text>
      <text x={cx} y={labelY}
        fill={st} fontSize="12.5" fontFamily="monospace"
        textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
        {excavator.label}
      </text>
    </g>
  );
}
