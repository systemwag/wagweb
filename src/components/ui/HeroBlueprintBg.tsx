'use client';
import { useEffect, useRef, useState } from 'react';

export default function HeroBlueprintBg() {
  const [mounted, setMounted] = useState(false);
  
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const radarLineRef = useRef<SVGLineElement>(null);
  
  useEffect(() => {
    setMounted(true);
    let animationFrameId: number;
    let startTime = performance.now();

    const animateBlueprint = (timestamp: number) => {
      // 1. Math Data Faking
      const delta = timestamp - startTime;
      if (delta > 200) { // update terminal every 200ms
        textRefs.current.forEach((textNode, idx) => {
          if (textNode) {
            const val1 = (Math.random() * 100).toFixed(4);
            const val2 = (Math.random() * 10).toFixed(2);
            textNode.textContent = `P${idx}_LOAD: ${val1}kN / ${val2}g`;
          }
        });
        startTime = timestamp;
      }

      // 2. Radar spin manual calc if needed, but CSS is easier.
      // We rely on CSS for the radar line spin.

      animationFrameId = window.requestAnimationFrame(animateBlueprint);
    };

    animationFrameId = window.requestAnimationFrame(animateBlueprint);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: 0.15 }} aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crosshair-schema" width="100" height="100" patternUnits="userSpaceOnUse">
             <path d="M 50 45 L 50 55 M 45 50 L 55 50" stroke="var(--teal)" strokeWidth="0.5" />
          </pattern>
        </defs>
        
        {/* Full-screen Crosshair Grid */}
        <rect width="100%" height="100%" fill="url(#crosshair-schema)" />

        {/* ==============================
            RADAR / COMPASS MAP (Top Right)
            ============================== */}
        <g transform="translate(85%, 30%)" stroke="var(--teal)" fill="none">
          {/* Rings */}
          <circle cx="0" cy="0" r="400" strokeWidth="0.5" strokeDasharray="5 15" style={{ animation: 'spin 120s linear infinite', transformOrigin: 'center' }} />
          <circle cx="0" cy="0" r="380" strokeWidth="0.5" strokeDasharray="2 6" style={{ animation: 'spin 60s reverse linear infinite', transformOrigin: 'center' }} />
          <circle cx="0" cy="0" r="395" strokeWidth="4" strokeDasharray="1 90" style={{ animation: 'spin 90s linear infinite', transformOrigin: 'center' }} />
          
          <path d="M -420 0 L 420 0 M 0 -420 L 0 420" strokeWidth="0.5" strokeOpacity="0.4" />
          
          {/* Radar Scanner Line */}
          <line x1="0" y1="0" x2="0" y2="-400" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.8" style={{ animation: 'spin 6s linear infinite', transformOrigin: 'bottom' }} />
          
          <text x="-430" y="4" fill="var(--teal)" fontSize="10" fontFamily="monospace" textAnchor="end">270° W</text>
          <text x="430" y="4" fill="var(--teal)" fontSize="10" fontFamily="monospace" textAnchor="start">90° E</text>
        </g>

        {/* ==============================
            DYNAMIC TERMINAL FEED (Left Center)
            ============================== */}
        <g transform="translate(5%, 60%)" fill="var(--teal)" fontSize="12" fontFamily="monospace" opacity="0.8">
          <text x="0" y="0">WAG_SYS: ENGINEERING PROTOCOL INIT</text>
          <text x="0" y="16">STRUCTURAL_BEARING_ANALYSIS [RUNNING]</text>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <text 
              key={i} 
              x="0" 
              y={35 + i * 16} 
              ref={el => { textRefs.current[i] = el; }}
            >
              P_LOAD: 000.0000kN / 0.00g
            </text>
          ))}
          <path d="M -10 -10 L -10 160 L 0 160" fill="none" stroke="var(--teal)" strokeWidth="1" />
          <rect x="-12" y="160" width="4" height="4" fill="var(--teal)" />
        </g>

        {/* ==============================
            BLUEPRINT TRUSS DIAGRAM (Bottom Right)
            ============================== */}
        <g transform="translate(60%, 75%)" stroke="var(--gold)" fill="none" opacity="0.4">
           {/* Bridge truss mathematical schema */}
           <path d="M 0 0 L 300 0 L 300 80 L 0 80 Z" strokeWidth="1" />
           <path d="M 0 0 L 50 80 L 100 0 L 150 80 L 200 0 L 250 80 L 300 0" strokeWidth="1" strokeDasharray="5 5" />
           <circle cx="150" cy="40" r="30" strokeWidth="1" strokeDasharray="2 4" />
           <line x1="150" y1="-40" x2="150" y2="120" strokeWidth="0.5" />
           <line x1="10" y1="40" x2="290" y2="40" strokeWidth="0.5" />
           
           <text x="160" y="-15" fill="var(--gold)" fontSize="10" fontFamily="monospace">TRUSS_ELEVATION_SC_A</text>
           <text x="160" y="130" fill="var(--gold)" fontSize="10" fontFamily="monospace">SYNC: CALIBRATED</text>
        </g>

        {/* ==============================
            SINE/COSINE TENSION GRAPH (Top Left)
            ============================== */}
        <g transform="translate(10%, 20%)" stroke="var(--teal)" fill="none" opacity="0.5">
           {/* Axis */}
           <path d="M 0 0 L 250 0 M 0 -50 L 0 50" strokeWidth="1" strokeOpacity="0.4" />
           <path d="M 0 0 L 250 0" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1 3" />
           {/* Curve */}
           <path d="M 0 0 Q 50 -100 100 0 T 200 0" strokeWidth="1.5" strokeDasharray="4 4" />
           
           <circle cx="50" cy="-50" r="3" fill="var(--teal)" />
           <line x1="50" y1="0" x2="50" y2="-50" strokeWidth="1" strokeDasharray="2 2" />
           
           <text x="55" y="-55" fill="var(--teal)" fontSize="10" fontFamily="monospace">MAX_TENSION_PEAK [Y: 0.85]</text>
        </g>
      </svg>
    </div>
  );
}
