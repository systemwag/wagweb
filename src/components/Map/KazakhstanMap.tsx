'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './Map.module.css';
import type { Project } from '@/lib/types';

/* ── Kazakhstan path data ──────────────────────────────────────────────────── */
const KZ_MAIN =
  'M5567 8003 c-4 -3 -7 -15 -7 -25 0 -22 -18 -23 -42 -1 -17 15 -18 15 -18 -5 0 -11 -5 -24 -10 -27 -6 -4 -8 -15 -5 -25 4 -14 -2 -19 -32 -26 -21 -4 -44 -6 -52 -5 -10 2 -12 -6 -7 -32 4 -23 2 -38 -5 -42 -8 -6 -8 -10 2 -15 24 -15 -10 -40 -53 -40 -28 0 -45 -6 -57 -21 -9 -12 -29 -23 -43 -24 -14 -2 -35 -8 -46 -14 -11 -6 -29 -11 -40 -11 -11 0 -52 -13 -92 -30 -40 -16 -84 -30 -98 -30 -14 0 -40 -11 -59 -26 -31 -24 -33 -24 -33 -5 0 30 -16 34 -39 10 -16 -17 -28 -21 -54 -16 -30 5 -39 1 -66 -27 -21 -22 -31 -42 -31 -64 0 -30 -1 -31 -25 -20 -19 9 -29 7 -50 -6 -18 -12 -47 -18 -93 -18 -74 0 -112 -16 -112 -48 0 -22 -20 -26 -37 -9 -9 9 -20 9 -44 0 -17 -6 -47 -11 -64 -11 -18 0 -38 -7 -45 -15 -7 -8 -24 -15 -39 -15 -14 0 -45 -9 -68 -20 -34 -15 -42 -24 -40 -42 1 -14 -4 -23 -15 -26 -14 -3 -18 3 -18 27 0 30 -2 31 -42 31 -25 0 -49 -7 -60 -17 -17 -15 -19 -15 -32 3 -12 15 -19 17 -42 9 -25 -9 -32 -7 -49 12 -28 32 -67 22 -63 -16 3 -23 0 -26 -24 -23 -33 3 -39 -23 -8 -33 26 -8 25 -25 -1 -70 -26 -44 -19 -54 42 -62 50 -6 80 -28 72 -50 -4 -11 -17 -14 -44 -11 -34 3 -39 1 -39 -17 0 -11 4 -26 8 -33 16 -24 76 -62 101 -63 37 -1 109 -83 91 -104 -9 -11 -16 -11 -29 -3 -12 7 -23 8 -36 1 -13 -8 -30 -5 -63 10 -44 19 -47 19 -79 2 -18 -10 -33 -24 -33 -31 0 -14 -66 -74 -81 -74 -14 0 0 -43 17 -53 8 -4 14 -16 14 -26 0 -10 11 -28 25 -41 36 -34 32 -69 -13 -113 -26 -25 -47 -37 -67 -37 -18 -1 -44 -13 -65 -30 -19 -17 -45 -30 -57 -30 -13 0 -23 -6 -23 -13 0 -18 21 -37 41 -37 9 0 19 -9 22 -19 3 -11 17 -22 36 -26 31 -7 31 -7 15 -36 -20 -40 -4 -63 38 -54 24 6 37 -1 85 -41 38 -33 64 -48 82 -47 18 1 34 -9 54 -33 16 -19 24 -34 19 -34 -6 0 -20 -42 -33 -94 l-22 -94 -71 -29 c-65 -27 -75 -28 -123 -18 -52 10 -93 37 -93 61 0 7 -9 18 -20 24 -17 9 -23 4 -51 -45 -17 -30 -34 -55 -37 -55 -4 0 -16 7 -26 15 -11 8 -30 15 -43 15 -30 0 -140 53 -175 84 -15 13 -31 42 -37 63 -8 29 -19 43 -44 55 -22 10 -39 13 -49 7 -10 -6 -26 -4 -44 6 -42 22 -63 19 -70 -10 -8 -34 -43 -33 -84 2 -25 20 -49 29 -98 35 -43 5 -68 4 -72 -3 -4 -6 -18 -7 -33 -3 -21 5 -27 2 -27 -9 0 -11 -12 -17 -37 -19 -36 -3 -38 -5 -46 -48 -7 -36 -15 -50 -42 -68 -45 -29 -61 -28 -96 7 -16 17 -37 32 -47 35 -22 7 -52 57 -52 85 0 16 -8 23 -29 27 -16 3 -39 19 -51 36 -12 16 -29 28 -38 26 -14 -3 -17 -17 -17 -88 0 -82 -1 -85 -24 -88 -21 -3 -23 -1 -16 25 14 55 8 80 -28 125 -22 26 -37 56 -39 78 -3 30 -8 36 -45 50 -57 21 -80 45 -88 90 -8 50 -22 68 -71 89 -27 12 -47 15 -62 10 -14 -5 -30 -4 -41 3 -13 8 -27 8 -48 0 -29 -9 -31 -8 -49 26 -10 21 -21 51 -24 67 -4 26 -9 30 -35 27 -16 -1 -41 -3 -55 -3 -46 0 -70 -19 -70 -56 0 -38 -9 -41 -35 -13 -10 11 -31 20 -46 20 -34 0 -48 19 -26 34 26 20 -10 56 -61 63 -28 4 -46 13 -53 25 -14 26 -29 13 -29 -24 0 -30 -1 -31 -19 -14 -24 22 -41 13 -41 -19 0 -30 -77 -95 -112 -95 -14 0 -42 -13 -63 -30 -43 -34 -39 -33 -82 -21 -44 13 -61 -7 -43 -49 7 -17 11 -32 9 -33 -2 -1 -25 -12 -51 -25 -27 -12 -48 -27 -48 -33 0 -12 -58 -8 -94 7 -15 6 -17 4 -12 -14 4 -11 11 -58 16 -104 5 -45 12 -99 16 -118 7 -43 -13 -65 -67 -75 -33 -6 -39 -4 -72 35 -24 29 -40 61 -48 97 -15 66 -58 135 -95 152 -20 9 -35 9 -60 1 -32 -11 -34 -14 -34 -58 0 -30 -8 -61 -23 -87 -20 -35 -27 -40 -54 -37 -38 4 -51 -15 -71 -98 -7 -30 -15 -65 -19 -78 -4 -16 3 -34 23 -60 42 -54 36 -95 -17 -122 -30 -16 -39 -26 -39 -47 0 -15 -14 -44 -33 -67 -54 -66 -61 -83 -43 -111 9 -13 37 -30 65 -40 56 -18 65 -27 75 -70 4 -16 17 -38 29 -48 l22 -19 -27 6 c-31 7 -33 2 -13 -34 8 -14 14 -37 15 -51 0 -17 9 -33 25 -43 23 -15 25 -15 25 -1 0 18 30 13 65 -11 11 -8 38 -14 61 -14 l41 0 38 -87 c22 -47 49 -98 60 -112 33 -40 146 -261 140 -271 -9 -14 -31 -12 -63 4 -31 15 -72 5 -72 -18 0 -20 19 -25 134 -38 56 -6 105 -15 110 -19 15 -13 -45 -23 -65 -10 -25 15 -44 14 -58 -2 -14 -18 16 -46 84 -79 72 -36 118 -41 168 -18 23 10 58 22 78 25 20 3 46 16 59 30 l23 25 -40 0 c-22 0 -43 3 -46 7 -12 11 13 31 33 26 12 -3 20 0 20 7 0 7 7 10 15 7 8 -4 17 -2 20 3 4 7 13 6 25 0 13 -7 21 -6 30 5 6 7 17 12 24 9 7 -3 20 6 29 20 12 17 29 27 60 31 58 9 104 -11 161 -71 37 -38 47 -44 52 -31 5 14 10 11 28 -16 23 -34 56 -48 56 -24 0 7 11 19 25 25 14 6 25 16 25 21 0 5 21 1 48 -9 26 -11 60 -22 76 -25 l28 -6 -6 -80 c-6 -68 -5 -79 8 -79 38 0 8 -119 -40 -155 -38 -29 -51 -60 -34 -80 10 -13 7 -15 -19 -15 -17 0 -31 -4 -31 -10 0 -13 -115 -13 -163 1 -32 9 -43 7 -65 -8 -15 -9 -32 -16 -38 -15 -15 3 -50 -38 -61 -73 -6 -19 -17 -31 -31 -33 -28 -4 -29 -32 -2 -55 11 -9 20 -25 20 -36 0 -36 12 -51 40 -51 16 0 32 -5 35 -10 4 -7 -9 -10 -37 -10 -24 1 -51 0 -60 0 -9 -1 -30 9 -47 21 -23 17 -38 20 -66 16 -21 -4 -45 -1 -56 6 -15 9 -22 8 -39 -10 -28 -30 -25 -54 9 -87 22 -21 36 -27 54 -23 28 8 67 -17 67 -41 0 -10 6 -26 14 -37 7 -11 16 -36 20 -55 3 -19 20 -55 37 -80 24 -36 30 -54 28 -90 -1 -25 -1 -51 0 -57 1 -15 66 -57 102 -66 18 -5 33 -21 50 -56 l24 -50 51 -1 c36 0 54 -4 58 -15 4 -10 14 -13 36 -9 28 6 31 3 49 -38 l20 -44 -30 -89 c-32 -94 -32 -103 -8 -226 l12 -66 46 26 c81 46 177 71 271 71 l86 0 67 -56 c37 -30 67 -62 67 -70 0 -8 34 -64 76 -124 l76 -110 62 0 63 0 7 98 c3 53 9 330 12 614 l7 518 31 6 c17 3 168 33 336 67 l304 62 11 42 c14 57 23 64 91 67 33 1 65 5 72 10 11 6 10 1 -1 -21 -29 -55 22 -81 58 -30 8 12 15 16 15 9 0 -7 5 -10 10 -7 11 7 7 108 -5 158 -7 26 -5 28 16 25 21 -3 24 -9 27 -55 2 -32 9 -56 19 -65 13 -10 17 -10 20 0 6 17 38 15 53 -3 7 -8 10 -25 6 -39 -4 -15 -1 -28 6 -32 17 -11 -17 -22 -67 -23 -53 -2 -64 -10 -58 -45 5 -26 8 -28 42 -22 95 17 141 19 145 5 2 -8 16 -67 31 -131 23 -101 25 -121 15 -153 -11 -34 -10 -39 13 -63 13 -15 85 -108 160 -208 l135 -180 173 22 174 22 162 -26 162 -26 51 24 52 24 20 -24 c11 -14 25 -32 32 -41 6 -9 24 -20 41 -26 23 -7 40 -28 79 -102 33 -60 54 -90 63 -86 7 3 20 8 28 11 13 5 15 -13 15 -134 0 -157 -3 -152 81 -152 l35 0 12 -75 c14 -90 51 -170 84 -179 13 -3 73 -6 134 -6 73 0 126 -5 156 -16 l46 -15 -9 -37 c-6 -29 -4 -41 9 -55 28 -31 51 -39 93 -32 l39 7 0 48 c0 46 2 48 38 63 42 18 92 61 92 81 0 18 66 76 85 76 8 0 26 18 41 39 14 22 37 42 50 45 17 5 26 16 31 36 3 16 12 35 19 41 8 6 14 18 14 26 0 20 25 26 49 13 18 -9 25 -6 52 25 17 19 37 35 44 35 24 0 73 50 85 85 12 35 58 77 100 90 14 4 33 15 43 24 31 26 206 17 276 -15 44 -20 63 -23 102 -18 36 5 55 2 73 -10 28 -18 63 -21 86 -6 12 8 13 13 2 27 -24 34 -25 45 -8 73 9 16 16 41 16 57 0 18 9 38 23 50 32 29 110 53 152 46 28 -4 35 -2 35 11 0 23 20 20 97 -13 116 -49 214 -71 312 -71 81 0 90 2 96 20 7 22 13 23 135 25 56 1 88 7 125 24 43 21 58 23 115 16 75 -9 75 -9 235 5 166 14 161 14 248 12 75 -2 79 -3 121 -42 41 -38 47 -40 107 -40 46 0 78 -7 114 -23 l50 -24 0 95 c0 61 4 97 11 99 6 2 20 10 30 18 17 12 17 17 6 35 -7 12 -12 23 -10 23 45 22 64 36 66 51 7 34 -8 82 -43 136 -19 30 -35 62 -35 71 0 9 -7 22 -15 29 -8 7 -15 26 -15 42 0 16 -7 45 -16 66 -9 22 -14 57 -12 87 l3 50 -53 0 c-97 0 -83 53 23 85 22 6 72 20 110 30 39 10 104 34 144 54 l75 36 21 -20 c17 -16 38 -21 94 -23 81 -4 91 4 91 67 0 34 -2 36 -31 36 l-31 0 7 58 c4 31 6 82 6 112 -1 38 11 98 39 192 22 75 40 147 40 161 0 45 19 48 106 21 71 -23 89 -25 177 -20 53 3 97 3 97 -1 0 -5 4 -14 8 -21 6 -9 25 -4 76 23 37 19 74 35 82 35 7 0 16 12 20 28 3 15 7 33 9 39 2 7 -2 34 -11 60 -24 80 -34 181 -22 242 12 64 36 91 80 91 36 0 88 26 88 44 0 7 6 19 14 25 9 7 13 33 14 76 0 71 12 95 47 95 37 0 35 10 -11 59 -61 65 -77 96 -61 122 10 16 9 21 -3 29 -22 14 -26 13 -38 -15 -6 -13 -25 -31 -41 -40 -17 -8 -33 -26 -37 -40 -5 -19 -10 -23 -23 -16 -37 19 -82 21 -108 4 -25 -16 -26 -16 -47 9 -45 56 -84 114 -90 133 -6 22 -84 75 -109 75 -21 0 -47 38 -47 70 0 20 -21 47 -83 107 l-82 81 -69 7 c-58 6 -70 5 -78 -9 -5 -9 -22 -16 -38 -16 -19 0 -30 -5 -30 -14 0 -32 -122 -52 -177 -29 -22 9 -49 12 -70 8 -33 -6 -33 -5 -33 31 l0 37 -37 -6 c-21 -4 -48 -4 -61 -1 -21 6 -22 10 -16 55 6 42 4 49 -10 49 -9 0 -35 9 -58 21 -37 19 -42 19 -50 5 -5 -9 -17 -16 -27 -16 -25 0 -36 -41 -15 -57 13 -10 11 -16 -20 -46 -21 -21 -37 -31 -40 -24 -2 7 -5 2 -5 -10 -1 -34 -15 -28 -41 20 -95 169 -355 596 -472 776 l-142 216 -193 189 c-106 103 -193 192 -193 197 0 5 11 9 23 9 27 0 51 41 42 70 -3 11 0 20 10 24 8 3 15 10 15 16 0 17 -30 11 -57 -10 -31 -24 -56 -25 -93 -4 -26 16 -28 16 -49 -5 -14 -14 -34 -21 -57 -21 -20 0 -51 -9 -68 -19 -22 -14 -36 -17 -46 -11 -23 14 -30 12 -30 -10 0 -25 -84 -84 -125 -87 -87 -7 -135 -17 -136 -27 -1 -6 0 -28 1 -48 1 -30 -2 -37 -14 -32 -8 3 -16 15 -18 27 -2 15 -11 23 -28 26 -14 1 -28 7 -31 12 -9 15 -68 29 -75 17 -4 -5 -20 -8 -38 -5 -22 3 -37 -1 -53 -15 l-21 -20 -36 28 c-39 31 -43 47 -24 91 21 46 35 56 73 49 l35 -7 0 46 c0 41 -2 45 -24 45 -13 0 -29 -7 -36 -15 -8 -10 -30 -15 -62 -15 -45 0 -54 4 -86 37 -32 32 -107 73 -136 73 -4 0 -5 -11 -2 -25 5 -19 3 -23 -9 -19 -8 4 -22 1 -30 -6 -21 -17 -29 -7 -16 19 7 13 8 22 1 26 -5 3 -10 14 -10 24 0 17 -29 51 -43 51 -4 0 -7 -31 -7 -68 0 -64 -2 -70 -25 -80 -17 -8 -25 -20 -25 -36 0 -27 -27 -39 -54 -24 -11 6 -28 6 -48 -1 -17 -6 -32 -10 -33 -9 -1 2 -9 14 -18 28 -26 37 -22 60 9 60 24 0 26 3 19 28 -5 15 -8 55 -9 90 -1 52 -5 66 -22 80 -34 26 -44 56 -44 122 0 51 -5 67 -26 96 -37 48 -83 43 -130 -13 -24 -29 -37 -25 -106 29 -35 27 -42 29 -91 23 -50 -6 -56 -5 -74 19 -21 26 -34 32 -46 19z';

