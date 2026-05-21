/**
 * 02 · About — light cream page. Title + inline stats, lead box, industry
 * chips, two-column mission/approach text, three legal entity cards.
 */
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox, Chip } from '../ui/Cards';
import { WagMark } from '../ui/WagMark';
import { INDUSTRY_ICONS } from '../ui/Icons';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = { pageNum: number; content: Content['about'] };

const s = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8mm',
  },
  inlineStats: { flexDirection: 'row', alignItems: 'center', gap: '4mm', paddingTop: '8mm' },
  inlineStat: { flexDirection: 'column', gap: '1mm' },
  inlineStatNum: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: 22,
    color: palette.gold,
    lineHeight: 1,
    fontVariant: ['tabular-nums'],
  },
  inlineStatLabel: {
    fontFamily: FONT_MONO,
    fontSize: fs.micro,
    fontWeight: 500,
    letterSpacing: 0.14,
    color: palette.muted,
    textTransform: 'uppercase',
  },
  inlineStatDiv: { width: 0.4, height: '12mm', backgroundColor: palette.lineCreamOnCream },

  industryRow: { flexDirection: 'row', alignItems: 'center', gap: '5mm', marginTop: '2mm', marginBottom: '3mm' },
  industryGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: '2.5mm', flex: 1 },

  divider: { borderTopWidth: 0.3, borderTopColor: palette.lineCreamOnCream, borderStyle: 'dashed', marginVertical: '3mm' },

  cols: { flexDirection: 'row', gap: '8mm', marginBottom: '5mm' },
  col: { flex: 1 },
  colTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.bodyLg,
    fontWeight: 600,
    color: palette.goldDark,
    marginBottom: '2.5mm',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  colBody: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, lineHeight: lh.loose, color: palette.ink2 },

  legalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3mm',
    marginBottom: '3mm',
  },
  legalLine: { width: '12mm', height: 0.4, backgroundColor: palette.gold },
  legalLabelText: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldDark,
    textTransform: 'uppercase',
  },

  legalCards: { flexDirection: 'row', gap: '4mm' },
  legalCard: {
    flex: 1,
    position: 'relative',
    padding: '4mm',
    paddingTop: '5mm',
    backgroundColor: palette.creamCard,
    borderWidth: 0.3,
    borderColor: palette.lineCreamOnCream,
    borderRadius: 2,
    minHeight: '28mm',
  },
  legalCardDark: {
    backgroundColor: palette.dark,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  legalBadge: {
    position: 'absolute',
    top: -7,
    right: 12,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 700,
    letterSpacing: 0.14,
    borderRadius: 1.5,
  },
  legalBadgeGold: { backgroundColor: palette.gold, color: palette.dark },
  legalBadgeTeal: { backgroundColor: palette.teal, color: palette.dark },
  legalBadgeBlue: { backgroundColor: palette.blue, color: '#fff' },
  legalName: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.h3,
    fontWeight: 700,
    marginBottom: '1.5mm',
    color: palette.ink,
  },
  legalNameDark: { color: palette.textOnDark },
  legalRole: { fontFamily: FONT_FAMILY, fontSize: fs.small, color: palette.muted, marginBottom: '2mm' },
  legalRoleDark: { color: 'rgba(240,242,248,0.55)' },
  legalMeta: {
    paddingTop: '2mm',
    borderTopWidth: 0.2,
    borderTopColor: palette.lineCreamOnCream,
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    color: palette.muted,
    letterSpacing: 0.06,
  },
  legalMetaDark: { color: 'rgba(240,242,248,0.50)', borderTopColor: 'rgba(255,255,255,0.06)' },

  legalNote: {
    marginTop: '4mm',
    fontFamily: FONT_FAMILY,
    fontSize: fs.small,
    fontStyle: 'italic',
    color: palette.muted,
    lineHeight: lh.normal,
  },

  watermark: {
    position: 'absolute',
    bottom: '4mm',
    right: '12mm',
    opacity: 0.08,
  },
});

export function About({ pageNum, content }: Props) {
  return (
    <PrintPage variant="light" pageNum={pageNum}>
      <Eyebrow>{content.eyebrow}</Eyebrow>

      <View style={s.titleRow}>
        <TitleH1 accent={content.accent}>{content.title}</TitleH1>
        <View style={s.inlineStats}>
          {content.stats.map((stat, i) => (
            <View key={stat.label} style={{ flexDirection: 'row', alignItems: 'center', gap: '4mm' }}>
              <View style={s.inlineStat}>
                <Text style={s.inlineStatNum}>{stat.num}</Text>
                <Text style={s.inlineStatLabel}>{stat.label}</Text>
              </View>
              {i < content.stats.length - 1 && <View style={s.inlineStatDiv} />}
            </View>
          ))}
        </View>
      </View>

      <LeadBox>{content.lead}</LeadBox>

      <View style={s.industryRow}>
        <Text style={s.legalLabelText}>{content.industryChipsLabel}</Text>
        <View style={s.industryGroup}>
          {content.industryChips.map((c) => {
            const Icon = INDUSTRY_ICONS[c.icon];
            return (
              <View key={c.label} style={{ flexDirection: 'row', alignItems: 'center', gap: '2mm',
                backgroundColor: palette.creamCard, borderWidth: 0.3, borderColor: palette.lineCreamOnCream,
                borderRadius: 999, paddingTop: '1.2mm', paddingBottom: '1.2mm', paddingLeft: '3mm', paddingRight: '3.5mm' }}>
                <Icon size={9} color={palette.gold} />
                <Text style={{ fontFamily: FONT_FAMILY, fontSize: fs.body, color: palette.ink }}>{c.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.cols}>
        {content.columns.map((c) => (
          <View key={c.title} style={s.col}>
            <Text style={s.colTitle}>{c.title}</Text>
            <Text style={s.colBody}>{c.body}</Text>
          </View>
        ))}
      </View>

      <View style={s.legalLabel}>
        <View style={s.legalLine} />
        <Text style={s.legalLabelText}>{content.legalLabel}</Text>
      </View>

      <View style={s.legalCards}>
        {content.legalEntities.map((e) => {
          const isHQ = e.badge === 'HQ';
          const badgeStyle =
            e.badgeColor === 'teal' ? s.legalBadgeTeal :
            e.badgeColor === 'blue' ? s.legalBadgeBlue :
            s.legalBadgeGold;
          return (
            <View key={e.name} style={isHQ ? [s.legalCard, s.legalCardDark] : [s.legalCard]}>
              <Text style={[s.legalBadge, badgeStyle]}>{e.badge}</Text>
              <Text style={isHQ ? [s.legalName, s.legalNameDark] : [s.legalName]}>{e.name}</Text>
              <Text style={isHQ ? [s.legalRole, s.legalRoleDark] : [s.legalRole]}>{e.role}</Text>
              <Text style={isHQ ? [s.legalMeta, s.legalMetaDark] : [s.legalMeta]}>{e.meta}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.legalNote}>{content.legalNote}</Text>

      <View style={s.watermark}>
        <WagMark width="32mm" height="28mm" gradientId="wag-about" />
      </View>
    </PrintPage>
  );
}
