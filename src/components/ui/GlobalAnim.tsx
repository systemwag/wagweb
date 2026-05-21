'use client';

import { useEffect } from 'react';

/**
 * Scroll-reveal driver.
 *
 * In browsers that support `animation-timeline: view()` (Chrome/Edge),
 * CSS handles reveals natively — this component does nothing.
 *
 * In other browsers (Firefox at time of writing), we tag elements with
 * `.anim-el` and use IntersectionObserver to add `.is-revealed`. The
 * cascade delay is set via the `--anim-delay` custom property based on
 * the element's index among its tagged siblings — robust to heterogeneous
 * children, unlike the previous :nth-child approach.
 */
export default function GlobalAnim() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Scroll-driven is handled entirely by CSS; bail out.
    if (CSS.supports('animation-timeline: view()')) return;

    // Reduced motion: reveal everything immediately, no observer.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const selectors = [
      'h2',
      'h3',
      '.glass-card',
      '[class*="dirCard"]',
      '[class*="serviceCard"]',
      '.btn-outline',
      '.btn-primary',
      'p',
      'li',
    ].join(', ');

    // Tag elements outside Hero with .anim-el
    const candidates = document.querySelectorAll(selectors);
    const tagged: HTMLElement[] = [];
    candidates.forEach((el) => {
      if (el.closest('[class*="hero"]')) return;
      el.classList.add('anim-el');
      tagged.push(el as HTMLElement);
    });

    // Cascade delay: count tagged siblings under the same direct parent
    const indexByParent = new Map<Element, number>();
    tagged.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const i = indexByParent.get(parent) ?? 0;
      el.style.setProperty('--anim-delay', `${Math.min(i * 0.08, 0.6)}s`);
      indexByParent.set(parent, i + 1);
    });

    if (reduceMotion) {
      tagged.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    tagged.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
