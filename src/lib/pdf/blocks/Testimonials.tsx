/**
 * 13-14 · Testimonials — two pages, 8 cards on first, 7 on second. Each
 * card: category chip + optional date, client name, italic quote, signature
 * line with name + role.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox, BigBadge } from '../ui/Cards';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_MONO } from '../fonts';
import type { Content, Testimonial } from '../content/types';

type TestimonialsProps = {
  pageNum: number;
  content: Content['testimonials'];
};

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },

  continueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5mm' },
  continueRight: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.body,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.muted,
  },

  grid: { flexDirection: 'column', gap: '4mm', flex: 1 },
  row: { flexDirection: 'row', gap: '5mm' },
  card: {
    flex: 1,
    padding: '3.5mm',
    backgroundColor: palette.creamCard,
    borderWidth: 0.25,
    borderColor: palette.lineCreamOnCream,
    borderRadius: 1.5,
    flexDirection: 'column',
    gap: '2mm',
    minHeight: '48mm',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '3mm' },
  cardCategory: {
    fontFamily: FONT_MONO,
    fontSize: fs.micro,
    fontWeight: 500,
    letterSpacing: 0.12,
    color: palette.goldDark,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(181,137,35,0.10)',
    borderWidth: 0.25,
    borderColor: 'rgba(181,137,35,0.32)',
    borderRadius: 999,
    paddingTop: 1.5,
    paddingBottom: 1.5,
    paddingLeft: 5,
    paddingRight: 5,
  },
  cardDate: { fontFamily: FONT_MONO, fontSize: fs.micro, letterSpacing: 0.06, color: palette.muted },

  cardClient: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, fontWeight: 700, color: palette.ink, lineHeight: lh.tight },
  cardQuote: { fontFamily: FONT_FAMILY, fontSize: fs.body, fontStyle: 'italic', color: palette.ink2, lineHeight: lh.normal, flex: 1 },
  cardSig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: '2mm',
    borderTopWidth: 0.2,
    borderTopColor: palette.lineCreamOnCream,
    borderTopStyle: 'dashed',
  },
  cardSigName: { fontFamily: FONT_FAMILY, fontSize: fs.body, fontWeight: 700, color: palette.ink },
  cardSigRole: { fontFamily: FONT_FAMILY, fontSize: fs.micro, letterSpacing: 0.1, color: palette.muted },
});

function Card({ t }: { t: Testimonial }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardCategory}>{t.category}</Text>
        {t.date && <Text style={s.cardDate}>{t.date}</Text>}
      </View>
      <Text style={s.cardClient}>{t.client}</Text>
      <Text style={s.cardQuote}>«{t.quote}»</Text>
      <View style={s.cardSig}>
        <Text style={s.cardSigName}>{t.signatory}</Text>
        <Text style={s.cardSigRole}>{t.role}</Text>
      </View>
    </View>
  );
}

function Grid({ items }: { items: Testimonial[] }) {
  // Layout: 2 cols × N rows. Pair items by index.
  const rows: Testimonial[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View style={s.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={s.row}>
          {row.map((t, ci) => <Card key={`${ri}-${ci}`} t={t} />)}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

export function TestimonialsPage1({ pageNum, content }: TestimonialsProps) {
  const first8 = content.items.slice(0, 8);
  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <View style={s.titleRow}>
        <TitleH1 accent={content.accent} accentFirst>{content.title}</TitleH1>
        <BigBadge num={content.items.length} label={content.badgeLabel} />
      </View>
      <LeadBox>{content.lead}</LeadBox>
      <Grid items={first8} />
    </PrintPage>
  );
}

export function TestimonialsPage2({ pageNum, content }: TestimonialsProps) {
  const rest = content.items.slice(8);
  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <View style={s.continueRow}>
        <Eyebrow>{content.continueEyebrow}</Eyebrow>
        <Text style={s.continueRight}>{content.continueRight}</Text>
      </View>
      <Grid items={rest} />
    </PrintPage>
  );
}