const KZ_LAKE =
  'M3192 3949 c-7 -10 -12 -33 -12 -51 0 -27 11 -43 67 -95 53 -50 69 -60 80 -51 10 8 12 23 7 52 -9 55 -17 66 -25 36 -6 -18 -7 -11 -6 24 2 42 -2 51 -25 69 -30 22 -49 17 -28 -8 11 -13 8 -15 -15 -15 -24 0 -27 3 -23 25 7 32 -4 40 -20 14z';

/* ── Palette ───────────────────────────────────────────────────────────────── */
const FILL: Record<string, string> = {
  'completed':   'rgba(212,168,67,1)',
  'in-progress': 'rgba(0,196,167,1)',
  'planned':     'rgba(79,132,255,1)',
};
const GLOW: Record<string, string> = {
  'completed':   'rgba(212,168,67,0.35)',
  'in-progress': 'rgba(0,196,167,0.35)',
  'planned':     'rgba(79,132,255,0.35)',
};
const STATUS_LABEL: Record<string, string> = {
  'completed':   'Завершён',
  'in-progress': 'В процессе',
  'planned':     'Планируется',
};

/* ── SVG viewport ─────────────────────────────────────────────────────────── */
const VB_X = -100, VB_Y = 30, VB_W = 1200, VB_H = 820;

