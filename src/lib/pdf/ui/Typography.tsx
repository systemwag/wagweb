/**
 * Typography primitives: Eyebrow, TitleH1, TitleH2, BodyText, MiniLabel.
 *
 * The TitleH1 supports inline accent text — pass `accent` as a separate
 * prop instead of children-with-mixed-styles, which keeps the API
 * declarative (no JSX-in-string acrobatics).
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { ReactNode } from 'react';
import { palette, fs, ls, lh } from '../tokens';
import { FONT_FAMILY, FONT_DISPLAY } from '../fonts';

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.micro,
    fontWeight: 600,
    letterSpacing: ls.micro,
    color: palette.goldDark,
    textTransform: 'uppercase',
  },
  eyebrowDark: { color: palette.goldSoft },

  h1: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: fs.h1,
    lineHeight: 1.02,
    letterSpacing: -0.025,
    color: palette.ink,
    marginTop: '8mm',
    marginBottom: '6mm',
  },
  h1Dark: { color: palette.textOnDark },
  h1Big:  { fontSize: fs.h1Big },

  // Editorial-minimal: no italic. Accent is just the brand gold colour at
  // the same weight as the rest of the title — colour does the emphasis.
  accent:     { color: palette.gold },
  accentGold: { color: palette.gold },
  accentTeal: { color: palette.teal },

  body: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.body,
    lineHeight: lh.loose,
    color: palette.ink2,
  },
  bodyDark: { color: 'rgba(240,242,248,0.85)' },

  miniLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: fs.eyebrow,
    fontWeight: 600,
    letterSpacing: ls.badge,
    color: palette.goldDark,
    textTransform: 'uppercase',
  },
  miniLabelDark: { color: palette.goldSoft },
});

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <Text style={dark ? [styles.eyebrow, styles.eyebrowDark] : [styles.eyebrow]}>{children}</Text>;
}

type TitleH1Props = {
  children: ReactNode;
  accent?: ReactNode;
  accentVariant?: 'default' | 'gold' | 'teal';
  accentFirst?: boolean;       // put accent on first line instead of second
  big?: boolean;
  dark?: boolean;
};

export function TitleH1({
  children,
  accent,
  accentVariant = 'default',
  accentFirst,
  big,
  dark,
}: TitleH1Props) {
  const accentStyle =
    accentVariant === 'gold' ? styles.accentGold :
    accentVariant === 'teal' ? styles.accentTeal :
    styles.accent;

  return (
    <Text style={[
      styles.h1,
      ...(dark ? [styles.h1Dark] : []),
      ...(big  ? [styles.h1Big]  : []),
    ]}>
      {accentFirst && accent ? (
        <>
          <Text style={accentStyle}>{accent}</Text>
          {'\n'}
          {children}
        </>
      ) : (
        <>
          {children}
          {accent && (
            <>
              {'\n'}
              <Text style={accentStyle}>{accent}</Text>
            </>
          )}
        </>
      )}
    </Text>
  );
}

export function Body({ children, dark, style }: { children: ReactNode; dark?: boolean; style?: Style }) {
  return (
    <Text style={[
      styles.body,
      ...(dark  ? [styles.bodyDark] : []),
      ...(style ? [style] : []),
    ]}>
      {children}
    </Text>
  );
}

export function MiniLabel({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <Text style={dark ? [styles.miniLabel, styles.miniLabelDark] : [styles.miniLabel]}>{children}</Text>;
}
