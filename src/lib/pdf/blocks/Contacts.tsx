/**
 * 16 · Contacts — dark page with badge "СРОК ОТВЕТА · 1 ДЕНЬ",
 * 4 contact rows (phone/email/address/hours), 4 team member cards,
 * juridical info footer, site name + watermark triangle.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox } from '../ui/Cards';
import { WagMark } from '../ui/WagMark';
import { IconPhone, IconMail, IconPin, IconClock } from '../ui/Icons';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';

type Props = { pageNum: number; content: Content['contacts'] };

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },

  // "1 день" badge
  badge: {
    width: '28mm',
    minHeight: '28mm',
    borderWidth: 0.6,
    borderColor: palette.gold,
    borderRadius: 2,
    backgroundColor: 'rgba(201,148,31,0.06)',
    padding: '3mm',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1mm',
  },
  badgeTop: { fontFamily: FONT_FAMILY, fontSize: fs.micro, fontWeight: 600, letterSpacing: ls.badge, color: 'rgba(240,242,248,0.65)', textTransform: 'uppercase' },
  badgeNum: { flexDirection: 'row', alignItems: 'baseline', gap: '1mm' },
  badgeNumBig: { fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 26, color: palette.gold, lineHeight: 1 },
  badgeNumUnit: { fontFamily: FONT_FAMILY, fontSize: fs.body, fontWeight: 600, color: 'rgba(240,242,248,0.75)' },
  badgeBottom: { fontFamily: FONT_FAMILY, fontSize: fs.micro, fontWeight: 600, letterSpacing: ls.badge, color: 'rgba(201,148,31,0.85)', textTransform: 'uppercase' },

  // Contact rows (2 cols)
  contactGrid: { flexDirection: 'column', gap: '4mm', marginTop: '2mm', marginBottom: '5mm' },
  contactRow: { flexDirection: 'row', gap: '8mm' },
  contactCell: {
    flex: 1,
    flexDirection: 'row',
    gap: '3mm',
    paddingBottom: '2mm',
    borderBottomWidth: 0.25,
    borderBottomColor: 'rgba(240,242,248,0.10)',
    borderBottomStyle: 'dashed',
  },
  contactIcon: {
    width: '8mm',
    height: '8mm',
    backgroundColor: 'rgba(201,148,31,0.10)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBody: { flex: 1, flexDirection: 'column', gap: '1mm' },
  contactLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: 'rgba(201,148,31,0.75)',
    textTransform: 'uppercase',
  },
  contactValue: { fontFamily: FONT_FAMILY, fontSize: fs.label, fontWeight: 500, color: palette.textOnDark, lineHeight: lh.tight },

  // Team
  teamLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3mm',
    marginBottom: '3mm',
  },
  teamLine: { width: '12mm', height: 0.4, backgroundColor: palette.gold },
  teamLabelText: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldDark,
    textTransform: 'uppercase',
  },
  teamGrid: { flexDirection: 'column', gap: '3mm', marginBottom: '4mm' },
  teamRow: { flexDirection: 'row', gap: '5mm' },
  teamCard: {
    flex: 1,
    position: 'relative',
    padding: '4mm',
    paddingLeft: '9mm',
    backgroundColor: 'rgba(13,18,34,0.5)',
    borderWidth: 0.3,
    borderColor: 'rgba(240,242,248,0.06)',
    borderLeftWidth: 1.4,
    borderLeftColor: palette.gold,
    borderRadius: 2,
  },
  teamNum: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: fs.h3,
    color: palette.gold,
    lineHeight: 1,
    fontVariant: ['tabular-nums'],
  },
  teamRole: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.label,
    color: 'rgba(240,242,248,0.55)',
    textTransform: 'uppercase',
    marginBottom: '1mm',
  },
  teamName: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, fontWeight: 700, color: palette.textOnDark, marginBottom: '1mm' },
  teamPhone: { fontFamily: FONT_FAMILY, fontSize: fs.bodyLg, fontWeight: 500, color: palette.goldSoft, letterSpacing: 0.02 },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: '5mm',
    marginTop: 'auto',
    paddingTop: '4mm',
    borderTopWidth: 0.3,
    borderTopColor: 'rgba(240,242,248,0.12)',
  },
  footerCol: { flex: 1, borderLeftWidth: 0.6, borderLeftColor: palette.gold, paddingLeft: '3mm' },
  footerLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: 'rgba(201,148,31,0.85)',
    textTransform: 'uppercase',
    marginBottom: '1.5mm',
  },
  footerValue: { fontFamily: FONT_FAMILY, fontSize: fs.body, color: 'rgba(240,242,248,0.85)', lineHeight: lh.normal },

  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '5mm' },
  bottomLeft: { flexDirection: 'column', gap: '2mm' },
  siteText: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    fontSize: 28,
    color: palette.gold,
    lineHeight: 1,
    letterSpacing: ls.tighter,
  },
});

export function Contacts({ pageNum, content }: Props) {
  return (
    <PrintPage variant="dark" pageNum={pageNum}>
      <Eyebrow dark>{content.eyebrow}</Eyebrow>

      <View style={s.titleRow}>
        <TitleH1 dark accent={content.accent} accentFirst accentVariant="gold">{content.title}</TitleH1>
        <View style={s.badge}>
          <Text style={s.badgeTop}>{content.badgeTop}</Text>
          <View style={s.badgeNum}>
            <Text style={s.badgeNumBig}>1</Text>
            <Text style={s.badgeNumUnit}>день</Text>
          </View>
          <Text style={s.badgeBottom}>{content.badgeBottom}</Text>
        </View>
      </View>

      <LeadBox dark>{content.lead}</LeadBox>

      <View style={s.contactGrid}>
        <View style={s.contactRow}>
          <View style={s.contactCell}>
            <View style={s.contactIcon}><IconPhone /></View>
            <View style={s.contactBody}>
              <Text style={s.contactLabel}>ТЕЛЕФОН ОФИСА</Text>
              <Text style={s.contactValue}>{content.phone}</Text>
            </View>
          </View>
          <View style={s.contactCell}>
            <View style={s.contactIcon}><IconMail /></View>
            <View style={s.contactBody}>
              <Text style={s.contactLabel}>EMAIL</Text>
              <Text style={s.contactValue}>{content.email}</Text>
            </View>
          </View>
        </View>
        <View style={s.contactRow}>
          <View style={s.contactCell}>
            <View style={s.contactIcon}><IconPin /></View>
            <View style={s.contactBody}>
              <Text style={s.contactLabel}>АДРЕС ОФИСА</Text>
              <Text style={s.contactValue}>{content.address}</Text>
            </View>
          </View>
          <View style={s.contactCell}>
            <View style={s.contactIcon}><IconClock /></View>
            <View style={s.contactBody}>
              <Text style={s.contactLabel}>РЕЖИМ РАБОТЫ</Text>
              <Text style={s.contactValue}>{content.hours}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={s.teamLabel}>
        <View style={s.teamLine} />
        <Text style={s.teamLabelText}>{content.teamLabel}</Text>
      </View>

      <View style={s.teamGrid}>
        {[0, 1].map((rowIdx) => (
          <View key={rowIdx} style={s.teamRow}>
            {[0, 1].map((colIdx) => {
              const t = content.team[rowIdx * 2 + colIdx];
              return (
                <View key={t.num} style={s.teamCard}>
                  <Text style={s.teamNum}>{t.num}</Text>
                  <Text style={s.teamRole}>{t.role}</Text>
                  <Text style={s.teamName}>{t.name}</Text>
                  <Text style={s.teamPhone}>{t.phone}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={s.footer}>
        <View style={s.footerCol}>
          <Text style={s.footerLabel}>{content.juridicalLabel}</Text>
          <Text style={s.footerValue}>{content.juridical}</Text>
        </View>
        <View style={s.footerCol}>
          <Text style={s.footerLabel}>{content.licensesLabel}</Text>
          <Text style={s.footerValue}>{content.licenses}</Text>
        </View>
      </View>

      <View style={s.bottomBar}>
        <View style={s.bottomLeft}>
          <Text style={s.footerLabel}>{content.siteLabel}</Text>
          <Text style={s.siteText}>{content.site}</Text>
        </View>
        <WagMark width="24mm" height="22mm" gradientId="wag-contacts" opacity={0.85} />
      </View>
    </PrintPage>
  );
}
