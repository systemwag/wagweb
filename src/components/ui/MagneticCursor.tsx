'use client';

import { useEffect, useState, useRef } from 'react';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Only activate cursor on devices with a fine pointer (mouse)
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsMobile(false);
      document.body.classList.add('custom-cursor-active');
    } else {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const attachHoverEvents = () => {
      const hoverElements = document.querySelectorAll('a, button, .glass-card, [role="button"]');
      
      const onMouseEnter = () => { isHovering = true; };
      const onMouseLeave = () => { isHovering = false; };

      hoverElements.forEach((el) => {
        // Remove old listeners to avoid duplicates if DOM changes
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });
    };

    // Initial attach
    attachHoverEvents();

    // Re-attach if DOM heavily changes (MutationObserver could be used, but let's keep it simple)
    const observer = new MutationObserver(attachHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      // Lerp for smooth trailing effect
      const speed = 0.25;
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      
      if (cursorRef.current) {
        // Apply transform. Scale is handled here too for immediate response without CSS conflict
        const scale = isHovering ? 2.5 : 1;
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'var(--gold)',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
        transition: 'transform 0.1s linear', // smooth out scale changes
      }}
    />
  );
}
