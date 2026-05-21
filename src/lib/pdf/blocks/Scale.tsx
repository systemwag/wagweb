/**
 * 03 · Scale — editorial minimal.
 *
 * Four BIG numbers stacked vertically with their labels and a short
 * description. The first number (СМР) is rendered in gold as the
 * "hero" stat; the rest in white. No grids, no boxes, no vertical bars.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { palette } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY } from '../fonts';
import type { Content } from '../content/types';
import type { PortfolioData } from '../data/getPortfolioData';

type Props = { pageNum: number; content: Content['scale']; data: PortfolioData };

const s = StyleSheet.create({
  list: {
    flexDirection: 'column',
    marginTop: '14mm',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: '8mm',
    paddingTop: '8mm',
    paddingBottom: '8mm',
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgba(240,242,248,0.12)',
  },
  rowLast: { borderBottomWidth: 0 },
  num: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: 96,
    lineHeight: 0.92,
    letterSpacing: -0.05,
    color: palette.textOnDark,
    fontVariant: ['tabular-nums'],
    width: '60mm',
  },
  numAccent: { color: palette.gold },
  body: { flex: 1, flexDirection: 'column', paddingBottom: '6mm' },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: 500,
    color: palette.textOnDark,
    marginBottom: '2mm',
  },
  desc: {
    fontFamily: FONT_FAMILY,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: 'rgba(240,242,248,0.55)',
    maxWidth: '95mm',
  },
});

export function Scale({ pageNum, content, data }: Props) {
  const valueFor = (key: 'smr' | 'pd' | 'regions' | 'countries') => {
    if (key === 'smr')       return data.countSmr;
    if (key === 'pd')        return data.countPd;
    if (key === 'regions')   return data.countRegions;
    return data.countCountries;
  };

  return (
    <PrintPage variant="dark" pageNum={pageNum}>
      <Eyebrow dark>{content.eyebrow}</Eyebrow>
      <TitleH1 dark>{content.title}{'\n'}работы</TitleH1>

      <View style={s.list}>
        {content.items.map((item, i) => (
          <View key={item.key} style={i === content.items.length - 1 ? [s.row, s.rowLast] : [s.row]}>
            <Text style={i === 0 ? [s.num, s.numAccent] : [s.num]}>{valueFor(item.key)}</Text>
            <View style={s.body}>
              <Text style={s.label}>{item.label}</Text>
              <Text style={s.desc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </PrintPage>
  );
}
