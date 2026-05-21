/**
 * Font registration for @react-pdf/renderer.
 *
 * Three families in use:
 *   - 'Inter'   — body, lead text, generic UI text (alias → Noto Sans TTF).
 *                Full Cyrillic incl. Kazakh extensions (Қ, ұ, і).
 *   - 'Display' — headlines, big numbers, cover title (Onest variable TTF).
 *                Geometric modern sans designed for headlines.
 *   - 'Mono'   — technical labels (page numbers, coordinates, license №,
 *                BIN, phone) (JetBrains Mono TTF).
 *
 * Onest is a variable font; we register the same file at multiple weights
 * — react-pdf passes the registered weight to fontkit which uses it as
 * the wght axis value.
 *
 * Onest has no italic master. Where italic display headings are needed we
 * fall back to Inter italic (Noto Sans).
 */
import { Font } from '@react-pdf/renderer';
import path from 'node:path';

const notoDir   = path.resolve(process.cwd(), 'public/fonts/noto');
const onestDir  = path.resolve(process.cwd(), 'public/fonts/onest');
const monoDir   = path.resolve(process.cwd(), 'public/fonts/mono');

const noto  = (f: string) => path.join(notoDir,  f);
const onest = (f: string) => path.join(onestDir, f);
const mono  = (f: string) => path.join(monoDir,  f);

// Body / generic
Font.register({
  family: 'Inter',
  fonts: [
    { src: noto('NotoSans-Regular.ttf'),         fontWeight: 400 },
    { src: noto('NotoSans-Medium.ttf'),          fontWeight: 500 },
    { src: noto('NotoSans-SemiBold.ttf'),        fontWeight: 600 },
    { src: noto('NotoSans-Bold.ttf'),            fontWeight: 700 },
    { src: noto('NotoSans-ExtraBold.ttf'),       fontWeight: 800 },
    { src: noto('NotoSans-Black.ttf'),           fontWeight: 900 },
    { src: noto('NotoSans-Italic.ttf'),          fontWeight: 400, fontStyle: 'italic' },
    { src: noto('NotoSans-MediumItalic.ttf'),    fontWeight: 500, fontStyle: 'italic' },
    { src: noto('NotoSans-BoldItalic.ttf'),      fontWeight: 700, fontStyle: 'italic' },
    { src: noto('NotoSans-ExtraBoldItalic.ttf'), fontWeight: 800, fontStyle: 'italic' },
  ],
});

// Display headlines (variable TTF — single file, weight via axis)
Font.register({
  family: 'Display',
  fonts: [
    { src: onest('Onest.ttf'), fontWeight: 400 },
    { src: onest('Onest.ttf'), fontWeight: 500 },
    { src: onest('Onest.ttf'), fontWeight: 600 },
    { src: onest('Onest.ttf'), fontWeight: 700 },
    { src: onest('Onest.ttf'), fontWeight: 800 },
    { src: onest('Onest.ttf'), fontWeight: 900 },
  ],
});

// Technical labels — monospace
Font.register({
  family: 'Mono',
  fonts: [
    { src: mono('JetBrainsMono-Regular.ttf'), fontWeight: 400 },
    { src: mono('JetBrainsMono-Medium.ttf'),  fontWeight: 500 },
    { src: mono('JetBrainsMono-Bold.ttf'),    fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

export const FONT_FAMILY  = 'Inter';
export const FONT_DISPLAY = 'Display';
export const FONT_MONO    = 'Mono';
