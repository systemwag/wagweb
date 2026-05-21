/**
 * 05 · ISO — light page with 4 cert cards (2×2 grid) and 3 footer blocks.
 */
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox, BigBadge } from '../ui/Cards';
import { assetBuffer } from '../ui/asset';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY } from '../fonts';
import type { Content } from '../content/types';

type Props = { pageNum: number; content: Content['iso'] };

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },

  grid: { flexDirection: 'column', gap: '5mm', marginTop: '2mm', marginBottom: '5mm' },
  row: { flexDirection: 'row', gap: '5mm' },
  card: {
    flex: 1,
    flexDirection: 'row',
    gap: '4mm',
    backgroundColor: palette.creamCard,
    borderWidth: 0.3,
    borderColor: palette.lineCreamOnCream,
    borderRadius: 2,
    padding: '3mm',
    minHeight: '36mm',
    alignItems: 'center',
  },
  img: { width: '28mm', height: '34mm', objectFit: 'contain', backgroundColor: '#fff', borderRadius: 1 },
  meta: { flex: 1, flexDirection: 'column', gap: '2mm', justifyContent: 'center' },
  name: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, fontWeight: 700, color: palette.ink, lineHeight: lh.tight },
  detail: { fontFamily: FONT_FAMILY, fontSize: fs.body, color: palette.muted, lineHeight: lh.normal },

  footer: {
    flexDirection: 'row',
    gap: '5mm',
    marginTop: 'auto',
    paddingTop: '4mm',
    borderTopWidth: 0.3,
    borderTopColor: palette.lineCreamOnCream,
  },
  footerItem: { flex: 1, borderLeftWidth: 0.6, borderLeftColor: palette.gold, paddingLeft: '3mm' },
  footerLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldDark,
    textTransform: 'uppercase',
    marginBottom: '1.5mm',
  },
  footerValue: { fontFamily: FONT_FAMILY, fontSize: fs.body, fontWeight: 600, color: palette.ink, lineHeight: lh.normal },
});


export function Iso({ pageNum, content }: Props) {
  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <View style={s.titleRow}>
        <TitleH1 accent={content.accent}>{content.title}</TitleH1>
        <BigBadge num="04" label={content.badgeLabel} />
      </View>

      <LeadBox>{content.lead}</LeadBox>

      <View style={s.grid}>
        <View style={s.row}>
          {[0, 1].map((i) => (
            <View key={content.certs[i].name} style={s.card}>
              <Image src={assetBuffer(content.certs[i].image)} style={s.img} />
              <View style={s.meta}>
                <Text style={s.name}>{content.certs[i].name}</Text>
                <Text style={s.detail}>{content.certs[i].detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.row}>
          {[2, 3].map((i) => (
            <View key={content.certs[i].name} style={s.card}>
              <Image src={assetBuffer(content.certs[i].image)} style={s.img} />
              <View style={s.meta}>
                <Text style={s.name}>{content.certs[i].name}</Text>
                <Text style={s.detail}>{content.certs[i].detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={s.footer}>
        {content.footer.map((f) => (
          <View key={f.label} style={s.footerItem}>
            <Text style={s.footerLabel}>{f.label}</Text>
            <Text style={s.footerValue}>{f.value}</Text>
          </View>
        ))}
      </View>
    </PrintPage>
  );
}
