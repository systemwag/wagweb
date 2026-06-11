import type * as React from 'react';
import styles from './ServicesHeroAnim.module.css';

interface MotifTruckProps {
  truck: {
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
    04 — DUMP TRUCK (Supplies)
───────────────────────────────────────── */
export default function MotifTruck({ truck, unit, tile, labelY, drawGen, style }: MotifTruckProps) {
  const { cx, cy, color: st } = truck;
  const truckW   = tile * 0.86;
  const tLeft    = cx - truckW / 2;
  const tRight   = cx + truckW / 2;
  const groundY  = cy + tile * 0.32;
  const wheelR   = unit * 0.16;
  const wheelY   = groundY - wheelR;

  /* Truck faces RIGHT (matches excavator).
     Cab on the right (~30%), level dump bed on the left. */
  const cabLeft   = tRight - truckW * 0.30;
  const cabRight  = tRight;
  const cabBottom = wheelY - wheelR * 0.4;
  const cabH      = tile * 0.38;
  const cabTop    = cabBottom - cabH;

  /* Chassis rail on which the bed rests */
  const chassisTop    = cabBottom - unit * 0.06;
  const chassisBottom = cabBottom;

  /* Level open dump bed: tall rectangular box, taller than cab */
  const bedLeft   = tLeft;
  const bedRight  = cabLeft - unit * 0.05;
  const bedH      = tile * 0.50;
  const bedBottom = chassisTop;
  const bedTop    = bedBottom - bedH;

  /* Two wheels: under bed (rear) + under cab (front) */
  const wheels = [
    tLeft + truckW * 0.22,    // rear (under bed)
    tLeft + truckW * 0.82,    // front (under cab)
  ];

  /* B/C — dump hinge (rear-bottom of bed) + delivered pile on the ground */
  const hingeX = bedLeft;
  const hingeY = bedBottom;
  const pileCx = tLeft - unit * 0.12;
  const pileW  = unit * 0.85;

  return (
    <g key="truck" style={style}>
      {/* Remount on each activation → CSS arrive/unload replays. */}
      <g key={drawGen}>
        {/* Ground line */}
        <line x1={pileCx - pileW} y1={groundY} x2={cx + truckW * 0.6} y2={groundY}
          stroke={st} strokeWidth="0.6" strokeOpacity="0.4" />

        {/* C — delivered material pile (grows as the bed unloads) */}
        <path className={styles.truckPile}
          d={
            `M ${pileCx - pileW / 2} ${groundY} ` +
            `Q ${pileCx - pileW * 0.2} ${groundY - unit * 0.24} ${pileCx} ${groundY - unit * 0.17} ` +
            `Q ${pileCx + pileW * 0.2} ${groundY - unit * 0.26} ${pileCx + pileW / 2} ${groundY} Z`
          }
          fill="rgba(232,165,114,0.16)" stroke={st} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* ── Truck — drives in from the left, then unloads ── */}
        <g className={styles.exDrive}
          style={{ ['--ex-in' as string]: `${-tile * 0.6}px` } as React.CSSProperties}>
          {/* Speed lines behind truck — fade out once parked */}
          <g className={styles.truckSpeed}>
            {[0, 1, 2].map(i => {
              const yLine = cy - tile * 0.04 + i * tile * 0.07;
              return (
                <line key={i}
                  x1={tLeft - tile * 0.20} y1={yLine}
                  x2={tLeft - unit * 0.10} y2={yLine}
                  stroke={st} strokeWidth="0.9" strokeOpacity="0.5"
                  strokeDasharray="6 4">
                  <animate attributeName="stroke-dashoffset"
                    values="0;-20" dur={`${0.8 + i * 0.15}s`}
                    repeatCount="indefinite" />
                </line>
              );
            })}
          </g>

          {/* Chassis rail */}
          <rect x={cabRight} y={chassisTop} width={tRight - cabRight}
            height={chassisBottom - chassisTop}
            fill={st} opacity="0.55" />

          {/* ── Dump bed — tips up at the rear hinge to unload ── */}
          <g className={styles.truckBed}
            style={{ transformBox: 'view-box', transformOrigin: `${hingeX}px ${hingeY}px` }}>
            {/* Bed box */}
            <rect x={bedLeft} y={bedTop} width={bedRight - bedLeft} height={bedH}
              fill="rgba(232,165,114,0.10)" stroke={st} strokeWidth="1.2" strokeOpacity="0.9" />
            {/* Inner rim line just below the top edge to suggest open top */}
            <line x1={bedLeft + unit * 0.05} y1={bedTop + unit * 0.06}
              x2={bedRight - unit * 0.05} y2={bedTop + unit * 0.06}
              stroke={st} strokeWidth="0.5" strokeOpacity="0.45" strokeDasharray="3 2" />
            {/* Vertical reinforcement ribs on bed side wall */}
            {[0.25, 0.5, 0.75].map(t => {
              const x = bedLeft + (bedRight - bedLeft) * t;
              return (
                <line key={t} x1={x} y1={bedTop + unit * 0.12}
                  x2={x} y2={bedBottom - unit * 0.06}
                  stroke={st} strokeWidth="0.5" strokeOpacity="0.45" />
              );
            })}
            {/* Material in the bed (empties as it tips) */}
            <path className={styles.truckLoad}
              d={
                `M ${bedLeft + unit * 0.10} ${bedTop} ` +
                `Q ${bedLeft + (bedRight - bedLeft) * 0.30} ${bedTop - unit * 0.10} ` +
                `${bedLeft + (bedRight - bedLeft) * 0.55} ${bedTop - unit * 0.04} ` +
                `Q ${bedLeft + (bedRight - bedLeft) * 0.80} ${bedTop - unit * 0.12} ` +
                `${bedRight - unit * 0.10} ${bedTop} Z`
              }
              fill={st} />
          </g>

          {/* Cab body — boxy with sloped front on the RIGHT (truck faces right) */}
          <polygon
            points={
              `${cabLeft},${cabBottom} ` +
              `${cabLeft},${cabTop} ` +
              `${cabRight - (cabRight - cabLeft) * 0.40},${cabTop} ` +
              `${cabRight},${cabTop + cabH * 0.45} ` +
              `${cabRight},${cabBottom}`
            }
            fill="rgba(232,165,114,0.10)" stroke={st} strokeWidth="1.1" strokeOpacity="0.85"
            strokeLinejoin="round" />
          {/* Windshield (on the right, sloped) */}
          <polygon
            points={
              `${cabLeft + unit * 0.06},${cabTop + cabH * 0.12} ` +
              `${cabRight - (cabRight - cabLeft) * 0.45},${cabTop + cabH * 0.12} ` +
              `${cabRight - (cabRight - cabLeft) * 0.18},${cabTop + cabH * 0.45} ` +
              `${cabRight - (cabRight - cabLeft) * 0.18},${cabTop + cabH * 0.55} ` +
              `${cabLeft + unit * 0.06},${cabTop + cabH * 0.55}`
            }
            fill="rgba(232,165,114,0.22)" stroke={st} strokeWidth="0.5" strokeOpacity="0.65" />
          {/* Headlight (on the right side, the front) */}
          <circle cx={cabRight - unit * 0.06} cy={cabBottom - cabH * 0.18} r={unit * 0.04}
            fill={st} opacity="0.7" />

          {/* Wheels — 2 (front + rear), rotating spokes */}
          {wheels.map((wx, i) => (
            <g key={i}>
              <circle cx={wx} cy={wheelY} r={wheelR}
                fill="rgba(232,165,114,0.18)" stroke={st} strokeWidth="1" strokeOpacity="0.9" />
              <circle cx={wx} cy={wheelY} r={wheelR * 0.42}
                fill={st} opacity="0.55" />
              <g>
                <animateTransform attributeName="transform" type="rotate"
                  values={`0 ${wx} ${wheelY}; 360 ${wx} ${wheelY}`}
                  dur={`${1.6 + i * 0.15}s`} repeatCount="indefinite" />
                <line x1={wx - wheelR * 0.78} y1={wheelY}
                  x2={wx + wheelR * 0.78} y2={wheelY}
                  stroke={st} strokeWidth="0.7" strokeOpacity="0.75" />
                <line x1={wx} y1={wheelY - wheelR * 0.78}
                  x2={wx} y2={wheelY + wheelR * 0.78}
                  stroke={st} strokeWidth="0.7" strokeOpacity="0.75" />
              </g>
            </g>
          ))}
        </g>
      </g>

      {/* Tag + spec line (top-left) + bottom label */}
      <text x={tLeft} y={bedTop - 8}
        fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
        opacity="0.85" letterSpacing="0.5px">{truck.tag}</text>
      <text x={tLeft} y={bedTop - 8 + 11}
        fill={st} fontSize="5.5" fontFamily="monospace"
        opacity="0.55" letterSpacing="0.4px">САМОСВАЛ · 25 Т</text>
      <text x={cx} y={labelY}
        fill={st} fontSize="12.5" fontFamily="monospace"
        textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
        {truck.label}
      </text>
    </g>
  );
}
