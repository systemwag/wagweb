---
name: engineering-line
description: Recreates the WAG GlobalVerticalBg animation — a self-drawing SVG engineering line that scrolls with the page, complete with nodes, structures, and a moving tip indicator. Use when asked to add a vertical engineering/blueprint background animation to a page or layout.
---

You are recreating the WAG engineering line animation. Implement it exactly as described below — no approximations.

## What this animation does

A fixed SVG that fills the viewport height (16000px tall) and scrolls via `translateY(-scrollY)` on the wrapper. A single curved path draws itself from top to bottom over **50 seconds** using `requestAnimationFrame` + `strokeDashoffset`. A glowing tip indicator (WAG logo or custom icon) rides the front of the drawing line. Engineering structures and data nodes appear along the track.

---

## Tech constraints

- `'use client'` React component
- No CSS animation for the draw — only `requestAnimationFrame` loop
- All DOM mutations via `useRef` (zero re-renders during animation)
- `usePathname` to hide on `/admin` routes and mobile (`w < 900`)
- `position: fixed; inset: 0; zIndex: 10; pointerEvents: none`

---

## Exact color values

```
Background shadow:  rgba(4, 6, 12, 0.6)          strokeWidth: 80
Teal guide dashes:  var(--teal)  opacity: 0.8     strokeWidth: 122  dasharray: "10 10"
Gold sleepers:      var(--gold)  opacity: 0.4     strokeWidth: 56   dasharray: "6 38"
Gold rails (main):  var(--gold)  opacity: 0.9     strokeWidth: 34
```

## Exact mask values

```
hollowRailsMask:     strokeWidth 30   (cuts the center gap between rails)
blueprintGuidesMask: strokeWidth 120  (clips teal guides to outside of rails)
drawMask:            strokeWidth 600  (reveal window that moves with progress)
```

---

## Path geometry

```js
const startX = w * 0.2;   // 20% from left
const endX   = w * 0.85;  // 85% from left

const mainPath = `M ${startX} -100
                  C ${startX} 300, ${endX} 100, ${endX} 600
                  V 16000`;
```
The path enters from the left (startX), curves over to the right (endX) in the first ~600px, then goes straight down to 16000px.

---

## Animation loop

```js
const DURATION = 50000; // ms — 50 seconds full draw

const drawLoop = (timestamp) => {
  if (!startTime) startTime = timestamp;
  const progress = Math.min((timestamp - startTime) / DURATION, 1);
  const currentDrawLength = pathLen * progress;
  const dashOffset = pathLen - currentDrawLength;

  maskPathRef.current.style.strokeDasharray = `${pathLen}`;
  maskPathRef.current.style.strokeDashoffset = `${dashOffset}`;

  // Move tip to front of line
  const point = corePathRef.current.getPointAtLength(currentDrawLength);
  tipGroupRef.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
  tipTextRef.current.textContent = `P:${Math.floor(point.x)}x${Math.floor(point.y)}`;

  if (progress < 1) animationFrameId = requestAnimationFrame(drawLoop);
};
```

---

## Scroll parallax

```js
// Passive scroll → translateY the SVG wrapper up by scrollY
const handleScroll = () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      svgWrapperRef.current.style.transform = `translateY(${-window.scrollY}px)`;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
};
```
The SVG has `willChange: 'transform'` for GPU compositing.

---

## Engineering nodes (repeating data labels)

Generate ~40 nodes spaced every ~500px from y=1200, alternating left/right:

```js
const NODES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  y: 1200 + i * 500 + Math.random() * 300,
  label: `УЗЕЛ-В${1000 + i * 14}`,
  value: ['НАГРУЗКА: НОРМА', 'НАТЯЖЕНИЕ: 120кН', 'СИНХР: ЗАВЕРШЕНО', 'УКЛОН: 0.5‰'][i % 4],
  isLeft: i % 2 === 0,
}));
// Filter out nodes that fall inside major structures (bridge, siding etc)
```

Each node renders at `translate(endX, node.y)`:
- `rect` 120×30px, fill `rgba(0,196,167,0.05)`, stroke `var(--teal)` strokeWidth 1
- Zigzag path across the rect, stroke `var(--teal)` opacity 0.6
- Center `circle` r=10, fill `var(--bg-primary)`, stroke `var(--gold)` strokeWidth 2
- Inner `rect` 8×8 fill `var(--gold)` (diamond marker)
- Leader line: `M 0 0 L ±70 0 L ±110 -30` stroke `var(--teal)` strokeWidth 1.5
- Label text: fontSize 13, `var(--teal)`, monospace, bold
- Value text: fontSize 11, `var(--text-secondary)`, monospace

---