/* ── Timing (ms) ──────────────────────────────────────────────────────────── */
const T_DRAW    = 1400;  // line draws
const T_VISIBLE = 3200;  // card stays
const T_FADE    = 500;   // everything fades

type Phase = 'idle' | 'drawing' | 'visible' | 'fading';

/* ── Tapered "pen stroke" path ────────────────────────────────────────────── */
function taperedBezierPath(
  x0: number, y0: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x1: number, y1: number,
  maxW = 2.5, N = 28
): string {
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t  = i / N;
    const mt = 1 - t;
    const px = mt*mt*mt*x0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x1;
    const py = mt*mt*mt*y0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y1;
    /* Tangent */
    const dx = 3*(mt*mt*(cx1-x0) + 2*mt*t*(cx2-cx1) + t*t*(x1-cx2));
    const dy = 3*(mt*mt*(cy1-y0) + 2*mt*t*(cy2-cy1) + t*t*(y1-cy2));
    const len = Math.sqrt(dx*dx + dy*dy) || 0.001;
    /* Normal (perpendicular to tangent) */
    const nx = -dy / len;
    const ny =  dx / len;
    /* Width: smooth sin taper — zero at both ends, max in middle */
    const w = maxW * Math.sin(Math.PI * t);
    upper.push([px + nx * w, py + ny * w]);
    lower.push([px - nx * w, py - ny * w]);
  }
  const pts = [...upper, ...[...lower].reverse()];
  return (
    `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)} ` +
    pts.slice(1).map(([x, y]) => `L ${x.toFixed(2)},${y.toFixed(2)}`).join(' ') +
    ' Z'
  );
}

