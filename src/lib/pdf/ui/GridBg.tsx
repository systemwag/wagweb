/**
 * Engineering grid background for dark pages — full-bleed SVG with
 * a faint dotted square grid plus 4 stronger anchor dots in the corners
 * of the inner safe area.
 *
 * Mirrors the GlobalVerticalBg visual language used on the website but
 * adapted for a single static A4 page.
 */
import { Svg, Line, Circle } from '@react-pdf/renderer';

const W = 210;   // A4 width in mm
const H = 297;   // A4 height in mm
const STEP = 12; // grid step in mm

export function GridBg() {
  const lines = [];

  // Vertical hairlines
  for (let x = STEP; x < W; x += STEP) {
    lines.push(
      <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="rgba(212,168,67,0.05)" strokeWidth={0.1} />,
    );
  }
  // Horizontal hairlines
  for (let y = STEP; y < H; y += STEP) {
    lines.push(
      <Line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="rgba(212,168,67,0.05)" strokeWidth={0.1} />,
    );
  }
  // Dot accents at every 4th intersection — subtle tech/engineering feel
  const dots = [];
  for (let x = STEP * 2; x < W; x += STEP * 4) {
    for (let y = STEP * 2; y < H; y += STEP * 4) {
      dots.push(
        <Circle key={`d${x}-${y}`} cx={x} cy={y} r={0.25} fill="rgba(212,168,67,0.18)" />,
      );
    }
  }

  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0, width: '210mm', height: '297mm' }}
      viewBox={`0 0 ${W} ${H}`}
    >
      {lines}
      {dots}
    </Svg>
  );
}
