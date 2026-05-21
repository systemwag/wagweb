/**
 * 01 · Cover — editorial minimal.
 *
 * Logo upper-third. Massive wordmark in the lower half. One tagline line
 * below. Bottom strip: company name on left, two info pairs on right.
 * 60% of the page is negative space — that's the design.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { WagMark } from '../ui/WagMark';
import { palette, fs } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = { content: Content['cover'] };

const s = StyleSheet.create({
  eyebrow: {
    position: 'absolute',
    top: '20mm',
    left: '22mm',
    fontFamily: FONT_FAMILY,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 0.22,
    color: 'rgba(240,242,248,0.55)',
    textTransform: 'uppercase',
  },
  year: {
    position: 'absolute',
    top: '20mm',
    right: '22mm',
    fontFamily: FONT_MONO,
    fontSize: 8,
    letterSpacing: 0.12,
    color: 'rgba(240,242,248,0.55)',
  },
  markWrap: {
    position: 'absolute',
    top: '54mm',
    left: '22mm',
    width: '38mm',
    height: '34mm',
  },
  title: {
    position: 'absolute',
    top: '170mm',
    left: '22mm',
    right: '22mm',
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: fs.display,
    lineHeight: 0.98,
    letterSpacing: -0.03,
    color: palette.textOnDark,
  },
  titleAccent: { color: palette.gold },
  tagline: {
    position: 'absolute',
    top: '230mm',
    left: '22mm',
    right: '22mm',
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 1.45,
    color: 'rgba(240,242,248,0.65)',
    maxWidth: '120mm',
  },
  bottomLeft: {
    position: 'absolute',
    bottom: '20mm',
    left: '22mm',
    flexDirection: 'column',
    gap: '2mm',
  },
  bottomCompany: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    fontWeight: 500,
    color: 'rgba(240,242,248,0.85)',
  },
  bottomBin: {
    fontFamily: FONT_FAMILY,
    fontSize: 8,
    letterSpacing: 0.06,
    color: 'rgba(240,242,248,0.45)',
  },
  bottomRight: {
    position: 'absolute',
    bottom: '20mm',
    right: '22mm',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2mm',
  },
  bottomSite: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: 500,
    color: palette.gold,
    letterSpacing: 0.01,
  },
  bottomPhone: {
    fontFamily: FONT_FAMILY,
    fontSize: 8.5,
    color: 'rgba(240,242,248,0.55)',
    letterSpacing: 0.04,
  },
});

export function Cover({ content }: Props) {
  return (
    <PrintPage variant="dark" noPadding>
      <Text style={s.eyebrow}>{content.eyebrow.replace(' · 2026', '')}</Text>
      <Text style={s.year}>2026</Text>

      <View style={s.markWrap}>
        <WagMark width="38mm" height="34mm" gradientId="wag-cover" />
      </View>

      <Text style={s.title}>
        {content.title}
        {'\n'}
        <Text style={s.titleAccent}>{content.accent}</Text>
      </Text>

      <Text style={s.tagline}>
        {content.taglineLine1} — {content.taglineLine2.toLowerCase()}.
      </Text>

      <View style={s.bottomLeft}>
        <Text style={s.bottomCompany}>ТОО «{content.title} {content.accent}»</Text>
        <Text style={s.bottomBin}>БИН {content.bin}</Text>
      </View>
      <View style={s.bottomRight}>
        <Text style={s.bottomSite}>{content.site}</Text>
        <Text style={s.bottomPhone}>{content.phone}</Text>
      </View>
    </PrintPage>
  );
}
