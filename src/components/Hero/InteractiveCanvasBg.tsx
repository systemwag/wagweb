'use client';

/**
 * InteractiveCanvasBg — частицная сетка с курсорным «магнетизмом»,
 * адаптированная под тёмный gold/teal палитру WAG.
 *
 * Концепция:
 *   • 60 частиц в сетке 6×10, slight drift в пределах ±30px от исходного места
 *   • Если курсор в радиусе 160px — частицы притягиваются с force ∝ (1 - dist/R)
 *     и растут до 2.2× от базового размера
 *   • Тонкие линии связи между близкими частицами (alpha ∝ dist)
 *   • К ближайшей точке от курсора рисуется двойной концентрический прицел
 *     и тонкая линия от курсора — эффект «data targeting»
 *
 * Адаптация для тёмной темы: gold particles + teal accents.
 * Disabled для prefers-reduced-motion.
 */

import React, { useRef, useEffect } from 'react';

// Палитра точек из дизайн-системы проекта (gold доминирует, teal + blue — акценты)
const PARTICLE_PALETTE = [
  'rgba(212, 168, 67, 0.45)',  // gold   #D4A843
  'rgba(212, 168, 67, 0.45)',  // gold   (вес ×2 — бренд-цвет преобладает)
  'rgba(0, 196, 167, 0.42)',   // teal   #00C4A7
  'rgba(79, 132, 255, 0.42)',  // blue   #4F84FF
];

export default function InteractiveCanvasBg({
  particleCount = 120,
}: {
  particleCount?: number;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const connectionDist = 140;
    const mouseRadius = 160;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseSize: number;
      originalX: number;
      originalY: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.color = color;
      }

      update(mouseX: number, mouseY: number, mouseActive: boolean) {
        // Лёгкий дрейф
        this.x += this.vx;
        this.y += this.vy;

        // Пружинка обратно к исходной позиции (ограничение в ±30px)
        const dxFromStart = this.x - this.originalX;
        const dyFromStart = this.y - this.originalY;
        if (Math.abs(dxFromStart) > 30) this.vx *= -1;
        if (Math.abs(dyFromStart) > 30) this.vy *= -1;

        // Притяжение к курсору
        if (mouseActive) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            this.x += (dx / dist) * force * 0.6;
            this.y += (dy / dist) * force * 0.6;
            this.size = this.baseSize * (1 + force * 1.2);
          } else if (this.size > this.baseSize) {
            this.size -= 0.05;
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
      }
    }

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      // Reset transform before scaling, чтобы при resize не аккумулировался scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particles = [];
      // Derive grid from particleCount, biased toward wider strips (hero is wide).
      const cols = Math.max(6, Math.round(Math.sqrt(particleCount * 1.6)));
      const rows = Math.ceil(particleCount / cols);
      for (let i = 0; i < particleCount; i++) {
        const rIndex = Math.floor(i / cols);
        const cIndex = i % cols;
        const x = (width / cols) * (cIndex + 0.5) + (Math.random() - 0.5) * 60;
        const y = (height / rows) * (rIndex + 0.5) + (Math.random() - 0.5) * 60;
        const color = PARTICLE_PALETTE[Math.floor(Math.random() * PARTICLE_PALETTE.length)];
        particles.push(new Particle(x, y, color));
      }
    };

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    init();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update + draw particles
      const m = mouseRef.current;
      particles.forEach((p) => {
        p.update(m.x, m.y, m.active);
        p.draw(ctx);
      });

      // Связь между близкими (alpha ∝ dist)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.10;
            ctx.strokeStyle = `rgba(0, 196, 167, ${alpha})`; // teal
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Targeting reticle на ближайшую частицу от курсора
      if (m.active && m.x > 0 && m.x < width) {
        let closestP = particles[0];
        let minDist = Infinity;
        particles.forEach((p) => {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) { minDist = dist; closestP = p; }
        });

        if (minDist < 180) {
          const tx = closestP.x;
          const ty = closestP.y;

          // Внешнее золотое кольцо
          ctx.strokeStyle = 'rgba(212, 168, 67, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(tx, ty, 20, 0, Math.PI * 2);
          ctx.stroke();

          // Внутреннее teal кольцо
          ctx.strokeStyle = 'rgba(0, 196, 167, 0.16)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(tx, ty, 30, 0, Math.PI * 2);
          ctx.stroke();

          // Линия от курсора к ближайшей частице
          ctx.strokeStyle = 'rgba(212, 168, 67, 0.18)';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // Микро-точка под курсором
          ctx.fillStyle = 'rgba(212, 168, 67, 0.7)';
          ctx.beginPath();
          ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const parent = canvas.parentElement;
    parent?.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent?.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
