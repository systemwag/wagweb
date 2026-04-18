'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutHeroAnim.module.css';

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

export default function AboutHeroAnim() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [[w, h], setDims] = useState([800, 440]);

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

  // ── Centre of animation area ──────────────────────────────────────────────
  // cx / cy = pixel centre of the wrapper div
  const cx = w / 2;
  const cy = h * 0.44;

  // ── Ring radius & logo size ───────────────────────────────────────────────
  const ring = Math.min(w * 0.10, h * 0.17, 72);

  // Logo rendered px (fits comfortably inside the ring)
  const logoW = ring * 2.8;
  const logoH = (logoW / LOGO_W) * LOGO_H;

  // ── Card geometry ─────────────────────────────────────────────────────────
  const cw = 116, ch = 42;
  const EDGE = 12;         // px from wrapper edge

  // Left column: right edge at EDGE+cw = EDGE+116 from left
  const leftX  = EDGE;
  // Right column: starts at w - EDGE - cw
  const rightX = w - EDGE - cw;

  // Three row top-y values
  const topY = EDGE;
  const midY = cy - ch / 2;
  // Bottom row: leave space for bar chart at the very bottom
  const barAreaH = Math.round(h * 0.15);   // reserved for bars
  const botY = h - barAreaH - ch - 8;

  // ── Cards definition ──────────────────────────────────────────────────────
  const cards = [
    { bx: leftX,  by: topY, label: 'ОСНОВАНА',  value: '2010',  color: 'teal', delay: '0s'   },
    { bx: rightX, by: topY, label: 'ОБЪЕКТОВ',  value: '300+',  color: 'gold', delay: '0.5s' },
    { bx: leftX,  by: midY, label: 'ЛЕТ ОПЫТА', value: '15+',  color: 'gold', delay: '1.0s' },
    { bx: rightX, by: midY, label: 'РЕГИОНОВ',  value: '16',   color: 'teal', delay: '1.5s' },
    { bx: leftX,  by: botY, label: 'КОМАНДА',   value: '79+',  color: 'gold', delay: '2.0s' },
    { bx: rightX, by: botY, label: 'КМ ПУТЕЙ',  value: '2800+', color: 'teal', delay: '2.5s' },
  ] as const;

  // Leader: from ring edge → card nearest edge (L-elbow for top/bot, straight for mid)
  const S = Math.SQRT1_2;  // sin/cos 45°
  const ringPts = [
    { x: cx - ring * S, y: cy - ring * S },  // top-left diag
    { x: cx + ring * S, y: cy - ring * S },  // top-right diag
    { x: cx - ring,     y: cy            },  // left
    { x: cx + ring,     y: cy            },  // right
    { x: cx - ring * S, y: cy + ring * S },  // bot-left diag
    { x: cx + ring * S, y: cy + ring * S },  // bot-right diag
  ];

  function leader(ri: number, bx: number, by: number): string {
    const rp  = ringPts[ri];
    const isL = bx < cx;
    const ex  = isL ? bx + cw : bx;    // card near-edge x
    const ey  = by + ch / 2;            // card centre y
    if (Math.abs(rp.y - ey) < 5)
      return `M ${rp.x} ${rp.y} L ${ex} ${ey}`;
    return `M ${rp.x} ${rp.y} L ${rp.x} ${ey} L ${ex} ${ey}`;
  }

  function pLen(d: string) {
    const n = (d.match(/-?\d+\.?\d*/g) ?? []).map(Number);
    let s = 0;
    for (let i = 2; i < n.length - 1; i += 2)
      s += Math.hypot(n[i] - n[i-2], n[i+1] - n[i-1]);
    return Math.ceil(s) + 6;
  }

  // ── Bar chart ─────────────────────────────────────────────────────────────
  const barMaxH  = barAreaH - 18;                  // height available
  const barBase  = h - 14;                         // baseline y (year labels sit below)
  const barW     = Math.max(16, Math.round(w * 0.02));
  const barStep  = barW * 1.9;
  const chartW   = 5 * barStep + barW;
  const chartX0  = cx - chartW / 2;               // centred on logo

  const BARS = [
    { year: '2010', pct: 0.13 }, { year: '2013', pct: 0.30 },
    { year: '2016', pct: 0.48 }, { year: '2019', pct: 0.65 },
    { year: '2022', pct: 0.83 }, { year: '2025', pct: 1.00 },
  ];

  return (
    <div className={styles.wrapper} ref={wrapRef} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ahaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--gold)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* ── Blueprint grid ── */}
        {[1,2,3,4,5].map(i => (
          <line key={`h${i}`} x1={0} y1={i * h / 6} x2={w} y2={i * h / 6}
            stroke="var(--teal)" strokeWidth="0.3" strokeOpacity="0.07" />
        ))}
        {[1,2,3,4,5,6,7].map(i => (
          <line key={`v${i}`} x1={i * w / 8} y1={0} x2={i * w / 8} y2={h}
            stroke="var(--teal)" strokeWidth="0.3" strokeOpacity="0.07" />
        ))}

        {/* ── Corner brackets ── */}
        {([
          [5, 5, 1, 1], [w-5, 5, -1, 1],
          [5, h-5, 1, -1], [w-5, h-5, -1, -1],
        ] as [number,number,number,number][]).map(([bx,by,sx,sy], i) => (
          <g key={i}>
            <line x1={bx} y1={by+sy*16} x2={bx}       y2={by}
              stroke="var(--teal)" strokeWidth="0.7" strokeOpacity="0.22" />
            <line x1={bx} y1={by}       x2={bx+sx*16} y2={by}
              stroke="var(--teal)" strokeWidth="0.7" strokeOpacity="0.22" />
          </g>
        ))}

        {/* ── Glow behind logo ── */}
        <circle cx={cx} cy={cy} r={ring * 2.8} fill="url(#ahaGlow)" />

        {/* ── Outer ring (CW) ── */}
        <circle cx={cx} cy={cy} r={ring * 1.28}
          stroke="var(--teal)" strokeWidth="0.6" strokeDasharray="8 6"
          strokeOpacity="0.28" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
            dur="38s" repeatCount="indefinite" />
        </circle>

        {/* ── Inner ring (CCW) ── */}
        <circle cx={cx} cy={cy} r={ring * 0.95}
          stroke="var(--gold)" strokeWidth="0.45" strokeDasharray="3 7"
          strokeOpacity="0.22" fill="none">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`-360 ${cx} ${cy}`}
            dur="24s" repeatCount="indefinite" />
        </circle>

        {/* ── Leader lines ── */}
        {cards.map((c, i) => {
          const d    = leader(i, c.bx, c.by);
          const dLen = pLen(d);
          const st   = c.color === 'gold' ? 'var(--gold)' : 'var(--teal)';
          return (
            <g key={`l${i}`}>
              <path d={d} fill="none" stroke={st}
                strokeWidth="0.75" strokeOpacity="0.40"
                strokeDasharray={dLen}>
                <animate attributeName="stroke-dashoffset"
                  values={`${dLen};0;0;${dLen}`}
                  keyTimes="0;0.35;0.72;1"
                  dur="7s" begin={c.delay} repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0 0 1 1;0.7 0 1 0.3" />
              </path>
              <circle cx={ringPts[i].x} cy={ringPts[i].y} r={2.5}
                fill="var(--bg-primary)" stroke={st} strokeWidth="1.2">
                <animate attributeName="opacity"
                  values="0;1;1;0" keyTimes="0;0.08;0.72;1"
                  dur="7s" begin={c.delay} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* ── Info cards ── */}
        {cards.map((c, i) => {
          const isG = c.color === 'gold';
          const st  = isG ? 'var(--gold)' : 'var(--teal)';
          const bg  = isG ? 'rgba(212,168,67,0.05)' : 'rgba(0,196,167,0.05)';
          const mx  = c.bx + cw / 2;
          return (
            <g key={`c${i}`}>
              <rect x={c.bx} y={c.by} width={cw} height={ch}
                fill={bg} stroke={st} strokeWidth="0.75" rx="2">
                <animate attributeName="opacity"
                  values="0;1;1;0" keyTimes="0;0.36;0.72;1"
                  dur="7s" begin={c.delay} repeatCount="indefinite" />
              </rect>
              <text x={mx} y={c.by + 14}
                fill={isG ? 'var(--text-secondary)' : 'var(--teal)'}
                fontSize="7.5" fontFamily="monospace" textAnchor="middle"
                letterSpacing="0.8px">
                <animate attributeName="opacity"
                  values="0;0.48;0.48;0" keyTimes="0;0.38;0.7;1"
                  dur="7s" begin={c.delay} repeatCount="indefinite" />
                {c.label}
              </text>
              <text x={mx} y={c.by + 32}
                fill={st} fontSize="14" fontFamily="monospace"
                fontWeight="bold" textAnchor="middle" letterSpacing="2px">
                <animate attributeName="opacity"
                  values="0;0.9;0.3;0.9;0" keyTimes="0;0.38;0.55;0.7;1"
                  dur="7s" begin={c.delay} repeatCount="indefinite" />
                {c.value}
              </text>
            </g>
          );
        })}

        {/* ── WAG logo — nested <svg> for coordinate isolation ──────────────
            Using a nested SVG ensures the CSS wagSpin animation (rotateY)
            operates entirely in the nested SVG's own coordinate space and
            cannot interfere with the outer SVG's positioning coordinate.
            The nested SVG x/y attrs position it at exactly (cx, cy) centre.
        ──── */}
        <svg
          x={cx - logoW / 2}
          y={cy - logoH / 2}
          width={logoW}
          height={logoH}
          viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
          overflow="visible"
        >
          <g className={styles.wagSpin}>
            <path fill="var(--gold)" opacity="0.88" d={WAG_PATH} />
          </g>
        </svg>

        {/* ── Growth bar chart — bottom centre ── */}
        <text x={chartX0} y={barBase - barMaxH - 10}
          fill="var(--teal)" fontSize="7.5" fontFamily="monospace"
          opacity="0.30" letterSpacing="1.5px">РОСТ КОМПАНИИ</text>

        <line x1={chartX0 - 3} y1={barBase - 12}
          x2={chartX0 + chartW + 3} y2={barBase - 12}
          stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.20" />

        {BARS.map((b, i) => {
          const bh  = b.pct * barMaxH;
          const bx  = chartX0 + i * barStep;
          const y0  = barBase - 12;
          return (
            <g key={b.year}>
              <rect x={bx} y={y0 - bh} width={barW} height={bh}
                fill="rgba(212,168,67,0.08)" stroke="var(--gold)"
                strokeWidth="0.7" strokeOpacity="0.50">
                <animate attributeName="height" values={`0;${bh}`}
                  dur="1.4s" begin={`${i * 0.15}s`} fill="freeze"
                  calcMode="spline" keySplines="0.22 0.1 0.25 1" />
                <animate attributeName="y"
                  values={`${y0};${y0 - bh}`}
                  dur="1.4s" begin={`${i * 0.15}s`} fill="freeze"
                  calcMode="spline" keySplines="0.22 0.1 0.25 1" />
              </rect>
              <line x1={bx} y1={y0 - bh} x2={bx + barW} y2={y0 - bh}
                stroke="var(--gold)" strokeWidth="1.3" strokeOpacity="0.70">
                <animate attributeName="y1" values={`${y0};${y0 - bh}`}
                  dur="1.4s" begin={`${i * 0.15}s`} fill="freeze"
                  calcMode="spline" keySplines="0.22 0.1 0.25 1" />
                <animate attributeName="y2" values={`${y0};${y0 - bh}`}
                  dur="1.4s" begin={`${i * 0.15}s`} fill="freeze"
                  calcMode="spline" keySplines="0.22 0.1 0.25 1" />
              </line>
              <text x={bx + barW / 2} y={barBase}
                fill="var(--teal)" fontSize="6.5" fontFamily="monospace"
                textAnchor="middle" opacity="0.32">{b.year}</text>
            </g>
          );
        })}

        {/* ── Scan line ── */}
        <line x1={0} y1={0} x2={w} y2={0}
          stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.09">
          <animateTransform attributeName="transform" type="translate"
            from={`0 0`} to={`0 ${h}`} dur="9s" repeatCount="indefinite" />
        </line>

        {/* ── Status labels ── */}
        <text x={w - 7} y={14} fill="var(--teal)" fontSize="7.5" fontFamily="monospace"
          textAnchor="end" opacity="0.24" letterSpacing="0.5px">WAG_ЯДРО_АКТИВНО</text>
        <text x={w - 7} y={24} fill="var(--gold)" fontSize="7" fontFamily="monospace"
          textAnchor="end" opacity="0.18">АКТОБЕ / 51.18°С</text>
        <text x={7} y={14} fill="var(--teal)" fontSize="7" fontFamily="monospace"
          opacity="0.20">WEST ARLAN GROUP</text>
        <text x={7} y={24} fill="var(--gold)" fontSize="7" fontFamily="monospace">
          СТАТУС: НОРМА
          <animate attributeName="opacity"
            values="0.22;0.06;0.22" dur="2.6s" repeatCount="indefinite" />
        </text>
      </svg>
    </div>
  );
}
