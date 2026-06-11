import type * as React from 'react';
import styles from './ServicesHeroAnim.module.css';

interface MotifBlueprintProps {
  design: {
    cx: number;
    cy: number;
    color: string;
    tag: string;
    label: string;
  };
  tile: number;
  labelY: number;
  drawGen: number;
  /** Crossfade opacity style supplied by the orchestrator (motifStyle). */
  style: React.CSSProperties;
}

/* ─────────────────────────────────────────
    01 — BLUEPRINT SHEET (Design / Проектирование)
    Architectural drawing on a paper sheet — building elevation,
    dimension lines, title block. Reads instantly as «engineering design».
───────────────────────────────────────── */
export default function MotifBlueprint({ design, tile, labelY, drawGen, style }: MotifBlueprintProps) {
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

  /* Pen sweep distance = full drawing span (innerL → innerR). */
  const penSweep = innerR - innerL;

  return (
    <g key="design" style={style}>
      {/* Remount on each activation → CSS draw-on replays. */}
      <g key={drawGen}>
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

        {/* Inner grid (the graph paper — present immediately) */}
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

        {/* ── Drawing layer: wipes on left→right under the pen ── */}
        <g className={styles.drawClip}>
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
        </g>

        {/* ── Drafting pen — leading edge of the draft, travels with the wipe ── */}
        <g className={styles.pen}
          style={{ ['--sha-sweep' as string]: `${penSweep}px` } as React.CSSProperties}>
          <line x1={innerL} y1={sheetY + 4} x2={innerL} y2={sheetB - 4}
            stroke={d.color} strokeWidth="1" strokeOpacity="0.8" />
          <circle cx={innerL} cy={innerB} r="2.4" fill={d.color} />
          <circle cx={innerL} cy={innerB} r="5" fill="none"
            stroke={d.color} strokeWidth="0.7" strokeOpacity="0.6" />
        </g>

        {/* ── Dimensions + title block — ink in AFTER the drawing ── */}
        <g className={styles.dims}>
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
        </g>
      </g>

      {/* Tag (top-left of sheet) + bottom label — phase identity, always on */}
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
}
