'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Инженерные узлы генерируются с запасом на 15000px высоты сайта
const NODES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  y: 1200 + i * 500 + Math.random() * 300,
  label: `УЗЕЛ-В${1000 + i * 14}`,
  value: ['НАГРУЗКА: НОРМА', 'НАТЯЖЕНИЕ: 120кН', 'СИНХР: ЗАВЕРШЕНО', 'УКЛОН: 0.5‰'][i % 4],
  isLeft: i % 2 === 0,
})).filter(n =>
  !(n.y > 2200 && n.y < 2800) &&
  !(n.y > 3500 && n.y < 4100) &&
  !(n.y > 4700 && n.y < 5300) &&
  !(n.y > 6200 && n.y < 6800) &&
  !(n.y > 7700 && n.y < 8300)
);

export default function GlobalVerticalBg() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [w, setW] = useState(1440);

  // Прямые ссылки на DOM для 60FPS анимации
  const svgWrapperRef = useRef<SVGSVGElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const tipGroupRef = useRef<SVGGElement>(null);
  const tipTextRef = useRef<SVGTextElement>(null);
  const corePathRef = useRef<SVGPathElement>(null);

  const [, setPathLen] = useState(16000);

  useEffect(() => {
    setMounted(true);
    setW(window.innerWidth);

    let pathLenToUse = 16000;
    if (corePathRef.current) {
      pathLenToUse = corePathRef.current.getTotalLength();
      setPathLen(pathLenToUse);
    }

    let animationFrameId: number;
    let startTime: number | null = null;
    const DURATION = 50000; // 50 секунд на прорисовку всего чертежа

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

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Скрыть на мобильных и в панели управления
  if (!mounted || w < 900 || pathname.startsWith('/admin')) return null;

  const startX = w * 0.2;
  const endX = w * 0.85;
  const mainPath = `M ${startX} -100
                    C ${startX} 300, ${endX} 100, ${endX} 600
                    V 16000`;

  const isHome = pathname === '/';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: isHome ? 10 : 2, pointerEvents: 'none' }} aria-hidden="true">
      <svg ref={svgWrapperRef} width="100%" height="16000" style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}>
        <defs>
          <mask id="hollowRailsMask">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="30" fill="none" />
          </mask>

          <mask id="blueprintGuidesMask">
            <rect width="100%" height="100%" fill="white" />
            <path d={mainPath} stroke="black" strokeWidth="120" fill="none" />
          </mask>

          <mask id="drawMask">
            <path ref={maskPathRef} d={mainPath} stroke="#FFF" strokeWidth="600" fill="none" style={{ willChange: 'stroke-dashoffset' }} />
          </mask>
        </defs>

        <g mask="url(#drawMask)">
          {/* Гравийная подушка / Тень */}
          <path d={mainPath} stroke="rgba(4,6,12, 0.6)" strokeWidth="80" fill="none" />

          {/* Непрерывные бирюзовые направляющие по краям пути (до самого конца!) */}
          <path d={mainPath} stroke="var(--teal)" strokeWidth="122" strokeDasharray="10 10" strokeOpacity="0.8" fill="none" mask="url(#blueprintGuidesMask)" />

          {/* Шпалы (Sleepers). Специально расширены */}
          <path d={mainPath} stroke="var(--gold)" strokeWidth="56" strokeDasharray="6 38" strokeOpacity="0.4" fill="none" />

          {/* Два рельса. Широко расставлены */}
          <path d={mainPath} stroke="var(--gold)" strokeWidth="34" strokeOpacity="0.9" fill="none" mask="url(#hollowRailsMask)" />

          {/* ==============================================
              СТРУКТУРА 1: РАЗЬЕЗД (SIDING)
              ============================================== */}
          <g transform={`translate(${endX}, 2500)`}>
            {/* Шпалы разъезда */}
            <path d="M 0 0 C -40 200, -80 300, -80 600 C -80 900, -40 1000, 0 1200" stroke="var(--gold)" strokeWidth="42" strokeDasharray="6 38" strokeOpacity="0.3" fill="none" />
            {/* Два рельса разъезда */}
            <path d="M -12 0 C -52 200, -92 300, -92 600 C -92 900, -52 1000, -12 1200" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
            <path d="M 12 0 C -28 200, -68 300, -68 600 C -68 900, -28 1000, 12 1200" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
            <circle cx="-80" cy="600" r="8" fill="var(--bg-primary)" stroke="var(--teal)" strokeWidth="2" />
            <text x="-100" y="604" fill="var(--teal)" fontSize="14" fontFamily="monospace" textAnchor="end" fontWeight="bold">[РАЗЪЕЗД: РЗ-АЛЬФА]</text>
            <text x="-100" y="620" fill="var(--text-secondary)" fontSize="10" fontFamily="monospace" textAnchor="end">СТРЕЛКА: СИНХР</text>
          </g>

          {/* ==============================================
              СТРУКТУРА: ЖД МОСТ (BRIDGE)
              ============================================== */}
          <g transform={`translate(${endX}, 3800)`}>
            {/* Опоры моста — две колонны */}
            <rect x="-90" y="-200" width="12" height="400" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1" strokeDasharray="6 6" />
            <rect x="78" y="-200" width="12" height="400" fill="rgba(0,196,167,0.08)" stroke="var(--teal)" strokeWidth="1" strokeDasharray="6 6" />
            {/* Основание опор */}
            <rect x="-100" y="190" width="32" height="10" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            <rect x="68" y="190" width="32" height="10" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            {/* Пролётная ферма — верхний пояс */}
            <line x1="-90" y1="-200" x2="90" y2="-200" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
            {/* Пролётная ферма — нижний пояс */}
            <line x1="-90" y1="-160" x2="90" y2="-160" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
            {/* Раскосы фермы (зигзаг) */}
            <path d="M -90 -200 L -60 -160 L -30 -200 L 0 -160 L 30 -200 L 60 -160 L 90 -200" fill="none" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.5" />
            {/* Нижняя ферма */}
            <line x1="-90" y1="160" x2="90" y2="160" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="-90" y1="200" x2="90" y2="200" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.7" />
            <path d="M -90 160 L -60 200 L -30 160 L 0 200 L 30 160 L 60 200 L 90 160" fill="none" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.5" />
            {/* Размерная линия со стрелками */}
            <line x1="-120" y1="-200" x2="-120" y2="200" stroke="var(--gold)" strokeWidth="0.8" strokeOpacity="0.6" />
            <path d="M -125 -195 L -120 -200 L -115 -195" fill="none" stroke="var(--gold)" strokeWidth="0.8" />
            <path d="M -125 195 L -120 200 L -115 195" fill="none" stroke="var(--gold)" strokeWidth="0.8" />
            <text x="-130" y="4" fill="var(--gold)" fontSize="10" fontFamily="monospace" textAnchor="end" transform="rotate(-90, -130, 4)">L=48м</text>
            {/* Надписи */}
            <text x="-100" y="-215" fill="var(--teal)" fontSize="14" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЖД МОСТ МС-12</text>
            <text x="-100" y="-199" fill="var(--text-secondary)" fontSize="10" fontFamily="monospace" textAnchor="end">ПРОЛЁТ: 48М / КЛАСС: Н-18</text>
            {/* Уровень воды */}
            <path d="M -70 40 Q -50 30, -30 40 Q -10 50, 10 40 Q 30 30, 50 40 Q 70 50, 90 40" fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.3" />
            <path d="M -70 55 Q -50 45, -30 55 Q -10 65, 10 55 Q 30 45, 50 55 Q 70 65, 90 55" fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeOpacity="0.2" />
          </g>

          {/* ==============================================
              СТРУКТУРА 2: ЖД ПЕРЕЕЗД (LEVEL CROSSING)
              ============================================== */}
          <g transform={`translate(${endX}, 5000)`}>
            <path d="M -400 -120 L 400 120" stroke="rgba(255,255,255,0.03)" strokeWidth="160" />
            <path d="M -400 -120 L -60 -18" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="10 10" />
            <path d="M 60 18 L 400 120" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="10 10" />
            <line x1="-100" y1="-50" x2="-20" y2="-50" stroke="var(--teal)" strokeWidth="5" strokeDasharray="10 10" />
            <line x1="20" y1="50" x2="100" y2="50" stroke="var(--teal)" strokeWidth="5" strokeDasharray="10 10" />
            <circle cx="-35" cy="-55" r="5" fill="var(--bg-primary)" stroke="red" strokeWidth="2" strokeOpacity="0.8" />
            <circle cx="-21" cy="-55" r="5" fill="var(--bg-primary)" stroke="red" strokeWidth="2" strokeOpacity="0.8" />
            <text x="-120" y="-70" fill="var(--teal)" fontSize="13" fontFamily="monospace" textAnchor="end" fontWeight="bold">ЖД ПЕРЕЕЗД ПР-9</text>
          </g>

          {/* ==============================================
              СТРУКТУРА: ТУПИК (DEAD-END SIDING)
              ============================================== */}
          <g transform={`translate(${endX}, 6500)`}>
            {/* Стрелочный перевод — ответвление влево */}
            <circle cx="0" cy="0" r="6" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
            <rect x="-3" y="-3" width="6" height="6" fill="var(--gold)" />
            {/* Шпалы тупика */}
            <path d="M 0 0 C -30 80, -80 150, -160 250 L -160 550" stroke="var(--gold)" strokeWidth="42" strokeDasharray="6 38" strokeOpacity="0.3" fill="none" />
            {/* Два рельса тупика */}
            <path d="M -12 0 C -42 80, -92 150, -172 250 L -172 550" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
            <path d="M 12 0 C -18 80, -68 150, -148 250 L -148 550" stroke="var(--gold)" strokeWidth="3" strokeOpacity="0.8" fill="none" />
            {/* Упор тупика (П-образная преграда) */}
            <line x1="-175" y1="545" x2="-145" y2="545" stroke="var(--teal)" strokeWidth="3" />
            <line x1="-175" y1="545" x2="-175" y2="560" stroke="var(--teal)" strokeWidth="3" />
            <line x1="-145" y1="545" x2="-145" y2="560" stroke="var(--teal)" strokeWidth="3" />
            {/* Знак тупика (X) */}
            <line x1="-168" y1="530" x2="-152" y2="540" stroke="red" strokeWidth="2" strokeOpacity="0.7" />
            <line x1="-152" y1="530" x2="-168" y2="540" stroke="red" strokeWidth="2" strokeOpacity="0.7" />
            {/* Стрелка перевода — обозначение */}
            <path d="M 10 -10 L 30 -30" fill="none" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.6" />
            <circle cx="35" cy="-35" r="4" fill="none" stroke="var(--teal)" strokeWidth="1" />
            {/* Надписи */}
            <text x="-180" y="260" fill="var(--teal)" fontSize="14" fontFamily="monospace" textAnchor="end" fontWeight="bold">ТУПИК ТП-7</text>
            <text x="-180" y="276" fill="var(--text-secondary)" fontSize="10" fontFamily="monospace" textAnchor="end">ДЛИНА: 120М / СТАТУС: СВОБОДЕН</text>
            {/* Стрелка */}
            <text x="45" y="-30" fill="var(--text-secondary)" fontSize="10" fontFamily="monospace" textAnchor="start">СТРЕЛКА №14</text>
          </g>

          {/* ==============================================
              СТРУКТУРА 3: КОЗЛОВОЙ КРАН (GANTRY CRANE)
              ============================================== */}
          <g transform={`translate(${endX}, 8000)`}>
            <line x1="-140" y1="-300" x2="-140" y2="300" stroke="var(--teal)" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 8" />
            <line x1="140" y1="-300" x2="140" y2="300" stroke="var(--teal)" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 8" />
            <rect x="-150" y="-40" width="300" height="80" fill="rgba(0, 196, 167, 0.05)" stroke="var(--teal)" strokeWidth="1" />
            <path d="M -150 -40 L -110 40 L -70 -40 L -30 40 L 10 -40 L 50 40 L 90 -40 L 130 40" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            <circle cx="0" cy="0" r="18" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
            <rect x="-8" y="-8" width="16" height="16" fill="var(--gold)" />
            <path d="M 0 18 L 0 60" stroke="var(--gold)" strokeWidth="2" strokeDasharray="2 2" />
            <path d="M -12 60 C -12 75, 12 75, 12 60" stroke="var(--gold)" strokeWidth="2" fill="none" />
            <text x="-160" y="-50" fill="var(--teal)" fontSize="15" fontFamily="monospace" textAnchor="end" fontWeight="bold">КРАН КК-400Т</text>
            <text x="-160" y="-30" fill="var(--text-secondary)" fontSize="11" fontFamily="monospace" textAnchor="end">ГРУЗОПОДЪЁМНОСТЬ: 400Т / СТАТУС: ОЖИДАНИЕ</text>
          </g>

          {/* Расчетные технические узлы по бокам трека */}
          {NODES.map(node => (
            <g key={node.id} transform={`translate(${endX}, ${node.y})`}>
              <rect x="-60" y="-15" width="120" height="30" fill="rgba(0, 196, 167, 0.05)" stroke="var(--teal)" strokeWidth="1" />
              <path d="M -60 -15 L -40 15 L -20 -15 L 0 15 L 20 -15 L 40 15 L 60 -15" fill="none" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.6" />

              <circle cx="0" cy="0" r="10" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
              <rect x="-4" y="-4" width="8" height="8" fill="var(--gold)" />

              <path d={`M 0 0 L ${node.isLeft ? -70 : 70} 0 L ${node.isLeft ? -110 : 110} -30`} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.8" />
              <text x={node.isLeft ? -120 : 120} y="-32" fill="var(--teal)" fontSize="13" fontFamily="monospace" textAnchor={node.isLeft ? "end" : "start"} fontWeight="bold">
                {node.label}
              </text>
              <text x={node.isLeft ? -120 : 120} y="-16" fill="var(--text-secondary)" fontSize="11" fontFamily="monospace" textAnchor={node.isLeft ? "end" : "start"}>
                {node.value}
              </text>
            </g>
          ))}
        </g>

        {/* ЛОГОТИП WAG (Рисует путь) */}
        <g ref={tipGroupRef} style={{ willChange: 'transform' }}>
          {/* Свечение */}
          <circle cx="0" cy="0" r="45" fill="var(--gold)" opacity="0.04" />
          <circle cx="0" cy="0" r="32" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="8 8" style={{ animation: 'spin 5s linear infinite', transformOrigin: 'center' }} />

          <line x1="-150" y1="0" x2="-40" y2="0" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="6 4" />
          <line x1="40" y1="0" x2="150" y2="0" stroke="var(--teal)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="6 4" />

          {/* WAG логотип */}
          <g transform="scale(0.045) translate(-360, -317)">
            <path fill="var(--gold)" d="M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z"/>
          </g>

          <text x="-160" y="4" fill="var(--teal)" fontSize="14" fontFamily="monospace" textAnchor="end" fontWeight="bold">
            WAG_ЯДРО_АКТИВНО
          </text>
          <text ref={tipTextRef} x="160" y="4" fill="var(--gold)" fontSize="15" fontFamily="monospace" textAnchor="start" fontWeight="bold" letterSpacing="1px">
            P:0x0
          </text>
        </g>

        {/* Скрытый путь для расчётов длины */}
        <path ref={corePathRef} d={mainPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}
