'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      // easeOutExpo — quick start, smooth landing
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Доступ для страниц с программным скроллом (навигация по этапам в 3D-историях):
    // нативный window.scrollTo(smooth) дёргается вместе с Lenis, поэтому даём инстанс.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
