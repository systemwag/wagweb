'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ServicesHeroAnim.module.css';
import MotifBlueprint from './MotifBlueprint';
import MotifCrane from './MotifCrane';
import MotifExcavator from './MotifExcavator';
import MotifTruck from './MotifTruck';

const CYCLE_MS = 3200;     // visible duration per motif
const FADE_MS  = 600;      // crossfade duration

export default function ServicesHeroAnim() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [[w, h], setDims] = useState([1200, 520]);
  /* Single monotonic counter — drives both the active motif and the draw-on
     replay key, so no setState-in-effect is needed. */
  const [tick, setTick] = useState(0);
  const idx = tick % 4;
  /* Changes only when phase 01 (design) comes round again → remounting the
     drawing layer on this key replays its CSS draw-on animation. */
  const drawGen = Math.floor(tick / 4);

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

  /* Advance the cycle: idx walks 0 → 1 → 2 → 3 → 0 … (tick % 4). */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), CYCLE_MS);
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

        {/* 01 — BLUEPRINT SHEET (Design / Проектирование) */}
        <MotifBlueprint design={design} tile={tile} labelY={labelY}
          drawGen={drawGen} style={motifStyle(0)} />

        {/* 02 — TOWER CRANE (Construction) */}
        <MotifCrane crane={crane} unit={unit} labelY={labelY}
          drawGen={drawGen} style={motifStyle(1)} />

        {/* 03 — EXCAVATOR (Special equipment) */}
        <MotifExcavator excavator={excavator} unit={unit} tile={tile} labelY={labelY}
          drawGen={drawGen} style={motifStyle(2)} />

        {/* 04 — DUMP TRUCK (Supplies) */}
        <MotifTruck truck={truck} unit={unit} tile={tile} labelY={labelY}
          drawGen={drawGen} style={motifStyle(3)} />

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