/* ── Card position helper ─────────────────────────────────────────────────── */
interface CardLayout {
  dotX: number; dotY: number;
  tipX: number; tipY: number;
  cardLeft: number; cardTop: number;
  taperedPath: string;
  goRight: boolean;
  lineColor: string;
}

const CARD_W_SVG = 280;
const CARD_H_SVG = 130;

function computeLayout(p: Project): CardLayout {
  const dotX = p.x_map!;
  const dotY = p.y_map!;

  const mapR = VB_X + VB_W - 10;
  const mapT = VB_Y + 10;
  const mapB = VB_Y + VB_H - 10;

  const goRight = dotX + 220 + CARD_W_SVG < mapR;

  const tipX = goRight ? dotX + 220 : dotX - 220;
  const tipY = Math.max(mapT + CARD_H_SVG / 2, Math.min(mapB - CARD_H_SVG / 2, dotY - 60));

  const cardLeft = goRight ? tipX : tipX - CARD_W_SVG;
  const cardTop  = Math.max(mapT, Math.min(mapB - CARD_H_SVG, tipY - CARD_H_SVG / 2));

  const dx   = tipX - dotX;
  const cp1x = dotX + dx * 0.35;
  const cp1y = dotY - Math.abs(dx) * 0.28;
  const cp2x = dotX + dx * 0.78;
  const cp2y = tipY + Math.abs(dx) * 0.05;

  const taperedPath = taperedBezierPath(dotX, dotY, cp1x, cp1y, cp2x, cp2y, tipX, tipY, 2.5);
  const color = FILL[p.status] ?? '#fff';
  return { dotX, dotY, tipX, tipY, cardLeft, cardTop, taperedPath, goRight, lineColor: color };
}

