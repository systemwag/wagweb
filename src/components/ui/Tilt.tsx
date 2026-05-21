'use client';

/**
 * Tilt — глобальный 3D-tilt эффект для карточек по типу того, что в Gemini-редизайне.
 *
 * При наведении курсора карточка наклоняется по обеим осям (rotateX/Y), плюс
 * слегка увеличивается через scale3d. Эффект реализован через CSS-переменные,
 * которые подставляются в transform: perspective() ... в стилях карточки.
 *
 * Карточки подписываются на эффект, объявляя transform со ссылками на:
 *   --tilt-x      (rotateX в градусах)
 *   --tilt-y      (rotateY в градусах)
 *   --tilt-scale  (масштаб, 1.0 ↔ 1.02)
 *
 * Отключён для touch-устройств и users с prefers-reduced-motion.
 */

import { useEffect } from 'react';

const SELECTOR = '.glass-card, [class*="dirCard"], [class*="serviceCard"], [class*="card_gold"], [class*="card_teal"], [class*="card_blue"]';
const MAX_DEG  = 8;        // peak rotation (degrees) — больше чем было (6° → 8°)
const SCALE_UP = 1.02;     // peak scale при наведении

export default function Tilt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const handlers = new WeakMap<Element, {
      onMove: (e: Event) => void;
      onLeave: () => void;
    }>();

    const attach = (el: HTMLElement) => {
      if (handlers.has(el)) return;
      const onMove = (ev: Event) => {
        const e = ev as MouseEvent;
        const r = el.getBoundingClientRect();
        // Координаты курсора относительно карточки, нормированные к [-0.5..+0.5]
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        el.style.setProperty('--tilt-y', `${x *  MAX_DEG * 2}deg`);
        el.style.setProperty('--tilt-x', `${y * -MAX_DEG * 2}deg`);
        el.style.setProperty('--tilt-scale', String(SCALE_UP));
      };
      const onLeave = () => {
        el.style.setProperty('--tilt-y', '0deg');
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-scale', '1');
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      handlers.set(el, { onMove, onLeave });
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(attach);
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        const h = handlers.get(el);
        if (!h) return;
        el.removeEventListener('mousemove', h.onMove);
        el.removeEventListener('mouseleave', h.onLeave);
      });
    };
  }, []);

  return null;
}
