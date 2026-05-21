/**
 * Card-shaped primitives: LeadBox, Chip, Badge, BigNumber.
 *
 * LeadBox: cream/dark intro paragraph with vertical gold accent on the left.
 * Chip: small pill-shaped tag (cream, dark, or filled-gold variants).
 * Badge: rectangular outlined or filled badge for I КАТ., 15 ПИСЕМ, etc.
 * BigNumber: large display number with a label + optional description,
 *            used on Scale and Numbers sections.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY } from '../fonts';

const s = StyleSheet.create({
  leadBox: {
    paddingTop: '3mm',
    paddingBottom: '3mm',
    paddingLeft: '5mm',
    paddingRight: '4mm',
    marginBottom: '5mm',
    borderLeftWidth: 1.6,
    borderLeftColor: palette.gold,
    backgroundColor: 'rgba(201,148,31,0.06)',
  },
  leadBoxDark: {
    backgroundColor: 'rgba(201,148,31,0.08)',
  },
  leadText: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.bodyLg,
    lineHeight: lh.loose,
    color: palette.ink2,
  },
  leadTextDark: { color: 'rgba(240,242,248,0.88)' },

  // Chip (small pill)
  chipBase: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.body,
    paddingTop: '1.2mm',
    paddingBottom: '1.2mm',
    paddingLeft: '3.5mm',
    paddingRight: '3.5mm',
    borderRadius: 999,
    borderWidth: 0.4,
  },
  chipCream: {
    backgroundColor: palette.creamCard,
    borderColor: palette.lineCreamOnCream,
    color: palette.ink,
  },
  chipDark: {
    backgroundColor: 'rgba(13,18,34,0.5)',
    borderColor: 'rgba(201,148,31,0.4)',
    color: 'rgba(240,242,248,0.88)',
  },
  chipFilled: {
    backgroundColor: 'rgba(201,148,31,0.18)',
    borderColor: 'rgba(201,148,31,0.5)',
    color: palette.ink2,
    fontWeight: 700,
    fontSize: fs.small,
    letterSpacing: ls.label,
    textTransform: 'uppercase',
  },

  // Badge (rectangular)
  badgeOutlined: {
    fontFamily: FONT_FAMILY,
    paddingTop: '2mm',
    paddingBottom: '2mm',
    paddingLeft: '3mm',
    paddingRight: '3mm',
    borderRadius: 2,
    borderWidth: 0.6,
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '26mm',
  },
  badgeOutlinedGold: { borderColor: palette.gold, backgroundColor: 'rgba(201,148,31,0.06)' },
  badgeOutlinedTeal: { borderColor: palette.teal, backgroundColor: 'rgba(0,168,142,0.08)' },

  badgeFilled: {
    fontFamily: FONT_FAMILY,
    paddingTop: '1.6mm',
    paddingBottom: '1.6mm',
    paddingLeft: '3.5mm',
    paddingRight: '3.5mm',
    borderRadius: 2,
    fontSize: fs.eyebrow,
    fontWeight: 700,
    letterSpacing: ls.badge,
    color: palette.goldSoft,
    backgroundColor: palette.dark,
  },

  // BigBadge — vertical-bar style number+label (used at top right of pages)
  bigBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '4mm',
    paddingTop: '2mm',
    paddingBottom: '2mm',
    borderLeftWidth: 1.6,
    borderLeftColor: palette.gold,
  },
  bigBadgeNum: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: fs.numMd,
    color: palette.gold,
    marginRight: '3mm',
    lineHeight: 1,
    fontVariant: ['tabular-nums'],
  },
  bigBadgeLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.label,
    textTransform: 'uppercase',
    color: palette.muted,
    lineHeight: lh.normal,
    maxWidth: '24mm',
  },
  bigBadgeLabelDark: { color: 'rgba(240,242,248,0.75)' },

  // BigNumber (Scale page) — value above a single short label, no decoration
  num: { flexDirection: 'column' },
  numValue: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: fs.num,
    lineHeight: 0.92,
    letterSpacing: -0.04,
    color: palette.textOnDark,
    fontVariant: ['tabular-nums'],
  },
  numValueGold: { color: palette.gold },
  numLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(240,242,248,0.85)',
    marginTop: '4mm',
  },
  numDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: 'rgba(240,242,248,0.55)',
    maxWidth: '120mm',
    marginTop: '2mm',
  },
});

export function LeadBox({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <View style={dark ? [s.leadBox, s.leadBoxDark] : [s.leadBox]}>
      <Text style={dark ? [s.leadText, s.leadTextDark] : [s.leadText]}>{children}</Text>
    </View>
  );
}

export function Chip({
  children, variant = 'cream',
}: { children: ReactNode; variant?: 'cream' | 'dark' | 'filled' }) {
  const variantStyle =
    variant === 'dark'   ? s.chipDark :
    variant === 'filled' ? s.chipFilled :
                           s.chipCream;
  return <Text style={[s.chipBase, variantStyle]}>{children}</Text>;
}

export function BadgeFilled({ children }: { children: ReactNode }) {
  return <Text style={s.badgeFilled}>{children}</Text>;
}

export function BadgeOutlined({
  children, variant = 'gold',
}: { children: ReactNode; variant?: 'gold' | 'teal' }) {
  const v = variant === 'teal' ? s.badgeOutlinedTeal : s.badgeOutlinedGold;
  return <View style={[s.badgeOutlined, v]}>{children}</View>;
}

/**
 * BigBadge accepts label as a plain string with `\n` for line breaks (the
 * content files write them that way). react-pdf's <Text> doesn't process
 * literal `\n` in template strings, so we split and rebuild with JSX
 * newline expressions.
 */
export function BigBadge({
  num, label, dark,
}: { num: number | string; label: string; dark?: boolean }) {
  const lines = label.split('\n');
  return (
    <View style={s.bigBadge}>
      <Text style={s.bigBadgeNum}>{num}</Text>
      <Text style={dark ? [s.bigBadgeLabel, s.bigBadgeLabelDark] : [s.bigBadgeLabel]}>
        {lines.map((line, i) => (
          <Text key={i}>
            {i > 0 && '\n'}
            {line}
          </Text>
        ))}
      </Text>
    </View>
  );
}

export function BigNumber({
  value, label, desc, accent,
}: {
  value: number | string;
  label: ReactNode;
  desc?: ReactNode;
  accent?: boolean;          // gold colour for the value
}) {
  return (
    <View style={s.num}>
      <Text style={accent ? [s.numValue, s.numValueGold] : [s.numValue]}>{value}</Text>
      <Text style={s.numLabel}>{label}</Text>
      {desc && <Text style={s.numDesc}>{desc}</Text>}
    </View>
  );
}
