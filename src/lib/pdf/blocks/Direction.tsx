/**
 * 10-11 · Direction — parameterized block, used twice (Проектирование / СМР).
 * Header with outlined I КАТ. С 2010 badge, 6 numbered services in 2×3 grid,
 * 4-step horizontal process flow, footer.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox } from '../ui/Cards';
import { IconChevron } from '../ui/Icons';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = {
  pageNum: number;
  direction: Content['direction01'];   // both direction01 and direction02 share shape
  variant: 'gold' | 'teal';
  count: number | string;
};

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },

  // Outlined badge in top right
  badge: {
    width: '24mm',
    height: '24mm',
    borderWidth: 0.6,
    borderRadius: 2,
    padding: '2mm',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1mm',
  },
  badgeGold: { borderColor: palette.gold, backgroundColor: 'rgba(201,148,31,0.06)' },
  badgeTeal: { borderColor: palette.teal, backgroundColor: 'rgba(0,168,142,0.08)' },
  badgeTop: { fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 800, letterSpacing: 0.06 },
  badgeTopGold: { color: palette.gold },
  badgeTopTeal: { color: palette.tealSoft },
  badgeBottom: { fontFamily: FONT_MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: 0.14, textTransform: 'uppercase' },
  badgeBottomGold: { color: 'rgba(201,148,31,0.85)' },
  badgeBottomTeal: { color: 'rgba(0,168,142,0.85)' },

  // Services grid (2 cols × 3 rows)
  svcGrid: { flexDirection: 'column', gap: '5mm', marginTop: '2mm', marginBottom: '5mm' },
  svcRow: { flexDirection: 'row', gap: '8mm' },
  svcItem: { flex: 1, flexDirection: 'row', gap: '3.5mm' },
  svcNum: {
    width: '8mm',
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: fs.h3 + 2,
    lineHeight: 1,
    fontVariant: ['tabular-nums'],
  },
  svcNumGold: { color: palette.gold },
  svcNumTeal: { color: palette.tealSoft },
  svcBody: { flex: 1, flexDirection: 'column', gap: '1.5mm' },
  svcTitle: { fontFamily: FONT_FAMILY, fontSize: fs.label, fontWeight: 700, color: palette.textOnDark, lineHeight: lh.tight },
  svcDesc:  { fontFamily: FONT_FAMILY, fontSize: fs.body, color: 'rgba(240,242,248,0.65)', lineHeight: lh.normal },

  // Process flow
  processLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3mm',
    marginBottom: '3mm',
  },
  processLine: { width: '12mm', height: 0.4, backgroundColor: palette.gold },
  processLabelText: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldDark,
    textTransform: 'uppercase',
  },
  processFlow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: '4mm' },
  processStep: {
    flex: 1,
    padding: '4mm',
    backgroundColor: 'rgba(13,18,34,0.5)',
    borderWidth: 0.3,
    borderColor: 'rgba(240,242,248,0.08)',
    borderLeftWidth: 1.4,
    borderRadius: 2,
    flexDirection: 'column',
    gap: '1.5mm',
  },
  processStepGold: { borderLeftColor: palette.gold },
  processStepTeal: { borderLeftColor: palette.teal },
  processRoman: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: fs.h2 + 2, lineHeight: 1 },
  processRomanGold: { color: palette.gold },
  processRomanTeal: { color: palette.tealSoft },
  processTitle: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, fontWeight: 700, color: palette.textOnDark, marginTop: '1mm' },
  processMeta: { fontFamily: FONT_FAMILY, fontSize: fs.small, color: 'rgba(240,242,248,0.55)', lineHeight: lh.normal },
  processArrow: {
    width: '6mm',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_FAMILY,
    fontSize: fs.h3,
    color: 'rgba(201,148,31,0.55)',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3mm',
    paddingTop: '3mm',
    borderTopWidth: 0.3,
    borderTopColor: 'rgba(240,242,248,0.12)',
    flexWrap: 'wrap',
  },
  footerNum: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: fs.h2, lineHeight: 1, fontVariant: ['tabular-nums'] },
  footerNumGold: { color: palette.gold },
  footerNumTeal: { color: palette.tealSoft },
  footerLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: 'rgba(240,242,248,0.70)',
    textTransform: 'uppercase',
  },
  footerSep: { color: 'rgba(240,242,248,0.3)' },
  footerText: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 500,
    letterSpacing: ls.label,
    color: 'rgba(240,242,248,0.55)',
    textTransform: 'uppercase',
  },
});

export function Direction({ pageNum, direction, variant, count }: Props) {
  const isGold = variant === 'gold';
  const accentVariant = isGold ? 'gold' : 'teal';

  return (
    <PrintPage variant="dark" pageNum={pageNum}>
      <Eyebrow dark>{direction.eyebrow}</Eyebrow>

      <View style={s.titleRow}>
        <TitleH1 dark accent={direction.accent} accentFirst accentVariant={accentVariant}>{direction.title}</TitleH1>
        <View style={isGold ? [s.badge, s.badgeGold] : [s.badge, s.badgeTeal]}>
          <Text style={isGold ? [s.badgeTop, s.badgeTopGold] : [s.badgeTop, s.badgeTopTeal]}>{direction.badgeTop}</Text>
          <Text style={isGold ? [s.badgeBottom, s.badgeBottomGold] : [s.badgeBottom, s.badgeBottomTeal]}>{direction.badgeBottom}</Text>
        </View>
      </View>

      <LeadBox dark>{direction.lead}</LeadBox>

      <View style={s.svcGrid}>
        {[0, 1, 2].map((rowIdx) => (
          <View key={rowIdx} style={s.svcRow}>
            {[0, 1].map((colIdx) => {
              const idx = rowIdx * 2 + colIdx;
              const svc = direction.services[idx];
              return (
                <View key={svc.num} style={s.svcItem}>
                  <Text style={isGold ? [s.svcNum, s.svcNumGold] : [s.svcNum, s.svcNumTeal]}>{svc.num}</Text>
                  <View style={s.svcBody}>
                    <Text style={s.svcTitle}>{svc.title}</Text>
                    <Text style={s.svcDesc}>{svc.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={s.processLabel}>
        <View style={s.processLine} />
        <Text style={s.processLabelText}>{direction.processLabel}</Text>
      </View>

      <View style={s.processFlow}>
        {direction.process.map((step, i) => (
          <React.Fragment key={step.roman}>
            <View style={isGold ? [s.processStep, s.processStepGold] : [s.processStep, s.processStepTeal]}>
              <Text style={isGold ? [s.processRoman, s.processRomanGold] : [s.processRoman, s.processRomanTeal]}>{step.roman}</Text>
              <Text style={s.processTitle}>{step.title}</Text>
              <Text style={s.processMeta}>{step.meta}</Text>
            </View>
            {i < direction.process.length - 1 && (
              <View style={{ width: '6mm', alignItems: 'center', justifyContent: 'center' }}>
                <IconChevron size={9} color={isGold ? palette.gold : palette.tealSoft} />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={s.footer}>
        <Text style={isGold ? [s.footerNum, s.footerNumGold] : [s.footerNum, s.footerNumTeal]}>{count}</Text>
        <Text style={s.footerLabel}>{direction.footerLabel}</Text>
        <Text style={s.footerSep}>·</Text>
        <Text style={s.footerText}>{direction.footerEntity}</Text>
        <Text style={s.footerSep}>·</Text>
        <Text style={s.footerText}>{direction.footerUrl}</Text>
      </View>
    </PrintPage>
  );
}

import React from 'react';
