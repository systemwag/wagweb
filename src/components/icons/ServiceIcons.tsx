/**
 * Service direction icons used in Services.tsx and elsewhere.
 * Kept as separate components for clarity, tree-shaking, and reuse.
 */

export function DesignIcon() {
  return (
    <svg className="svg-draw" viewBox="0 0 64 64" fill="none" width="64" height="64">
      {/* Document outline */}
      <rect x="10" y="8" width="40" height="48" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      {/* Title block */}
      <path d="M16 16h28M16 22h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Coordinate axes */}
      <path d="M18 46V32M18 46h22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Plotted curve */}
      <path d="M18 42 L22 38 L26 40 L30 34 L34 36 L38 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Plot points */}
      <circle cx="22" cy="38" r="1.2" fill="currentColor"/>
      <circle cx="26" cy="40" r="1.2" fill="currentColor"/>
      <circle cx="30" cy="34" r="1.2" fill="currentColor"/>
      <circle cx="34" cy="36" r="1.2" fill="currentColor"/>
      <circle cx="38" cy="30" r="1.2" fill="currentColor"/>
      {/* Compass mark */}
      <circle cx="46" cy="36" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M46 32v8M42 36h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

export function ConstructionIcon() {
  return (
    <svg className="svg-draw" viewBox="0 0 64 64" fill="none" width="64" height="64">
      {/* Ground line */}
      <path d="M6 54h52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Crane mast */}
      <path d="M16 54V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Crane truss (X-pattern) */}
      <path d="M16 14h28M16 22l28 0M16 30l28 0" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <path d="M16 14L44 22M44 14L16 22M16 22L44 30M44 22L16 30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      {/* Crane jib */}
      <path d="M44 14V8H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Hook */}
      <path d="M40 8v14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
      <rect x="38" y="22" width="4" height="3" stroke="currentColor" strokeWidth="1.2"/>
      {/* Building blocks at base */}
      <rect x="22" y="46" width="6" height="8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="30" y="42" width="6" height="12" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="38" y="38" width="6" height="16" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="46" y="34" width="6" height="20" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}
