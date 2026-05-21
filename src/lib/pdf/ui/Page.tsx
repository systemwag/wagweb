/**
 * Page wrappers — editorial-minimal version.
 *
 * Two variants (dark / cream). Pages carry generous breathing room and
 * a single tiny page number in the bottom corner — no decorative grids,
 * L-corner brackets, or gold accents. The typography does the work.
 */
import { Page, View, Text, StyleSheet, Svg, Circle } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { palette, fs, ls } from '../tokens';
import { FONT_FAMILY, FONT_MONO } from '../fonts';

type Variant = 'dark' | 'light';

type Props = {
  variant: Variant;
  pageNum?: number;
  total?: number;
  children: ReactNode;
  noPadding?: boolean;
};

const styles = StyleSheet.create({
  base: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.body,
    position: 'relative',
  },
  dark:  { backgroundColor: palette.dark,  color: palette.textOnDark },
  light: { backgroundColor: palette.cream, color: palette.ink },

  inner: {
    paddingTop:    '24mm',
    paddingLeft:   '22mm',
    paddingRight:  '22mm',
    paddingBottom: '20mm',
    height: '100%',
    flexDirection: 'column',
  },

  pageNumDark: {
    position: 'absolute',
    bottom: '12mm',
    right: '22mm',
    fontFamily: FONT_MONO,
    fontSize: 7,
    letterSpacing: 0.12,
    color: 'rgba(240,242,248,0.32)',
  },
  pageNumLight: {
    position: 'absolute',
    bottom: '12mm',
    right: '22mm',
    fontFamily: FONT_MONO,
    fontSize: 7,
    letterSpacing: 0.12,
    color: 'rgba(74,64,50,0.4)',
  },
});

/**
 * Faint dot pattern on cream pages — gives a subtle printed-paper feel
 * without imposing visual noise. Very low opacity / wide grid (8mm).
 */
function PaperGrain() {
  const W = 210, H = 297;
  const STEP = 8;
  const dots: React.ReactElement[] = [];
  for (let x = 0; x < W; x += STEP) {
    for (let y = 0; y < H; y += STEP) {
      dots.push(<Circle key={`${x}-${y}`} cx={x} cy={y} r={0.15} fill="rgba(74,64,50,0.10)" />);
    }
  }
  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0, width: '210mm', height: '297mm' }}
      viewBox={`0 0 ${W} ${H}`}
    >
      {dots}
    </Svg>
  );
}

export function PrintPage({ variant, pageNum, total = 16, children, noPadding }: Props) {
  const variantStyle = variant === 'dark' ? styles.dark : styles.light;
  const numStyle     = variant === 'dark' ? styles.pageNumDark : styles.pageNumLight;
  const pad = String(pageNum ?? 0).padStart(2, '0');

  return (
    <Page size="A4" style={[styles.base, variantStyle]}>
      {variant === 'light' && <PaperGrain />}

      {pageNum != null && (
        <Text style={numStyle}>{pad} / {total}</Text>
      )}

      {noPadding ? children : <View style={styles.inner}>{children}</View>}
    </Page>
  );
}

import React from 'react';
