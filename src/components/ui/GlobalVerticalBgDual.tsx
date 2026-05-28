'use client';

/**
 * GlobalVerticalBgDual — двух-рельсовая инженерная анимация с ПАРНОЙ компоновкой.
 *
 * Концепция:
 *   • Три горизонтальных бэнда, каждый занимает одинаковую Y-полосу на обоих рельсах
 *   • На каждой высоте СПРАВА и СЛЕВА видна РАЗНАЯ зона одновременно:
 *
 *      Band 1 (верх)  →  справа RAIL (01)      ║  слева ROAD (02)
 *      Band 2 (центр) →  справа INDUSTRY (03)  ║  слева ENERGY (04)
 *      Band 3 (низ)   →  справа OIL (05)       ║  слева GAS (06)
 *
 *   • Содержимое каждой зоны (оригинальные SVG координаты объектов) сохранено;
 *     зоны слева получают content-offset, который смещает их к соответствующему
 *     band-центру справа. Получается параллельная инженерная композиция.
 *
 * Режимы:
 *   hidden  — w < 1280px
 *   single  — 1280 ≤ w < ~1700px  — один правый рельс, ВСЕ 6 зон по очереди
 *   dual    — w ≥ ~1700px         — два рельса, парная компоновка (3 бэнда)
 *
 * Откат: в layout.tsx поменять импорт обратно на GlobalVerticalBgMulti.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const WAG_TRI = "M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z";

/* ── Зоны в их ОРИГИНАЛЬНОЙ системе координат (для single режима + контент) ── */
const ZONES = [
  { id: 'rail',     y0: -200, y1: 1480, num: '01', tag: 'RAIL' },
  { id: 'road',     y0: 1680, y1: 3120, num: '02', tag: 'ROAD' },
  { id: 'industry', y0: 3320, y1: 4760, num: '03', tag: 'INDU' },
  { id: 'energy',   y0: 4960, y1: 6400, num: '04', tag: 'ENRG' },
  { id: 'oil',      y0: 6600, y1: 8040, num: '05', tag: 'OIL'  },
  { id: 'gas',      y0: 8240, y1: 9680, num: '06', tag: 'GAS'  },
] as const;

type ZoneId = typeof ZONES[number]['id'];

/* ── Парные бэнды для dual режима ──
 *  Три компактных бэнда (ещё раз сокращены на 20% → 2400 × 0.8 = 1920),
 *  каждая зона на правом и левом рельсе видна одновременно в одном бэнде.  */
const BANDS_PAIRED = [
  { y0: 0,    y1: 1920 },   // band 1 — RAIL ↔ ROAD
  { y0: 2160, y1: 4080 },   // band 2 — OIL ↔ ENERGY  (после swap)
  { y0: 4320, y1: 6240 },   // band 3 — INDUSTRY ↔ GAS (после swap)
];

/* Какая зона на какой стороне в каком бэнде.
 * INDUSTRY и OIL обменялись местами (по запросу). */
const PAIRING: Record<ZoneId, { side: 'right' | 'left'; bandIndex: number }> = {
  rail:     { side: 'right', bandIndex: 0 },
  road:     { side: 'left',  bandIndex: 0 },
  oil:      { side: 'right', bandIndex: 1 },   // ← было 2
  energy:   { side: 'left',  bandIndex: 1 },
  industry: { side: 'right', bandIndex: 2 },   // ← было 1
  gas:      { side: 'left',  bandIndex: 2 },
};

type VisiblePreset = 'full' | 'right' | 'left';

/* ── Геометрия ─────────────────────────────────────────────────────────── */
const RAIL_SCALE        = 0.62;
const Y_STRETCH         = 2.0;
const BASE_PATH_HEIGHT  = 6500;            // ещё на ~20% (было 8000)
const PATH_HEIGHT       = BASE_PATH_HEIGHT * Y_STRETCH;
const CONTENT_HALF      = 640;
const RAIL_GUTTER       = 24;
const RAIL_OBJ_HALF_RAW = 200;
const RAIL_OBJ_HALF     = RAIL_OBJ_HALF_RAW * RAIL_SCALE;

const ys = (y: number) => y * Y_STRETCH;

/* getZoneDisplayY:
 *   В single (visible='full') — оригинальный Y зоны (× Y_STRETCH применяется отдельно).
 *   В dual (visible='right'/'left') — Y соответствующего парного бэнда. */
function getZoneDisplayY(zoneId: ZoneId, visible: VisiblePreset): { y0: number; y1: number } | null {
  if (visible === 'full') {
    const z = ZONES.find(z => z.id === zoneId);
    return z ? { y0: z.y0, y1: z.y1 } : null;
  }
  const pair = PAIRING[zoneId];
  if (pair.side !== visible) return null;        // не отображаем на «чужой» стороне
  return BANDS_PAIRED[pair.bandIndex];
}

/* Сдвиг содержимого зоны: top-align — верх контента совпадает с верхом бэнда.
 * Контент рисуется в исходных Y-координатах; после сдвига объекты начинаются
 * прямо с начала бэнда, а не от его центра. Это позволяет дополнять зону
 * новыми объектами вниз до самого дна бэнда. */
function getZoneContentOffset(zoneId: ZoneId, visible: VisiblePreset): number {
  const display = getZoneDisplayY(zoneId, visible);
  if (!display) return 0;
  const own = ZONES.find(z => z.id === zoneId)!;
  return ys(display.y0) - own.y0;
}

type Mode = 'hidden' | 'single' | 'dual';

function pickMode(w: number): Mode {
  if (w < 1280) return 'hidden';
  const needed = 2 * CONTENT_HALF + 2 * (RAIL_GUTTER + RAIL_OBJ_HALF) + 24;
  if (w >= needed) return 'dual';
  return 'single';
}

function railXScreen(w: number, side: 'right' | 'left'): number {
  const half = CONTENT_HALF + RAIL_GUTTER + RAIL_OBJ_HALF;
  if (side === 'right') {
    return Math.min(w - RAIL_OBJ_HALF - 16, w / 2 + half);
  }
  return Math.max(RAIL_OBJ_HALF + 16, w / 2 - half);
}

export default function GlobalVerticalBgDual() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [w, setW] = useState(1440);
  const [footerVisible, setFooterVisible] = useState(false);

  const svgWrapperRef = useRef<SVGSVGElement>(null);
  const maskPathRefR  = useRef<SVGPathElement>(null);
  const corePathRefR  = useRef<SVGPathElement>(null);
  const tipGroupRefR  = useRef<SVGGElement>(null);
  const tipTextRefR   = useRef<SVGTextElement>(null);
  const tipZoneRefR   = useRef<SVGTextElement>(null);
  const maskPathRefL  = useRef<SVGPathElement>(null);
  const corePathRefL  = useRef<SVGPathElement>(null);
  const tipGroupRefL  = useRef<SVGGElement>(null);
  const tipTextRefL   = useRef<SVGTextElement>(null);
  const tipZoneRefL   = useRef<SVGTextElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setW(window.innerWidth);

    let pathLenR = PATH_HEIGHT;
    let pathLenL = PATH_HEIGHT;
    if (corePathRefR.current) pathLenR = corePathRefR.current.getTotalLength();
    if (maskPathRefL.current) pathLenL = maskPathRefL.current.getTotalLength();

    let animationFrameId: number;
    let startTime: number | null = null;
    const DURATION = 32000;

    const isDual = pickMode(window.innerWidth) === 'dual';
    const visibleZoneIdsRight: ZoneId[] = isDual
      ? ['rail', 'industry', 'oil']
      : ['rail', 'road', 'industry', 'energy', 'oil', 'gas'];
    const visibleZoneIdsLeft: ZoneId[] = ['road', 'energy', 'gas'];

    const updateTip = (
      drawLen: number,
      corePath: SVGPathElement | null,
      tipGroup: SVGGElement | null,
      tipText: SVGTextElement | null,
      tipZone: SVGTextElement | null,
      side: VisiblePreset,
      visibleIds: ZoneId[],
    ) => {
      if (!tipGroup || !corePath) return;
      const point = corePath.getPointAtLength(drawLen);
      tipGroup.style.transform = `translate(${point.x}px, ${point.y}px)`;
      if (tipText) tipText.textContent = `P:${Math.floor(point.x)}x${Math.floor(point.y)}`;
      if (tipZone) {
        const z = ZONES.find(zn => {
          if (!visibleIds.includes(zn.id)) return false;
          const display = getZoneDisplayY(zn.id, side);
          if (!display) return false;
          return point.y >= ys(display.y0) - 200 && point.y <= ys(display.y1) + 200;
        });
        tipZone.textContent = z ? `[${z.tag}_${z.num}]` : `[ПЕРЕХОД]`;
      }
    };

    const drawLoop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      // Правый рельс
      const drawR = pathLenR * progress;
      if (maskPathRefR.current) {
        maskPathRefR.current.style.strokeDasharray  = `${pathLenR}`;
        maskPathRefR.current.style.strokeDashoffset = `${pathLenR - drawR}`;
      }
      updateTip(drawR,
        corePathRefR.current, tipGroupRefR.current,
        tipTextRefR.current,  tipZoneRefR.current,
        isDual ? 'right' : 'full', visibleZoneIdsRight,
      );

      // Левый рельс — синхронно с правым (тот же progress, без сдвига фазы)
      if (maskPathRefL.current) {
        const drawL = pathLenL * progress;
        maskPathRefL.current.style.strokeDasharray  = `${pathLenL}`;
        maskPathRefL.current.style.strokeDashoffset = `${pathLenL - drawL}`;
        updateTip(drawL,
          corePathRefL.current, tipGroupRefL.current,
          tipTextRefL.current,  tipZoneRefL.current,
          'left', visibleZoneIdsLeft,
        );
      }

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(drawLoop);
      }
    };

    animationFrameId = window.requestAnimationFrame(drawLoop);

    let scrollTicking = false;
    const handleScroll = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          if (svgWrapperRef.current) {
            svgWrapperRef.current.style.transform = `translateY(${-window.scrollY}px)`;
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    const handleResize = () => {
      setW(window.innerWidth);
      if (corePathRefR.current) pathLenR = corePathRefR.current.getTotalLength();
      if (maskPathRefL.current) pathLenL = maskPathRefL.current.getTotalLength();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    const footerEl = document.querySelector('footer');
    let footerObserver: IntersectionObserver | null = null;
    if (footerEl) {
      footerObserver = new IntersectionObserver(
        ([entry]) => setFooterVisible(entry.isIntersecting),
        { threshold: 0 }
      );
      footerObserver.observe(footerEl);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      footerObserver?.disconnect();
    };
  }, []);

  if (!mounted || pathname.startsWith('/admin')) return null;
  const mode = pickMode(w);
  if (mode === 'hidden') return null;

  // Прямая вертикальная линия сверху вниз — без верхнего S-изгиба
  const internalEndX = 800;
  const mainPath = `M ${internalEndX} -100 V ${PATH_HEIGHT}`;

  // /about hero is a clean cycling-text stage — hide the blueprint until
  // the hero scrolls past. Mask is in SVG-local coords and the SVG translates
  // with scroll, so the hidden zone stays pinned to the top of the document.
  const isAbout = pathname.startsWith('/about');
  const HERO_HIDE_PX = 1080;
  const heroMask = isAbout
    ? `linear-gradient(to bottom, transparent 0, transparent ${HERO_HIDE_PX - 80}px, black ${HERO_HIDE_PX + 40}px)`
    : undefined;

  const rightX = railXScreen(w, 'right');
  const leftX  = railXScreen(w, 'left');
  const rightTranslateX = rightX - internalEndX * RAIL_SCALE;
  const leftTranslateX  = leftX  - internalEndX * RAIL_SCALE;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        opacity: footerVisible ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}
      aria-hidden="true"
    >
      <svg
        ref={svgWrapperRef}
        width="100%"
        height={PATH_HEIGHT}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform',
          WebkitMaskImage: heroMask,
          maskImage: heroMask,
        }}
      >
        <Rail
          idPrefix="r"
          translateX={rightTranslateX}
          mainPath={mainPath}
          internalEndX={internalEndX}
          opacity={1}
          visible={mode === 'dual' ? 'right' : 'full'}
          maskPathRef={maskPathRefR}
          corePathRef={corePathRefR}
          tipGroupRef={tipGroupRefR}
          tipTextRef={tipTextRefR}
          tipZoneRef={tipZoneRefR}
          showTip={true}
        />

        {mode === 'dual' && (
          <Rail
            idPrefix="l"
            translateX={leftTranslateX}
            mainPath={mainPath}
            internalEndX={internalEndX}
            opacity={0.92}
            visible="left"
            maskPathRef={maskPathRefL}
            corePathRef={corePathRefL}
            tipGroupRef={tipGroupRefL}
            tipTextRef={tipTextRefL}
            tipZoneRef={tipZoneRefL}
            showTip={true}
          />
        )}
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

