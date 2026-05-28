'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ServicesHeroAnim.module.css';

const CYCLE_MS = 3200;     // visible duration per motif
const FADE_MS  = 600;      // crossfade duration

export default function ServicesHeroAnim() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [[w, h], setDims] = useState([1200, 520]);
  const [idx, setIdx] = useState(0);

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

  /* Cycle through 0 → 1 → 2 → 3 → 0 … */
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % 4), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  /* ── Geometry ──────────────────────────────────
     Layout: WAG logo on the left, ONE motif slot in the centre-right.
     All 4 motifs render into the same slot — only the active one is
     visible (others fade to opacity 0). */
  const PAD     = 32;
  const zoneL   = w * 0.40;
  const zoneR   = w - PAD;
  const zoneW   = zoneR - zoneL;

  /* Single large motif slot — the cycling animation is the hero's main visual. */
  const unit    = Math.min(zoneW / 5.0, h * 0.36, 145);
  const tile    = unit * 2.4;

  /* WAG triangle removed — motif anchors centre-right of the hero. */
  const slot2Cx = zoneL + zoneW * 0.42;   // SINGLE MOTIF SLOT (all 4 share)
  /* Aliases — geometry below was written assuming distinct positions;
     unifying lets us keep that code with one shared centre. */
  const slot3Cx = slot2Cx;
  const slot4Cx = slot2Cx;
  const slot5Cx = slot2Cx;

  const motifCy = h * 0.50;
  /* Shared baseline for all labels — placed below the deepest motif extent
     (crane base sits at motifCy + tile*0.45). */
  const labelY  = motifCy + tile * 0.55 + 18;

  /* Helper — generate the opacity style for one of the 4 cycling motifs. */
  const motifStyle = (n: number): React.CSSProperties => ({
    opacity: idx === n ? 1 : 0,
    transition: `opacity ${FADE_MS}ms ease`,
  });

  /* Decorative ring radius — kept for the dashed circles around the
     motif slot (the WAG logo itself is no longer rendered). */
  const ring    = tile * 0.22;

  const GOLD = 'var(--gold)';
  const TEAL = 'var(--teal)';
  const BLUE = 'var(--blue)';

  /* 01 — Blueprint sheet: architectural drawing on a paper sheet with
     dimensions, title block and crosshair — reads as «engineering design».
     Centred at slot2Cx / motifCy. */
  const design = {
    cx:    slot2Cx,
    cy:    motifCy,
    color: GOLD,
    tag:   '01',
    label: 'ПРОЕКТИРОВАНИЕ',
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

        {/* ── Halo behind motif slot ── */}
        <circle cx={slot2Cx} cy={motifCy} r={tile * 0.55} fill="url(#shaGlow)" />

        {/* ── Outer ring (CW) — around motif slot ── */}
        <circle cx={slot2Cx} cy={motifCy} r={ring * 1.32}
          stroke={TEAL} strokeWidth="0.6" strokeDasharray="9 7"
          strokeOpacity="0.28" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${slot2Cx} ${motifCy}`} to={`360 ${slot2Cx} ${motifCy}`}
            dur="42s" repeatCount="indefinite" />
        </circle>

        {/* ── Inner ring (CCW) — around motif slot ── */}
        <circle cx={slot2Cx} cy={motifCy} r={ring * 0.98}
          stroke={GOLD} strokeWidth="0.45" strokeDasharray="3 8"
          strokeOpacity="0.22" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${slot2Cx} ${motifCy}`} to={`-360 ${slot2Cx} ${motifCy}`}
            dur="26s" repeatCount="indefinite" />
        </circle>

        {/* ─────────────────────────────────────────
            01 — BLUEPRINT SHEET (Design / Проектирование)
            Architectural drawing on a paper sheet — building elevation,
            dimension lines, title block. Reads instantly as «engineering design».
        ───────────────────────────────────────── */}
        {(() => {
          const d = design;

          /* Sheet outline — slightly wider than tall, centred on (cx, cy) */
          const sheetW  = tile * 1.05;
          const sheetH  = tile * 0.82;
          const sheetX  = d.cx - sheetW / 2;
          const sheetY  = d.cy - sheetH / 2;
          const sheetR  = d.cx + sheetW / 2;
          const sheetB  = d.cy + sheetH / 2;

          /* Inner drawing area (with margins for dimensions + title block) */
          const padL = sheetW * 0.18;
          const padR = sheetW * 0.10;
          const padT = sheetH * 0.16;
          const padB = sheetH * 0.20;
          const innerL = sheetX + padL;
          const innerR = sheetR - padR;
          const innerT = sheetY + padT;
          const innerB = sheetB - padB;
          const innerW = innerR - innerL;
          const innerH = innerB - innerT;

          /* Bridge elevation geometry — beam bridge with 2 mid-piers (3 spans).
             Spans full inner width; abutments at sides, piers at 1/3 and 2/3. */
          const bldgW   = innerW * 0.86;
          const bldgL   = innerL + (innerW - bldgW) / 2;
          const bldgR   = bldgL + bldgW;
          const bldgB   = innerB;                          // ground line
          const deckT   = innerB - innerH * 0.42;          // top of deck
          const deckH   = innerH * 0.08;                   // deck slab thickness
          const beamH   = innerH * 0.10;                   // truss beam height
          const beamT   = deckT + deckH;
          const beamB   = beamT + beamH;
          const pier1X  = bldgL + bldgW * 0.33;
          const pier2X  = bldgL + bldgW * 0.67;
          const pierW   = bldgW * 0.04;
          /* Rail gauge on top of deck */
          const railTop = deckT - 2;

          /* Title block (bottom-right corner of sheet) */
          const tbW = sheetW * 0.26;
          const tbH = sheetH * 0.16;
          const tbX = sheetR - tbW - sheetW * 0.03;
          const tbY = sheetB - tbH - sheetH * 0.04;

          return (
            <g key="design" style={motifStyle(0)}>
              {/* Sheet (drawing paper) */}
              <rect x={sheetX} y={sheetY} width={sheetW} height={sheetH}
                fill="rgba(212,168,67,0.04)"
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.75" />
              {/* Corner brackets on sheet */}
              {([
                [sheetX,      sheetY,      1,  1],
                [sheetR,      sheetY,     -1,  1],
                [sheetX,      sheetB,      1, -1],
                [sheetR,      sheetB,     -1, -1],
              ] as [number, number, number, number][]).map(([bx, by, sx, sy], i) => (
                <g key={`crn${i}`}>
                  <line x1={bx} y1={by} x2={bx + sx * 12} y2={by}
                    stroke={d.color} strokeWidth="1.4" strokeOpacity="0.9" />
                  <line x1={bx} y1={by} x2={bx} y2={by + sy * 12}
                    stroke={d.color} strokeWidth="1.4" strokeOpacity="0.9" />
                </g>
              ))}

              {/* Inner grid (subtle blueprint feel) */}
              {Array.from({ length: 5 }).map((_, i) => {
                const x = innerL + ((i + 1) * innerW) / 6;
                return <line key={`vg${i}`} x1={x} y1={innerT} x2={x} y2={innerB}
                  stroke={d.color} strokeWidth="0.3" strokeOpacity="0.10"
                  strokeDasharray="2 3" />;
              })}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = innerT + ((i + 1) * innerH) / 5;
                return <line key={`hg${i}`} x1={innerL} y1={y} x2={innerR} y2={y}
                  stroke={d.color} strokeWidth="0.3" strokeOpacity="0.10"
                  strokeDasharray="2 3" />;
              })}

              {/* Ground line under the building */}
              <line x1={innerL} y1={innerB} x2={innerR} y2={innerB}
                stroke={d.color} strokeWidth="0.9" strokeOpacity="0.75" />
              {/* Hatching under ground line */}
              {Array.from({ length: 8 }).map((_, i) => {
                const x0 = innerL + (i * innerW) / 7;
                return <line key={`gh${i}`}
                  x1={x0 + 6} y1={innerB} x2={x0} y2={innerB + 5}
                  stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />;
              })}

              {/* === Bridge elevation === */}
              {/* Deck slab */}
              <rect x={bldgL} y={deckT} width={bldgW} height={deckH}
                fill="rgba(212,168,67,0.10)"
                stroke={d.color} strokeWidth="1.6" strokeOpacity="0.95" />
              {/* Deck top edge (highlight) */}
              <line x1={bldgL} y1={deckT} x2={bldgR} y2={deckT}
                stroke={d.color} strokeWidth="0.5" strokeOpacity="0.5" />

              {/* Rails on top of deck — two parallel gold lines + sleepers */}
              <line x1={bldgL + 4} y1={railTop} x2={bldgR - 4} y2={railTop}
                stroke={d.color} strokeWidth="0.8" strokeOpacity="0.9" />
              {Array.from({ length: 18 }).map((_, i) => {
                const sx = bldgL + 6 + i * ((bldgW - 12) / 17);
                return <line key={`slp${i}`}
                  x1={sx} y1={railTop - 1.5} x2={sx} y2={deckT - 0.5}
                  stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />;
              })}

              {/* Truss beam under deck — top chord + bottom chord + zigzag diagonals */}
              <line x1={bldgL} y1={beamT} x2={bldgR} y2={beamT}
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              <line x1={bldgL} y1={beamB} x2={bldgR} y2={beamB}
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              {/* Vertical truss posts and diagonal braces */}
              {(() => {
                const truss = 14;
                const stepX = bldgW / truss;
                return Array.from({ length: truss + 1 }).map((_, i) => {
                  const x = bldgL + i * stepX;
                  const next = bldgL + (i + 1) * stepX;
                  return (
                    <g key={`tr${i}`}>
                      <line x1={x} y1={beamT} x2={x} y2={beamB}
                        stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />
                      {i < truss && (
                        <line x1={x} y1={beamT} x2={next} y2={beamB}
                          stroke={d.color} strokeWidth="0.45" strokeOpacity="0.5" />
                      )}
                    </g>
                  );
                });
              })()}

              {/* Piers — two mid-piers + abutments */}
              {/* Left abutment */}
              <polygon
                points={
                  `${bldgL - pierW * 1.4},${beamB} ` +
                  `${bldgL + pierW * 0.6},${beamB} ` +
                  `${bldgL + pierW * 0.4},${bldgB} ` +
                  `${bldgL - pierW * 1.6},${bldgB}`
                }
                fill="rgba(212,168,67,0.10)"
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              {/* Right abutment */}
              <polygon
                points={
                  `${bldgR - pierW * 0.6},${beamB} ` +
                  `${bldgR + pierW * 1.4},${beamB} ` +
                  `${bldgR + pierW * 1.6},${bldgB} ` +
                  `${bldgR - pierW * 0.4},${bldgB}`
                }
                fill="rgba(212,168,67,0.10)"
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              {/* Pier 1 (1/3) */}
              <rect x={pier1X - pierW / 2} y={beamB} width={pierW} height={bldgB - beamB}
                fill="rgba(212,168,67,0.12)"
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              {/* Pier 2 (2/3) */}
              <rect x={pier2X - pierW / 2} y={beamB} width={pierW} height={bldgB - beamB}
                fill="rgba(212,168,67,0.12)"
                stroke={d.color} strokeWidth="1.2" strokeOpacity="0.9" />
              {/* Pier foundation pads (small flange at bottom) */}
              {[pier1X, pier2X].map((px, i) => (
                <rect key={`fnd${i}`}
                  x={px - pierW * 0.9} y={bldgB - 2}
                  width={pierW * 1.8} height="2"
                  fill={d.color} opacity="0.6" />
              ))}

              {/* Stagger reveal on bridge elements */}
              <g>
                <animate attributeName="opacity"
                  values="0;1" dur="0.35s" begin="0.7s" fill="freeze" />
              </g>

              {/* === Dimension lines === */}
              {/* Bottom horizontal dim — width */}
              {(() => {
                const dimY = sheetB - sheetH * 0.045;
                const lExtY = innerB + 4;
                return (
                  <g>
                    {/* Extension lines */}
                    <line x1={bldgL} y1={lExtY} x2={bldgL} y2={dimY + 3}
                      stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />
                    <line x1={bldgR} y1={lExtY} x2={bldgR} y2={dimY + 3}
                      stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />
                    {/* Dimension line */}
                    <line x1={bldgL} y1={dimY} x2={bldgR} y2={dimY}
                      stroke={d.color} strokeWidth="0.7" strokeOpacity="0.8" />
                    {/* Arrows */}
                    <polygon points={`${bldgL},${dimY} ${bldgL + 5},${dimY - 2.5} ${bldgL + 5},${dimY + 2.5}`}
                      fill={d.color} opacity="0.8" />
                    <polygon points={`${bldgR},${dimY} ${bldgR - 5},${dimY - 2.5} ${bldgR - 5},${dimY + 2.5}`}
                      fill={d.color} opacity="0.8" />
                    {/* Text */}
                    <text x={(bldgL + bldgR) / 2} y={dimY - 2.5}
                      fill={d.color} fontSize="6.5" fontFamily="monospace"
                      textAnchor="middle" fontWeight="bold" opacity="0.85">L = 48 м</text>
                  </g>
                );
              })()}
              {/* Left vertical dim — clearance (rail top to ground) */}
              {(() => {
                const dimX = sheetX + sheetW * 0.06;
                const dimYTop = railTop;
                const dimYBot = innerB;
                return (
                  <g>
                    {/* Extension lines */}
                    <line x1={dimX - 4} y1={dimYTop} x2={bldgL - 2} y2={dimYTop}
                      stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />
                    <line x1={dimX - 4} y1={dimYBot} x2={bldgL - 2} y2={dimYBot}
                      stroke={d.color} strokeWidth="0.5" strokeOpacity="0.55" />
                    {/* Dimension line */}
                    <line x1={dimX} y1={dimYTop} x2={dimX} y2={dimYBot}
                      stroke={d.color} strokeWidth="0.7" strokeOpacity="0.8" />
                    {/* Arrows */}
                    <polygon points={`${dimX},${dimYTop} ${dimX - 2.5},${dimYTop + 5} ${dimX + 2.5},${dimYTop + 5}`}
                      fill={d.color} opacity="0.8" />
                    <polygon points={`${dimX},${dimYBot} ${dimX - 2.5},${dimYBot - 5} ${dimX + 2.5},${dimYBot - 5}`}
                      fill={d.color} opacity="0.8" />
                    {/* Text (rotated) */}
                    <text x={dimX - 4} y={(dimYTop + dimYBot) / 2}
                      fill={d.color} fontSize="6.5" fontFamily="monospace"
                      textAnchor="middle" fontWeight="bold" opacity="0.85"
                      transform={`rotate(-90, ${dimX - 4}, ${(dimYTop + dimYBot) / 2})`}>
                      H = 12 м
                    </text>
                  </g>
                );
              })()}

              {/* === Title block (bottom-right) === */}
              <g>
                <rect x={tbX} y={tbY} width={tbW} height={tbH}
                  fill="rgba(212,168,67,0.06)"
                  stroke={d.color} strokeWidth="0.7" strokeOpacity="0.7" />
                {/* Internal divider */}
                <line x1={tbX} y1={tbY + tbH * 0.40}
                  x2={tbX + tbW} y2={tbY + tbH * 0.40}
                  stroke={d.color} strokeWidth="0.4" strokeOpacity="0.55" />
                <text x={tbX + 4} y={tbY + tbH * 0.30}
                  fill={d.color} fontSize="5.5" fontFamily="monospace"
                  opacity="0.85" fontWeight="bold" letterSpacing="0.4px">
                  ЖД МОСТ МС-12
                </text>
                <text x={tbX + 4} y={tbY + tbH * 0.65}
                  fill={d.color} fontSize="5" fontFamily="monospace"
                  opacity="0.65" letterSpacing="0.3px">
                  ПРОФИЛЬ  ·  М 1:200
                </text>
                <text x={tbX + 4} y={tbY + tbH * 0.90}
                  fill={d.color} fontSize="5" fontFamily="monospace"
                  opacity="0.65" letterSpacing="0.3px">
                  WAG · ИНЖ. ОТД.
                </text>
              </g>

              {/* === Drafting crosshair tracking across the sheet === */}
              <g opacity="0.9">
                <circle r="6" fill="none"
                  stroke={d.color} strokeWidth="0.8" strokeOpacity="0.7">
                  <animate attributeName="cx"
                    values={`${innerL + 4}; ${innerR - 4}; ${innerR - 4}; ${innerL + 4}; ${innerL + 4}`}
                    keyTimes="0; 0.45; 0.55; 0.95; 1"
                    dur="6s" repeatCount="indefinite" />
                  <animate attributeName="cy"
                    values={`${innerT + 6}; ${innerT + 6}; ${innerB - 6}; ${innerB - 6}; ${innerT + 6}`}
                    keyTimes="0; 0.30; 0.55; 0.85; 1"
                    dur="6s" repeatCount="indefinite" />
                </circle>
                <circle r="1.2" fill={d.color}>
                  <animate attributeName="cx"
                    values={`${innerL + 4}; ${innerR - 4}; ${innerR - 4}; ${innerL + 4}; ${innerL + 4}`}
                    keyTimes="0; 0.45; 0.55; 0.95; 1"
                    dur="6s" repeatCount="indefinite" />
                  <animate attributeName="cy"
                    values={`${innerT + 6}; ${innerT + 6}; ${innerB - 6}; ${innerB - 6}; ${innerT + 6}`}
                    keyTimes="0; 0.30; 0.55; 0.85; 1"
                    dur="6s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Tag (top-left of sheet) + bottom label */}
              <text x={sheetX} y={sheetY - 6}
                fill={d.color} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px">{d.tag}</text>
              <text x={d.cx} y={labelY}
                fill={d.color} fontSize="12.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
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
            <g key="crane" style={motifStyle(1)}>
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
              <text x={baseX} y={labelY}
                fill={st} fontSize="12.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
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
            <g key="excavator" style={motifStyle(2)}>
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
              <text x={cx} y={labelY}
                fill={st} fontSize="12.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
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

          return (
            <g key="truck" style={motifStyle(3)}>
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

              {/* Tag + label */}
              <text x={tLeft} y={bedTop - 8}
                fill={st} fontSize="8" fontFamily="monospace" fontWeight="bold"
                opacity="0.85" letterSpacing="0.5px">{truck.tag}</text>
              <text x={cx} y={labelY}
                fill={st} fontSize="12.5" fontFamily="monospace"
                textAnchor="middle" fontWeight="bold" letterSpacing="1.2px" opacity="0.9">
                {truck.label}
              </text>
            </g>
          );
        })()}

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
