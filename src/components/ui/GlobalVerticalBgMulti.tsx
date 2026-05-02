'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  МНОГОТЕМАТИЧЕСКАЯ ИНЖЕНЕРНАЯ АНИМАЦИЯ — WEST ARLAN GROUP        ║
// ║  Шесть инфраструктурных зон, объединённых одной чертёжной линией ║
// ║  ЖД → АВТО → ПРОМ → ЭНЕРГО → НЕФТЬ → ГАЗ                        ║
// ║  Между зонами треугольный логотип WAG выполняет переход          ║
// ╚══════════════════════════════════════════════════════════════════╝

const ZONES = [
  { id: 'rail',     y0: -200, y1: 1480, num: '01', tag: 'RAIL' },
  { id: 'road',     y0: 1680, y1: 3120, num: '02', tag: 'ROAD' },
  { id: 'industry', y0: 3320, y1: 4760, num: '03', tag: 'INDU' },
  { id: 'energy',   y0: 4960, y1: 6400, num: '04', tag: 'ENRG' },
  { id: 'oil',      y0: 6600, y1: 8040, num: '05', tag: 'OIL'  },
  { id: 'gas',      y0: 8240, y1: 9680, num: '06', tag: 'GAS'  },
] as const;

const WAG_TRI = "M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z";

