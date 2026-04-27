'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ServicesHeroAnim.module.css';

const WAG_PATH =
  'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51' +
  'c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07' +
  'l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02' +
  'l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,' +
  '13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42' +
  'c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02' +
  '-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79' +
  ',3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,' +
  '36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,' +
  '19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

const LOGO_W = 719.49;
const LOGO_H = 635.66;

export default function ServicesHeroAnim() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [[w, h], setDims] = useState([1200, 520]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 10 && r.height > 10)
        setDims([Math.round(r.width), Math.round(r.height)]);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Geometry ──────────────────────────────────
     Layout (left → right, each tile the same visual size):
       [LOGO] [DESIGN+CALC] [CRANE] [EXCAVATOR] [TRUCK]
     The logo sits closest to the heading; motifs follow. */
  const PAD     = 32;
  const zoneL   = w * 0.40;
  const zoneR   = w - PAD;
  const zoneW   = zoneR - zoneL;

  /* Five equal tiles fit in the zone. Row width = 5 tiles + 4 gaps =
     5 * 2.4u + 4 * 0.6u = 14.4u, so the divisor is sized to keep a
     small breathing margin on either side. */
  const unit    = Math.min(zoneW / 14.8, h * 0.27, 95);
  const tile    = unit * 2.4;
  const gap     = unit * 0.6;
  const rowW    = 5 * tile + 4 * gap;
  const rowL    = zoneL + Math.max(unit * 0.1, (zoneW - rowW) / 2);

  const slot1Cx = rowL + tile * 0.5;                 // LOGO
  const slot2Cx = rowL + tile * 1.5 + gap * 1;       // DESIGN + CALC
  const slot3Cx = rowL + tile * 2.5 + gap * 2;       // CRANE
  const slot4Cx = rowL + tile * 3.5 + gap * 3;       // EXCAVATOR
  const slot5Cx = rowL + tile * 4.5 + gap * 4;       // TRUCK (deliveries)

  const motifCy = h * 0.50;

  /* Logo — first tile, sized to match the others.
     `ring` keeps the original 1:2.8 ratio with the logo width so the
     decorative dashed circles sit naturally around it. */
  const logoCx  = slot1Cx;
  const logoCy  = motifCy;
  const logoW   = tile;
  const logoH   = (logoW / LOGO_W) * LOGO_H;
  const ring    = logoW * 0.36;

  const GOLD = 'var(--gold)';
  const TEAL = 'var(--teal)';
  const BLUE = 'var(--blue)';

  /* 02 — combined Design + Calculations: compass on the left, chart on the right.
     The combined pair fills one tile. */
  const design = {
    compassCx: slot2Cx - tile * 0.27,
    compassCy: motifCy,
    compassR:  unit * 0.65,
    chartX:    slot2Cx + tile * 0.02,
    chartY:    motifCy - unit * 0.50,
    chartW:    tile * 0.45,
    chartH:    unit * 0.95,
    color:     GOLD,
    tag:       '01',
    label:     'ПРОЕКТИРОВАНИЕ',
  };

  /* Crane sized to its tile */
  const craneJibLen     = tile * 0.42;
  const craneCounterLen = unit * 0.50;
  const crane = {
    baseX: slot3Cx,
    baseY: motifCy + tile * 0.45,
    mastH: tile * 0.85,
    jibLen: craneJibLen,
    counterLen: craneCounterLen,
    color: TEAL, tag: '02', label: 'СТРОИТЕЛЬСТВО',
  };

  /* Excavator sized to its tile */
  const excavator = {
    cx: slot4Cx,
    cy: motifCy + tile * 0.10,
    color: BLUE, tag: '03', label: 'СПЕЦ ТЕХНИКА',
  };

  /* Delivery truck — warm-orange accent (distinct from gold/teal/blue) */
  const truck = {
    cx: slot5Cx,
    cy: motifCy + tile * 0.10,
    color: '#E8A572',
    tag: '04',
    label: 'ПОСТАВКИ',
  };

  return (
    <div className={styles.wrapper} ref={wrapRef} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="shaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--gold)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* ── Blueprint grid (subtle, only across the animation zone) ── */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1={zoneL} y1={(i + 1) * h / 8} x2={w} y2={(i + 1) * h / 8}
            stroke={TEAL} strokeWidth="0.3" strokeOpacity="0.06" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = zoneL + ((i + 1) * zoneW) / 10;
          return (
            <line key={`v${i}`} x1={x} y1={0} x2={x} y2={h}
              stroke={TEAL} strokeWidth="0.3" strokeOpacity="0.06" />
          );
        })}

        {/* ── Corner brackets (right-side zone) ── */}
        {([
          [zoneL + 4, 6,     1,  1],
          [w - 6,        6,    -1,  1],
          [zoneL + 4, h - 6, 1, -1],
          [w - 6,        h - 6,-1, -1],
        ] as [number, number, number, number][]).map(([bx, by, sx, sy], i) => (
          <g key={i}>
            <line x1={bx} y1={by + sy * 18} x2={bx}            y2={by}
              stroke={TEAL} strokeWidth="0.7" strokeOpacity="0.22" />
            <line x1={bx} y1={by}            x2={bx + sx * 18} y2={by}
              stroke={TEAL} strokeWidth="0.7" strokeOpacity="0.22" />
          </g>
        ))}

        {/* ── Halo behind logo ── */}
        <circle cx={logoCx} cy={logoCy} r={tile * 0.55} fill="url(#shaGlow)" />

        {/* ── Outer ring (CW) ── */}
        <circle cx={logoCx} cy={logoCy} r={ring * 1.32}
          stroke={TEAL} strokeWidth="0.6" strokeDasharray="9 7"
          strokeOpacity="0.28" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${logoCx} ${logoCy}`} to={`360 ${logoCx} ${logoCy}`}
            dur="42s" repeatCount="indefinite" />
        </circle>

        {/* ── Inner ring (CCW) ── */}
        <circle cx={logoCx} cy={logoCy} r={ring * 0.98}
          stroke={GOLD} strokeWidth="0.45" strokeDasharray="3 8"
          strokeOpacity="0.22" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${logoCx} ${logoCy}`} to={`-360 ${logoCx} ${logoCy}`}
            dur="26s" repeatCount="indefinite" />
        </circle>

        {/* ─────────────────────────────────────────
            01 — COMPASS + CHART (Design & Calculations)
        ───────────────────────────────────────── */}
        {(() => {
          const d = design;
          const points = Array.from({ length: 9 }).map((_, i) => {
            const t = i / 8;
            const px = d.chartX + t * d.chartW;
            const py = d.chartY + d.chartH - Math.pow(t, 0.7) * d.chartH;
            return `${px.toFixed(1)},${py.toFixed(1)}`;
          }).join(' ');

          /* Combined motif bbox for tag/label placement */
          const bboxLeft  = d.compassCx - d.compassR;
          const bboxRight = d.chartX + d.chartW;
          const bboxTop   = Math.min(d.compassCy - d.compassR, d.chartY);
          const bboxBot   = Math.max(d.compassCy + d.compassR, d.chartY + d.chartH);

          return (
            <g key="design">
              {/* Compass */}
              <g transform={`translate(${d.compassCx}, ${d.compassCy})`}>
                <circle r={d.compassR} fill="none" stroke={d.color} strokeOpacity="0.55" strokeWidth="0.9" />
                <circle r={d.compassR * 0.74} fill="none" stroke={d.color} strokeOpacity="0.18"
                  strokeWidth="0.5" strokeDasharray="2 4" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const deg = i * 30;
                  const rad = (deg * Math.PI) / 180;
                  const r2 = d.compassR;
                  const r1 = d.compassR - (i % 3 === 0 ? 6 : 3);
                  return <line key={i}
                    x1={Math.cos(rad) * r1} y1={Math.sin(rad) * r1}
                    x2={Math.cos(rad) * r2} y2={Math.sin(rad) * r2}
                    stroke={d.color}
                    strokeOpacity={i % 3 === 0 ? '0.7' : '0.35'}
                    strokeWidth={i % 3 === 0 ? '0.9' : '0.5'} />;
                })}
                <g className={styles.needleSpin}>
                  <line x1={0} y1={-d.compassR * 0.85} x2={0} y2={d.compassR * 0.6}
                    stroke={d.color} strokeWidth="1.4" strokeOpacity="0.9" />
                  <polygon
                    points={`0,${-d.compassR * 0.85} -3,${-d.compassR * 0.65} 3,${-d.compassR * 0.65}`}
                    fill={d.color} opacity="0.95" />
                  <circle r="2.4" fill="var(--bg-primary, #04060c)" stroke={d.color} strokeWidth="1" />
                </g>
                <text y={-d.compassR - 5} fill={d.color} fontSize="6.5" fontFamily="monospace"
                  textAnchor="middle" opacity="0.5">N</text>
              </g>

              {/* Chart axes */}
              <line x1={d.chartX} y1={d.chartY + d.chartH} x2={d.chartX + d.chartW} y2={d.chartY + d.chartH}
                stroke={d.color} strokeWidth="0.6" strokeOpacity="0.45" />
              <line x1={d.chartX} y1={d.chartY} x2={d.chartX} y2={d.chartY + d.chartH}
                stroke={d.color} strokeWidth="0.6" strokeOpacity="0.45" />
              {/* Chart grid */}
              {[0.25, 0.5, 0.75].map(t => (
                <line key={t} x1={d.chartX} y1={d.chartY + d.chartH - t * d.chartH}
                  x2={d.chartX + d.chartW} y2={d.chartY + d.chartH - t * d.chartH}
                  stroke={d.color} strokeWidth="0.3" strokeOpacity="0.16" strokeDasharray="2 3" />
              ))}
              {/* Filled area under curve */}
              <polygon
                points={`${d.chartX},${d.chartY + d.chartH} ${points} ${d.chartX + d.chartW},${d.chartY + d.chartH}`}
                fill={d.color} opacity="0.10" />
              {/* Curve */}
              <polyline points={points} fill="none" stroke={d.color}
                strokeWidth="1.5" strokeOpacity="0.9"
                strokeDasharray="240" strokeDashoffset="240">
                <animate attributeName="stroke-dashoffset"
                  values="240;0" dur="2.6s" begin="0.3s" fill="freeze"
                  calcMode="spline" keySplines="0.4 0 0.2 1" />
              </polyline>
              {/* Data points */}
              {[2, 4, 6, 8].map(i => {
                const t = i / 8;
                const px = d.chartX + t * d.chartW;
                const py = d.chartY + d.chartH - Math.pow(t, 0.7) * d.chartH;
                return (
                  <circle key={i} cx={px} cy={py} r="1.9"
                    fill="var(--bg-primary, #04060c)" stroke={d.color} strokeWidth="1">
                    <animate attributeName="opacity"
                      values="0;1" dur="0.4s" begin={`${0.3 + i * 0.25}s`} fill="freeze" />
                  </circle>
                );
              })}
              {/* Numerics under chart */}
              <g fontFamily="monospace" fill={d.color}>
                {[
                  { dy: 9,  txt: 'L = 420.6 км',  delay: '0s'   },
                  { dy: 18, txt: 'σ = 165 МПа',   delay: '1.2s' },
                ].map((row, i) => (
                  <text key={i} x={d.chartX} y={d.chartY + d.chartH + row.dy}
                    fontSize="6.5" letterSpacing="0.4px"
                    style={{ animation: `calcTick 3.6s ${row.delay} ease-in-out infinite` } as React.CSSProperties}>
                    {row.txt}
                  </text>
                ))}
              </g>

              {/* Tag + combined label */}
              <text x={bboxLeft} y={bboxTop - 6}
                fill={d.color} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px">{d.tag}</text>
              <text x={(bboxLeft + bboxRight) / 2} y={bboxBot + 22}
                fill={d.color} fontSize="8.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.6px" opacity="0.85">
                {d.label}
              </text>
            </g>
          );
        })()}

        {/* ─────────────────────────────────────────
            02 — TOWER CRANE (Construction)
        ───────────────────────────────────────── */}
        {(() => {
          const { baseX, baseY, mastH, jibLen, counterLen, color: st } = crane;
          const mastTop = baseY - mastH;
          const halfMast = Math.max(6, unit * 0.12);
          const trolleyT = 0.62;
          const trolleyX = baseX + jibLen * trolleyT;
          const cabH = Math.max(16, unit * 0.36);
          const cabW = Math.max(20, unit * 0.42);
          const segments = 9;

          return (
            <g key="crane">
              {/* Mast (lattice tower) */}
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

              {/* Operator cabin */}
              <rect x={baseX - cabW / 2} y={mastTop - cabH} width={cabW} height={cabH}
                fill="rgba(0,196,167,0.10)" stroke={st} strokeWidth="0.7" strokeOpacity="0.7" />

              {/* Jib group — SMIL rotation around mast top (reliable in user-space) */}
              {(() => {
                const pivotX = baseX;
                const pivotY = mastTop - cabH;
                const apexY  = pivotY - unit * 0.45;
                const cableMin = unit * 0.6;
                const cableMax = unit * 1.4;
                return (
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values={`-7 ${pivotX} ${pivotY}; 7 ${pivotX} ${pivotY}; -7 ${pivotX} ${pivotY}`}
                      keyTimes="0; 0.5; 1"
                      dur="9s"
                      repeatCount="indefinite"
                    />
                    {/* A-frame */}
                    <line x1={pivotX} y1={pivotY} x2={pivotX} y2={apexY}
                      stroke={st} strokeWidth="0.9" strokeOpacity="0.7" />
                    {/* Front jib */}
                    <line x1={pivotX} y1={pivotY} x2={pivotX + jibLen} y2={pivotY}
                      stroke={st} strokeWidth="1.6" strokeOpacity="0.9" />
                    {/* Counter jib */}
                    <line x1={pivotX} y1={pivotY} x2={pivotX - counterLen} y2={pivotY}
                      stroke={st} strokeWidth="1.6" strokeOpacity="0.9" />
                    {/* Lattice on front jib */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const x0 = pivotX + (i * jibLen) / 6;
                      const xn = pivotX + ((i + 1) * jibLen) / 6;
                      return (
                        <g key={`jl${i}`}>
                          <line x1={x0} y1={pivotY} x2={xn} y2={pivotY - 6}
                            stroke={st} strokeWidth="0.4" strokeOpacity="0.55" />
                          <line x1={xn} y1={pivotY} x2={x0} y2={pivotY - 6}
                            stroke={st} strokeWidth="0.4" strokeOpacity="0.55" />
                        </g>
                      );
                    })}
                    <line x1={pivotX} y1={pivotY - 6} x2={pivotX + jibLen} y2={pivotY - 6}
                      stroke={st} strokeWidth="0.5" strokeOpacity="0.45" />
                    {/* Tie cables from apex */}
                    <line x1={pivotX} y1={apexY} x2={pivotX + jibLen * 0.95} y2={pivotY}
                      stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />
                    <line x1={pivotX} y1={apexY} x2={pivotX - counterLen * 0.95} y2={pivotY}
                      stroke={st} strokeWidth="0.5" strokeOpacity="0.55" />
                    {/* Counterweight */}
                    <rect x={pivotX - counterLen - 3} y={pivotY - 5} width={9} height={11}
                      fill={st} opacity="0.55" />

                    {/* Trolley + hook + load — hoist via animated cable length */}
                    <rect x={trolleyX - 5} y={pivotY - 2} width={10} height={4}
                      fill={st} opacity="0.85" />
                    <line x1={trolleyX} y1={pivotY + 2} x2={trolleyX}
                      stroke={st} strokeWidth="0.5" strokeOpacity="0.7">
                      <animate attributeName="y2"
                        values={`${pivotY + cableMin}; ${pivotY + cableMax}; ${pivotY + cableMax}; ${pivotY + cableMin}; ${pivotY + cableMin}`}
                        keyTimes="0; 0.25; 0.5; 0.75; 1"
                        dur="6s" repeatCount="indefinite" />
                    </line>
                    <rect x={trolleyX - 7} width={14} height={7}
                      fill={st} opacity="0.55" stroke={st} strokeOpacity="0.9" strokeWidth="0.6">
                      <animate attributeName="y"
                        values={`${pivotY + cableMin}; ${pivotY + cableMax}; ${pivotY + cableMax}; ${pivotY + cableMin}; ${pivotY + cableMin}`}
                        keyTimes="0; 0.25; 0.5; 0.75; 1"
                        dur="6s" repeatCount="indefinite" />
                    </rect>
                  </g>
                );
              })()}

              {/* Tag + label */}
              <text x={baseX - 22} y={mastTop - cabH - 30}
                fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px" textAnchor="end">{crane.tag}</text>
              <text x={baseX} y={baseY + 18}
                fill={st} fontSize="8.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.6px" opacity="0.85">
                {crane.label}
              </text>
            </g>
          );
        })()}

        {/* ─────────────────────────────────────────
            03 — EXCAVATOR (Special equipment)
        ───────────────────────────────────────── */}
        {(() => {
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

          return (
            <g key="excavator">
              {/* Ground line */}
              <line x1={cx - trackW * 0.65} y1={groundY} x2={cx + trackW * 0.65} y2={groundY}
                stroke={st} strokeWidth="0.6" strokeOpacity="0.4" />

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

              {/* Boom + stick + bucket — animated rotation around pivot */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={`-8 ${pivotX} ${pivotY}; 6 ${pivotX} ${pivotY}; 6 ${pivotX} ${pivotY}; -8 ${pivotX} ${pivotY}; -8 ${pivotX} ${pivotY}`}
                  keyTimes="0; 0.30; 0.55; 0.85; 1"
                  dur="5s"
                  repeatCount="indefinite"
                />
                {/* Boom */}
                <line x1={pivotX} y1={pivotY} x2={boomEndX} y2={boomEndY}
                  stroke={st} strokeWidth="2.4" strokeOpacity="0.9" />
                {/* Boom inner detail */}
                <line x1={pivotX + 2} y1={pivotY - 2} x2={boomEndX - 2} y2={boomEndY + 2}
                  stroke={st} strokeWidth="0.5" strokeOpacity="0.45" />
                {/* Hydraulic cylinder along boom */}
                <line x1={pivotX + unit * 0.10} y1={pivotY - unit * 0.18}
                      x2={pivotX + unit * 0.55} y2={pivotY - unit * 0.55}
                  stroke={st} strokeWidth="1.4" strokeOpacity="0.7" />
                {/* Boom pivot joint */}
                <circle cx={pivotX} cy={pivotY} r={unit * 0.07}
                  fill="var(--bg-primary, #04060c)" stroke={st} strokeWidth="1" />
                {/* Boom-stick joint */}
                <circle cx={boomEndX} cy={boomEndY} r={unit * 0.06}
                  fill="var(--bg-primary, #04060c)" stroke={st} strokeWidth="0.9" />

                {/* Stick */}
                <line x1={boomEndX} y1={boomEndY} x2={stickEndX} y2={stickEndY}
                  stroke={st} strokeWidth="1.8" strokeOpacity="0.9" />
                {/* Stick hydraulic */}
                <line x1={boomEndX - unit * 0.10} y1={boomEndY - unit * 0.05}
                      x2={boomEndX + unit * 0.30} y2={boomEndY + unit * 0.30}
                  stroke={st} strokeWidth="1.1" strokeOpacity="0.65" />

                {/* Bucket — trapezoidal */}
                {(() => {
                  const bx = stickEndX;
                  const by = stickEndY;
                  const u  = unit;
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
              </g>

              {/* Tag + label */}
              <text x={cx - trackW / 2} y={cabBottom - cabH - unit * 1.0}
                fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px">{excavator.tag}</text>
              <text x={cx} y={groundY + 18}
                fill={st} fontSize="8.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.6px" opacity="0.85">
                {excavator.label}
              </text>
            </g>
          );
        })()}

        {/* ─────────────────────────────────────────
            04 — DUMP TRUCK (Supplies)
        ───────────────────────────────────────── */}
        {(() => {
          const { cx, cy, color: st } = truck;
          const truckW   = tile * 0.86;
          const tLeft    = cx - truckW / 2;
          const tRight   = cx + truckW / 2;
          const groundY  = cy + tile * 0.32;
          const wheelR   = unit * 0.16;
          const wheelY   = groundY - wheelR;

          /* Cab on the left (~30%), level dump bed on the right */
          const cabRight  = tLeft + truckW * 0.30;
          const cabBottom = wheelY - wheelR * 0.4;
          const cabH      = tile * 0.38;
          const cabTop    = cabBottom - cabH;

          /* Chassis rail on which the bed rests */
          const chassisTop    = cabBottom - unit * 0.06;
          const chassisBottom = cabBottom;

          /* Level open dump bed: tall rectangular box, taller than cab */
          const bedLeft   = cabRight + unit * 0.05;
          const bedRight  = tRight;
          const bedH      = tile * 0.50;
          const bedBottom = chassisTop;
          const bedTop    = bedBottom - bedH;

          /* Two wheels: under cab + under rear bed */
          const wheels = [
            tLeft + truckW * 0.18,
            tLeft + truckW * 0.78,
          ];

          return (
            <g key="truck">
              {/* Ground line */}
              <line x1={cx - truckW * 0.6} y1={groundY} x2={cx + truckW * 0.6} y2={groundY}
                stroke={st} strokeWidth="0.6" strokeOpacity="0.4" />

              {/* Speed lines behind truck */}
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

              {/* Chassis rail */}
              <rect x={cabRight} y={chassisTop} width={tRight - cabRight}
                height={chassisBottom - chassisTop}
                fill={st} opacity="0.55" />

              {/* Dump bed — tall open rectangular box */}
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
              {/* Material peeking above the rim (sand / gravel mound) */}
              <path
                d={
                  `M ${bedLeft + unit * 0.10} ${bedTop} ` +
                  `Q ${bedLeft + (bedRight - bedLeft) * 0.30} ${bedTop - unit * 0.10} ` +
                  `${bedLeft + (bedRight - bedLeft) * 0.55} ${bedTop - unit * 0.04} ` +
                  `Q ${bedLeft + (bedRight - bedLeft) * 0.80} ${bedTop - unit * 0.12} ` +
                  `${bedRight - unit * 0.10} ${bedTop} Z`
                }
                fill={st} opacity="0.45" />

              {/* Cab body — boxy with sloped front */}
              <polygon
                points={
                  `${tLeft},${cabBottom} ` +
                  `${tLeft},${cabTop + cabH * 0.45} ` +
                  `${tLeft + (cabRight - tLeft) * 0.40},${cabTop} ` +
                  `${cabRight},${cabTop} ` +
                  `${cabRight},${cabBottom}`
                }
                fill="rgba(232,165,114,0.10)" stroke={st} strokeWidth="1.1" strokeOpacity="0.85"
                strokeLinejoin="round" />
              {/* Windshield */}
              <polygon
                points={
                  `${tLeft + (cabRight - tLeft) * 0.18},${cabTop + cabH * 0.45} ` +
                  `${tLeft + (cabRight - tLeft) * 0.45},${cabTop + cabH * 0.12} ` +
                  `${cabRight - unit * 0.06},${cabTop + cabH * 0.12} ` +
                  `${cabRight - unit * 0.06},${cabTop + cabH * 0.55} ` +
                  `${tLeft + (cabRight - tLeft) * 0.18},${cabTop + cabH * 0.55}`
                }
                fill="rgba(232,165,114,0.22)" stroke={st} strokeWidth="0.5" strokeOpacity="0.65" />
              {/* Headlight */}
              <circle cx={tLeft + unit * 0.06} cy={cabBottom - cabH * 0.18} r={unit * 0.04}
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

              {/* Tag + label */}
              <text x={tLeft} y={bedTop - 8}
                fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px">{truck.tag}</text>
              <text x={cx} y={groundY + 18}
                fill={st} fontSize="8.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.6px" opacity="0.85">
                {truck.label}
              </text>
            </g>
          );
        })()}

        {/* ── WAG logo — centre ── */}
        <svg
          x={logoCx - logoW / 2}
          y={logoCy - logoH / 2}
          width={logoW}
          height={logoH}
          viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
          overflow="visible"
        >
          <g className={styles.wagSpin}>
            <path fill="var(--gold)" opacity="0.92" d={WAG_PATH} />
          </g>
        </svg>

        {/* ── Scan line ── */}
        <line x1={zoneL} y1={0} x2={w} y2={0}
          stroke={TEAL} strokeWidth="0.8" strokeOpacity="0.10">
          <animateTransform attributeName="transform" type="translate"
            from={`0 0`} to={`0 ${h}`} dur="9s" repeatCount="indefinite" />
        </line>

        {/* ── Status labels ── */}
        <text x={w - 8} y={14} fill={TEAL} fontSize="7.5" fontFamily="monospace"
          textAnchor="end" opacity="0.26" letterSpacing="0.5px">УСЛУГИ_ЯДРО</text>
        <text x={w - 8} y={24} fill={GOLD} fontSize="7" fontFamily="monospace"
          textAnchor="end" opacity="0.20">3 НАПРАВЛЕНИЯ / 19+ РАБОТ</text>
        <text x={zoneL + 8} y={14} fill={TEAL} fontSize="7" fontFamily="monospace"
          opacity="0.22">WEST ARLAN GROUP</text>
        <text x={zoneL + 8} y={24} fill={GOLD} fontSize="7" fontFamily="monospace">
          СИСТЕМА: АКТИВНА
          <animate attributeName="opacity"
            values="0.24;0.06;0.24" dur="2.6s" repeatCount="indefinite" />
        </text>
      </svg>
    </div>
  );
}
