/**
 * 15 · Partners — 4×4 grid of partner logos, with 4 category chips top-right
 * and "94% повторных контрактов" footer.
 */
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox, Chip } from '../ui/Cards';
import { assetBuffer } from '../ui/asset';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = { pageNum: number; content: Content['partners'] };

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },
  categoryCol: { flexDirection: 'column', gap: '2mm', alignItems: 'flex-end' },

  grid: { flexDirection: 'column', gap: '3mm', marginTop: '3mm', flex: 1 },
  row: { flexDirection: 'row', gap: '3mm' },
  card: {
    flex: 1,
    backgroundColor: palette.creamCard,
    borderWidth: 0.3,
    borderColor: palette.lineCreamOnCream,
    borderRadius: 2,
    padding: '3mm',
    alignItems: 'center',
    gap: '2mm',
    minHeight: '32mm',
  },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '22mm' },
  logo: { maxWidth: '90%', maxHeight: '20mm', objectFit: 'contain' },
  name: { fontFamily: FONT_FAMILY, fontSize: fs.body, fontWeight: 600, color: palette.ink, textAlign: 'center', lineHeight: lh.tight },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '4mm',
    borderTopWidth: 0.3,
    borderTopColor: palette.lineCreamOnCream,
    marginTop: '2mm',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'baseline', gap: '3mm' },
  footerNum: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: fs.h2 + 4, color: palette.gold, lineHeight: 1, fontVariant: ['tabular-nums'] },
  footerText: { fontFamily: FONT_MONO, fontSize: fs.body, fontWeight: 500, letterSpacing: 0.18, color: palette.ink2, textTransform: 'uppercase' },
  footerRight: { fontFamily: FONT_MONO, fontSize: fs.body, fontWeight: 400, letterSpacing: 0.14, color: palette.muted, textTransform: 'uppercase' },
});


export function Partners({ pageNum, content }: Props) {
  // Layout 4 rows × 4 cols
  const rows: typeof content.items[] = [];
  for (let i = 0; i < content.items.length; i += 4) {
    rows.push(content.items.slice(i, i + 4));
  }

  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <View style={s.titleRow}>
        <View style={{ flex: 1, maxWidth: '130mm' }}>
          <TitleH1 accent={content.accent} accentFirst>{content.title}</TitleH1>
        </View>
        <View style={s.categoryCol}>
          {content.categoryChips.map((c) => (
            <Chip key={c} variant="filled">{c}</Chip>
          ))}
        </View>
      </View>

      <LeadBox>{content.lead}</LeadBox>

      <View style={s.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((p) => (
              <View key={p.file} style={s.card}>
                <View style={s.logoWrap}>
                  <Image src={assetBuffer('/partners/' + p.file)} style={s.logo} />
                </View>
                <Text style={s.name}>{p.name}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={s.footer}>
        <View style={s.footerLeft}>
          <Text style={s.footerNum}>{content.footerNum}</Text>
          <Text style={s.footerText}>{content.footerText}</Text>
        </View>
        <Text style={s.footerRight}>{content.footerRight}</Text>
      </View>
    </PrintPage>
  );
}