/* ── Props ────────────────────────────────────────────────────────────────── */
interface Props {
  projects: Project[];
  stats?: { completed: number; inProgress: number; planned: number };
}

export default function KazakhstanMap({ projects, stats }: Props) {
  const [activePopup, setActivePopup] = useState<Project | null>(null);
  const [phase,       setPhase]       = useState<Phase>('idle');
  const [idx,         setIdx]         = useState(0);
  const [statCounts,     setStatCounts]     = useState({ completed: 0, inProgress: 0, planned: 0 });
  const [countsFinished, setCountsFinished] = useState(false);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const statsStarted = useRef(false);

  /* Projects with valid map coords */
  const labeled = useMemo(() => {
    const w = projects.filter(p => p.x_map != null && p.y_map != null);
    return [
      ...w.filter(p => p.featured),
      ...w.filter(p => !p.featured).sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    ];
  }, [projects]);

  /* IntersectionObserver → kick off animation */
  useEffect(() => {
    if (!labeled.length) return;
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPhase('drawing'); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [labeled.length]);

  /* State machine */
  useEffect(() => {
    if (phase === 'idle' || !labeled.length) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'drawing') {
      t = setTimeout(() => setPhase('visible'), T_DRAW);
    } else if (phase === 'visible') {
      t = setTimeout(() => setPhase('fading'), T_VISIBLE);
    } else if (phase === 'fading') {
      t = setTimeout(() => {
        setIdx(prev => (prev + 1) % labeled.length);
        setPhase('drawing');
      }, T_FADE);
    }
    return () => clearTimeout(t);
  }, [phase, labeled.length]);

  /* Count-up for stats when map becomes visible */
  useEffect(() => {
    if (phase === 'idle' || statsStarted.current || !stats) return;
    statsStarted.current = true;
    const duration = 1400;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setStatCounts({
        completed:  Math.round(ease * stats.completed),
        inProgress: Math.round(ease * stats.inProgress),
        planned:    Math.round(ease * stats.planned),
      });
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCountsFinished(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, stats]);

  /* Coordinate → CSS % helpers */
  const toLeft = (x: number) => `${((x - VB_X) / VB_W) * 100}%`;
  const toTop  = (y: number) => `${((y - VB_Y) / VB_H) * 100}%`;

  const current  = labeled[idx] ?? null;
  const layout   = current ? computeLayout(current) : null;
  const dotFill  = current ? (FILL[current.status] ?? '#fff') : '#fff';
  const dotGlow  = current ? (GLOW[current.status] ?? 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.2)';

  return (
    <div ref={wrapRef}>
      {/* ── Stats ───────────────────────────────────────────────── */}
      {stats && (() => {
        const isVis = phase !== 'idle';
        const items = [
          { key: 'completed',  label: 'Завершено',   count: statCounts.completed,  cls: styles.statGold },
          { key: 'inProgress', label: 'В процессе',  count: statCounts.inProgress, cls: styles.statTeal },
          { key: 'planned',    label: 'Планируется', count: statCounts.planned,    cls: styles.statBlue },
        ];
        return (
          <div className={styles.statsRow}>
            {items.map(item => (
              <div key={item.key} className={`${styles.statItem} ${item.cls} ${isVis ? styles.statVisible : ''}`}>
                <span className={styles.statLabel}>{item.label}</span>
                <div className={styles.statNumWrap}>
                  <span className={styles.statNum}>{item.count}</span>
                  <span className={`${styles.cursor} ${countsFinished ? styles.cursorBlink : styles.cursorSolid}`}>_</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div
        className={styles.mapContainer}
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        onMouseLeave={() => setActivePopup(null)}
      >
        <svg
          className={styles.svgMap}
          viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid */}
          <defs>
            <pattern id="kzGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50,0 L0,0 L0,50" fill="none" stroke="rgba(212,168,67,0.04)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} fill="url(#kzGrid)" />

          {/* Kazakhstan */}
          <g transform="translate(-50,874) scale(0.1,-0.1)">
            <path d={KZ_MAIN} fill="rgba(13,18,34,0.65)" stroke="none" />
            <path d={KZ_LAKE} fill="rgba(13,18,34,0.65)" stroke="none" />
            <path d={KZ_MAIN} fill="none" stroke="rgba(0,196,167,0.12)" strokeWidth="60" strokeLinejoin="round" />
            <path d={KZ_MAIN} fill="none" stroke="rgba(0,196,167,0.75)" strokeWidth="15"
              strokeLinejoin="round" strokeLinecap="round"
              pathLength="1" strokeDasharray="1" strokeDashoffset="1">
              <animate attributeName="strokeDashoffset" from="1" to="0" dur="4s" begin="0.3s"
                fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
            </path>
            <path d={KZ_MAIN} fill="none" stroke="rgba(212,168,67,0.3)" strokeWidth="10"
              strokeLinejoin="round" strokeDasharray="80 400"
              pathLength="1" strokeDashoffset="1">
              <animate attributeName="strokeDashoffset" from="1" to="0" dur="4s" begin="0.3s"
                fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
            </path>
          </g>

          {/* All project dots (static) */}
          {projects.map(project => {
            if (project.x_map == null || project.y_map == null) return null;
            const x     = project.x_map;
            const y     = project.y_map;
            const fill  = FILL[project.status] ?? '#fff';
            const glow  = GLOW[project.status] ?? 'rgba(255,255,255,0.2)';
            const isCur = current?.id === project.id;
            const r     = isCur ? 4.5 : 3;

            /* Status-specific core marker */
            let coreMarker: React.ReactNode;
            if (project.status === 'completed') {
              /* Diamond ◆ */
              const d = r * 1.5;
              coreMarker = (
                <polygon
                  points={`${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}`}
                  fill={fill} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"
                  strokeLinejoin="round" opacity="0"
                >
                  <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="3.5s" fill="freeze" />
                </polygon>
              );
            } else if (project.status === 'in-progress') {
              /* Bullseye ⊙ — outer ring + inner filled circle */
              coreMarker = (
                <>
                  <circle cx={x} cy={y} r={r} fill="none"
                    stroke={fill} strokeWidth="1.2" opacity="0">
                    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="3.5s" fill="freeze" />
                  </circle>
                  <circle cx={x} cy={y} r={r * 0.42} fill={fill} opacity="0">
                    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="3.5s" fill="freeze" />
                  </circle>
                </>
              );
            } else {
              /* Triangle △ — planned */
              const h = r * 1.4, w = r * 1.2;
              coreMarker = (
                <polygon
                  points={`${x},${y - h} ${x + w},${y + r * 0.7} ${x - w},${y + r * 0.7}`}
                  fill={fill} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"
                  strokeLinejoin="round" opacity="0"
                >
                  <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="3.5s" fill="freeze" />
                </polygon>
              );
            }

            return (
              <g key={project.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActivePopup(project)}
                onClick={() => setActivePopup(project)}
              >
                {/* Outer pulse ring */}
                <circle cx={x} cy={y} r={r} fill={fill}>
                  <animate attributeName="r"       from={r + 1} to={r + 9} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0"         dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Inner pulse ring */}
                <circle cx={x} cy={y} r={r} fill={fill}>
                  <animate attributeName="r"       from={r + 0.5} to={r + 5} dur="3s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0"            dur="3s" begin="0.8s" repeatCount="indefinite" />
                </circle>
                {/* Subtle glow halo */}
                <circle cx={x} cy={y} r={r + 1.5} fill={glow} opacity="0.4" />
                {/* Status-specific core marker */}
                {coreMarker}
              </g>
            );
          })}

          {/* Tapered pen-stroke callout line — remounts on each new project */}
          {layout && phase !== 'idle' && (
            <g
              key={`callout-${idx}`}
              className={
                phase === 'fading'
                  ? styles.calloutLineFade
                  : layout.goRight
                    ? styles.calloutLineDrawRight
                    : styles.calloutLineDrawLeft
              }
            >
              <path
                d={layout.taperedPath}
                fill={layout.lineColor}
                opacity="0.88"
              />
            </g>
          )}
        </svg>

        {/* ── Overlay ───────────────────────────────────────────── */}
        <div className={styles.pointOverlay}>

          {/* Hover popup (existing behaviour) */}
          {activePopup && activePopup.x_map != null && activePopup.y_map != null && (
            <div
              className={`${styles.popup} ${styles.visible}`}
              style={{ left: toLeft(activePopup.x_map), top: toTop(activePopup.y_map) }}
            >
              <span className={styles.popupCategory}>{activePopup.category}</span>
              <h3 className={styles.popupTitle}>{activePopup.title}</h3>
              <p className={styles.popupDesc}>{activePopup.description}</p>
              <div className={styles.popupMeta}>
                <span className={styles.popupLocation}>{activePopup.location}</span>
                {activePopup.coords_label && (
                  <span className={styles.popupCoords}>{activePopup.coords_label}</span>
                )}
              </div>
              <div className={styles.popupStatusWrap}>
                <span className={`${styles.statusIndicator} ${styles[activePopup.status]}`} />
                <span className={styles.statusText}>{STATUS_LABEL[activePopup.status] ?? activePopup.status}</span>
              </div>
            </div>
          )}

          {/* Sequential callout card */}
          {layout && current && phase !== 'idle' && (
            <div
              key={`card-${idx}`}
              className={`${styles.calloutCard} ${
                phase === 'drawing' ? styles.calloutCardHide :
                phase === 'visible' ? styles.calloutCardShow :
                styles.calloutCardFade
              }`}
              style={{
                left:  toLeft(layout.cardLeft),
                top:   toTop(layout.cardTop),
                width: `${(CARD_W_SVG / VB_W) * 100}%`,
                '--tip-side': layout.goRight ? '0' : '100%',
                '--tip-top':  `${((layout.tipY - layout.cardTop) / CARD_H_SVG) * 100}%`,
              } as React.CSSProperties}
              onClick={() => setActivePopup(current)}
            >
              {/* Category pill */}
              <span className={styles.calloutCategory}>{current.category}</span>

              {/* Title */}
              <p className={styles.calloutTitle}>{current.title}</p>

              {/* Meta row */}
              <div className={styles.calloutMeta}>
                <span className={styles.calloutLocation}>
                  <svg viewBox="0 0 10 13" fill="none" width="8" height="10">
                    <path d="M5 0C2.79 0 1 1.79 1 4c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z"
                      fill="currentColor" opacity="0.6"/>
                  </svg>
                  {current.location}
                </span>
                {current.year && (
                  <span className={styles.calloutYear}>{current.year}</span>
                )}
              </div>

              {/* Status bar */}
              <div className={styles.calloutStatus}>
                <span
                  className={styles.calloutStatusDot}
                  style={{ background: dotFill, boxShadow: `0 0 6px ${dotFill}` }}
                />
                <span className={styles.calloutStatusText}>
                  {STATUS_LABEL[current.status] ?? current.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
