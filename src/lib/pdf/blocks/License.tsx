/**
 * 06-09 · License — editorial minimal.
 *
 * Number + name + scan + meta-list. No decorative corners, no badge box,
 * no double borders. The scan is the page. Meta items are a single
 * inline row of dot-separated label:value pairs at the bottom.
 */
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { assetBuffer } from '../ui/asset';
import { palette, fs, ls } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = { pageNum: number; license: Content['licenses']['smr'] };

const s = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  number: {
    fontFamily: FONT_MONO,
    fontSize: 8.5,
    letterSpacing: 0.10,
    color: palette.muted,
    textTransform: 'uppercase',
    fontVariant: ['tabular-nums'],
  },
  category: {
    fontFamily: FONT_FAMILY,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 0.12,
    color: palette.gold,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: 34,
    lineHeight: 1.05,
    letterSpacing: -0.02,
    color: palette.ink,
    marginTop: '5mm',
    marginBottom: '10mm',
  },
  scanWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '10mm',
    paddingTop: '6mm',
    borderTopWidth: 0.3,
    borderTopColor: 'rgba(74,64,50,0.18)',
    gap: '8mm',
  },
  metaItem: { flexDirection: 'column', gap: '1mm' },
  metaLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 0.14,
    color: palette.muted,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontFamily: FONT_FAMILY,
    fontSize: 9.5,
    color: palette.ink,
  },
});

export function License({ pageNum, license }: Props) {
  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <View style={s.topRow}>
        <Text style={s.number}>№ {license.number} · ОТ {license.date}</Text>
        <Text style={s.category}>{license.badge}</Text>
      </View>

      <Text style={s.title}>{license.title}</Text>

      <View style={s.scanWrap}>
        <Image src={assetBuffer(license.scan)} style={s.scanImg} />
      </View>

      <View style={s.metaRow}>
        {license.meta.map((m) => (
          <View key={m.label} style={[s.metaItem, { minWidth: '38mm' }]}>
            <Text style={s.metaLabel}>{m.label}</Text>
            <Text style={s.metaValue}>{m.value}</Text>
          </View>
        ))}
      </View>
    </PrintPage>
  );
}
