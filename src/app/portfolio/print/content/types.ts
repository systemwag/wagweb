import type { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────
   Shared shape of every translatable string/array in the print
   brochure. Values that carry markup (<br />, accent <span>s,
   {' '} joins) are typed ReactNode and live as JSX in content/ru.tsx
   and content/en.tsx, so the rendered HTML stays byte-identical to
   the pre-refactor pages. Locale-invariant structure (icons, images,
   page chrome, URLs, counts) lives in ../PrintBrochure.tsx.
   ───────────────────────────────────────────────────────────────── */

export type PrintTestimonial = {
  client: string;
  signatory: string;
  role: string;
  date?: string;
  category: string;
  quote: string;
};

export type PrintPartner = { file: string; name: string };

export type SvcText = { num: string; title: string; desc: string };

export type ProcessStep = { roman: string; title: string; meta: string };

export type PersonStat = { num: string; label: string; desc: string };

export type TeamMember = { num: string; role: string; name: string; phone: string };

export type LicenseContent = {
  /* Section kicker at the very top, e.g. «ЛИЦЕНЗИЯ · СТРОИТЕЛЬСТВО» —
     mirrors the eyebrow on page 04 («СЕРТИФИКАТЫ · ISO»). */
  eyebrow: string;
  number: string;
  date: string;
  titleAccent: string;
  titleMain: string;
  /* Rendered as a bigBadge (num + label) in the title row, mirroring
     page 08 — e.g. «I» + «Категория», «1» + «Класс». */
  badgeNum: string;
  badgeLabel: ReactNode;
  scan: string;
  meta: { label: string; value: string }[];
};

export type AccreditationCard = {
  number: string;    // «№ KZ83VWC00283699»
  scope: string;     // краткая суть допуска
  level: string;     // «I и II уровни» / «I уровень»
  holder: string;    // «West Arlan Group» / «Global Construction Project»
  validUntil: string; // «до 26.06.2028»
  scan: string;      // путь к сканированному свидетельству
};

export type DirectionContent = {
  eyebrow: string;
  title: ReactNode;
  badgeTop: string;
  badgeBottom: string;
  lead: ReactNode;
  svcs: SvcText[];
  processLabel: string;
  process: ProcessStep[];
  footerLabel: string;
};

export interface PrintContent {
  /* 01 · COVER */
  cover: {
    eyebrow: string;
    issue: string;
    badges: { level: string; area: string }[];
    /* RU shows a bilingual pair per tagline item (main + sub); EN has a
       single span — `sub` is simply omitted there. */
    tagline: { main: string; sub?: string }[];
    binLabel: string;
  };

  /* 02 · ABOUT */
  about: {
    eyebrow: string;
    title: ReactNode;
    statSmrLabel: string;
    statPdLabel: string;
    statSectorsLabel: string;
    statRegionsLabel: string;
    lead: ReactNode;
    industriesLabel: string;
    industryChips: ReactNode[];
    missionLabel: string;
    mission: ReactNode;
    approachLabel: string;
    approach: ReactNode;
    /* Leading space is significant — original JSX was `<span /> LABEL`. */
    legalLabel: string;
    hqRole: string;
    hqMeta: string;
    legalCards: { badge: string; name: string; role: string }[];
    legalNote: ReactNode;
  };

  /* 03 · SCALE + GEOGRAPHY */
  scale: {
    eyebrow: string;
    title: ReactNode;
    lead: ReactNode;
    statBuildLabel: ReactNode;
    statMaintenanceLabel: ReactNode;
    statPdLabel: ReactNode;
    statRegionsLabel: ReactNode;
    statCountriesLabel: ReactNode;
    peopleTitle: ReactNode;
    people: PersonStat[];
  };

  /* 04 · ISO CERTIFICATES */
  iso: {
    eyebrow: string;
    title: ReactNode;
    badgeLabel: ReactNode;
    lead: ReactNode;
    /* Zipped with the locale-invariant scan images in PrintBrochure. */
    cards: { name: string; detail: string }[];
  };

  /* 05–07 · LICENSES — prefix includes its trailing space ('№ ' / 'No. ')
     so the SSR text-node split stays identical to the originals. */
  licNumberPrefix: string;
  licenses: [LicenseContent, LicenseContent, LicenseContent];

  /* 08 · ACCREDITATIONS — 2×2 grid of the four 2026 accreditation
     certificates (technical survey, supervision ×2, project management). */
  accreditations: {
    eyebrow: string;
    title: ReactNode;
    badgeLabel: ReactNode;
    lead: ReactNode;
    cards: [AccreditationCard, AccreditationCard, AccreditationCard, AccreditationCard];
  };

  /* 09 · DIRECTION 01 — DESIGN, 10 · DIRECTION 02 — BUILD */
  dirDesign: DirectionContent;
  dirBuild: DirectionContent;

  /* 11 · PORTFOLIO QR */
  qr: {
    eyebrow: string;
    title: ReactNode;
    badgeLabel: ReactNode;
    lead: ReactNode;
    /* Order: projects (teal), maintenance (blue), design (gold). */
    cards: { title: string; countLabel: ReactNode; hint: string }[];
    /* Leading space is significant — original JSX was `<span /> LABEL`. */
    infoLabel: string;
    infoChips: { title: string; desc: string }[];
    /* Optional lead-in band at the bottom pointing to the project cases that
       follow (QR page now sits BEFORE the cases). */
    remark?: ReactNode;
    remarkTag?: string;
  };

  /* 12 · TESTIMONIALS */
  testimonials: {
    eyebrow: string;
    title: ReactNode;
    lead: ReactNode;
    quoteOpen: string;
    quoteClose: string;
    items: PrintTestimonial[];
  };

  /* 13 · PARTNERS */
  partners: {
    eyebrow: string;
    title: ReactNode;
    categories: string[];
    lead: ReactNode;
    items: PrintPartner[];
    repeatLabel: string;
    registryLabel: string;
  };

  /* 14 · CONTACTS */
  contacts: {
    eyebrow: string;
    title: ReactNode;
    badgeTopSmall: string;
    badgeNumBig: ReactNode;
    badgeBottom: string;
    lead: ReactNode;
    /* Zipped with the locale-invariant row icons in PrintBrochure. */
    rows: { label: string; value: ReactNode }[];
    teamLabel: string;
    team: TeamMember[];
    legalLabel: string;
    legalValue: string;
    licensesLabel: string;
    licensesValue: string;
    siteLabel: string;
  };

  /* 15 · CLOSING MANIFESTO */
  closing: {
    eyebrow: string;
    quote: ReactNode;
    byline: ReactNode;
  };
}