## Engineering structures (placed at fixed y offsets from endX)

### РАЗЪЕЗД (Siding) — y: 2500
- Branch path curving left, then rejoining: sleepers + two rail lines
- Midpoint circle: r=8, stroke `var(--teal)`
- Label: `[РАЗЪЕЗД: РЗ-АЛЬФА]` + `СТРЕЛКА: СИНХР`

### ЖД МОСТ (Bridge) — y: 3800
- Two dashed columns (rect, stroke `var(--teal)` dasharray "6 6")
- Top and bottom chord lines, zigzag truss diagonals
- Dimension line with arrowheads and rotated `L=48м` label
- Water ripple lines (sinusoidal paths, opacity 0.2–0.3)
- Labels: `ЖД МОСТ МС-12` / `ПРОЛЁТ: 48М / КЛАСС: Н-18`

### ПЕРЕЕЗД (Level Crossing) — y: 5000
- Road path across the track (wide semi-transparent stroke)
- Stop line dashes, two red signal circles
- Label: `ЖД ПЕРЕЕЗД ПР-9`

### ТУПИК (Dead-end) — y: 6500
- Branch veering left, ending with П-shaped buffer stop
- X mark in red on the buffer
- Switch point marker (circle + line)
- Labels: `ТУПИК ТП-7` + `ДЛИНА: 120М / СТАТУС: СВОБОДЕН`

### КРАН (Gantry Crane) — y: 8000
- Two vertical dashed columns
- Horizontal beam rect with zigzag understructure
- Hanging hook (arc + dashed line)
- Center square marker in gold
- Labels: `КРАН КК-400Т` + `ГРУЗОПОДЪЁМНОСТЬ: 400Т`

---

## Tip indicator (moving head)

Positioned via `tipGroupRef` at `translate(point.x, point.y)`:

```
- Outer glow: circle r=45, fill var(--gold) opacity 0.04
- Spinning ring: circle r=32, stroke var(--gold) strokeWidth 1.5, dasharray "8 8"
  animation: spin 5s linear infinite (CSS @keyframes spin { to { rotate: 360deg } })
- Left antenna: line x1=-150 → x1=-40, stroke var(--teal) dasharray "6 4"
- Right antenna: line x1=40 → x1=150, stroke var(--teal) dasharray "6 4"
- Center icon: WAG logo SVG scaled at 0.045, or replace with project-appropriate icon
- Left label: "WAG_ЯДРО_АКТИВНО" fill var(--teal) fontSize 14 monospace bold
- Right label: coordinate readout fill var(--gold) fontSize 15 monospace bold
```

---

## SVG layer order (bottom to top inside `<g mask="url(#drawMask)">`)

1. Shadow path (wide dark stroke, background shadow)
2. Teal guide dashes (masked by blueprintGuidesMask)
3. Gold sleeper dashes
4. Gold rails (masked by hollowRailsMask)
5. Engineering structures (siding, bridge, crossing, dead-end, crane)
6. Data nodes
7. (Outside drawMask) Tip indicator group

---

## Refs needed

```ts
const svgWrapperRef = useRef<SVGSVGElement>(null);   // translateY scroll
const maskPathRef   = useRef<SVGPathElement>(null);  // strokeDashoffset
const tipGroupRef   = useRef<SVGGElement>(null);     // transform tip position
const tipTextRef    = useRef<SVGTextElement>(null);  // coordinate text
const corePathRef   = useRef<SVGPathElement>(null);  // getTotalLength / getPointAtLength
```

---

## Customisation guide

| What to change | Where |
|---|---|
| Draw speed | `DURATION` constant (ms) |
| Path position | `startX` / `endX` multipliers |
| Rail width | `hollowRailsMask` strokeWidth (gap) + main rail strokeWidth |
| Sleeper density | `strokeDasharray "6 38"` — first number is sleeper, second is gap |
| Tip icon | Replace WAG `<path>` inside tipGroupRef group |
| Node labels/values | `NODES` array — label and value strings |
| Add structure | New `<g transform="translate(endX, Y)">` inside drawMask group |
| Total height | Change `V 16000` and SVG height attribute |

---

## Implementation checklist

- [ ] `'use client'` at top
- [ ] All 5 refs declared
- [ ] `useEffect` cleanup cancels `animationFrameId` and removes event listeners
- [ ] Component returns `null` when `!mounted || w < 900 || pathname.startsWith('/admin')`
- [ ] SVG wrapper has `willChange: 'transform'`
- [ ] maskPath has `willChange: 'stroke-dashoffset'`
- [ ] Hidden `corePathRef` path has `stroke="none" fill="none"` (calculations only)
- [ ] `@keyframes spin` defined in CSS for the rotating tip ring
