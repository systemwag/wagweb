/**
 * Design tokens for the print engine.
 * Mirrors the website's brand palette but tuned for print (lighter darks,
 * warmer creams) and uses mm/pt units instead of px.
 *
 * NOTE: react-pdf accepts numbers as pt (1/72") or strings with units
 * ('10mm', '12pt', '50%'). We standardize on pt for type values (so
 * font-size: 30 = 30pt) and mm strings for box spacing.
 */

export const palette = {
  // Backgrounds
  dark:        '#04060C',        // primary dark (cover, dark pages)
  dark2:       '#0A1124',        // slightly lighter for stat boxes on dark
  cream:       '#EFE2CB',        // primary cream (light pages)
  creamCard:   '#F8EFE0',        // cards/chips on cream
  creamCard2:  '#F2E6CF',        // alt card tone

  // Ink
  ink:         '#1A1A1A',
  ink2:        '#4A4032',
  muted:       '#8A7B5C',

  // Brand accents
  gold:        '#B58923',     // softer, paper-friendly than the website's #C9941F
  goldBright:  '#E8C158',
  goldDark:    '#8F6A1A',
  goldSoft:    '#D7AB47',

  teal:        '#00A88E',
  tealSoft:    '#1AC2A6',

  blue:        '#4F84FF',

  // Lines
  lineGoldOnDark:    'rgba(201,148,31,0.45)',
  lineCreamOnCream:  'rgba(74,64,50,0.18)',
  lineOnDark:        'rgba(240,242,248,0.12)',

  // Text on dark
  textOnDark:        '#F0F2F8',
  textOnDarkMuted:   'rgba(240,242,248,0.70)',
  textOnDarkFaint:   'rgba(240,242,248,0.45)',
};

/**
 * Page dimensions (A4 portrait).
 * react-pdf <Page size="A4"> already produces 210×297mm; these are for
 * margin/padding calculations.
 */
export const page = {
  width:   '210mm',
  height:  '297mm',
  padTop:  '18mm',
  padX:    '16mm',
  padBot:  '14mm',
};

/**
 * Font sizes in pt (react-pdf's default unit).
 */
export const fs = {
  eyebrow:    8,
  micro:      7,
  small:      8,
  body:       9.5,
  bodyLg:     10.5,
  label:      10,
  card:       10,
  h3:         13,
  h2:         18,
  h1:         48,    // generous editorial display
  h1Big:      58,
  display:    64,    // cover title
  num:        96,    // big numbers on Scale page — page-dominant
  numMd:      32,
  numSm:      20,
};

/**
 * Letter spacing (em).
 */
export const ls = {
  eyebrow:  0.28,
  label:    0.18,
  badge:    0.20,
  micro:    0.32,
  tight:    -0.015,
  tighter:  -0.02,
};

/**
 * Line height multipliers (react-pdf uses lineHeight as a multiplier).
 */
export const lh = {
  tight:   1.05,
  normal:  1.4,
  loose:   1.55,
};

/**
 * Box spacing scale (in mm).
 */
export const sp = {
  xs:   '1.5mm',
  sm:   '2.5mm',
  md:   '4mm',
  lg:   '6mm',
  xl:   '10mm',
  '2xl':'14mm',
};
