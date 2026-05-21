/**
 * Type definitions for the portfolio content. The actual values live in
 * `ru.ts` (and future `en.ts`). Components read content via these types.
 *
 * Marketing numbers (counts, percentages) are NOT part of content — they
 * live in `data/getPortfolioData.ts` and are merged at render time.
 */

export type LegalEntity = {
  badge: 'HQ' | 'СМР' | 'ПД';
  badgeColor: 'gold' | 'teal' | 'blue';
  name: string;
  role: string;
  meta: string;
};

export type IsoCert = {
  image: string;       // path under /public
  name: string;
  detail: string;
};

export type IsoFooterItem = {
  label: string;
  value: string;
};

export type LicenseMeta = {
  label: string;
  value: string;
};

export type License = {
  number: string;
  date: string;
  title: string;
  badge: string;
  scan: string;        // path under /public
  meta: LicenseMeta[];
};

export type IndustryChip = {
  icon: 'rail' | 'pipe' | 'power' | 'industry' | 'network';
  label: string;
};

export type Service = {
  num: string;
  title: string;
  desc: string;
};

export type ProcessStep = {
  roman: string;
  title: string;
  meta: string;
};

export type Partner = {
  file: string;        // filename in /public/partners/
  name: string;
};

export type Testimonial = {
  client: string;
  signatory: string;
  role: string;
  date?: string;
  category: string;
  quote: string;
};

export type TeamMember = {
  num: string;
  role: string;
  name: string;
  phone: string;
};

export type Content = {
  cover: {
    eyebrow: string;
    title: string;
    accent: string;
    taglineLine1: string;
    taglineLine2: string;
    chips: string[];
    bin: string;
    phone: string;
    site: string;
  };

  about: {
    eyebrow: string;
    title: string;
    accent: string;
    stats: { num: string; label: string }[];
    lead: string;
    industryChipsLabel: string;
    industryChips: IndustryChip[];
    columns: { title: string; body: string }[];
    legalLabel: string;
    legalEntities: LegalEntity[];
    legalNote: string;
  };

  scale: {
    eyebrow: string;
    title: string;
    items: {
      key: 'smr' | 'pd' | 'regions' | 'countries';
      label: string;
      desc: string;
      variant: 'gold' | 'teal' | 'blue';
    }[];
  };

  map: {
    eyebrowPrefix: string;       // 'ГЕОГРАФИЯ РАБОТ'
    title: string;
    accent: string;
    badgeLabel: string;
    lead: string;
    cornerCoord1: string;
    cornerCoord2: string;
    aktobeLabel: string;
    orenburgLabel: string;
    orenburgSubtitle: string;
    statBarLabels: string[];     // 4 items: ЗАВЕРШЕНО, В РАБОТЕ, В ПЛАНАХ, СТРАНЫ
    regionsLabel: string;
    regions: string[];
  };

  iso: {
    eyebrow: string;
    title: string;
    accent: string;
    badgeLabel: string;
    lead: string;
    certs: IsoCert[];
    footer: IsoFooterItem[];
  };

  licenses: {
    smr: License;
    pd: License;
    eco: License;
    accreditation: License;
  };

  direction01: {
    eyebrow: string;
    title: string;
    accent: string;
    badgeTop: string;
    badgeBottom: string;
    lead: string;
    services: Service[];
    processLabel: string;
    process: ProcessStep[];
    footerLabel: string;
    footerEntity: string;
    footerUrl: string;
  };

  direction02: {
    eyebrow: string;
    title: string;
    accent: string;
    badgeTop: string;
    badgeBottom: string;
    lead: string;
    services: Service[];
    processLabel: string;
    process: ProcessStep[];
    footerLabel: string;
    footerEntity: string;
    footerUrl: string;
  };

  qr: {
    eyebrow: string;
    title: string;
    accent: string;
    lead: string;
    cards: {
      num: string;
      title: string;
      countLabel: string;
      url: string;
      hint: string;
      variant: 'gold' | 'teal';
    }[];
    infoLabel: string;
    info: { title: string; desc: string }[];
  };

  testimonials: {
    eyebrow: string;
    title: string;
    accent: string;
    badgeLabel: string;
    lead: string;
    continueEyebrow: string;
    continueRight: string;
    items: Testimonial[];
  };

  partners: {
    eyebrow: string;
    title: string;
    accent: string;
    categoryChips: string[];
    lead: string;
    items: Partner[];
    footerNum: string;
    footerText: string;
    footerRight: string;
  };

  contacts: {
    eyebrow: string;
    title: string;
    accent: string;
    badgeTop: string;
    badgeBottom: string;
    lead: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
    teamLabel: string;
    team: TeamMember[];
    juridicalLabel: string;
    juridical: string;
    licensesLabel: string;
    licenses: string;
    siteLabel: string;
    site: string;
  };
};
