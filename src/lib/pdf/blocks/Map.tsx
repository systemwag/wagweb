/**
 * 04 · Map — dark page with KZ map (pre-baked PNG), corner coordinates,
 * project status dots overlaid as SVG, stat bar, region chips.
 */
import { View, Text, Image, Svg, Circle, StyleSheet } from '@react-pdf/renderer';
import { PrintPage } from '../ui/Page';
import { Eyebrow, TitleH1 } from '../ui/Typography';
import { LeadBox, Chip, BigBadge } from '../ui/Cards';
import { assetBuffer } from '../ui/asset';
import { palette, fs, ls } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import type { Content } from '../content/types';
import type { PortfolioData } from '../data/getPortfolioData';

type Props = { pageNum: number; content: Content['map']; data: PortfolioData };

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8mm' },

  frame: {
    position: 'relative',
    backgroundColor: 'rgba(7,11,22,0.5)',
    borderWidth: 0.3,
    borderColor: 'rgba(240,242,248,0.06)',
    borderRadius: 2,
    flex: 1,
    minHeight: '90mm',
    marginTop: '3mm',
    marginBottom: '5mm',
  },
  mapImg: { width: '100%', height: '100%', objectFit: 'contain' },
  mapSvgOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },

  cornerCoord: {
    position: 'absolute',
    fontFamily: FONT_MONO,
    fontSize: fs.micro,
    letterSpacing: 0.10,
    color: 'rgba(240,242,248,0.40)',
  },

  statBar: { flexDirection: 'row', gap: '3mm', marginBottom: '4mm' },
  statBarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4mm',
    paddingTop: '4mm',
    paddingBottom: '4mm',
    paddingLeft: '5mm',
    paddingRight: '5mm',
    backgroundColor: 'rgba(13,18,34,0.5)',
    borderWidth: 0.3,
    borderColor: 'rgba(240,242,248,0.06)',
    borderLeftWidth: 1.4,
    borderRadius: 2,
  },
  statBarGold: { borderLeftColor: palette.gold },
  statBarTeal: { borderLeftColor: palette.teal },
  statBarBlue: { borderLeftColor: palette.blue },
  statBarNum: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    fontSize: 22,
    color: palette.textOnDark,
    lineHeight: 1,
    fontVariant: ['tabular-nums'],
  },
  statBarNumGold: { color: palette.gold },
  statBarNumTeal: { color: palette.tealSoft },
  statBarNumBlue: { color: palette.blue },
  statBarLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: 'rgba(240,242,248,0.70)',
  },

  chipRow: { flexDirection: 'row', alignItems: 'center', gap: '5mm' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: '2mm', flex: 1 },
  chipLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldSoft,
  },
});

// Project markers and the baked PNG must share one coordinate space — the
// same viewBox used by src/components/Map/KazakhstanMap.tsx and the bake
// script. Otherwise markers drift relative to the country outline.
const VB_X = -100, VB_Y = 30, VB_W = 1200, VB_H = 820;

export function MapBlock({ pageNum, content, data }: Props) {
  const eyebrow = `${content.eyebrowPrefix} · ${data.countRegions} РЕГИОНОВ · ${data.countCountries} СТРАНЫ`;

  const dotColor = (status: string) =>
    status === 'completed'   ? '#D4A843' :
    status === 'in-progress' ? '#00C4A7' :
    '#4F84FF';

  return (
    <PrintPage variant="dark" pageNum={pageNum}>
      <Eyebrow dark>{eyebrow}</Eyebrow>

      <View style={s.titleRow}>
        <TitleH1 dark accent={content.accent} accentFirst accentVariant="gold">{content.title}</TitleH1>
        <BigBadge num={data.countRegions} label={content.badgeLabel} dark />
      </View>

      <LeadBox dark>{content.lead}</LeadBox>

      <View style={s.frame}>
        <Text style={[s.cornerCoord, { top: '4mm', left: '4mm' }]}>{content.cornerCoord1}</Text>
        <Text style={[s.cornerCoord, { bottom: '4mm', right: '4mm' }]}>{content.cornerCoord2}</Text>

        <Image src={assetBuffer('/portfolio/kz-map.png')} style={s.mapImg} />

        <Svg style={s.mapSvgOverlay} viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}>
          {data.mapProjects.map((p) => {
            if (p.x_map == null || p.y_map == null) return null;
            const c = dotColor(p.status);
            return (
              <React.Fragment key={p.id}>
                <Circle cx={p.x_map} cy={p.y_map} r={14} fill={c} fillOpacity={0.20} />
                <Circle cx={p.x_map} cy={p.y_map} r={5} fill={c} />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={s.statBar}>
        <View style={[s.statBarItem, s.statBarGold]}>
          <Text style={[s.statBarNum, s.statBarNumGold]}>{data.completed}</Text>
          <Text style={s.statBarLabel}>{content.statBarLabels[0]}</Text>
        </View>
        <View style={[s.statBarItem, s.statBarTeal]}>
          <Text style={[s.statBarNum, s.statBarNumTeal]}>{data.inProgress}</Text>
          <Text style={s.statBarLabel}>{content.statBarLabels[1]}</Text>
        </View>
        <View style={[s.statBarItem, s.statBarBlue]}>
          <Text style={[s.statBarNum, s.statBarNumBlue]}>{data.planned}</Text>
          <Text style={s.statBarLabel}>{content.statBarLabels[2]}</Text>
        </View>
        <View style={[s.statBarItem, s.statBarGold]}>
          <Text style={[s.statBarNum, s.statBarNumGold]}>{data.countCountries}</Text>
          <Text style={s.statBarLabel}>{content.statBarLabels[3]}</Text>
        </View>
      </View>

      <View style={s.chipRow}>
        <Text style={s.chipLabel}>{content.regionsLabel}</Text>
        <View style={s.chipGroup}>
          {content.regions.map((r) => (
            <Chip key={r} variant="dark">{r}</Chip>
          ))}
        </View>
      </View>
    </PrintPage>
  );
}

import React from 'react';