export default function GlobalVerticalBgMulti() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [w, setW] = useState(1440);
  const [footerVisible, setFooterVisible] = useState(false);

  const svgWrapperRef = useRef<SVGSVGElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const tipGroupRef = useRef<SVGGElement>(null);
  const tipTextRef = useRef<SVGTextElement>(null);
  const tipZoneRef = useRef<SVGTextElement>(null);
  const corePathRef = useRef<SVGPathElement>(null);

  const [, setPathLen] = useState(9700);

  useEffect(() => {
    setMounted(true);
    setW(window.innerWidth);

    let pathLenToUse = 9700;
    if (corePathRef.current) {
      pathLenToUse = corePathRef.current.getTotalLength();
      setPathLen(pathLenToUse);
    }

    let animationFrameId: number;
    let startTime: number | null = null;
    const DURATION = 22000;

    const drawLoop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const currentDrawLength = pathLenToUse * progress;
      const dashOffset = pathLenToUse - currentDrawLength;

      if (maskPathRef.current) {
        maskPathRef.current.style.strokeDasharray = `${pathLenToUse}`;
        maskPathRef.current.style.strokeDashoffset = `${dashOffset}`;
      }

      if (tipGroupRef.current && corePathRef.current) {
        const point = corePathRef.current.getPointAtLength(currentDrawLength);
        tipGroupRef.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
        if (tipTextRef.current) {
          tipTextRef.current.textContent = `P:${Math.floor(point.x)}x${Math.floor(point.y)}`;
        }
        if (tipZoneRef.current) {
          const z = ZONES.find(zn => point.y >= zn.y0 - 200 && point.y <= zn.y1 + 200);
          tipZoneRef.current.textContent = z ? `[${z.tag}_${z.num}]` : `[ПЕРЕХОД]`;
        }
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
      if (corePathRef.current) {
        const newLen = corePathRef.current.getTotalLength();
        setPathLen(newLen);
        pathLenToUse = newLen;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    // Скрываем анимацию когда футер появляется во viewport — обходим проблему стэкинга
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

  if (!mounted || w < 900 || pathname.startsWith('/admin')) return null;

  const startX = w * 0.2;
  const endX = w * 0.85;
  const mainPath = `M ${startX} -100
                    C ${startX} 150, ${endX} 50, ${endX} 300
                    V 9700`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none', opacity: footerVisible ? 0 : 1, transition: 'opacity 0.35s ease' }} aria-hidden="true">
      <svg ref={svgWrapperRef} width="100%" height="9700" style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}>
        <defs>
          {/* Маски для двойных параллельных линий (рельсы / трубы / провода) */}
          <mask id="hollowMask24">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="24" fill="none" />
          </mask>
          <mask id="hollowMask40">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="40" fill="none" />
          </mask>
          <mask id="hollowMask60">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="60" fill="none" />
          </mask>
          <mask id="trackBandMask">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="120" fill="none" />
          </mask>

          {/* Зональные клипы — каждая зона видна только в своём диапазоне Y */}
          {ZONES.map(zone => (
            <clipPath key={zone.id} id={`clip-${zone.id}`}>
              <rect x="0" y={zone.y0} width="100%" height={zone.y1 - zone.y0} />
            </clipPath>
          ))}

          {/* Главная маска прогрессивного рисования (тот же приём, что в оригинале) */}
          <mask id="drawMask">
            <path ref={maskPathRef} d={mainPath} stroke="#FFF" strokeWidth="600" fill="none" style={{ willChange: 'stroke-dashoffset' }} />
          </mask>
        </defs>

        <g mask="url(#drawMask)">
          {/* ════════════════ ZONE 01 — ЖЕЛЕЗНАЯ ДОРОГА ════════════════ */}
          <g clipPath="url(#clip-rail)">
            <path d={mainPath} stroke="rgba(4,6,12, 0.6)" strokeWidth="80" fill="none" />
            <path d={mainPath} stroke="var(--teal)" strokeWidth="122" strokeDasharray="10 10" strokeOpacity="0.8" fill="none" mask="url(#trackBandMask)" />
            <path d={mainPath} stroke="var(--gold)" strokeWidth="56" strokeDasharray="6 38" strokeOpacity="0.4" fill="none" />
            <path d={mainPath} stroke="var(--gold)" strokeWidth="34" strokeOpacity="0.9" fill="none" mask="url(#hollowMask24)" />

            {/* ЖД мост — фермы Уоррена */}
            <g transform={`translate(${endX}, 700)`}>
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

            {/* Стрелочный перевод */}
            <g transform={`translate(${endX}, 1000)`}>
              <circle cx="0" cy="0" r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
              <rect x="-3" y="-3" width="6" height="6" fill="var(--gold)" />
              <path d="M 0 0 C -30 80, -80 150, -160 230 L -160 350" stroke="var(--gold)" strokeWidth="42" strokeDasharray="6 38" strokeOpacity="0.3" fill="none" />
              <path d="M -12 0 C -42 80, -92 150, -172 230 L -172 350" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
              <path d="M 12 0 C -18 80, -68 150, -148 230 L -148 350" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
              <text x="-180" y="240" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">СТРЕЛКА №14</text>
              <text x="-180" y="256" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">МАРКА КРЕСТОВИНЫ 1/11</text>
            </g>
          </g>

          {/* ── ПЕРЕХОД 01 → 02 ── */}
          <g transform={`translate(${endX}, 1580)`}>
            <ZoneTransition />
          </g>

          {/* ════════════════ ZONE 02 — АВТОДОРОГА ════════════════ */}
          <g clipPath="url(#clip-road)">
            {/* Асфальтовое полотно */}
            <path d={mainPath} stroke="rgba(15, 18, 26, 0.85)" strokeWidth="100" fill="none" />
            {/* Белые краевые линии разметки */}
            <path d={mainPath} stroke="rgba(255,255,255,0.55)" strokeWidth="100" fill="none" mask="url(#hollowMask60)" />
            {/* Центральная пунктирная (золотая) */}
            <path d={mainPath} stroke="var(--gold)" strokeWidth="3" strokeDasharray="20 14" strokeOpacity="0.95" fill="none" />

            {/* Дорожный знак — указатель направлений М-2 */}
            <g transform={`translate(${endX}, 2030)`}>
              {/* Две стойки знака с фундаментами */}
              <line x1="-200" y1="0" x2="-200" y2="60" stroke="var(--gold)" strokeWidth="1.6" />
              <line x1="-100" y1="0" x2="-100" y2="60" stroke="var(--gold)" strokeWidth="1.6" />
              <rect x="-208" y="58" width="16" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />
              <rect x="-108" y="58" width="16" height="6" fill="none" stroke="var(--gold)" strokeWidth="1" />

              {/* Синий прямоугольный щит */}
              <rect x="-220" y="-46" width="140" height="46" fill="rgba(79,132,255,0.18)" stroke="var(--blue)" strokeWidth="1.6" />
              {/* Белая рамка внутри */}
              <rect x="-216" y="-42" width="132" height="38" fill="none" stroke="rgba(240,242,248,0.45)" strokeWidth="0.5" />

              {/* Текст направлений */}
              <text x="-150" y="-30" fill="rgba(240,242,248,0.95)" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="0.5px">АСТАНА — АКТОБЕ</text>

              {/* Щит маршрута M-2 (жёлтый/золотой) */}
              <rect x="-178" y="-22" width="56" height="18" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1.4" />
              {/* Вертикальные риски-разделители как "| M2 |" */}
              <line x1="-172" y1="-20" x2="-172" y2="-6" stroke="var(--gold)" strokeWidth="0.8" />
              <line x1="-128" y1="-20" x2="-128" y2="-6" stroke="var(--gold)" strokeWidth="0.8" />
              <text x="-150" y="-9" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">M-2</text>

              {/* Заголовок (служебный) */}
              <text x="-225" y="-58" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">УКАЗАТЕЛЬ Н-04</text>
              <text x="-225" y="-50" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">5.27.1 · РЕСП.ТРАССА</text>
            </g>

            {/* Путепровод (узкий) */}
            <g transform={`translate(${endX}, 2380)`}>
              <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="-110" y1="-22" x2="110" y2="-22" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
              <path d="M -110 0 L -82 -22 L -55 0 L -28 -22 L 0 0 L 28 -22 L 55 0 L 82 -22 L 110 0" fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.5" />
              <rect x="-115" y="-30" width="6" height="80" fill="none" stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="109" y="-30" width="6" height="80" fill="none" stroke="var(--teal)" strokeWidth="1" strokeDasharray="4 3" />
              <text x="-120" y="-32" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ПУТЕПРОВОД ПП-3</text>
              <text x="-120" y="-17" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=24М · ПРОЛЁТ БАЛОЧНЫЙ</text>
            </g>

            {/* Светофор + пешеходный переход + знак */}
            <g transform={`translate(${endX}, 2580)`}>
              {/* Зебра — белые поперечные полосы по асфальту */}
              {[0,1,2,3,4,5].map(i => (
                <rect key={`zb${i}`} x={-50 + i*18} y="-9" width="10" height="18" fill="rgba(255,255,255,0.65)" />
              ))}
              {/* Стоп-линия перед зеброй */}
              <line x1="-50" y1="-14" x2="58" y2="-14" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />

              {/* Стойка светофора слева */}
              <line x1="-78" y1="14" x2="-78" y2="-44" stroke="var(--gold)" strokeWidth="1.4" />
              <line x1="-83" y1="14" x2="-73" y2="14" stroke="var(--gold)" strokeWidth="1" />
              {/* Кронштейн */}
              <line x1="-78" y1="-44" x2="-92" y2="-44" stroke="var(--gold)" strokeWidth="1.2" />
              {/* Корпус светофора (3-секционный) */}
              <rect x="-100" y="-90" width="16" height="44" fill="rgba(15,18,26,0.85)" stroke="var(--gold)" strokeWidth="1.2" />
              {/* Козырьки ламп */}
              <path d="M -103 -82 L -100 -82 L -100 -78" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
              <path d="M -103 -68 L -100 -68 L -100 -64" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
              <path d="M -103 -54 L -100 -54 L -100 -50" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
              {/* Лампы R-Y-G */}
              <circle cx="-92" cy="-80" r="3.5" fill="rgba(255,80,80,0.75)" stroke="var(--gold)" strokeWidth="0.5" />
              <circle cx="-92" cy="-68" r="3.5" fill="rgba(255,210,63,0.4)" stroke="var(--gold)" strokeWidth="0.5" />
              <circle cx="-92" cy="-56" r="3.5" fill="rgba(0,196,167,0.75)" stroke="var(--gold)" strokeWidth="0.5" />

              {/* Стойка знака пешеходного перехода справа */}
              <line x1="78" y1="14" x2="78" y2="-30" stroke="var(--gold)" strokeWidth="1.4" />
              <line x1="73" y1="14" x2="83" y2="14" stroke="var(--gold)" strokeWidth="1" />
              {/* Знак 5.19.1 — синий квадрат с пешеходом */}
              <rect x="60" y="-72" width="36" height="36" fill="rgba(79,132,255,0.22)" stroke="var(--blue)" strokeWidth="1.4" />
              <rect x="62" y="-70" width="32" height="32" fill="none" stroke="rgba(240,242,248,0.5)" strokeWidth="0.5" />
              {/* Зебра внутри знака */}
              <line x1="64" y1="-42" x2="92" y2="-42" stroke="rgba(240,242,248,0.6)" strokeWidth="0.6" />
              <line x1="66" y1="-44" x2="66" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              <line x1="71" y1="-44" x2="71" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              <line x1="76" y1="-44" x2="76" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              <line x1="81" y1="-44" x2="81" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              <line x1="86" y1="-44" x2="86" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              <line x1="91" y1="-44" x2="91" y2="-40" stroke="rgba(240,242,248,0.7)" strokeWidth="0.6" />
              {/* Силуэт пешехода */}
              <circle cx="78" cy="-62" r="2.4" fill="none" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
              <line x1="78" y1="-60" x2="78" y2="-52" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
              <line x1="78" y1="-57" x2="74" y2="-54" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
              <line x1="78" y1="-57" x2="83" y2="-55" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
              <line x1="78" y1="-52" x2="74" y2="-46" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />
              <line x1="78" y1="-52" x2="82" y2="-46" stroke="rgba(240,242,248,0.85)" strokeWidth="0.7" />

              <text x="-105" y="-105" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">УЗЕЛ ПЕРЕХОД-7</text>
              <text x="-105" y="-94" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">СВЕТОФОР · ЗН.5.19.1 · ЗЕБРА</text>
            </g>

            {/* Кольцевая развязка с перекрёстком (короткие боковые отводы) */}
            <g transform={`translate(${endX}, 2780)`}>
              {/* Левый отвод дороги */}
              <rect x="-160" y="-22" width="100" height="44" fill="rgba(15,18,26,0.85)" />
              <line x1="-160" y1="-22" x2="-58" y2="-22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
              <line x1="-160" y1="22" x2="-58" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
              <line x1="-150" y1="0" x2="-72" y2="0" stroke="var(--gold)" strokeWidth="2" strokeDasharray="10 8" strokeOpacity="0.95" />
              {/* Правый отвод дороги */}
              <rect x="60" y="-22" width="100" height="44" fill="rgba(15,18,26,0.85)" />
              <line x1="58" y1="-22" x2="160" y2="-22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
              <line x1="58" y1="22" x2="160" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
              <line x1="72" y1="0" x2="150" y2="0" stroke="var(--gold)" strokeWidth="2" strokeDasharray="10 8" strokeOpacity="0.95" />
              {/* Кольцо развязки поверх */}
              <circle cx="0" cy="0" r="58" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.7" />
              <circle cx="0" cy="0" r="38" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.7" />
              <circle cx="0" cy="0" r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1.5" />
              {/* Стрелки направлений на 4 съездах */}
              <path d="M 0 -58 L -8 -76 M 0 -58 L 8 -76" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
              <path d="M 58 0 L 76 -8 M 58 0 L 76 8" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
              <path d="M -58 0 L -76 -8 M -58 0 L -76 8" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
              <text x="-170" y="-30" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">ПЕРЕКРЁСТОК Р-7</text>
              <text x="-170" y="-18" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">D=120М · 4 СЪЕЗДА</text>
            </g>
          </g>

          {/* ── ПЕРЕХОД 02 → 03 ── */}
          <g transform={`translate(${endX}, 3220)`}>
            <ZoneTransition />
          </g>

          {/* ════════════════ ZONE 03 — ПРОМЫШЛЕННЫЕ ОБЪЕКТЫ ════════════════ */}
          <g clipPath="url(#clip-industry)">
            {/* Лёгкий тон производственной площадки (без рельсовых обводок) */}
            <path d={mainPath} stroke="rgba(212,168,67,0.04)" strokeWidth="280" fill="none" />

            {/* ВЕРТИКАЛЬНОЕ ПРОМЫШЛЕННОЕ ЗДАНИЕ — ВИД СВЕРХУ (генплан) */}
            {(() => {
              const cx = endX;
              const yTop = 3380;
              const yBot = 4720;
              const halfW = 56;
              return (
                <>
                  {/* Внешний контур корпуса */}
                  <rect x={cx - halfW} y={yTop} width={halfW * 2} height={yBot - yTop} fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.6" />
                  {/* Поперечные перегородки между секциями */}
                  {[3530, 3690, 3850, 4010, 4170, 4330, 4490, 4650].map(y => (
                    <line key={`pt${y}`} x1={cx - halfW} y1={y} x2={cx + halfW} y2={y} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.55" />
                  ))}
                  {/* Внутренняя сетка ферм (продольные ребра) */}
                  <line x1={cx - 28} y1={yTop} x2={cx - 28} y2={yBot} stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.4" />
                  <line x1={cx} y1={yTop} x2={cx} y2={yBot} stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.4" />
                  <line x1={cx + 28} y1={yTop} x2={cx + 28} y2={yBot} stroke="var(--teal)" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.4" />
                  {/* Поперечные ребра ферм (часто) */}
                  {Array.from({ length: 30 }, (_, i) => yTop + 20 + i * 44).map(y => (
                    <line key={`tr${y}`} x1={cx - halfW + 4} y1={y} x2={cx + halfW - 4} y2={y} stroke="var(--teal)" strokeWidth="0.4" strokeOpacity="0.3" />
                  ))}
                  {/* Погрузочные доки слева — ворота */}
                  {[3460, 3780, 4100, 4380, 4600].map(y => (
                    <rect key={`gL${y}`} x={cx - halfW - 14} y={y} width="14" height="36" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="0.8" />
                  ))}
                  {/* Погрузочные доки справа */}
                  {[3540, 3920, 4280, 4560].map(y => (
                    <rect key={`gR${y}`} x={cx + halfW} y={y} width="14" height="36" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="0.8" />
                  ))}
                  {/* Угловые маркеры осей */}
                  <circle cx={cx - halfW} cy={yTop} r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="0.8" />
                  <text x={cx - halfW} y={yTop + 3} fill="var(--gold)" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">А</text>
                  <circle cx={cx + halfW} cy={yTop} r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="0.8" />
                  <text x={cx + halfW} y={yTop + 3} fill="var(--gold)" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Б</text>
                  <circle cx={cx - halfW} cy={yBot} r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="0.8" />
                  <text x={cx - halfW} y={yBot + 3} fill="var(--gold)" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">А</text>
                  <circle cx={cx + halfW} cy={yBot} r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="0.8" />
                  <text x={cx + halfW} y={yBot + 3} fill="var(--gold)" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Б</text>

                  {/* Размерная цепочка длины слева (вертикальная) */}
                  <line x1={cx - halfW - 36} y1={yTop} x2={cx - halfW - 36} y2={yBot} stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.6" />
                  <line x1={cx - halfW - 40} y1={yTop} x2={cx - halfW - 32} y2={yTop} stroke="var(--gold)" strokeWidth="0.6" />
                  <line x1={cx - halfW - 40} y1={yBot} x2={cx - halfW - 32} y2={yBot} stroke="var(--gold)" strokeWidth="0.6" />
                  <text x={cx - halfW - 44} y={(yTop + yBot) / 2 + 4} fill="var(--gold)" fontSize="7" fontFamily="monospace" textAnchor="middle" transform={`rotate(-90 ${cx - halfW - 44} ${(yTop + yBot) / 2 + 4})`}>L=134М</text>

                  {/* Размерная цепочка ширины снизу (горизонтальная) */}
                  <line x1={cx - halfW} y1={yBot + 28} x2={cx + halfW} y2={yBot + 28} stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.6" />
                  <line x1={cx - halfW} y1={yBot + 24} x2={cx - halfW} y2={yBot + 32} stroke="var(--gold)" strokeWidth="0.6" />
                  <line x1={cx + halfW} y1={yBot + 24} x2={cx + halfW} y2={yBot + 32} stroke="var(--gold)" strokeWidth="0.6" />
                  <text x={cx} y={yBot + 41} fill="var(--gold)" fontSize="7" fontFamily="monospace" textAnchor="middle">B=22М</text>

                  {/* Главный вход (двери с дугой раскрытия) — слева на длинной стене */}
                  {(() => {
                    const dY = 4080;
                    return (
                      <g>
                        {/* Проём в стене (стирает участок контура) */}
                        <rect x={cx - halfW - 1} y={dY - 12} width="2" height="24" fill="var(--bg-primary)" />
                        {/* Створка двери */}
                        <line x1={cx - halfW} y1={dY - 12} x2={cx - halfW + 18} y2={dY - 12} stroke="var(--teal)" strokeWidth="1.2" />
                        {/* Дуга открытия двери */}
                        <path d={`M ${cx - halfW + 18} ${dY - 12} A 18 18 0 0 1 ${cx - halfW} ${dY + 6}`} fill="none" stroke="var(--teal)" strokeWidth="0.7" strokeDasharray="2 2" strokeOpacity="0.7" />
                        <text x={cx - halfW - 4} y={dY + 2} fill="var(--teal)" fontSize="6" fontFamily="monospace" textAnchor="end">ВХОД-1</text>
                      </g>
                    );
                  })()}

                  {/* Главный вход — справа на длинной стене */}
                  {(() => {
                    const dY = 4180;
                    return (
                      <g>
                        <rect x={cx + halfW - 1} y={dY - 12} width="2" height="24" fill="var(--bg-primary)" />
                        <line x1={cx + halfW} y1={dY - 12} x2={cx + halfW - 18} y2={dY - 12} stroke="var(--teal)" strokeWidth="1.2" />
                        <path d={`M ${cx + halfW - 18} ${dY - 12} A 18 18 0 0 0 ${cx + halfW} ${dY + 6}`} fill="none" stroke="var(--teal)" strokeWidth="0.7" strokeDasharray="2 2" strokeOpacity="0.7" />
                        <text x={cx + halfW + 4} y={dY + 2} fill="var(--teal)" fontSize="6" fontFamily="monospace" textAnchor="start">ВХОД-2</text>
                      </g>
                    );
                  })()}

                  {/* Окна-ленты на длинных стенах (мелкие риски через регулярные шаги) */}
                  {Array.from({ length: 28 }, (_, i) => yTop + 50 + i * 46).map(y => (
                    <g key={`win${y}`}>
                      {/* Левая стена */}
                      <line x1={cx - halfW - 2} y1={y} x2={cx - halfW + 2} y2={y} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.85" />
                      <line x1={cx - halfW - 2} y1={y + 14} x2={cx - halfW + 2} y2={y + 14} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.85" />
                      {/* Правая стена */}
                      <line x1={cx + halfW - 2} y1={y} x2={cx + halfW + 2} y2={y} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.85" />
                      <line x1={cx + halfW - 2} y1={y + 14} x2={cx + halfW + 2} y2={y + 14} stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.85" />
                    </g>
                  ))}

                  {/* Заголовок здания */}
                  <text x={cx - halfW - 4} y={yTop - 24} fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">КОРПУС ПК-1 (ВИД СВЕРХУ)</text>
                  <text x={cx - halfW - 4} y={yTop - 10} fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">L=134М · B=22М · S=15000 М² · 9 СЕКЦИЙ</text>
                </>
              );
            })()}

            {/* Роза ветров (компас) — справа сверху от здания */}
            <g transform={`translate(${endX + 165}, 3460)`}>
              {/* Внешнее кольцо */}
              <circle cx="0" cy="0" r="34" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="0.9" />
              {/* Внутреннее кольцо с делениями */}
              <circle cx="0" cy="0" r="26" fill="none" stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="2 4" />
              {/* 8-конечная звезда направлений */}
              <path d="M 0 -32 L 4 -4 L 0 0 L -4 -4 Z" fill="rgba(212,168,67,0.55)" stroke="var(--gold)" strokeWidth="0.7" />
              <path d="M 0 32 L -4 4 L 0 0 L 4 4 Z" fill="rgba(212,168,67,0.25)" stroke="var(--gold)" strokeWidth="0.7" />
              <path d="M 32 0 L 4 -4 L 0 0 L 4 4 Z" fill="rgba(212,168,67,0.25)" stroke="var(--gold)" strokeWidth="0.7" />
              <path d="M -32 0 L -4 4 L 0 0 L -4 -4 Z" fill="rgba(212,168,67,0.25)" stroke="var(--gold)" strokeWidth="0.7" />
              {/* Диагональные лучи */}
              <path d="M 22 -22 L 3 -3 M -22 22 L -3 3 M 22 22 L 3 3 M -22 -22 L -3 -3" stroke="var(--teal)" strokeWidth="0.5" strokeOpacity="0.6" />
              {/* Центр */}
              <circle cx="0" cy="0" r="2" fill="var(--gold)" />
              {/* Метки сторон света */}
              <text x="0" y="-37" fill="var(--gold)" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">С</text>
              <text x="0" y="44" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">Ю</text>
              <text x="40" y="3" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">В</text>
              <text x="-40" y="3" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">З</text>
              <text x="0" y="-50" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">РОЗА ВЕТРОВ</text>
            </g>

            {/* Самосвал #1 — слева, рядом с воротами */}
            <g transform={`translate(${endX - 110}, 3500)`}>
              <rect x="-12" y="-10" width="24" height="20" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
              <rect x="-9" y="-19" width="18" height="9" fill="rgba(212,168,67,0.28)" stroke="var(--gold)" strokeWidth="0.8" />
              <rect x="-14" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="-14" y="2" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="2" width="3" height="6" fill="var(--gold)" />
              <text x="20" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">КАМАЗ-65115</text>
            </g>

            {/* Погрузчик #1 — справа сверху */}
            <g transform={`translate(${endX + 100}, 3580)`}>
              <rect x="-9" y="-7" width="18" height="14" fill="rgba(0,196,167,0.20)" stroke="var(--teal)" strokeWidth="0.9" />
              <line x1="-3" y1="-7" x2="-3" y2="-15" stroke="var(--teal)" strokeWidth="0.9" />
              <line x1="3" y1="-7" x2="3" y2="-15" stroke="var(--teal)" strokeWidth="0.9" />
              <rect x="-11" y="-6" width="2" height="4" fill="var(--teal)" />
              <rect x="9" y="-6" width="2" height="4" fill="var(--teal)" />
              <rect x="-11" y="2" width="2" height="4" fill="var(--teal)" />
              <rect x="9" y="2" width="2" height="4" fill="var(--teal)" />
              <text x="14" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">ПОГР L-34</text>
            </g>

            {/* Самосвал #2 — справа, в центре */}
            <g transform={`translate(${endX + 105}, 3960)`}>
              <rect x="-12" y="-10" width="24" height="20" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
              <rect x="-9" y="-19" width="18" height="9" fill="rgba(212,168,67,0.28)" stroke="var(--gold)" strokeWidth="0.8" />
              <rect x="-14" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="-14" y="2" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="2" width="3" height="6" fill="var(--gold)" />
              <text x="20" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">САМОСВАЛ-2</text>
            </g>

            {/* Погрузчик #2 — слева, ниже центра (направлен вниз) */}
            <g transform={`translate(${endX - 100}, 4180)`}>
              <rect x="-9" y="-7" width="18" height="14" fill="rgba(0,196,167,0.20)" stroke="var(--teal)" strokeWidth="0.9" />
              <line x1="-3" y1="7" x2="-3" y2="15" stroke="var(--teal)" strokeWidth="0.9" />
              <line x1="3" y1="7" x2="3" y2="15" stroke="var(--teal)" strokeWidth="0.9" />
              <rect x="-11" y="-6" width="2" height="4" fill="var(--teal)" />
              <rect x="9" y="-6" width="2" height="4" fill="var(--teal)" />
              <rect x="-11" y="2" width="2" height="4" fill="var(--teal)" />
              <rect x="9" y="2" width="2" height="4" fill="var(--teal)" />
              <text x="-14" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="end">ПОГР K-2</text>
            </g>

            {/* Самосвал #3 — слева внизу */}
            <g transform={`translate(${endX - 115}, 4420)`}>
              <rect x="-12" y="-10" width="24" height="20" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
              <rect x="-9" y="9" width="18" height="9" fill="rgba(212,168,67,0.28)" stroke="var(--gold)" strokeWidth="0.8" />
              <rect x="-14" y="-8" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="-8" width="3" height="6" fill="var(--gold)" />
              <rect x="-14" y="10" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="10" width="3" height="6" fill="var(--gold)" />
              <text x="-18" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="end">САМОСВАЛ-3</text>
            </g>

            {/* Сотовая вышка (вид сверху) — справа над самосвалом #4 */}
            <g transform={`translate(${endX + 130}, 4280)`}>
              {/* Решётчатое треугольное основание */}
              <path d="M 0 -10 L 9 5 L -9 5 Z" fill="rgba(0,196,167,0.14)" stroke="var(--teal)" strokeWidth="0.9" />
              {/* Внутренняя триангуляция */}
              <line x1="0" y1="-10" x2="0" y2="5" stroke="var(--teal)" strokeWidth="0.4" strokeOpacity="0.6" />
              <line x1="-9" y1="5" x2="4.5" y2="-2.5" stroke="var(--teal)" strokeWidth="0.4" strokeOpacity="0.5" />
              <line x1="9" y1="5" x2="-4.5" y2="-2.5" stroke="var(--teal)" strokeWidth="0.4" strokeOpacity="0.5" />
              {/* Центральная мачта */}
              <circle cx="0" cy="-1" r="2" fill="var(--gold)" />
              {/* 3 секторных антенны */}
              <rect x="-2" y="-15" width="4" height="3" fill="var(--gold)" />
              <rect x="6.5" y="3" width="4" height="3" fill="var(--gold)" transform="rotate(60 8.5 4.5)" />
              <rect x="-10.5" y="3" width="4" height="3" fill="var(--gold)" transform="rotate(-60 -8.5 4.5)" />
              {/* Радиолучи покрытия */}
              <path d="M 0 -16 L 0 -24 M 11 7 L 18 12 M -11 7 L -18 12" stroke="var(--teal)" strokeWidth="0.4" strokeDasharray="2 3" strokeOpacity="0.45" />
              <text x="14" y="-2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">БС-7 4G/5G</text>
            </g>

            {/* Самосвал #4 — справа внизу */}
            <g transform={`translate(${endX + 110}, 4580)`}>
              <rect x="-12" y="-10" width="24" height="20" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="1" />
              <rect x="-9" y="-19" width="18" height="9" fill="rgba(212,168,67,0.28)" stroke="var(--gold)" strokeWidth="0.8" />
              <rect x="-14" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="-16" width="3" height="6" fill="var(--gold)" />
              <rect x="-14" y="2" width="3" height="6" fill="var(--gold)" />
              <rect x="11" y="2" width="3" height="6" fill="var(--gold)" />
              <text x="20" y="2" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="start">САМОСВАЛ-4</text>
            </g>

          </g>

          {/* ── ПЕРЕХОД 03 → 04 ── */}
          <g transform={`translate(${endX}, 4860)`}>
            <ZoneTransition />
          </g>

          {/* ════════════════ ZONE 04 — ЭНЕРГОИНФРАСТРУКТУРА ════════════════ */}
          <g clipPath="url(#clip-energy)">
            {/* Свечение коридора ЛЭП */}
            <path d={mainPath} stroke="rgba(79,132,255,0.08)" strokeWidth="100" fill="none" />

            {/* Два провода ЛЭП — проходят через крайние фарфоровые изоляторы (x=±100) */}
            {(() => {
              const yIn = 4960;
              const yT1 = 5104;   // ЛЭП-1 (центр 5260)
              const yT2 = 5504;   // ЛЭП-2 (центр 5660)
              const yT3 = 5904;   // ЛЭП-3 (центр 6060)
              const yOut = 6400;
              // Провод сагает вовнутрь (к центру) между опорами
              const wire = (off: number, sagDir: 1 | -1) => {
                const sag = 18;
                return (
                  `M ${endX + off} ${yIn} ` +
                  `Q ${endX + off + sagDir * sag * 0.35} ${(yIn + yT1) / 2}, ${endX + off} ${yT1} ` +
                  `Q ${endX + off + sagDir * sag} ${(yT1 + yT2) / 2}, ${endX + off} ${yT2} ` +
                  `Q ${endX + off + sagDir * sag} ${(yT2 + yT3) / 2}, ${endX + off} ${yT3} ` +
                  `Q ${endX + off + sagDir * sag * 1.1} ${(yT3 + yOut) / 2}, ${endX + off} ${yOut}`
                );
              };
              return (
                <>
                  {/* Левый провод (через изоляторы x=-72), сагает вправо */}
                  <path d={wire(-72, 1)} fill="none" stroke="var(--blue)" strokeWidth="2.4" strokeOpacity="0.92" strokeLinecap="round" />
                  {/* Правый провод (через изоляторы x=+72), сагает влево */}
                  <path d={wire(72, -1)} fill="none" stroke="var(--blue)" strokeWidth="2.4" strokeOpacity="0.92" strokeLinecap="round" />
                  {/* Импульсный разряд тока на левом проводе */}
                  <path d={wire(-72, 1)} fill="none" stroke="#7AB1FF" strokeWidth="3" strokeDasharray="2 110" strokeOpacity="0.95" strokeLinecap="round" />
                </>
              );
            })()}

            {/* Унифицированный шаблон ЛЭП-опоры (3 одинаковых) */}
            {[
              { y: 5260, label: 'ОПОРА ЛЭП-1', spec: 'U=220 кВ · H=42М' },
              { y: 5660, label: 'ОПОРА ЛЭП-2', spec: 'U=220 кВ · H=42М' },
              { y: 6060, label: 'ОПОРА ЛЭП-3', spec: 'U=110 кВ · H=42М' },
            ].map(({ y, label, spec }) => (
              <g key={`lep${y}`} transform={`translate(${endX}, ${y})`}>
                {/* Боковые стойки */}
                <line x1="-58" y1="110" x2="-20" y2="-200" stroke="var(--gold)" strokeWidth="1.6" />
                <line x1="58" y1="110" x2="20" y2="-200" stroke="var(--gold)" strokeWidth="1.6" />
                {/* Горизонтальные раскосы решётки */}
                {[0,1,2,3,4,5,6,7].map(i => {
                  const t = i / 7;
                  const ry = 110 - t * 310;
                  const xL = -58 + t * 38;
                  const xR = 58 - t * 38;
                  return <line key={`tr${i}`} x1={xL} y1={ry} x2={xR} y2={ry} stroke="var(--gold)" strokeWidth="1.2" />;
                })}
                {/* Диагональные раскосы */}
                <line x1="-58" y1="110" x2="20" y2="-200" stroke="var(--gold)" strokeWidth="1.2" />
                <line x1="58" y1="110" x2="-20" y2="-200" stroke="var(--gold)" strokeWidth="1.2" />
                {/* Верхняя траверса */}
                <line x1="-72" y1="-160" x2="-32" y2="-160" stroke="var(--blue)" strokeWidth="1.6" />
                <line x1="32" y1="-160" x2="72" y2="-160" stroke="var(--blue)" strokeWidth="1.6" />
                {/* Нижняя траверса */}
                <line x1="-62" y1="-110" x2="-32" y2="-110" stroke="var(--blue)" strokeWidth="1.6" />
                <line x1="32" y1="-110" x2="62" y2="-110" stroke="var(--blue)" strokeWidth="1.6" />
                {/* Изоляторные гирлянды */}
                {[-72,-32,32,72].map(x => (
                  <g key={`is${x}`}>
                    <line x1={x} y1={-160} x2={x} y2={-130} stroke="var(--gold)" strokeWidth="1.2" />
                    {[0,1,2].map(i => <circle key={i} cx={x} cy={-156 + i * 8} r="2.4" fill="rgba(212,168,67,0.15)" stroke="var(--gold)" strokeWidth="1" />)}
                  </g>
                ))}
                <text x="-90" y="-200" fill="var(--blue)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">{label}</text>
                <text x="-90" y="-186" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="end">{spec}</text>
              </g>
            ))}

            {/* Подстанция «Альфа» — компактная, ближе к оси */}
            <g transform={`translate(${endX}, 6300)`}>
              <rect x="-180" y="-60" width="120" height="100" fill="none" stroke="var(--gold)" strokeWidth="1.1" strokeDasharray="3 3" />
              {/* Трансформатор */}
              <rect x="-170" y="-40" width="34" height="56" fill="rgba(79,132,255,0.08)" stroke="var(--blue)" strokeWidth="1.1" />
              <line x1="-170" y1="-32" x2="-136" y2="-32" stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.6" />
              <line x1="-170" y1="-22" x2="-136" y2="-22" stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.6" />
              <line x1="-170" y1="-12" x2="-136" y2="-12" stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.6" />
              <line x1="-170" y1="6" x2="-136" y2="6" stroke="var(--blue)" strokeWidth="0.6" strokeOpacity="0.6" />
              <circle cx="-153" cy="-50" r="4" fill="rgba(79,132,255,0.1)" stroke="var(--blue)" strokeWidth="0.7" />
              <circle cx="-153" cy="26" r="4" fill="rgba(79,132,255,0.1)" stroke="var(--blue)" strokeWidth="0.7" />
              {/* Выключатели (3 шт, плотнее) */}
              {[-110,-90,-70].map(x => (
                <g key={`b${x}`}>
                  <circle cx={x} cy="-12" r="5" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="1" />
                  <line x1={x-3} y1="-12" x2={x+3} y2="-12" stroke="var(--gold)" strokeWidth="0.6" />
                  <line x1={x} y1="-17" x2={x} y2="-7" stroke="var(--gold)" strokeWidth="0.6" />
                  <line x1={x} y1="-60" x2={x} y2="-17" stroke="var(--blue)" strokeWidth="0.7" strokeOpacity="0.6" />
                  <line x1={x} y1="-7" x2={x} y2="24" stroke="var(--blue)" strokeWidth="0.7" strokeOpacity="0.6" />
                </g>
              ))}
              <line x1="-180" y1="24" x2="-60" y2="24" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" />
              <text x="-180" y="-72" fill="var(--blue)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">ПС &quot;АЛЬФА&quot;</text>
              <text x="-180" y="-62" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">220/110 кВ · 125 МВА</text>
            </g>
          </g>

          {/* ── ПЕРЕХОД 04 → 05 ── */}
          <g transform={`translate(${endX}, 6500)`}>
            <ZoneTransition />
          </g>

          {/* ════════════════ ZONE 05 — НЕФТЕПРОВОДЫ ════════════════ */}
          <g clipPath="url(#clip-oil)">
            {(() => {
              const cx = endX;
              const yTop = 6600;
              const yBot = 8040;
              const halfW = 14;          // полуширина одной трубы
              const offset = 22;         // смещение центров от оси
              const pipeCenters = [cx - offset, cx + offset];
              return (
                <>
                  {pipeCenters.map(pcx => (
                    <g key={`pipe${pcx}`}>
                      {/* Тело трубы */}
                      <rect x={pcx - halfW} y={yTop} width={halfW * 2} height={yBot - yTop} fill="rgba(40,28,18,0.85)" />
                      {/* Контуры стальной оболочки */}
                      <line x1={pcx - halfW} y1={yTop} x2={pcx - halfW} y2={yBot} stroke="var(--gold)" strokeWidth="1.3" strokeOpacity="0.95" />
                      <line x1={pcx + halfW} y1={yTop} x2={pcx + halfW} y2={yBot} stroke="var(--gold)" strokeWidth="1.3" strokeOpacity="0.95" />
                      {/* Блик слева (3D-цилиндр) */}
                      <rect x={pcx - halfW + 3} y={yTop} width="3" height={yBot - yTop} fill="rgba(255,210,150,0.22)" />
                      {/* Тень справа */}
                      <rect x={pcx + halfW - 6} y={yTop} width="6" height={yBot - yTop} fill="rgba(15,10,5,0.55)" />
                      {/* Внутренняя нефть */}
                      <rect x={pcx - halfW + 6} y={yTop} width={halfW * 2 - 12} height={yBot - yTop} fill="rgba(168,114,43,0.35)" />
                      {/* Полоска блика */}
                      <line x1={pcx - 2} y1={yTop} x2={pcx - 2} y2={yBot} stroke="rgba(255,200,140,0.45)" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Кольцевые стыки — на обеих трубах, каждые 240px */}
                  {Array.from({ length: 6 }, (_, i) => yTop + 120 + i * 240).map(y => (
                    <g key={`fl${y}`}>
                      {pipeCenters.map(pcx => (
                        <g key={`fl${y}-${pcx}`}>
                          <rect x={pcx - halfW - 3} y={y - 3} width={halfW * 2 + 6} height="7" fill="rgba(212,168,67,0.18)" stroke="var(--gold)" strokeWidth="0.8" />
                          {[0,1,2,3].map(b => (
                            <circle key={b} cx={pcx - halfW + 2 + b * 8} cy={y + 0.5} r="0.8" fill="var(--gold)" />
                          ))}
                        </g>
                      ))}
                    </g>
                  ))}

                  {/* Стрелки направления потока — на обеих трубах */}
                  {Array.from({ length: 5 }, (_, i) => yTop + 240 + i * 280).map(y => (
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

            {/* Задвижка с маховиком */}
            <g transform={`translate(${endX}, 6900)`}>
              <rect x="-22" y="-44" width="44" height="64" fill="rgba(212,168,67,0.08)" stroke="var(--gold)" strokeWidth="1.4" />
              <line x1="0" y1="-44" x2="0" y2="-78" stroke="var(--gold)" strokeWidth="1.6" />
              <circle cx="0" cy="-86" r="16" fill="rgba(0,196,167,0.05)" stroke="var(--teal)" strokeWidth="1.4" />
              <circle cx="0" cy="-86" r="6" fill="none" stroke="var(--teal)" strokeWidth="1" />
              <line x1="-16" y1="-86" x2="16" y2="-86" stroke="var(--teal)" strokeWidth="0.8" />
              <line x1="0" y1="-102" x2="0" y2="-70" stroke="var(--teal)" strokeWidth="0.8" />
              <line x1="-11" y1="-97" x2="11" y2="-75" stroke="var(--teal)" strokeWidth="0.6" strokeOpacity="0.7" />
              <line x1="-11" y1="-75" x2="11" y2="-97" stroke="var(--teal)" strokeWidth="0.6" strokeOpacity="0.7" />
              <text x="-30" y="-90" fill="var(--gold)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЗАДВИЖКА З-16</text>
              <text x="-30" y="-76" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">DN-700 · PN-6.3 МПа</text>
            </g>

            {/* Насосная станция — компактная, ближе к трубе */}
            <g transform={`translate(${endX}, 7250)`}>
              <rect x="-180" y="-72" width="140" height="130" fill="rgba(212,168,67,0.04)" stroke="var(--gold)" strokeWidth="1.2" />
              {/* Два магистральных насоса (меньше) */}
              <circle cx="-150" cy="-22" r="16" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.2" />
              <circle cx="-150" cy="-22" r="6" fill="none" stroke="var(--teal)" strokeWidth="0.8" />
              <line x1="-159" y1="-22" x2="-141" y2="-22" stroke="var(--teal)" strokeWidth="0.6" />
              <circle cx="-100" cy="-22" r="16" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.2" />
              <circle cx="-100" cy="-22" r="6" fill="none" stroke="var(--teal)" strokeWidth="0.8" />
              <line x1="-109" y1="-22" x2="-91" y2="-22" stroke="var(--teal)" strokeWidth="0.6" />
              {/* Электродвигатели сверху */}
              <rect x="-167" y="-58" width="34" height="16" fill="rgba(79,132,255,0.06)" stroke="var(--blue)" strokeWidth="0.9" />
              <rect x="-117" y="-58" width="34" height="16" fill="rgba(79,132,255,0.06)" stroke="var(--blue)" strokeWidth="0.9" />
              <line x1="-150" y1="-42" x2="-150" y2="-38" stroke="var(--blue)" strokeWidth="0.9" />
              <line x1="-100" y1="-42" x2="-100" y2="-38" stroke="var(--blue)" strokeWidth="0.9" />
              {/* Магистральный коллектор */}
              <line x1="-180" y1="36" x2="-40" y2="36" stroke="var(--gold)" strokeWidth="2.2" strokeOpacity="0.7" />
              <line x1="-150" y1="-6" x2="-150" y2="36" stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.7" />
              <line x1="-100" y1="-6" x2="-100" y2="36" stroke="var(--gold)" strokeWidth="1.4" strokeOpacity="0.7" />
              <text x="-180" y="-86" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="start" fontWeight="bold">НПС-3 «АРЛАН»</text>
              <text x="-180" y="-76" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" textAnchor="start">2×7 МВт · Q=10000 м³/ч</text>
            </g>

            {/* П-образный компенсатор */}
            <g transform={`translate(${endX}, 7650)`}>
              <path d="M 0 0 L 0 -40 L -130 -40 L -130 -200 L 0 -200 L 0 -240" fill="none" stroke="var(--gold)" strokeWidth="6" strokeOpacity="0.85" />
              <path d="M 0 0 L 0 -40 L -130 -40 L -130 -200 L 0 -200 L 0 -240" fill="none" stroke="#A8722B" strokeWidth="2" strokeOpacity="0.95" />
              <line x1="-130" y1="-100" x2="-170" y2="-100" stroke="var(--teal)" strokeWidth="1.4" />
              <line x1="-130" y1="-150" x2="-170" y2="-150" stroke="var(--teal)" strokeWidth="1.4" />
              <line x1="-160" y1="-100" x2="-160" y2="-150" stroke="var(--teal)" strokeWidth="1" />
              <text x="-65" y="-114" fill="var(--gold)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">КОМПЕНСАТОР К-2</text>
              <text x="-65" y="-104" fill="var(--text-secondary)" fontSize="6" fontFamily="monospace" textAnchor="middle">П-ОБРАЗНЫЙ · ΔL=320мм</text>
            </g>
          </g>

          {/* ── ПЕРЕХОД 05 → 06 ── */}
          <g transform={`translate(${endX}, 8140)`}>
            <ZoneTransition />
          </g>

          {/* ════════════════ ZONE 06 — ГАЗОПРОВОДЫ ════════════════ */}
          <g clipPath="url(#clip-gas)">
            {/* Тонкая бирюзовая труба */}
            <path d={mainPath} stroke="rgba(0, 196, 167, 0.18)" strokeWidth="58" fill="none" />
            <path d={mainPath} stroke="var(--teal)" strokeWidth="58" strokeOpacity="0.85" fill="none" mask="url(#hollowMask40)" />
            {/* Газовый поток (штриховка) */}
            <path d={mainPath} stroke="rgba(0, 196, 167, 0.45)" strokeWidth="22" strokeDasharray="4 8" fill="none" />
            {/* Жёлтые шевронные метки безопасности */}
            <path d={mainPath} stroke="#FFD23F" strokeWidth="60" strokeDasharray="4 80" strokeOpacity="0.55" fill="none" />
            <path d={mainPath} stroke="#FFD23F" strokeWidth="2.5" strokeOpacity="0.95" fill="none" />

            {/* ГРС «Бета» — газораспределительная станция */}
            <g transform={`translate(${endX}, 8540)`}>
              <rect x="-300" y="-90" width="220" height="160" fill="rgba(0,196,167,0.04)" stroke="var(--teal)" strokeWidth="1.5" />
              {/* Вентиляционные стояки */}
              {[-260,-220,-180,-140].map(x => (
                <g key={`v${x}`}>
                  <line x1={x} y1="-90" x2={x} y2="-150" stroke="var(--teal)" strokeWidth="1.2" />
                  <circle cx={x} cy="-156" r="3" fill="none" stroke="var(--teal)" strokeWidth="0.8" />
                  <line x1={x-3} y1="-156" x2={x+3} y2="-156" stroke="var(--teal)" strokeWidth="0.6" />
                </g>
              ))}
              {/* Регуляторы давления */}
              {[-280,-230,-180,-130].map(x => (
                <g key={`r${x}`}>
                  <rect x={x-12} y="-30" width="24" height="44" fill="none" stroke="var(--gold)" strokeWidth="1" />
                  <circle cx={x} cy="-8" r="3" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
                </g>
              ))}
              {/* Коллектор */}
              <line x1="-300" y1="50" x2="-80" y2="50" stroke="var(--teal)" strokeWidth="2.5" strokeOpacity="0.7" />
              <text x="-300" y="-105" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">ГРС «БЕТА»</text>
              <text x="-300" y="-92" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">P=5.5 МПа · Q=120000 нм³/ч</text>
            </g>

            {/* Шаровый кран с электроприводом */}
            <g transform={`translate(${endX}, 8890)`}>
              <circle cx="0" cy="0" r="24" fill="rgba(0,196,167,0.06)" stroke="var(--teal)" strokeWidth="1.5" />
              <line x1="-24" y1="0" x2="24" y2="0" stroke="var(--teal)" strokeWidth="1" />
              <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--teal)" strokeWidth="1" />
              <circle cx="0" cy="0" r="10" fill="none" stroke="var(--teal)" strokeWidth="0.8" />
              <line x1="0" y1="-24" x2="0" y2="-54" stroke="var(--gold)" strokeWidth="2" />
              <rect x="-18" y="-78" width="36" height="24" fill="rgba(212,168,67,0.06)" stroke="var(--gold)" strokeWidth="1.4" />
              <text x="0" y="-62" fill="var(--gold)" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">М</text>
              <text x="-30" y="-56" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">КРАН ШК-9</text>
              <text x="-30" y="-42" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="end">DN-1000 · PN-10.0 МПа</text>
            </g>

            {/* Свеча аварийного сброса с факелом */}
            <g transform={`translate(${endX}, 9240)`}>
              <line x1="-180" y1="100" x2="-180" y2="-200" stroke="var(--teal)" strokeWidth="2" />
              <line x1="-188" y1="100" x2="-172" y2="100" stroke="var(--teal)" strokeWidth="1.5" />
              {/* Опорная решётка */}
              {[100,60,20,-20,-60,-100,-140].map(y => (
                <line key={`g${y}`} x1="-196" y1={y} x2="-164" y2={y} stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.7" />
              ))}
              {/* Растяжки */}
              <line x1="-180" y1="-100" x2="-220" y2="100" stroke="var(--teal)" strokeWidth="0.6" strokeDasharray="3 3" strokeOpacity="0.5" />
              <line x1="-180" y1="-100" x2="-140" y2="100" stroke="var(--teal)" strokeWidth="0.6" strokeDasharray="3 3" strokeOpacity="0.5" />
              {/* Пламя */}
              <path d="M -180 -200 L -168 -224 L -180 -240 L -192 -224 Z" fill="rgba(255,210,63,0.18)" stroke="#FFD23F" strokeWidth="1" />
              <path d="M -180 -224 L -172 -244 L -180 -258 L -188 -244 Z" fill="rgba(255,210,63,0.14)" stroke="#FFD23F" strokeWidth="0.8" />
              <path d="M -180 -244 L -176 -260 L -180 -272 L -184 -260 Z" fill="none" stroke="#FFD23F" strokeWidth="0.7" strokeOpacity="0.7" />
              <text x="-130" y="-220" fill="var(--teal)" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">СВЕЧА СВ-1</text>
              <text x="-130" y="-206" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace" textAnchor="start">H=60М · АВАРИЙНЫЙ СБРОС</text>
            </g>
          </g>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*    ЛОГОТИП НА КОНЧИКЕ ЛИНИИ — РИСУЕТ ПУТЬ           */}
        {/* ════════════════════════════════════════════════════ */}
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

        {/* Скрытый эталонный путь для расчёта длины и getPointAtLength */}
        <path ref={corePathRef} d={mainPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}

// ┌──────────────────────────────────────────────────────────────────┐
// │  Переход между зонами — большой треугольный логотип WAG         │
// │  с концентрическими вращающимися кольцами и баннером секции     │
// └──────────────────────────────────────────────────────────────────┘
function ZoneTransition() {
  return (
    <g>
      {/* WAG-треугольник без обрамления */}
      <g transform="scale(0.095) translate(-360, -317)">
        <path fill="var(--gold)" fillOpacity="0.95" d={WAG_TRI}/>
      </g>
    </g>
  );
}
