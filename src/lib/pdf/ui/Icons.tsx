/**
 * Outline icons for the Contacts page (phone, email, pin, clock).
 * Plain SVG primitives, no external dependencies.
 */
import { Svg, Path, Polyline, Circle, Line, Rect } from '@react-pdf/renderer';

type IconProps = { size?: number; color?: string };

export function IconPhone({ size = 14, color = '#C9941F' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

export function IconMail({ size = 14, color = '#C9941F' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={1.6} fill="none" />
      <Polyline points="22,6 12,13 2,6" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function IconPin({ size = 14, color = '#C9941F' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth={1.6} fill="none" />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function IconClock({ size = 14, color = '#C9941F' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.6} fill="none" />
      <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Industry icons — stroke-only outline at 24×24 for chip rows
   ───────────────────────────────────────────────────────────────── */

// Rails / roads — parallel lines with ties
export function IconRail({ size = 10, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={8} y1={3} x2={8} y2={21}   stroke={color} strokeWidth={1.5} />
      <Line x1={16} y1={3} x2={16} y2={21} stroke={color} strokeWidth={1.5} />
      <Line x1={6} y1={6}  x2={18} y2={6}  stroke={color} strokeWidth={1.5} />
      <Line x1={6} y1={12} x2={18} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={6} y1={18} x2={18} y2={18} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

// Pipeline — horizontal tube with valve
export function IconPipe({ size = 10, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={8} width={20} height={8} fill="none" stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={4} x2={12} y2={8}  stroke={color} strokeWidth={1.5} />
      <Rect x={9} y={2} width={6} height={3} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

// Power lines — pylon
export function IconPower({ size = 10, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 12 2 L 5 22 M 12 2 L 19 22 M 7 14 L 17 14 M 8 18 L 16 18 M 9 10 L 15 10" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

// Industrial building — silos with roof line
export function IconIndustry({ size = 10, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 3 21 L 3 9 L 8 6 L 8 21 M 8 13 L 14 13 L 14 9 L 19 9 L 19 21 L 3 21 M 11 13 L 11 21 M 16 13 L 16 21" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

// Networks — nodes with connections
export function IconNetwork({ size = 10, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={6} r={2} fill="none" stroke={color} strokeWidth={1.4} />
      <Circle cx={19} cy={6} r={2} fill="none" stroke={color} strokeWidth={1.4} />
      <Circle cx={12} cy={18} r={2} fill="none" stroke={color} strokeWidth={1.4} />
      <Line x1={5} y1={6} x2={19} y2={6}   stroke={color} strokeWidth={1.4} />
      <Line x1={5} y1={6} x2={12} y2={18}  stroke={color} strokeWidth={1.4} />
      <Line x1={19} y1={6} x2={12} y2={18} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

// Small chevron bullet for info chips and section markers
export function IconChevron({ size = 8, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 8 4 L 16 12 L 8 20" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Diamond bullet — used in info chips
export function IconDiamond({ size = 8, color = '#B58923' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 12 3 L 21 12 L 12 21 L 3 12 Z" fill={color} />
    </Svg>
  );
}

export const INDUSTRY_ICONS = {
  rail:     IconRail,
  pipe:     IconPipe,
  power:    IconPower,
  industry: IconIndustry,
  network:  IconNetwork,
} as const;
