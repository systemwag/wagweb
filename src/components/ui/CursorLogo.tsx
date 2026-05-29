'use client';

/**
 * CursorLogo — глобальный золотой знак WAG, преследующий курсор по всему сайту,
 * с ракетным шлейфом: тёплый золотой «дым» (мягкие тающие клубы) + яркие искры,
 * вылетающие из-за знака по направлению движения.
 *
 * Знак движется со сглаживанием (lerp) → выраженный «хвост». Из его позиции
 * эмитятся частицы пропорционально скорости. Рендер на fixed-канвасе под знаком.
 *
 * Декорация (aria-hidden, pointer-events:none). Отключается при
 * prefers-reduced-motion и на тач-устройствах (pointer: coarse).
 */

import { useEffect, useRef } from 'react';
import styles from './CursorLogo.module.css';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // 1 → 0
  decay: number;
  size: number;
  grow: number;      // прирост размера за кадр (дым растёт)
  spark: boolean;
};

export default function CursorLogo() {
  const logoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const el = logoRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let targetX = -200, targetY = -200;
    let curX = targetX, curY = targetY;
    let prevX = curX, prevY = curY;
    let shown = false;
    let raf = 0;
    const particles: Particle[] = [];
    const MAX = 260;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!shown) { shown = true; el.style.opacity = '0.6'; }
    };
    const onLeave = () => { shown = false; el.style.opacity = '0'; };

    const emit = (x: number, y: number, dirX: number, dirY: number, speed: number) => {
      // Дым — мягкие клубы, эмит позади знака, медленно расходятся и тают
      const smokeCount = Math.min(3, 1 + Math.floor(speed / 6));
      for (let i = 0; i < smokeCount; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: dirX * (0.3 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.5,
          vy: dirY * (0.3 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.5 - 0.15,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          size: 3 + Math.random() * 4,
          grow: 0.18 + Math.random() * 0.22,
          spark: false,
        });
      }
      // Искры — быстрые яркие точки, тем чаще, чем выше скорость
      if (speed > 3) {
        const sparkCount = Math.min(4, Math.floor(speed / 4));
        for (let i = 0; i < sparkCount; i++) {
          const a = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 1.1;
          const sp = 1.2 + Math.random() * 2.8;
          particles.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: 1,
            decay: 0.03 + Math.random() * 0.03,
            size: 1 + Math.random() * 1.4,
            grow: -0.01,
            spark: true,
          });
        }
      }
    };

    const tick = () => {
      // Сглаженное преследование курсора
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      el.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) translate(-50%, -50%)`;

      // Скорость и направление «выхлопа» (назад по ходу движения)
      const mvX = curX - prevX;
      const mvY = curY - prevY;
      const speed = Math.hypot(mvX, mvY);
      prevX = curX; prevY = curY;

      if (shown && speed > 0.4) {
        const inv = speed > 0 ? 1 / speed : 0;
        emit(curX, curY, -mvX * inv, -mvY * inv, speed);
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Дым (мягкие клубы, обычное наложение)
      ctx.globalCompositeOperation = 'source-over';
      for (const p of particles) {
        if (p.spark) continue;
        const a = p.life * 0.32;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(240, 200, 90, ${a})`);
        g.addColorStop(1, 'rgba(212, 168, 67, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Искры (аддитивное свечение поверх дыма)
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (!p.spark) continue;
        ctx.fillStyle = `rgba(255, 232, 158, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Обновление + удаление мёртвых
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.spark) {
          p.vy += 0.06;          // лёгкая «гравитация» искр
          p.vx *= 0.98;
        } else {
          p.vy -= 0.01;          // дым чуть всплывает
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
        p.size += p.grow;
        p.life -= p.decay;
        if (p.life <= 0 || p.size <= 0) particles.splice(i, 1);
      }
      // Бэкстоп от переполнения
      if (particles.length > MAX) particles.splice(0, particles.length - MAX);

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className={styles.trail} aria-hidden="true" />
      <div ref={logoRef} className={styles.cursor} aria-hidden="true">
        <svg viewBox="0 0 719.49 635.66" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="var(--gold)"
            d="M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z"
          />
        </svg>
      </div>
    </>
  );
}
