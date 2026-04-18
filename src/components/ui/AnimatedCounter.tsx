'use client';

import { useEffect, useState, useRef } from 'react';

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export default function AnimatedCounter({ 
  target, 
  duration = 2000, 
  className 
}: { 
  target: number; 
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const incrementTime = 30; // ms per frame
    const totalSteps = duration / incrementTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const easedProgress = easeOutExpo(progress);
      
      const currentValue = Math.floor(easedProgress * target);
      setCount(currentValue);

      if (currentStep >= totalSteps) {
        setCount(target);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration, isVisible]);

  return <span ref={ref} className={className}>{count.toLocaleString('ru-RU')}</span>;
}