interface RailProps {
  idPrefix: string;
  translateX: number;
  mainPath: string;
  internalEndX: number;
  opacity: number;
  visible: VisiblePreset;
  showTip: boolean;
  maskPathRef:   React.RefObject<SVGPathElement | null>;
  corePathRef?:  React.RefObject<SVGPathElement | null>;
  tipGroupRef?:  React.RefObject<SVGGElement | null>;
  tipTextRef?:   React.RefObject<SVGTextElement | null>;
  tipZoneRef?:   React.RefObject<SVGTextElement | null>;
}

function Rail({
  idPrefix,
  translateX,
  mainPath,
  internalEndX,
  opacity,
  visible,
  showTip,
  maskPathRef,
  corePathRef,
  tipGroupRef,
  tipTextRef,
  tipZoneRef,
}: RailProps) {
  const endX = internalEndX;

  const showZone = (id: ZoneId) => getZoneDisplayY(id, visible) !== null;
  const cOff = (id: ZoneId) => getZoneContentOffset(id, visible);

  // Переходы между зонами имеют смысл только в single (full)
  const showTransition = (a: ZoneId, b: ZoneId) =>
    visible === 'full' && showZone(a) && showZone(b);

  const idDraw   = `drawMask-${idPrefix}`;
  const idHol24  = `hollow24-${idPrefix}`;
  const idHol40  = `hollow40-${idPrefix}`;
  const idHol60  = `hollow60-${idPrefix}`;
  const idTrack  = `track-${idPrefix}`;
  const idClip   = (zid: string) => `clip-${zid}-${idPrefix}`;

  return (
    <g
      transform={`translate(${translateX}, 0) scale(${RAIL_SCALE})`}
      opacity={opacity}
    >
      <defs>
        <mask id={idHol24}>
          <rect width="100%" height="100%" fill="white" />
          <path d={mainPath} stroke="black" strokeWidth="24" fill="none" />
        </mask>
        <mask id={idHol40}>
          <rect width="100%" height="100%" fill="white" />
          <path d={mainPath} stroke="black" strokeWidth="40" fill="none" />
        </mask>
        <mask id={idHol60}>
          <rect width="100%" height="100%" fill="white" />
          <path d={mainPath} stroke="black" strokeWidth="60" fill="none" />
        </mask>
        <mask id={idTrack}>
          <rect width="100%" height="100%" fill="white" />
          <path d={mainPath} stroke="black" strokeWidth="120" fill="none" />
        </mask>

        {/* clipPath для каждой видимой зоны — позиция зависит от visible (full vs paired) */}
        {ZONES.map(zone => {
          const display = getZoneDisplayY(zone.id, visible);
          if (!display) return null;
          return (
            <clipPath key={zone.id} id={idClip(zone.id)}>
              <rect x="0" y={ys(display.y0)} width="100%" height={ys(display.y1 - display.y0)} />
            </clipPath>
          );
        })}

        <mask id={idDraw}>
          <path
            ref={maskPathRef}
            d={mainPath}
            stroke="#FFF"
            strokeWidth="600"
            fill="none"
            style={{ willChange: 'stroke-dashoffset' }}
          />
        </mask>
      </defs>

      <g mask={`url(#${idDraw})`}>
        {/* ════════════════ ZONE 01 — ЖЕЛЕЗНАЯ ДОРОГА ════════════════ */}
        {showZone('rail') && (
          <g clipPath={`url(#${idClip('rail')})`}>
            {/* Тёмный балласт под путём */}
            <path d={mainPath} stroke="rgba(4,6,12, 0.6)" strokeWidth="80" fill="none" />
            {/* Бровка пути (бирюзовые краевые штрихи) */}
            <path d={mainPath} stroke="var(--teal)" strokeWidth="122" strokeDasharray="10 10" strokeOpacity="0.8" fill="none" mask={`url(#${idTrack})`} />
            {/* Шпалы — поперечные штрихи */}
            <path d={mainPath} stroke="var(--gold)" strokeWidth="56" strokeDasharray="6 38" strokeOpacity="0.4" fill="none" />
            {/* Две параллельные рельсы — явные линии (mask-трюк на прямой ненадёжен) */}
            <line x1={endX - 14} y1="-200" x2={endX - 14} y2={PATH_HEIGHT} stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.95" />
            <line x1={endX + 14} y1="-200" x2={endX + 14} y2={PATH_HEIGHT} stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.95" />

            <g transform={`translate(0, ${cOff('rail')})`}>
              <g transform={`translate(${endX}, 580)`}>
                <rect x="-90" y="-180" width="12" height="360" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1" strokeDasharray="6 6" />
                <rect x="78" y="-180" width="12" height="360" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1" strokeDasharray="6 6" />
                <rect x="-100" y="170" width="32" height="10" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
                <rect x="68" y="170" width="32" height="10" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
                <line x1="-90" y1="-180" x2="90" y2="-180" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="-90" y1="-150" x2="90" y2="-150" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
                <path d="M -90 -180 L -60 -150 L -30 -180 L 0 -150 L 30 -180 L 60 -150 L 90 -180" fill="none" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="-120" y1="-180" x2="-120" y2="180" stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.6" />
                <text x="-130" y="4" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" transform="rotate(-90, -130, 4)">L=48м</text>
                <text x="-100" y="-195" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЖД МОСТ МС-12</text>
                <text x="-100" y="-180" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">ПРОЛЁТ: 48М · КЛАСС Н-18</text>
              </g>

              <g transform={`translate(${endX}, 960)`}>
                <circle cx="0" cy="0" r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
                <rect x="-3" y="-3" width="6" height="6" fill="var(--gold)" />
                <path d="M 0 0 C -30 80, -80 150, -160 230 L -160 350" stroke="var(--gold)" strokeWidth="42" strokeDasharray="6 38" strokeOpacity="0.3" fill="none" />
                <path d="M -12 0 C -42 80, -92 150, -172 230 L -172 350" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
                <path d="M 12 0 C -18 80, -68 150, -148 230 L -148 350" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
                <text x="-180" y="240" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">СТРЕЛКА №14</text>
                <text x="-180" y="256" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">МАРКА КРЕСТОВИНЫ 1/11</text>
              </g>

              {/* Светофор-семафор (вверху зоны) */}
              <g transform={`translate(${endX}, 200)`}>
                <line x1="0" y1="0" x2="0" y2="40" stroke="var(--gold)" strokeWidth="1.4" />
                <rect x="-3" y="40" width="6" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
                <rect x="-14" y="-30" width="28" height="32" fill="rgba(15,18,26,0.85)" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="0" cy="-22" r="3.5" fill="rgba(255,80,80,0.85)" stroke="var(--gold)" strokeWidth="0.5" />
                <circle cx="0" cy="-12" r="3.5" fill="rgba(255,210,63,0.4)" stroke="var(--gold)" strokeWidth="0.5" />
                <circle cx="0" cy="-2"  r="3.5" fill="rgba(0,196,167,0.85)" stroke="var(--gold)" strokeWidth="0.5" />
                <text x="-22" y="-38" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СВЕТОФОР С-3</text>
                <text x="-22" y="-26" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3-ЗНАЧНЫЙ · ПК 18+45</text>
              </g>

              {/* ЖД-переезд */}
              <g transform={`translate(${endX}, 1340)`}>
                <line x1="-100" y1="0"   x2="100" y2="0"   stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="6 6" />
                <line x1="-100" y1="-22" x2="100" y2="-22" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M -20 -22 L 20 0 M 20 -22 L -20 0" stroke="var(--gold)" strokeWidth="2" />
                <line x1="-108" y1="-32" x2="-46" y2="-58" stroke="var(--gold)" strokeWidth="2.2" />
                <rect x="-110" y="-34" width="6" height="14" fill="rgba(255,80,80,0.6)" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="108" y1="22" x2="46" y2="46" stroke="var(--gold)" strokeWidth="2.2" />
                <text x="-118" y="-66" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ПЕРЕЕЗД ПР-4</text>
                <text x="-118" y="-54" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">АВТО + ЖД · ШЛАГБАУМ</text>
              </g>

              {/* Семафор (механический) */}
              <g transform={`translate(${endX}, 1720)`}>
                <line x1="0" y1="0" x2="0" y2="80" stroke="var(--gold)" strokeWidth="1.6" />
                <rect x="-3" y="80" width="6" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
                {/* Крыло семафора */}
                <line x1="0" y1="-10" x2="50" y2="-30" stroke="rgba(255,80,80,0.7)" strokeWidth="6" strokeLinecap="round" />
                <circle cx="0" cy="-10" r="4" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.4" />
                <circle cx="0" cy="-10" r="1.5" fill="var(--gold)" />
                {/* Грузовой балансир */}
                <line x1="0" y1="-10" x2="-20" y2="2" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="-22" cy="3" r="3" fill="var(--gold)" />
                <text x="-22" y="-32" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СЕМАФОР СМ-2</text>
                <text x="-22" y="-20" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">МЕХАНИЧЕСКИЙ · ВЫЕЗД</text>
              </g>

              {/* Тупиковый упор */}
              <g transform={`translate(${endX}, 2100)`}>
                <rect x="-40" y="-12" width="80" height="24" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.6" />
                {/* Диагональные раскосы */}
                <line x1="-40" y1="-12" x2="-20" y2="12" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" />
                <line x1="40"  y1="-12" x2="20"  y2="12" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" />
                <line x1="-30" y1="-12" x2="-10" y2="12" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" />
                <line x1="30"  y1="-12" x2="10"  y2="12" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" />
                {/* Колея за упором */}
                <line x1="-14" y1="12" x2="-14" y2="50" stroke="var(--gold)" strokeWidth="2.4" strokeOpacity="0.7" />
                <line x1="14"  y1="12" x2="14"  y2="50" stroke="var(--gold)" strokeWidth="2.4" strokeOpacity="0.7" />
                <text x="-48" y="-22" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ТУПИК ТУП-1</text>
                <text x="-48" y="-10" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">УПОР ТИПА УП · ДЕРЕВО</text>
              </g>

              {/* Депо локомотивное (вид сверху) — слева от рельс, не перекрывает их */}
              <g transform={`translate(${endX - 170}, 2480)`}>
                <rect x="-50" y="-50" width="100" height="100" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.6" />
                {/* Канавы для осмотра — 4 параллельные линии внутри депо */}
                {[-30, -10, 10, 30].map(y => (
                  <line key={`pit${y}`} x1="-46" y1={y} x2="46" y2={y} stroke="var(--gold)" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.6" />
                ))}
                {/* Локомотив-силуэт по центру */}
                <rect x="-22" y="-7" width="44" height="14" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.9" />
                <rect x="-20" y="-5" width="12" height="3" fill="var(--gold)" />
                <rect x="10"  y="-5" width="10" height="3" fill="var(--gold)" />
                <circle cx="-16" cy="10" r="2.4" fill="var(--gold)" />
                <circle cx="-4"  cy="10" r="2.4" fill="var(--gold)" />
                <circle cx="8"   cy="10" r="2.4" fill="var(--gold)" />
                <circle cx="18"  cy="10" r="2.4" fill="var(--gold)" />
                {/* Подъездные пути к депо (от рельсов к воротам) */}
                <line x1="50" y1="-20" x2="120" y2="-20" stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.7" />
                <line x1="50" y1="20"  x2="120" y2="20"  stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.7" />
                <text x="-56" y="-60" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">ЛОКОМОТИВНОЕ ДЕПО ТЧ-4</text>
                <text x="-56" y="-52" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">4 СТОЙЛА · S=2400 М²</text>
              </g>

              {/* Водонапорная башня */}
              <g transform={`translate(${endX + 110}, 2860)`}>
                {/* Резервуар наверху */}
                <ellipse cx="0" cy="-46" rx="22" ry="6" fill="rgba(79,132,255,0.12)" stroke="var(--blue)" strokeWidth="1.2" />
                <rect x="-22" y="-46" width="44" height="36" fill="rgba(79,132,255,0.08)" stroke="var(--blue)" strokeWidth="1.2" />
                <ellipse cx="0" cy="-10" rx="22" ry="5" fill="rgba(79,132,255,0.18)" stroke="var(--blue)" strokeWidth="1" />
                {/* Опора */}
                <line x1="-7" y1="-10" x2="-7"  y2="50" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="7"  y1="-10" x2="7"   y2="50" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-7" y1="10"  x2="7"   y2="10" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="-7" y1="30"  x2="7"   y2="30" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="-7" y1="-10" x2="7"   y2="50" stroke="var(--gold)" strokeWidth="0.6" strokeOpacity="0.6" />
                <line x1="7"  y1="-10" x2="-7"  y2="50" stroke="var(--gold)" strokeWidth="0.6" strokeOpacity="0.6" />
                <text x="28" y="-30" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">БАШНЯ ВБ-1</text>
                <text x="28" y="-18" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">V=50 М³ · H=24М</text>
              </g>

              {/* Грузовой состав ВИД СВЕРХУ, стоит на путях (тянется вдоль рельсов) */}
              <g transform={`translate(${endX}, 3240)`}>
                {/* === Вагон 1: грузовая платформа с контейнерами === */}
                <rect x="-22" y="-110" width="44" height="64" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.4" rx="3" />
                {/* Контейнеры на платформе */}
                <rect x="-17" y="-103" width="15" height="16" fill="rgba(212,168,67,0.35)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="2"   y="-103" width="15" height="16" fill="rgba(212,168,67,0.35)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="-17" y="-84"  width="34" height="14" fill="rgba(212,168,67,0.30)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="-12" y="-66"  width="24" height="16" fill="rgba(212,168,67,0.25)" stroke="var(--gold)" strokeWidth="0.7" />
                {/* Колёсные тележки (вид сверху — кружки по углам вагона) */}
                <circle cx="-22" cy="-100" r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="-100" r="2.4" fill="var(--gold)" />
                <circle cx="-22" cy="-58"  r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="-58"  r="2.4" fill="var(--gold)" />

                {/* Сцепка 1-2 */}
                <rect x="-3" y="-46" width="6" height="4" fill="var(--gold)" />

                {/* === Вагон 2: полувагон (гондола) === */}
                <rect x="-22" y="-42" width="44" height="64" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.4" rx="3" />
                {/* Внутренние рёбра жёсткости (поперёк) */}
                {[-32, -22, -12, -2, 8, 18].map(y => (
                  <line key={`r${y}`} x1="-20" y1={y} x2="20" y2={y} stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.6" />
                ))}
                <circle cx="-22" cy="-32" r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="-32" r="2.4" fill="var(--gold)" />
                <circle cx="-22" cy="14"  r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="14"  r="2.4" fill="var(--gold)" />

                {/* Сцепка 2-3 */}
                <rect x="-3" y="22" width="6" height="4" fill="var(--gold)" />

                {/* === Вагон 3: цистерна (вид сверху — продолговатый овал) === */}
                <rect x="-22" y="26" width="44" height="64" fill="rgba(40,28,18,0.6)" stroke="var(--gold)" strokeWidth="1.4" rx="3" />
                {/* Контур котла цистерны */}
                <ellipse cx="0" cy="58" rx="15" ry="29" fill="rgba(168,114,43,0.4)" stroke="var(--gold)" strokeWidth="0.9" />
                {/* Заливные люки сверху котла (3 шт по длине) */}
                <circle cx="0" cy="38" r="3.2" fill="rgba(212,168,67,0.4)" stroke="var(--gold)" strokeWidth="0.7" />
                <circle cx="0" cy="58" r="4"   fill="rgba(212,168,67,0.4)" stroke="var(--gold)" strokeWidth="0.7" />
                <circle cx="0" cy="78" r="3.2" fill="rgba(212,168,67,0.4)" stroke="var(--gold)" strokeWidth="0.7" />
                {/* Колёсные тележки */}
                <circle cx="-22" cy="36" r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="36" r="2.4" fill="var(--gold)" />
                <circle cx="-22" cy="80" r="2.4" fill="var(--gold)" />
                <circle cx="22"  cy="80" r="2.4" fill="var(--gold)" />

                <text x="-30" y="-122" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СОСТАВ ТП-7</text>
                <text x="-30" y="-110" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3 ВАГОНА · 240Т</text>
              </g>
            </g>
          </g>
        )}

        {showTransition('rail', 'road') && (
          <g transform={`translate(${endX}, ${ys(1580)})`}><ZoneTransition /></g>
        )}

        {/* ════════════════ ZONE 02 — АВТОДОРОГА ════════════════ */}
        {showZone('road') && (
          <g clipPath={`url(#${idClip('road')})`}>
            <path d={mainPath} stroke="rgba(15, 18, 26, 0.85)" strokeWidth="100" fill="none" />
            <path d={mainPath} stroke="rgba(255,255,255,0.55)" strokeWidth="100" fill="none" mask={`url(#${idHol60})`} />
            <path d={mainPath} stroke="var(--gold)" strokeWidth="3" strokeDasharray="20 14" strokeOpacity="0.95" fill="none" />

            <g transform={`translate(0, ${cOff('road')})`}>
              <g transform={`translate(${endX}, 2080)`}>
                <line x1="-200" y1="0" x2="-200" y2="60" stroke="var(--gold)" strokeWidth="1.6" />
                <line x1="-100" y1="0" x2="-100" y2="60" stroke="var(--gold)" strokeWidth="1.6" />
                <rect x="-208" y="58" width="16" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
                <rect x="-108" y="58" width="16" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
                <rect x="-220" y="-46" width="140" height="46" fill="rgba(79,132,255,0.18)" stroke="var(--blue)" strokeWidth="1.6" />
                <rect x="-216" y="-42" width="132" height="38" fill="none" stroke="rgba(240,242,248,0.45)" strokeWidth="0.5" />
                <text x="-150" y="-30" fill="rgba(240,242,248,0.95)" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="0.5px">АСТАНА — АКТОБЕ</text>
                <rect x="-178" y="-22" width="56" height="18" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-172" y1="-20" x2="-172" y2="-6" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="-128" y1="-20" x2="-128" y2="-6" stroke="var(--gold)" strokeWidth="0.8" />
                <text x="-150" y="-9" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">M-2</text>
                <text x="-225" y="-58" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">УКАЗАТЕЛЬ Н-04</text>
                <text x="-225" y="-50" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">5.27.1 · РЕСП.ТРАССА</text>
              </g>

              <g transform={`translate(${endX}, 2380)`}>
                {/* (Путепровод — позиция сохранена; равномерное распределение строится вокруг него) */}
                <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="-110" y1="-22" x2="110" y2="-22" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
                <path d="M -110 0 L -82 -22 L -55 0 L -28 -22 L 0 0 L 28 -22 L 55 0 L 82 -22 L 110 0" fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.5" />
                <rect x="-115" y="-30" width="6" height="80" fill="none" stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 3" />
                <rect x="109" y="-30" width="6" height="80" fill="none" stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 3" />
                <text x="-120" y="-32" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ПУТЕПРОВОД ПП-3</text>
                <text x="-120" y="-17" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=24М · ПРОЛЁТ БАЛОЧНЫЙ</text>
              </g>

              <g transform={`translate(${endX}, 2680)`}>
                {[0,1,2,3,4,5].map(i => (
                  <rect key={`zb${i}`} x={-50 + i*18} y="-9" width="10" height="18" fill="rgba(255,255,255,0.65)" />
                ))}
                <line x1="-50" y1="-14" x2="58" y2="-14" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="-78" y1="14" x2="-78" y2="-44" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-83" y1="14" x2="-73" y2="14" stroke="var(--gold)" strokeWidth="1" />
                <line x1="-78" y1="-44" x2="-92" y2="-44" stroke="var(--gold)" strokeWidth="1.2" />
                <rect x="-100" y="-90" width="16" height="44" fill="rgba(15,18,26,0.85)" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="-92" cy="-80" r="3.5" fill="rgba(255,80,80,0.75)" stroke="var(--gold)" strokeWidth="0.5" />
                <circle cx="-92" cy="-68" r="3.5" fill="rgba(255,210,63,0.4)" stroke="var(--gold)" strokeWidth="0.5" />
                <circle cx="-92" cy="-56" r="3.5" fill="rgba(0,196,167,0.75)" stroke="var(--gold)" strokeWidth="0.5" />
                <line x1="78" y1="14" x2="78" y2="-30" stroke="var(--gold)" strokeWidth="1.4" />
                <rect x="60" y="-72" width="36" height="36" fill="rgba(79,132,255,0.22)" stroke="var(--blue)" strokeWidth="1.4" />
                <circle cx="78" cy="-62" r="2.4" fill="none" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
                <line x1="78" y1="-60" x2="78" y2="-52" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
                <text x="-105" y="-105" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">УЗЕЛ ПЕРЕХОД-7</text>
                <text x="-105" y="-94" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">СВЕТОФОР · ЗН.5.19.1 · ЗЕБРА</text>
              </g>

              <g transform={`translate(${endX}, 2980)`}>
                <rect x="-160" y="-22" width="100" height="44" fill="rgba(15,18,26,0.85)" />
                <line x1="-160" y1="-22" x2="-58" y2="-22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="-160" y1="22" x2="-58" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <rect x="60" y="-22" width="100" height="44" fill="rgba(15,18,26,0.85)" />
                <line x1="58" y1="-22" x2="160" y2="-22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="58" y1="22" x2="160" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <circle cx="0" cy="0" r="58" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.7" />
                <circle cx="0" cy="0" r="38" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.7" />
                <circle cx="0" cy="0" r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.5" />
                <text x="-170" y="-30" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">ПЕРЕКРЁСТОК Р-7</text>
                <text x="-170" y="-18" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">D=120М · 4 СЪЕЗДА</text>
              </g>

              {/* Остановка с навесом (вверху зоны) */}
              <g transform={`translate(${endX}, 1800)`}>
                <rect x="-100" y="-22" width="68" height="34" fill="rgba(79,132,255,0.18)" stroke="var(--blue)" strokeWidth="1.4" />
                <line x1="-104" y1="-26" x2="-28" y2="-26" stroke="var(--blue)" strokeWidth="1.6" />
                {/* Автобус-силуэт */}
                <rect x="-90" y="-12" width="36" height="14" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.8" />
                <rect x="-86" y="-9" width="6" height="6" fill="rgba(240,242,248,0.5)" />
                <rect x="-78" y="-9" width="6" height="6" fill="rgba(240,242,248,0.5)" />
                <rect x="-70" y="-9" width="6" height="6" fill="rgba(240,242,248,0.5)" />
                <circle cx="-82" cy="4" r="2.4" fill="var(--gold)" />
                <circle cx="-62" cy="4" r="2.4" fill="var(--gold)" />
                <text x="-110" y="-32" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ОСТАНОВКА А-9</text>
                <text x="-110" y="-22" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">КРЫТАЯ · 12 МЕСТ</text>
              </g>

              {/* Пункт оплаты */}
              <g transform={`translate(${endX}, 3280)`}>
                <line x1="-150" y1="0" x2="-30" y2="0" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="30"   y1="0" x2="150" y2="0" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <rect x="-32" y="-22" width="64" height="44" fill="rgba(212,168,67,0.08)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-16" y1="-22" x2="-16" y2="22" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="0"   y1="-22" x2="0"   y2="22" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="16"  y1="-22" x2="16"  y2="22" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="-44" y1="-28" x2="44" y2="-28" stroke="var(--gold)" strokeWidth="1.6" />
                <line x1="-44" y1="-28" x2="-32" y2="-22" stroke="var(--gold)" strokeWidth="0.8" />
                <line x1="44"  y1="-28" x2="32"  y2="-22" stroke="var(--gold)" strokeWidth="0.8" />
                <text x="-54" y="-36" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ПУНКТ ОПЛАТЫ ПО-2</text>
                <text x="-54" y="-24" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3 ПОЛОСЫ · 24/7</text>
              </g>

              {/* Пешеходный переход №2 (со светофором) */}
              <g transform={`translate(${endX}, 3580)`}>
                {[0,1,2,3,4,5].map(i => (
                  <rect key={`zb${i}`} x={-50 + i*18} y="-9" width="10" height="18" fill="rgba(255,255,255,0.65)" />
                ))}
                <line x1="-50" y1="-14" x2="58" y2="-14" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                {/* Стойка светофора слева */}
                <line x1="-78" y1="14" x2="-78" y2="-30" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-83" y1="14" x2="-73" y2="14" stroke="var(--gold)" strokeWidth="1" />
                <line x1="-78" y1="-30" x2="-90" y2="-30" stroke="var(--gold)" strokeWidth="1.2" />
                {/* Корпус 3-секционного светофора */}
                <rect x="-96" y="-66" width="12" height="34" fill="rgba(15,18,26,0.85)" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="-90" cy="-58" r="2.6" fill="rgba(255,80,80,0.75)"  stroke="var(--gold)" strokeWidth="0.4" />
                <circle cx="-90" cy="-49" r="2.6" fill="rgba(255,210,63,0.4)"  stroke="var(--gold)" strokeWidth="0.4" />
                <circle cx="-90" cy="-40" r="2.6" fill="rgba(0,196,167,0.75)"  stroke="var(--gold)" strokeWidth="0.4" />
                {/* Знак справа — простой синий квадрат поменьше */}
                <line x1="78" y1="14" x2="78" y2="-30" stroke="var(--gold)" strokeWidth="1.2" />
                <rect x="67" y="-54" width="22" height="22" fill="rgba(79,132,255,0.30)" stroke="var(--blue)" strokeWidth="1.4" />
                <rect x="69" y="-52" width="18" height="18" fill="none" stroke="rgba(240,242,248,0.3)" strokeWidth="0.4" />
                <text x="0" y="-78" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ПЕРЕХОД ПХ-2</text>
                <text x="0" y="-68" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">СВЕТОФОР · ЗН.5.19.1</text>
              </g>

              {/* АЗС */}
              <g transform={`translate(${endX - 100}, 3880)`}>
                {/* Навес */}
                <rect x="-30" y="-32" width="60" height="14" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-30" y1="-18" x2="-30" y2="6" stroke="var(--gold)" strokeWidth="1" />
                <line x1="30"  y1="-18" x2="30"  y2="6" stroke="var(--gold)" strokeWidth="1" />
                {/* Колонки заправки */}
                <rect x="-22" y="-6" width="8" height="14" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="1" />
                <rect x="-4"  y="-6" width="8" height="14" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="1" />
                <rect x="14"  y="-6" width="8" height="14" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="1" />
                {/* Здание магазина */}
                <rect x="-44" y="14" width="20" height="20" fill="rgba(212,168,67,0.08)" stroke="var(--gold)" strokeWidth="1" />
                {/* Подземные резервуары */}
                <ellipse cx="20" cy="32" rx="14" ry="3" fill="none" stroke="var(--gold)" strokeWidth="0.6" strokeDasharray="3 2" strokeOpacity="0.6" />
                <text x="-50" y="-42" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">АЗС &laquo;ARLAN-G&raquo;</text>
                <text x="-50" y="-30" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3 КОЛ. · АИ-92/95/ДТ</text>
              </g>

              {/* Туннель / Галерея */}
              <g transform={`translate(${endX}, 4180)`}>
                {/* Дорога входит в туннель */}
                <rect x="-100" y="-22" width="200" height="44" fill="rgba(15,18,26,0.85)" />
                <line x1="-100" y1="-22" x2="100" y2="-22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="-100" y1="22" x2="100" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                {/* Арка тоннеля сверху и снизу */}
                <path d="M -100 -22 Q -50 -52 0 -52 Q 50 -52 100 -22" fill="rgba(0,196,167,0.05)" stroke="var(--teal)" strokeWidth="1.4" />
                <path d="M -100 22 Q -50 52 0 52 Q 50 52 100 22" fill="rgba(0,196,167,0.05)" stroke="var(--teal)" strokeWidth="1.4" />
                {/* Опоры арки */}
                {[-80, -40, 0, 40, 80].map(x => (
                  <line key={`pl${x}`} x1={x} y1="-50" x2={x} y2="-22" stroke="var(--teal)" strokeWidth="0.7" strokeOpacity="0.5" />
                ))}
                <text x="-110" y="-58" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ТУННЕЛЬ ТП-3</text>
                <text x="-110" y="-46" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=180М · ОДНОПОЛ.</text>
              </g>

              {/* Пешеходный переход №3 (со светофором) */}
              <g transform={`translate(${endX}, 4480)`}>
                {[0,1,2,3,4,5].map(i => (
                  <rect key={`zb${i}`} x={-50 + i*18} y="-9" width="10" height="18" fill="rgba(255,255,255,0.65)" />
                ))}
                <line x1="-50" y1="-14" x2="58" y2="-14" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                <line x1="-50" y1="14"  x2="58" y2="14"  stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                {/* Знак слева — простой синий квадрат поменьше */}
                <line x1="-78" y1="14" x2="-78" y2="-30" stroke="var(--gold)" strokeWidth="1.2" />
                <rect x="-89" y="-54" width="22" height="22" fill="rgba(79,132,255,0.30)" stroke="var(--blue)" strokeWidth="1.4" />
                <rect x="-87" y="-52" width="18" height="18" fill="none" stroke="rgba(240,242,248,0.3)" strokeWidth="0.4" />
                {/* Стойка светофора справа */}
                <line x1="78" y1="14" x2="78" y2="-30" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="73" y1="14" x2="83" y2="14" stroke="var(--gold)" strokeWidth="1" />
                <line x1="78" y1="-30" x2="90" y2="-30" stroke="var(--gold)" strokeWidth="1.2" />
                {/* Корпус 3-секционного светофора */}
                <rect x="84" y="-66" width="12" height="34" fill="rgba(15,18,26,0.85)" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="90" cy="-58" r="2.6" fill="rgba(255,80,80,0.75)" stroke="var(--gold)" strokeWidth="0.4" />
                <circle cx="90" cy="-49" r="2.6" fill="rgba(255,210,63,0.4)" stroke="var(--gold)" strokeWidth="0.4" />
                <circle cx="90" cy="-40" r="2.6" fill="rgba(0,196,167,0.75)" stroke="var(--gold)" strokeWidth="0.4" />
                <text x="0" y="-78" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ПЕРЕХОД ПХ-3</text>
                <text x="0" y="-68" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">СВЕТОФОР · ЗН.5.19.1</text>
              </g>

              {/* Метеостанция / пост ГИБДД */}
              <g transform={`translate(${endX + 100}, 4780)`}>
                <rect x="-22" y="-26" width="44" height="52" fill="rgba(79,132,255,0.10)" stroke="var(--blue)" strokeWidth="1.2" />
                {/* Мачта с антенной */}
                <line x1="0" y1="-26" x2="0" y2="-58" stroke="var(--blue)" strokeWidth="1.4" />
                <line x1="-8" y1="-50" x2="8" y2="-50" stroke="var(--blue)" strokeWidth="1" />
                <line x1="-6" y1="-44" x2="6" y2="-44" stroke="var(--blue)" strokeWidth="1" />
                <circle cx="0" cy="-58" r="2.5" fill="var(--blue)" />
                {/* Анемометр */}
                <line x1="-12" y1="-58" x2="12" y2="-58" stroke="var(--blue)" strokeWidth="0.5" />
                <circle cx="-12" cy="-58" r="1.5" fill="var(--blue)" />
                <circle cx="12"  cy="-58" r="1.5" fill="var(--blue)" />
                <text x="-28" y="-66" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">МС-5 &laquo;ARLAN&raquo;</text>
                <text x="-28" y="-54" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">МЕТЕО · ГИБДД</text>
              </g>

              {/* Виадук через долину */}
              <g transform={`translate(${endX}, 5080)`}>
                {/* Опоры виадука */}
                {[-100, -50, 0, 50, 100].map(x => (
                  <g key={`pyl${x}`}>
                    <line x1={x} y1="0" x2={x} y2="60" stroke="var(--gold)" strokeWidth="1.6" />
                    <rect x={x-6} y="58" width="12" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
                  </g>
                ))}
                {/* Полотно виадука */}
                <line x1="-110" y1="0"   x2="110" y2="0"   stroke="var(--gold)" strokeWidth="1.6" />
                <line x1="-110" y1="-12" x2="110" y2="-12" stroke="var(--gold)" strokeWidth="1.6" />
                {/* Ферма поддерживающая */}
                <path d="M -100 0 L -75 -22 L -50 0 L -25 -22 L 0 0 L 25 -22 L 50 0 L 75 -22 L 100 0"
                  fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.6" />
                <text x="-120" y="-22" fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ВИАДУК ВД-2</text>
                <text x="-120" y="-10" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=240М · 5 ПРОЛЁТОВ · H=18М</text>
              </g>

              {/* Стоянка для большегрузов */}
              <g transform={`translate(${endX - 90}, 5400)`}>
                <rect x="-50" y="-40" width="100" height="80" fill="rgba(15,18,26,0.5)" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="4 3" />
                {/* Линии разметки парковочных мест */}
                {[-30, -10, 10, 30].map(x => (
                  <line key={`lp${x}`} x1={x} y1="-38" x2={x} y2="38" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" strokeDasharray="3 2" />
                ))}
                {/* Силуэт фуры (вид сверху) */}
                <rect x="-26" y="-30" width="20" height="14" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="-26" y="-12" width="14" height="6" fill="var(--gold)" />
                <rect x="-6" y="-2" width="20" height="14" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.7" />
                <text x="-60" y="-48" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СТОЯНКА П-9</text>
                <text x="-60" y="-36" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">8 МЕСТ · ГРУЗОВЫХ</text>
              </g>
            </g>
          </g>
        )}

        {showTransition('road', 'industry') && (
          <g transform={`translate(${endX}, ${ys(3220)})`}><ZoneTransition /></g>
        )}

        {/* ════════════════ ZONE 03 — ПРОМЫШЛЕННЫЕ ОБЪЕКТЫ ════════════════ */}
        {showZone('industry') && (
          <g clipPath={`url(#${idClip('industry')})`}>
            <path d={mainPath} stroke="rgba(212,168,67,0.04)" strokeWidth="280" fill="none" />

            <g transform={`translate(0, ${cOff('industry')})`}>
              {(() => {
                const cx = endX;
                const yTop = 3380;
                const yBot = 4720;
                const halfW = 56;
                return (
                  <>
                    <rect x={cx - halfW} y={yTop} width={halfW * 2} height={yBot - yTop} fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.6" />
                    {[3530, 3690, 3850, 4010, 4170, 4330, 4490, 4650].map(y => (
                      <line key={`pt${y}`} x1={cx - halfW} y1={y} x2={cx + halfW} y2={y} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.55" />
                    ))}
                    {Array.from({ length: 30 }, (_, i) => yTop + 20 + i * 44).map(y => (
                      <line key={`tr${y}`} x1={cx - halfW + 4} y1={y} x2={cx + halfW - 4} y2={y} stroke="var(--teal)" strokeWidth="0.4" strokeOpacity="0.3" />
                    ))}
                    {[3460, 3780, 4100, 4380, 4600].map(y => (
                      <rect key={`gL${y}`} x={cx - halfW - 14} y={y} width="14" height="36" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="0.8" />
                    ))}
                    {[3540, 3920, 4280, 4560].map(y => (
                      <rect key={`gR${y}`} x={cx + halfW} y={y} width="14" height="36" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="0.8" />
                    ))}
                    <text x={cx - halfW - 4} y={yTop - 24} fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">КОРПУС ПК-1 (ВИД СВЕРХУ)</text>
                    <text x={cx - halfW - 4} y={yTop - 10} fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=134М · B=22М · S=15000 М² · 9 СЕКЦИЙ</text>
                  </>
                );
              })()}

              {/* Административный корпус (справа от главного) */}
              <g transform={`translate(${endX + 120}, 3580)`}>
                <rect x="-22" y="-50" width="44" height="100" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-22" y1="-25" x2="22" y2="-25" stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.6" />
                <line x1="-22" y1="0"   x2="22" y2="0"   stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.6" />
                <line x1="-22" y1="25"  x2="22" y2="25"  stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.6" />
                {/* Окна-ленты */}
                {[-35, -10, 15, 40].map(y => (
                  <line key={`win${y}`} x1="-22" y1={y} x2="22" y2={y - 2} stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.4" />
                ))}
                <text x="30" y="-44" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">АДМИН АК-2</text>
                <text x="30" y="-32" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">4 ЭТАЖА · S=800 М²</text>
              </g>

              {/* Резервуарный парк (слева снизу) */}
              <g transform={`translate(${endX - 130}, 4380)`}>
                {[0, 26, 52, 78].map(dx => (
                  <g key={dx} transform={`translate(${dx}, 0)`}>
                    <circle cx="0" cy="0" r="11" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1.2" />
                    <circle cx="0" cy="0" r="6"  fill="none" stroke="var(--teal)" strokeWidth="0.6" strokeOpacity="0.5" />
                    <circle cx="0" cy="0" r="2"  fill="var(--teal)" />
                  </g>
                ))}
                <text x="-18" y="-18" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">РЕЗЕРВУАРНЫЙ ПАРК Р-1</text>
                <text x="-18" y="-8" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">4×500 М³ · ХРАНЕНИЕ</text>
              </g>

              {/* Котельная (справа снизу) */}
              <g transform={`translate(${endX + 130}, 4500)`}>
                <rect x="-30" y="-26" width="60" height="52" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.2" />
                <rect x="-22" y="-40" width="6" height="20" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="0"   y="-44" width="6" height="24" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="18"  y="-38" width="6" height="18" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.7" />
                <text x="35" y="-30" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">КОТЕЛЬНАЯ КТ-3</text>
                <text x="35" y="-18" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">3 КОТЛА · 24 МВт</text>
              </g>

              {/* Склад с эстакадой (вид сверху) */}
              <g transform={`translate(${endX}, 5400)`}>
                <rect x="-80" y="-30" width="160" height="60" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="1.4" />
                {/* Поперечные перегородки */}
                {[-50, -20, 10, 40].map(x => (
                  <line key={`pf${x}`} x1={x} y1="-30" x2={x} y2="30" stroke="var(--gold)" strokeWidth="0.7" strokeOpacity="0.5" />
                ))}
                {/* Эстакада сверху */}
                <rect x="-80" y="-44" width="160" height="10" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1" />
                {/* Ворота снизу */}
                {[-60, -25, 10, 45].map(x => (
                  <rect key={`g${x}`} x={x} y="30" width="14" height="6" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.8" />
                ))}
                <text x="-86" y="-52" fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">СКЛАД СГП-5</text>
                <text x="-86" y="-40" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=80М · ЭСТАКАДА · 4 ВОРОТ</text>
              </g>

              {/* Цех механообработки */}
              <g transform={`translate(${endX - 110}, 5950)`}>
                <rect x="-44" y="-32" width="88" height="64" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.4" />
                {/* Кран-балка */}
                <rect x="-40" y="-26" width="80" height="4" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.7" />
                <rect x="-2"  y="-26" width="4"  height="14" fill="var(--teal)" />
                {/* Станки (квадраты) */}
                {[-30, -16, -2, 12, 26].map(x => (
                  <rect key={`mc${x}`} x={x-3} y="-2" width="6" height="6" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.7" />
                ))}
                {/* Конвейер */}
                <line x1="-44" y1="14" x2="44" y2="14" stroke="var(--gold)" strokeWidth="1.6" strokeOpacity="0.7" />
                <text x="-50" y="-42" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЦЕХ МО-7</text>
                <text x="-50" y="-30" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">5 СТАНКОВ · КРАН-БАЛКА 5Т</text>
              </g>

              {/* Контейнерная площадка */}
              <g transform={`translate(${endX + 120}, 6500)`}>
                <rect x="-50" y="-40" width="100" height="80" fill="rgba(15,18,26,0.4)" stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 3" />
                {/* Контейнеры (вид сверху, в 4 ряда) */}
                {[
                  [-40, -32, 'rgba(0,196,167,0.4)'],
                  [-22, -32, 'rgba(212,168,67,0.4)'],
                  [-4,  -32, 'rgba(79,132,255,0.4)'],
                  [14,  -32, 'rgba(0,196,167,0.4)'],
                  [32,  -32, 'rgba(212,168,67,0.4)'],
                  [-40, -16, 'rgba(212,168,67,0.4)'],
                  [-22, -16, 'rgba(0,196,167,0.4)'],
                  [-4,  -16, 'rgba(212,168,67,0.4)'],
                  [14,  -16, 'rgba(79,132,255,0.4)'],
                  [-40, 0,   'rgba(79,132,255,0.4)'],
                  [-22, 0,   'rgba(212,168,67,0.4)'],
                  [-4,  0,   'rgba(0,196,167,0.4)'],
                  [14,  0,   'rgba(212,168,67,0.4)'],
                  [32,  0,   'rgba(79,132,255,0.4)'],
                  [-40, 16,  'rgba(212,168,67,0.4)'],
                  [-22, 16,  'rgba(0,196,167,0.4)'],
                  [14,  16,  'rgba(0,196,167,0.4)'],
                  [32,  16,  'rgba(212,168,67,0.4)'],
                ].map((c, i) => (
                  <rect key={`ct${i}`} x={c[0] as number} y={c[1] as number} width="14" height="12" fill={c[2] as string} stroke="var(--gold)" strokeWidth="0.4" />
                ))}
                <text x="-56" y="-50" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">КОНТЕЙНЕРНАЯ ПЛОЩАДКА КП-3</text>
                <text x="-56" y="-38" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">120 TEU · 4×5 РЯДА</text>
              </g>

              {/* Площадка отгрузки */}
              <g transform={`translate(${endX - 100}, 7050)`}>
                <rect x="-30" y="-20" width="100" height="40" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="1.2" />
                {/* Рампа */}
                <rect x="-30" y="-20" width="14" height="40" fill="rgba(0,196,167,0.10)" stroke="var(--teal)" strokeWidth="0.9" />
                {/* Грузовики на разгрузке (вид сверху) */}
                <rect x="0"  y="-14" width="22" height="10" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="26" y="-14" width="22" height="10" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="52" y="-14" width="16" height="10" fill="rgba(0,196,167,0.3)" stroke="var(--teal)" strokeWidth="0.7" />
                <rect x="0"  y="4" width="22" height="10" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.7" />
                <rect x="26" y="4" width="22" height="10" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.7" />
                <text x="-36" y="-30" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ОТГРУЗКА ОТ-4</text>
                <text x="-36" y="-18" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">РАМПА · 5 МЕСТ</text>
              </g>
            </g>
          </g>
        )}

        {showTransition('industry', 'energy') && (
          <g transform={`translate(${endX}, ${ys(4860)})`}><ZoneTransition /></g>
        )}

        {/* ════════════════ ZONE 04 — ЭНЕРГОИНФРАСТРУКТУРА ════════════════ */}
        {showZone('energy') && (
          <g clipPath={`url(#${idClip('energy')})`}>
            <path d={mainPath} stroke="rgba(79,132,255,0.08)" strokeWidth="100" fill="none" />

            <g transform={`translate(0, ${cOff('energy')})`}>
              {(() => {
                /* Список опор — 5 опор через одну относительно предыдущего набора,
                 * шаг 800 ед. вместо 400 → расстояние идеальное для провисов. */
                const LEPS = [
                  { y: 5060, label: 'ОПОРА ЛЭП-1', spec: 'U=500 кВ · H=58М' },
                  { y: 5760, label: 'ОПОРА ЛЭП-2', spec: 'U=500 кВ · H=58М' },
                  { y: 6460, label: 'ОПОРА ЛЭП-3', spec: 'U=220 кВ · H=42М' },
                  { y: 7160, label: 'ОПОРА ЛЭП-4', spec: 'U=220 кВ · H=42М' },
                  { y: 7860, label: 'ОПОРА ЛЭП-5', spec: 'U=110 кВ · H=36М' },
                ];

                /* X-координаты подвесных точек проводов — только 2 крайние
                 * (внешние фарфоровые гирлянды). Нижняя точка изоляторной
                 * гирлянды (y=-130 от центра опоры) — точка подвеса. */
                const INSULATOR_X = [-72, 72];
                const SUSPENSION_Y_REL = -130;

                return (
                  <>
                    {/* === Провода между соседними опорами (рисуем ПЕРВЫМИ,
                         чтобы изоляторы перекрывали места подвеса). === */}
                    {LEPS.slice(1).flatMap((current, i) => {
                      const prev = LEPS[i];
                      const y1 = prev.y    + SUSPENSION_Y_REL;
                      const y2 = current.y + SUSPENSION_Y_REL;
                      const midY = (y1 + y2) / 2;
                      return INSULATOR_X.map(x => {
                        /* Сагитта провисания: control point смещён к оси,
                         * провода натянуты между крайними изоляторами,
                         * прогибаются под собственным весом ~3% пролёта. */
                        const sag = 22;
                        const bowX = endX + x + (x > 0 ? -sag : sag);
                        const ax = endX + x;
                        return (
                          <path
                            key={`w${prev.y}-${current.y}-${x}`}
                            d={`M ${ax} ${y1} Q ${bowX} ${midY} ${ax} ${y2}`}
                            stroke="var(--blue)"
                            strokeWidth="1.5"
                            fill="none"
                            strokeOpacity="0.85"
                            strokeLinecap="round"
                          />
                        );
                      });
                    })}

                    {/* === Сами опоры === */}
                    {LEPS.map(({ y, label, spec }) => (
                      <g key={`lep${y}`} transform={`translate(${endX}, ${y})`}>
                        {/* Каркас опоры (диагонали + раскосы) */}
                        <line x1="-58" y1="110" x2="-20" y2="-200" stroke="var(--gold)" strokeWidth="1.6" />
                        <line x1="58"  y1="110" x2="20"  y2="-200" stroke="var(--gold)" strokeWidth="1.6" />
                        {[0,1,2,3,4,5,6,7].map(i => {
                          const t = i / 7;
                          const ry = 110 - t * 310;
                          const xL = -58 + t * 38;
                          const xR = 58 - t * 38;
                          return <line key={`tr${i}`} x1={xL} y1={ry} x2={xR} y2={ry} stroke="var(--gold)" strokeWidth="1.2" />;
                        })}
                        <line x1="-58" y1="110"  x2="20"  y2="-200" stroke="var(--gold)" strokeWidth="1.2" />
                        <line x1="58"  y1="110"  x2="-20" y2="-200" stroke="var(--gold)" strokeWidth="1.2" />
                        {/* Траверсы */}
                        <line x1="-72" y1="-160" x2="-32" y2="-160" stroke="var(--blue)" strokeWidth="1.6" />
                        <line x1="32"  y1="-160" x2="72"  y2="-160" stroke="var(--blue)" strokeWidth="1.6" />
                        <line x1="-62" y1="-110" x2="-32" y2="-110" stroke="var(--blue)" strokeWidth="1.6" />
                        <line x1="32"  y1="-110" x2="62"  y2="-110" stroke="var(--blue)" strokeWidth="1.6" />
                        {/* Изоляторные гирлянды — отсюда «свисают» провода */}
                        {INSULATOR_X.map(x => (
                          <g key={`is${x}`}>
                            <line x1={x} y1={-160} x2={x} y2={-130} stroke="var(--gold)" strokeWidth="1.2" />
                            {[0,1,2].map(i => (
                              <circle key={i} cx={x} cy={-156 + i * 8} r="2.4" fill="rgba(212,168,67,0.15)" stroke="var(--gold)" strokeWidth="1" />
                            ))}
                          </g>
                        ))}
                        <text x="-90" y="-200" fill="var(--blue)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">{label}</text>
                        <text x="-90" y="-186" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">{spec}</text>
                      </g>
                    ))}
                  </>
                );
              })()}

              {/* Ветрогенератор (между ЛЭП-5 и подстанцией) */}
              <g transform={`translate(${endX + 130}, 8200)`}>
                {/* Опора */}
                <line x1="0" y1="50" x2="0" y2="-40" stroke="var(--gold)" strokeWidth="1.6" />
                {/* Гондола */}
                <rect x="-12" y="-46" width="24" height="10" fill="rgba(79,132,255,0.18)" stroke="var(--blue)" strokeWidth="1.2" />
                {/* Лопасти (3 шт., веер) */}
                <line x1="0" y1="-41" x2="32"  y2="-65" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="-41" x2="-28" y2="-58" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="-41" x2="-4"  y2="-12" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="0" cy="-41" r="3" fill="var(--blue)" />
                {/* Фундамент */}
                <line x1="-12" y1="50" x2="12" y2="50" stroke="var(--gold)" strokeWidth="1.4" />
                <text x="22" y="-66" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">ВЭУ-3</text>
                <text x="22" y="-54" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">3.4 МВт · H=120М</text>
              </g>

              {/* Солнечная электростанция (массив панелей, вид сверху) */}
              <g transform={`translate(${endX - 110}, 8450)`}>
                <rect x="-46" y="-26" width="92" height="52" fill="rgba(15,18,26,0.5)" stroke="var(--gold)" strokeWidth="1" strokeDasharray="3 3" />
                {/* Ряды панелей */}
                {[-22, -12, -2, 8, 18].map(y => (
                  <g key={`row${y}`}>
                    {[-40, -28, -16, -4, 8, 20, 32].map(x => (
                      <rect key={`p${x}-${y}`} x={x} y={y} width="10" height="6" fill="rgba(79,132,255,0.4)" stroke="var(--blue)" strokeWidth="0.4" />
                    ))}
                  </g>
                ))}
                <text x="-52" y="-36" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СЭС &laquo;ARLAN-SOL&raquo;</text>
                <text x="-52" y="-24" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">2.8 МВт · 5040 ПАНЕЛЕЙ</text>
              </g>

              {/* Подстанция «Альфа» — на самом дне зоны */}
              <g transform={`translate(${endX}, 8700)`}>
                <rect x="-180" y="-60" width="120" height="100" fill="none" stroke="var(--gold)" strokeWidth="1.1" strokeDasharray="3 3" />
                <rect x="-170" y="-40" width="34" height="56" fill="rgba(79,132,255,0.08)" stroke="var(--blue)" strokeWidth="1.1" />
                {/* Шины подстанции */}
                <line x1="-130" y1="-40" x2="-70" y2="-40" stroke="var(--blue)" strokeWidth="1.4" />
                <line x1="-130" y1="-20" x2="-70" y2="-20" stroke="var(--blue)" strokeWidth="1.4" />
                <line x1="-130" y1="0"   x2="-70" y2="0"   stroke="var(--blue)" strokeWidth="1.4" />
                {/* Выключатели */}
                <circle cx="-110" cy="-40" r="3" fill="rgba(79,132,255,0.3)" stroke="var(--blue)" strokeWidth="0.8" />
                <circle cx="-90"  cy="-20" r="3" fill="rgba(79,132,255,0.3)" stroke="var(--blue)" strokeWidth="0.8" />
                <text x="-180" y="-72" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">ПС «АЛЬФА»</text>
                <text x="-180" y="-62" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">220/110 кВ · 125 МВА</text>
              </g>

              {/* Распределительный пункт — слева от ЛЭП-1 (вверху) */}
              <g transform={`translate(${endX - 160}, 5060)`}>
                <rect x="-22" y="-16" width="44" height="32" fill="rgba(79,132,255,0.08)" stroke="var(--blue)" strokeWidth="1.1" />
                <line x1="-22" y1="-8" x2="22" y2="-8" stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.5" />
                <line x1="-22" y1="0"  x2="22" y2="0"  stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.5" />
                <line x1="-22" y1="8"  x2="22" y2="8"  stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.5" />
                <text x="-30" y="-22" fill="var(--blue)" fontSize="7" fontFamily="monospace" textAnchor="end" fontWeight="bold">РП-6 кВ</text>
              </g>

              {/* Распределительный трансформатор — справа, между ЛЭП-3 и ЛЭП-4 */}
              <g transform={`translate(${endX + 140}, 6810)`}>
                <rect x="-18" y="-22" width="36" height="44" fill="rgba(79,132,255,0.1)" stroke="var(--blue)" strokeWidth="1.2" />
                <circle cx="-9" cy="-12" r="3" fill="none" stroke="var(--blue)" strokeWidth="0.7" />
                <circle cx="9"  cy="-12" r="3" fill="none" stroke="var(--blue)" strokeWidth="0.7" />
                <circle cx="-9" cy="0"   r="3" fill="none" stroke="var(--blue)" strokeWidth="0.7" />
                <circle cx="9"  cy="0"   r="3" fill="none" stroke="var(--blue)" strokeWidth="0.7" />
                <line x1="0" y1="-22" x2="0" y2="-40" stroke="var(--blue)" strokeWidth="1" />
                <line x1="-8" y1="-40" x2="8" y2="-40" stroke="var(--blue)" strokeWidth="1.2" />
                <text x="25" y="0" fill="var(--blue)" fontSize="7" fontFamily="monospace" textAnchor="start" fontWeight="bold">ТМ-1000</text>
                <text x="25" y="10" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">10/0.4 кВ</text>
              </g>
            </g>
          </g>
        )}

        {showTransition('energy', 'oil') && (
          <g transform={`translate(${endX}, ${ys(6500)})`}><ZoneTransition /></g>
        )}

        {/* ════════════════ ZONE 05 — НЕФТЕПРОВОДЫ ════════════════ */}
        {showZone('oil') && (
          <g clipPath={`url(#${idClip('oil')})`}>
            <g transform={`translate(0, ${cOff('oil')})`}>
              {(() => {
                const cx = endX;
                const yTop = 6600;
                const yBot = 10300;        // подогнано под ещё сокращённый бэнд (max 10440)
                const halfW = 14;
                const offset = 22;
                const pipeCenters = [cx - offset, cx + offset];
                return (
                  <>
                    {pipeCenters.map(pcx => (
                      <g key={`pipe${pcx}`}>
                        <rect x={pcx - halfW} y={yTop} width={halfW * 2} height={yBot - yTop} fill="rgba(40,28,18,0.85)" />
                        <line x1={pcx - halfW} y1={yTop} x2={pcx - halfW} y2={yBot} stroke="var(--gold)" strokeWidth="1.3" strokeOpacity="0.95" />
                        <line x1={pcx + halfW} y1={yTop} x2={pcx + halfW} y2={yBot} stroke="var(--gold)" strokeWidth="1.3" strokeOpacity="0.95" />
                        <rect x={pcx - halfW + 3} y={yTop} width="3" height={yBot - yTop} fill="rgba(255,210,150,0.22)" />
                        <rect x={pcx + halfW - 6} y={yTop} width="6" height={yBot - yTop} fill="rgba(15,10,5,0.55)" />
                        <rect x={pcx - halfW + 6} y={yTop} width={halfW * 2 - 12} height={yBot - yTop} fill="rgba(168,114,43,0.35)" />
                        <line x1={pcx - 2} y1={yTop} x2={pcx - 2} y2={yBot} stroke="rgba(255,200,140,0.45)" strokeWidth="1" />
                      </g>
                    ))}
                    {Array.from({ length: 22 }, (_, i) => yTop + 120 + i * 240).filter(y => y < yBot - 20).map(y => (
                      <g key={`fl${y}`}>
                        {pipeCenters.map(pcx => (
                          <g key={`fl${y}-${pcx}`}>
                            <rect x={pcx - halfW - 3} y={y - 3} width={halfW * 2 + 6} height="7" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.8" />
                          </g>
                        ))}
                      </g>
                    ))}
                    {Array.from({ length: 19 }, (_, i) => yTop + 240 + i * 280).filter(y => y < yBot - 50).map(y => (
                      <g key={`ar${y}`}>
                        {pipeCenters.map(pcx => (
                          <g key={`ar${y}-${pcx}`}>
                            <line x1={pcx} y1={y} x2={pcx} y2={y + 32} stroke="rgba(255,210,150,0.85)" strokeWidth="1.6" />
                            <path d={`M ${pcx - 5} ${y + 24} L ${pcx} ${y + 34} L ${pcx + 5} ${y + 24}`} fill="none" stroke="rgba(255,210,150,0.9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </g>
                        ))}
                      </g>
                    ))}
                  </>
                );
              })()}

              <g transform={`translate(${endX}, 6900)`}>
                <rect x="-22" y="-44" width="44" height="64" fill="rgba(212,168,67,0.08)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="0" y1="-44" x2="0" y2="-78" stroke="var(--gold)" strokeWidth="1.6" />
                <circle cx="0" cy="-86" r="16" fill="rgba(0,196,167,0.05)" stroke="var(--teal)" strokeWidth="1.4" />
                <circle cx="0" cy="-86" r="6" fill="none" stroke="var(--teal)" strokeWidth="1" />
                <text x="-30" y="-90" fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЗАДВИЖКА З-16</text>
                <text x="-30" y="-76" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">DN-700 · PN-6.3 МПа</text>
              </g>

              <g transform={`translate(${endX}, 7250)`}>
                <rect x="-180" y="-72" width="140" height="130" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx="-150" cy="-22" r="16" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.2" />
                <circle cx="-100" cy="-22" r="16" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.2" />
                <text x="-180" y="-86" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">НПС-3 «АРЛАН»</text>
                <text x="-180" y="-76" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">2×7 МВт · Q=10000 м³/ч</text>
              </g>

              <g transform={`translate(${endX}, 7650)`}>
                <path d="M 0 0 L 0 -40 L -130 -40 L -130 -200 L 0 -200 L 0 -240" fill="none" stroke="var(--gold)" strokeWidth="6" strokeOpacity="0.85" />
                <path d="M 0 0 L 0 -40 L -130 -40 L -130 -200 L 0 -200 L 0 -240" fill="none" stroke="#A8722B" strokeWidth="2" strokeOpacity="0.95" />
                <text x="-65" y="-114" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">КОМПЕНСАТОР К-2</text>
                <text x="-65" y="-104" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">П-ОБРАЗНЫЙ · ΔL=320мм</text>
              </g>

              {/* Резервуар нефти (справа от труб, вверху) */}
              <g transform={`translate(${endX + 130}, 6760)`}>
                <rect x="-26" y="-36" width="52" height="72" fill="rgba(40,28,18,0.6)" stroke="var(--gold)" strokeWidth="1.4" />
                <rect x="-26" y="-36" width="52" height="8" fill="rgba(212,168,67,0.18)" />
                {/* Кольца жесткости */}
                <line x1="-26" y1="-16" x2="26" y2="-16" stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1="-26" y1="4"   x2="26" y2="4"   stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1="-26" y1="24"  x2="26" y2="24"  stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.4" />
                {/* Уровнемер */}
                <line x1="0" y1="-28" x2="0" y2="28" stroke="var(--gold)" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.5" />
                {/* Замерный люк */}
                <circle cx="0" cy="-36" r="3" fill="rgba(212,168,67,0.3)" stroke="var(--gold)" strokeWidth="0.6" />
                <text x="32" y="-40" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">РВС-5000</text>
                <text x="32" y="-28" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">V=5000 М³ · НЕФТЬ</text>
              </g>

              {/* Вторая задвижка (резервная) */}
              <g transform={`translate(${endX + 90}, 7950)`}>
                <rect x="-18" y="-32" width="36" height="48" fill="rgba(212,168,67,0.08)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="0" y1="-32" x2="0" y2="-58" stroke="var(--gold)" strokeWidth="1.6" />
                <circle cx="0" cy="-66" r="12" fill="rgba(0,196,167,0.05)" stroke="var(--teal)" strokeWidth="1.4" />
                <circle cx="0" cy="-66" r="4"  fill="none" stroke="var(--teal)" strokeWidth="1" />
                <line x1="-12" y1="-66" x2="12" y2="-66" stroke="var(--teal)" strokeWidth="0.6" />
                <line x1="0" y1="-78"   x2="0"  y2="-54" stroke="var(--teal)" strokeWidth="0.6" />
                <text x="22" y="-68" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">ЗАДВИЖКА З-22</text>
                <text x="22" y="-56" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">DN-700 · РЕЗЕРВНАЯ</text>
              </g>

              {/* Манифольд */}
              <g transform={`translate(${endX - 100}, 8400)`}>
                <rect x="-32" y="-30" width="64" height="60" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.4" />
                {/* Коллектор */}
                <line x1="-32" y1="-18" x2="32" y2="-18" stroke="var(--gold)" strokeWidth="1.6" strokeOpacity="0.7" />
                <line x1="-32" y1="0"   x2="32" y2="0"   stroke="var(--gold)" strokeWidth="1.6" strokeOpacity="0.7" />
                <line x1="-32" y1="18"  x2="32" y2="18"  stroke="var(--gold)" strokeWidth="1.6" strokeOpacity="0.7" />
                {/* Краны */}
                {[-20, -8, 4, 16].map(x => (
                  <g key={`v${x}`}>
                    <circle cx={x} cy="-18" r="3" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.7" />
                    <circle cx={x} cy="0"   r="3" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.7" />
                    <circle cx={x} cy="18"  r="3" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.7" />
                  </g>
                ))}
                <text x="-38" y="-40" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">МАНИФОЛЬД М-5</text>
                <text x="-38" y="-28" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3 КОЛЛЕКТОРА · 12 КРАНОВ</text>
              </g>

              {/* Сепаратор НГС */}
              <g transform={`translate(${endX + 110}, 9000)`}>
                {/* Горизонтальный цилиндр */}
                <ellipse cx="0" cy="0" rx="40" ry="14" fill="rgba(168,114,43,0.30)" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="-40" y1="-14" x2="-40" y2="14" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="40"  y1="-14" x2="40"  y2="14" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="2 2" />
                {/* Уровень жидкости */}
                <line x1="-36" y1="3" x2="36" y2="3" stroke="rgba(255,210,150,0.6)" strokeWidth="0.8" />
                {/* Патрубки */}
                <line x1="-40" y1="0" x2="-54" y2="0" stroke="var(--gold)" strokeWidth="1.2" />
                <line x1="40"  y1="-4" x2="54" y2="-4" stroke="var(--blue)" strokeWidth="1.2" />
                <line x1="40"  y1="8"  x2="54" y2="8"  stroke="var(--gold)" strokeWidth="1.2" />
                {/* Опоры */}
                <line x1="-20" y1="14" x2="-20" y2="22" stroke="var(--gold)" strokeWidth="1" />
                <line x1="20"  y1="14" x2="20"  y2="22" stroke="var(--gold)" strokeWidth="1" />
                <text x="-46" y="-22" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СЕПАРАТОР НГС-4</text>
                <text x="-46" y="-10" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">V=50 М³ · 3-ФАЗНЫЙ</text>
              </g>

              {/* Резервуарный парк-2 (вид сверху) */}
              <g transform={`translate(${endX - 130}, 9600)`}>
                {[0, 30, 60].map((dx) => (
                  <g key={dx} transform={`translate(${dx}, 0)`}>
                    <circle cx="0" cy="-14" r="13" fill="rgba(40,28,18,0.6)" stroke="var(--gold)" strokeWidth="1.2" />
                    <circle cx="0" cy="-14" r="7"  fill="none" stroke="var(--gold)" strokeWidth="0.6" strokeOpacity="0.5" />
                    <circle cx="0" cy="14" r="13" fill="rgba(40,28,18,0.6)" stroke="var(--gold)" strokeWidth="1.2" />
                    <circle cx="0" cy="14" r="7"  fill="none" stroke="var(--gold)" strokeWidth="0.6" strokeOpacity="0.5" />
                  </g>
                ))}
                <text x="-22" y="-34" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">РЕЗЕРВУАРНЫЙ ПАРК Р-2</text>
                <text x="-22" y="-22" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">6×3000 М³ · ТОВАРНАЯ НЕФТЬ</text>
              </g>

              {/* Нефтяная скважина с качалкой */}
              <g transform={`translate(${endX + 130}, 10200)`}>
                {/* Основание */}
                <rect x="-18" y="14" width="36" height="6" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
                {/* Стойка балансира */}
                <line x1="0" y1="14" x2="-2" y2="-20" stroke="var(--gold)" strokeWidth="1.4" />
                <line x1="0" y1="14" x2="2"  y2="-20" stroke="var(--gold)" strokeWidth="1.4" />
                {/* Балансир */}
                <line x1="-22" y1="-26" x2="22" y2="-22" stroke="var(--gold)" strokeWidth="2" />
                <circle cx="-22" cy="-26" r="3" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1" />
                <circle cx="22"  cy="-22" r="3" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1" />
                {/* Шток в скважину */}
                <line x1="-22" y1="-26" x2="-22" y2="20" stroke="var(--gold)" strokeWidth="1" />
                {/* Устье скважины */}
                <rect x="-26" y="20" width="8" height="6" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.8" />
                {/* Противовес */}
                <rect x="18" y="-26" width="10" height="6" fill="var(--gold)" />
                <text x="-32" y="-36" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">СКВ-58 «АРЛАН»</text>
                <text x="-32" y="-24" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">СКН · Q=18 М³/сут</text>
              </g>
            </g>
          </g>
        )}

        {showTransition('oil', 'gas') && (
          <g transform={`translate(${endX}, ${ys(8140)})`}><ZoneTransition /></g>
        )}

        {/* ════════════════ ZONE 06 — ГАЗОПРОВОДЫ ════════════════ */}
        {showZone('gas') && (
          <g clipPath={`url(#${idClip('gas')})`}>
            <path d={mainPath} stroke="rgba(0, 196, 167, 0.18)" strokeWidth="58" fill="none" />
            <path d={mainPath} stroke="var(--teal)" strokeWidth="58" strokeOpacity="0.85" fill="none" mask={`url(#${idHol40})`} />
            <path d={mainPath} stroke="rgba(0, 196, 167, 0.45)" strokeWidth="22" strokeDasharray="4 8" fill="none" />
            <path d={mainPath} stroke="#FFD23F" strokeWidth="60" strokeDasharray="4 80" strokeOpacity="0.55" fill="none" />
            <path d={mainPath} stroke="#FFD23F" strokeWidth="2.5" strokeOpacity="0.95" fill="none" />

            <g transform={`translate(0, ${cOff('gas')})`}>
              <g transform={`translate(${endX}, 8540)`}>
                <rect x="-300" y="-90" width="220" height="160" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1.5" />
                <text x="-300" y="-105" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">ГРС «БЕТА»</text>
                <text x="-300" y="-92" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">P=5.5 МПа · Q=120000 нм³/ч</text>
              </g>

              <g transform={`translate(${endX}, 8890)`}>
                <circle cx="0" cy="0" r="24" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.5" />
                <line x1="-24" y1="0" x2="24" y2="0" stroke="var(--teal)" strokeWidth="1" />
                <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--teal)" strokeWidth="1" />
                <text x="-30" y="-56" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">КРАН ШК-9</text>
                <text x="-30" y="-42" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">DN-1000 · PN-10.0 МПа</text>
              </g>

              <g transform={`translate(${endX}, 9240)`}>
                <line x1="-180" y1="100" x2="-180" y2="-200" stroke="var(--teal)" strokeWidth="2" />
                <path d="M -180 -200 L -168 -224 L -180 -240 L -192 -224 Z" fill="rgba(255,210,63,0.18)" stroke="#FFD23F" strokeWidth="1" />
                <text x="-130" y="-220" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">СВЕЧА СВ-1</text>
                <text x="-130" y="-206" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">H=60М · АВАРИЙНЫЙ СБРОС</text>
              </g>

              {/* Компрессорная станция (вверху зоны) */}
              <g transform={`translate(${endX + 90}, 8340)`}>
                <rect x="-60" y="-30" width="120" height="86" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="1.2" />
                {/* 3 ГПА */}
                {[-44, -16, 12].map(x => (
                  <g key={`gpa${x}`}>
                    <rect x={x} y="-20" width="20" height="24" fill="rgba(0,196,167,0.1)" stroke="var(--teal)" strokeWidth="0.9" />
                    <circle cx={x + 10} cy="-8" r="4" fill="rgba(0,196,167,0.18)" stroke="var(--teal)" strokeWidth="0.6" />
                    <line x1={x + 10} y1="-12" x2={x + 10} y2="-4" stroke="var(--teal)" strokeWidth="0.6" />
                    <line x1={x + 6}  y1="-8"  x2={x + 14} y2="-8" stroke="var(--teal)" strokeWidth="0.6" />
                  </g>
                ))}
                {/* Резервный ГПА */}
                <rect x="40" y="-20" width="20" height="24" fill="none" stroke="var(--teal)" strokeWidth="0.7" strokeDasharray="2 2" />
                {/* Коллектор */}
                <line x1="-60" y1="24" x2="60" y2="24" stroke="var(--gold)" strokeWidth="1.6" strokeOpacity="0.7" />
                {/* Маслохозяйство */}
                <rect x="-50" y="36" width="30" height="14" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="0.8" />
                <text x="-60" y="-40" fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">КС «ГАММА»</text>
                <text x="-60" y="-32" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">3×ГПА-25 + резерв · N=75 МВт</text>
              </g>

              {/* Второй шаровый кран */}
              <g transform={`translate(${endX - 120}, 9020)`}>
                <circle cx="0" cy="0" r="22" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.5" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="var(--teal)" strokeWidth="1" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="var(--teal)" strokeWidth="1" />
                <circle cx="0" cy="0" r="9" fill="none" stroke="var(--teal)" strokeWidth="0.7" />
                <line x1="0" y1="-22" x2="0" y2="-48" stroke="var(--gold)" strokeWidth="2" />
                <rect x="-14" y="-66" width="28" height="20" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.2" />
                <text x="-26" y="-52" fill="var(--gold)" fontSize="7" fontFamily="monospace" textAnchor="end" fontWeight="bold">М</text>
                <text x="-26" y="-40" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">КРАН ШК-12</text>
                <text x="-26" y="-28" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">DN-800 · РЕЗЕРВНЫЙ</text>
              </g>

              {/* ГРП-2 — газораспределительный пункт */}
              <g transform={`translate(${endX + 120}, 9700)`}>
                <rect x="-30" y="-26" width="60" height="52" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1.4" />
                {/* Регуляторы давления */}
                {[-18, -6, 6, 18].map(x => (
                  <g key={`reg${x}`}>
                    <rect x={x-4} y="-16" width="8" height="20" fill="none" stroke="var(--gold)" strokeWidth="0.9" />
                    <circle cx={x} cy="-6" r="2" fill="rgba(212,168,67,0.4)" stroke="var(--gold)" strokeWidth="0.6" />
                  </g>
                ))}
                {/* Манометры */}
                {[-12, 12].map(x => (
                  <circle key={`mg${x}`} cx={x} cy="14" r="3" fill="none" stroke="var(--gold)" strokeWidth="0.7" />
                ))}
                <text x="-36" y="-36" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ГРП-2</text>
                <text x="-36" y="-24" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">P=1.2/0.3 МПа · 4 РЕГУЛ.</text>
              </g>

              {/* Одорант-станция */}
              <g transform={`translate(${endX - 100}, 10300)`}>
                {/* Резервуар одоранта */}
                <ellipse cx="0" cy="-10" rx="14" ry="8" fill="rgba(255,210,63,0.18)" stroke="#FFD23F" strokeWidth="1.2" />
                <rect x="-14" y="-10" width="28" height="30" fill="rgba(255,210,63,0.10)" stroke="#FFD23F" strokeWidth="1" />
                <ellipse cx="0" cy="20" rx="14" ry="8" fill="rgba(255,210,63,0.25)" stroke="#FFD23F" strokeWidth="1.2" />
                {/* Дозатор */}
                <line x1="0" y1="20" x2="0" y2="40" stroke="var(--gold)" strokeWidth="1" />
                <rect x="-6" y="40" width="12" height="8" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.8" />
                <text x="-22" y="-22" fill="#FFD23F" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">ОДОРАНТ ОУ-1</text>
                <text x="-22" y="-10" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">ЭТИЛМЕРКАПТАН · 16 мг/м³</text>
              </g>

              {/* Замерная установка */}
              <g transform={`translate(${endX + 110}, 10900)`}>
                <rect x="-26" y="-22" width="52" height="44" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1.4" />
                {/* Расходомеры (3 шт) */}
                {[-14, 0, 14].map(x => (
                  <g key={`rm${x}`}>
                    <circle cx={x} cy="-8" r="5" fill="none" stroke="var(--teal)" strokeWidth="0.9" />
                    <line x1={x-2.5} y1="-8" x2={x+2.5} y2="-8" stroke="var(--teal)" strokeWidth="0.6" />
                    <line x1={x} y1="-10.5" x2={x} y2="-5.5" stroke="var(--teal)" strokeWidth="0.6" />
                  </g>
                ))}
                {/* Коллектор */}
                <line x1="-26" y1="8" x2="26" y2="8" stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.7" />
                {/* Шкаф автоматики */}
                <rect x="-12" y="12" width="24" height="8" fill="rgba(79,132,255,0.10)" stroke="var(--blue)" strokeWidth="0.8" />
                <text x="-30" y="-30" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="end" fontWeight="bold">УЗЛ ЗАМЕРА ИК-3</text>
                <text x="-30" y="-18" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">3×Q · АКТ КОММЕРЧЕСКИЙ</text>
              </g>

              {/* Газовая скважина с фонтанной арматурой */}
              <g transform={`translate(${endX - 130}, 11500)`}>
                {/* Колонна */}
                <line x1="0" y1="20" x2="0" y2="-12" stroke="var(--teal)" strokeWidth="2" />
                {/* Крестовина */}
                <line x1="-14" y1="-12" x2="14" y2="-12" stroke="var(--teal)" strokeWidth="1.6" />
                {/* Задвижки на крестовине */}
                {[-14, 14].map(x => (
                  <rect key={`fv${x}`} x={x-4} y="-20" width="8" height="8" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.8" />
                ))}
                {/* Верхняя арматура */}
                <rect x="-6" y="-30" width="12" height="18" fill="rgba(0,196,167,0.10)" stroke="var(--teal)" strokeWidth="1.2" />
                <circle cx="0" cy="-36" r="6" fill="none" stroke="var(--teal)" strokeWidth="1.4" />
                <line x1="-6" y1="-36" x2="6" y2="-36" stroke="var(--teal)" strokeWidth="0.7" />
                <line x1="0"  y1="-42" x2="0" y2="-30" stroke="var(--teal)" strokeWidth="0.7" />
                {/* Основание */}
                <rect x="-12" y="18" width="24" height="6" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
                <text x="22" y="-30" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">СКВ-12 ГАЗ</text>
                <text x="22" y="-18" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">P=12.5 МПа · Q=85000 м³/сут</text>
              </g>

              {/* Свеча-2 (резервная) */}
              <g transform={`translate(${endX + 80}, 12000)`}>
                <line x1="0" y1="60" x2="0" y2="-80" stroke="var(--teal)" strokeWidth="1.6" />
                {/* Решётка опоры */}
                {[40, 10, -20, -50].map(y => (
                  <line key={`gr${y}`} x1="-14" y1={y} x2="14" y2={y} stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.6" />
                ))}
                {/* Растяжки */}
                <line x1="0" y1="-40" x2="-30" y2="60" stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                <line x1="0" y1="-40" x2="30"  y2="60" stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                {/* Пламя */}
                <path d="M 0 -80 L -8 -100 L 0 -114 L 8 -100 Z" fill="rgba(255,210,63,0.18)" stroke="#FFD23F" strokeWidth="0.8" />
                <text x="22" y="-100" fill="var(--teal)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">СВЕЧА СВ-2</text>
                <text x="22" y="-88" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">H=40М · РЕЗЕРВНАЯ</text>
              </g>
            </g>
          </g>
        )}

        {/* Логотипы переходов между бэндами (только в dual-режиме — single
            использует свои inter-zone переходы через showTransition). */}
        {visible !== 'full' && (
          <>
            <g transform={`translate(${endX}, ${ys((BANDS_PAIRED[0].y1 + BANDS_PAIRED[1].y0) / 2)})`}>
              <ZoneTransition />
            </g>
            <g transform={`translate(${endX}, ${ys((BANDS_PAIRED[1].y1 + BANDS_PAIRED[2].y0) / 2)})`}>
              <ZoneTransition />
            </g>
          </>
        )}
      </g>

      {showTip && tipGroupRef && (
        <>
          <g ref={tipGroupRef} style={{ willChange: 'transform' }}>
            <circle cx="0" cy="0" r="50" fill="var(--gold)" opacity="0.04" />
            <circle cx="0" cy="0" r="36" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="8 8" style={{ animation: 'spin 5s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
            <line x1="-160" y1="0" x2="-44" y2="0" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="6 4" />
            <line x1="44" y1="0" x2="160" y2="0" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="6 4" />
            <g transform="scale(0.045) translate(-360, -317)">
              <path fill="var(--gold)" d={WAG_TRI} />
            </g>
            <text ref={tipZoneRef} x="-170" y="4" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              [WAG_АКТИВНО]
            </text>
            <text ref={tipTextRef} x="170" y="4" fill="var(--gold)" fontSize="15" fontFamily="monospace" textAnchor="start" fontWeight="bold" letterSpacing="1px">
              P:0x0
            </text>
          </g>
          <path ref={corePathRef} d={mainPath} fill="none" stroke="none" />
        </>
      )}
    </g>
  );
}

function ZoneTransition() {
  return (
    <g>
      <g transform="scale(0.095) translate(-360, -317)">
        <path fill="var(--gold)" fillOpacity="0.95" d={WAG_TRI} />
      </g>
    </g>
  );
}
