import { Fragment, type ReactNode } from 'react';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import styles from './print.module.css';
import type { PrintContent, PrintTestimonial } from '../content/types';
import CaseSheet, { CaseAnnexPage } from './CaseSheet';
import PztmShowcase from './PztmShowcase';
import BrandQr from '../BrandQr';
import { V2_COPY, type V2Copy } from './copy';
import { WAG_TRIANGLE } from '../wagTriangle';
import PROJECT_CASES from '../content/cases-ru';
import PROJECT_CASES_EN from '../content/cases-en';
import { KZ_REGIONS, KZ_OUTLINE, VIEWBOX } from '@/lib/geo/kz-geo.generated';
import { buildGeoIndex, KIND_ORDER, type WorkKind } from '@/lib/geo/works';
import { hubRadius, layoutHubLabels, layoutRegionLabels, relaxHubs, tierFor } from '@/lib/geo/layout';

/* ─────────────────────────────────────────────────────────────────
   v2 redesign of the print brochure (2026-10-19). Same copy as
   ../PrintBrochure.tsx (content/{ru,en}.tsx, cases-{ru,en}.tsx); new
   visual system: 7-step type scale, one gold and one teal per page tone,
   one colour code, drawings on plates that share the free height, the
   expertise conclusion in each case header. Rendered into
   versions/portfolio-v2*.pdf (npm run build:pdf:v2).
   ───────────────────────────────────────────────────────────────── */

/* WAG triangle mark — official logo (path in ../wagTriangle). */
function WagMark({ className, gradientId = 'wagGold' }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 719.49 635.66" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#D4A843" />
          <stop offset="50%"  stopColor="#F0C85A" />
          <stop offset="100%" stopColor="#C49A30" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`} d={WAG_TRIANGLE} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Locale-invariant assets
   ───────────────────────────────────────────────────────────────── */

const INDUSTRY_ICONS: ReactNode[] = [
  (
    <svg key="rails" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="7" y1="7" x2="7" y2="17" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="17" y1="7" x2="17" y2="17" />
    </svg>
  ),
  (
    <svg key="pipeline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="5" x2="12" y2="9" />
    </svg>
  ),
  (
    <svg key="pylon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="20" y2="21" />
      <line x1="9" y1="21" x2="12" y2="4" />
      <line x1="15" y1="21" x2="12" y2="4" />
      <line x1="6" y1="11" x2="18" y2="11" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  ),
  (
    <svg key="factory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V11l5-3v3l5-3v3l5-3v13z" />
      <line x1="7" y1="16" x2="7" y2="18" />
      <line x1="12" y1="16" x2="12" y2="18" />
      <line x1="17" y1="16" x2="17" y2="18" />
    </svg>
  ),
  (
    <svg key="network" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2">
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
      <line x1="6" y1="6" x2="11" y2="11" fill="none" />
      <line x1="18" y1="6" x2="13" y2="11" fill="none" />
      <line x1="6" y1="18" x2="11" y2="13" fill="none" />
      <line x1="18" y1="18" x2="13" y2="13" fill="none" />
    </svg>
  ),
];

const svcIconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const SVC_DESIGN_ICONS: ReactNode[] = [
  (<svg key="d1" {...svcIconProps}><circle cx="10.5" cy="10.5" r="6" /><line x1="10.5" y1="7" x2="10.5" y2="14" /><line x1="7" y1="10.5" x2="14" y2="10.5" /><line x1="19.5" y1="19.5" x2="15" y2="15" /></svg>),
  (<svg key="d2" {...svcIconProps}><path d="M3 21V11l5-3v3l5-3v3l5-3v13z" /><line x1="7" y1="16" x2="7" y2="18" /><line x1="12" y1="16" x2="12" y2="18" /><line x1="17" y1="16" x2="17" y2="18" /></svg>),
  (<svg key="d3" {...svcIconProps}><rect x="6" y="3" width="12" height="18" rx="0.5" /><line x1="9" y1="7" x2="10" y2="7" /><line x1="14" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="10" y2="11" /><line x1="14" y1="11" x2="15" y2="11" /><line x1="10.5" y1="21" x2="13.5" y2="21" /></svg>),
  (<svg key="d4" {...svcIconProps}><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="7" y1="7" x2="7" y2="17" /><line x1="12" y1="7" x2="12" y2="17" /><line x1="17" y1="7" x2="17" y2="17" /></svg>),
  (<svg key="d5" {...svcIconProps}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>),
  (<svg key="d6" {...svcIconProps}><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.9 2.9-2.5-2.5z" /></svg>),
];

const SVC_BUILD_ICONS: ReactNode[] = [
  (<svg key="b1" {...svcIconProps}><rect x="4" y="8" width="9" height="13" /><path d="M13 21V4l7 3.5V21" /><line x1="7" y1="12" x2="10" y2="12" /><line x1="7" y1="16" x2="10" y2="16" /></svg>),
  (<svg key="b2" {...svcIconProps}><rect x="5" y="3" width="14" height="18" rx="1" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="12" x2="8.5" y2="12" /><line x1="12" y1="12" x2="12.5" y2="12" /><line x1="16" y1="12" x2="16.5" y2="12" /><line x1="8" y1="16" x2="8.5" y2="16" /><line x1="12" y1="16" x2="12.5" y2="16" /><line x1="16" y1="16" x2="16.5" y2="16" /></svg>),
  (<svg key="b3" {...svcIconProps}><path d="M7 3h7l4 4v14H7z" /><polyline points="14 3 14 7 18 7" /><line x1="10" y1="12" x2="15" y2="12" /><line x1="10" y1="16" x2="15" y2="16" /></svg>),
  (<svg key="b4" {...svcIconProps}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1" /></svg>),
  (<svg key="b5" {...svcIconProps}><rect x="6" y="4" width="12" height="17" rx="1" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></svg>),
  (<svg key="b6" {...svcIconProps}><circle cx="12" cy="12" r="9" /><polyline points="8 12 11 15 16 9" /></svg>),
];

const CONTACT_ICONS: ReactNode[] = [
  (
    <svg key="phone" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  (
    <svg key="mail" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  (
    <svg key="pin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  (
    <svg key="clock" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
];

/* Group-member badges follow the brochure colour code: construction teal
   (West Capital Construction), design gold (Global Construction Project),
   supply & maintenance blue (West Altyn Kyran), logistics neutral. */
const LEGAL_BADGE_CLASSES = [
  styles.legalCardBadgeTeal,
  styles.legalCardBadgeGold,
  styles.legalCardBadgeBlue,
  styles.legalCardBadgeNeutral,
];

/* Map colours and legend labels follow the same code (the website map uses
   its own palette; the brochure stays consistent with its own pages). */
const KIND_COLOR: Record<WorkKind, string> = { build: '#1AC2A6', maintenance: '#4F84FF', design: '#E6BE57' };
const KIND_LABEL: Record<'ru' | 'en', Record<WorkKind, string>> = {
  ru: { build: 'Строительство', maintenance: 'Обслуживание', design: 'Проектирование' },
  en: { build: 'Construction', maintenance: 'Maintenance', design: 'Design' },
};

/* Featured testimonials (indices into content testimonials, same order in
   RU and EN): АМК — reconstruction of Rudnaya station, «Синтез Урал»
   (Russia), «Нефтестройсервис» — all three also appear as project cases —
   and «УКИЗ Актобе» for track maintenance. The rest are behind the QR. */
const FEATURED_TESTIMONIALS = [3, 8, 11, 0];
const TESTIMONIALS_URL = 'https://www.westarlangroup.kz/testimonials';

/* ─────────────────────────────────────────────────────────────────
   Page plan — the same 38 pages as the v1 brochure.
   ───────────────────────────────────────────────────────────────── */

const ABOUT_PAGE = 2;
const SCALE_PAGE = 3;
const LICENSES_START = 4;              // 3 pages
const ACCREDITATIONS_PAGE = 7;
const DIR_DESIGN_PAGE = 8;             // the two directions face each other
const DIR_BUILD_PAGE = 9;
const QR_PAGE = 10;
const PZTM_START = 11;                 // 2 pages
const CASE_START = 13;

/* Cases are numbered in reading order (ПЗТМ is 01) without the gaps the
   content indices carry; a client with several sheets keeps its
   sub-numbers (02.1–02.3). */
const CASE_INDEX: string[] = (() => {
  const nums = new Map<string, number>();
  return PROJECT_CASES.map((cs) => {
    const [main, sub] = cs.index.split('.');
    if (!nums.has(main)) nums.set(main, nums.size + 2);
    const n = String(nums.get(main)).padStart(2, '0');
    return sub ? `${n}.${sub}` : n;
  });
})();

const CASE_PAGES: number[] = (() => {
  let p = CASE_START;
  return PROJECT_CASES.map((cs) => { const page = p; p += cs.annex ? 2 : 1; return page; });
})();
const CASE_SHEET_PAGES = PROJECT_CASES.reduce((n, cs) => n + (cs.annex ? 2 : 1), 0);
const TESTIMONIALS_PAGE = CASE_START + CASE_SHEET_PAGES;
const PARTNERS_PAGE = TESTIMONIALS_PAGE + 1;
const CONTACTS_PAGE = TESTIMONIALS_PAGE + 2;
const CLOSING_PAGE = TESTIMONIALS_PAGE + 3;
const TOTAL = CLOSING_PAGE;

const pad = (n: number) => String(n).padStart(2, '0');
const pageNumLabel = (n: number) => `${pad(n)} / ${TOTAL}`;
const ISSUE_STAMP = 'WAG · PORTFOLIO · 2026';

// SVG presentation attributes don't take var(), so the map text repeats the
// --body / --heading stacks from print.module.css.
const SVG_FONT_BODY    = "'WagOnest', 'WagNoto', 'WagSymbols', sans-serif";
const SVG_FONT_HEADING = "'WagGrotesk', 'WagOnest', 'WagNoto', 'WagSymbols', sans-serif";

function CornerL({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const cls = pos === 'tl' ? styles.cornerTL : pos === 'tr' ? styles.cornerTR : pos === 'bl' ? styles.cornerBL : styles.cornerBR;
  return <span className={`${styles.cornerL} ${cls}`} aria-hidden />;
}

function PageChrome({ pageNum, dark = false }: { pageNum?: number; dark?: boolean }) {
  return (
    <>
      <CornerL pos="tl" />
      <CornerL pos="tr" />
      <CornerL pos="bl" />
      <CornerL pos="br" />
      {pageNum != null && (
        <>
          <div className={`${styles.pageNum} ${dark ? styles.pageNumDark : ''}`}>{pageNumLabel(pageNum)}</div>
          <div className={`${styles.pageStamp} ${dark ? styles.pageStampDark : ''}`}>{ISSUE_STAMP}</div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Brochure component
   ───────────────────────────────────────────────────────────────── */

export default async function BrochureV2({
  content: c,
  buttons,
  locale = 'ru',
}: {
  content: PrintContent;
  buttons: ReactNode;
  /* The EN case list is a structural twin of the RU one (same count, same
     annexes), so the module-level page plan computed from cases-ru holds. */
  locale?: 'ru' | 'en';
}) {
  const v: V2Copy = V2_COPY[locale];
  const CASES = locale === 'en' ? PROJECT_CASES_EN : PROJECT_CASES;

  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  // Фоллбэки сверены с прод-БД 26.07.2026 — см. ../PrintBrochure.tsx.
  const COUNT_SMR_BUILD = projects.length || 32;
  const COUNT_MAINTENANCE = maintenance.length || 20;
  const COUNT_PD = design.length || 100;
  const COUNT_REGISTRY = COUNT_SMR_BUILD + COUNT_MAINTENANCE + COUNT_PD;

  const geo = buildGeoIndex(projects, maintenance, design);
  const geoHubs = relaxHubs(geo.hubs);
  const geoRegionCount = new Map(geo.regions.map((r) => [r.code, r.total]));
  const geoRegionLabels = layoutRegionLabels(geo.regions, geoHubs);
  const geoHubLabels = layoutHubLabels(geoHubs, null, geoRegionLabels.map((l) => l.box));
  const COUNT_YEARS = new Date().getFullYear() - 2010;
  const COUNT_COUNTRIES = 2;

  const items = c.testimonials.items;
  const featured = FEATURED_TESTIMONIALS.map((i) => items[i]).filter(Boolean);

  const dbCounts = JSON.stringify({
    projects: COUNT_SMR_BUILD,
    maintenance_projects: COUNT_MAINTENANCE,
    design_projects: COUNT_PD,
  });

  return (
    <main className={styles.book} data-pages={TOTAL} data-db-counts={dbCounts}>
      {buttons}

      {/* ═══ COVER — one focus: mark, name, rule; credentials as a quiet line ═══ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <CornerL pos="tl" />
        <CornerL pos="tr" />
        <CornerL pos="bl" />
        <CornerL pos="br" />
        <div className={styles.coverTop}>
          <div className={styles.coverEyebrow}>{c.cover.eyebrow}</div>
          <div className={styles.coverIssue}>{c.cover.issue}</div>
        </div>
        <div className={styles.coverCenter}>
          <WagMark className={styles.coverMark} gradientId="wagCover" />
          <h1 className={styles.coverTitle}>
            WEST ARLAN<br />
            <span className={styles.coverTitleAccent}>GROUP</span>
          </h1>
          <div className={styles.coverTitleRule} />
        </div>
        <div className={styles.coverFoot}>
          <div className={styles.coverCreds}>
            {c.cover.badges.map((b) => (
              <div key={b.area} className={styles.coverCred}>
                <span className={styles.coverCredLevel}>{b.level}</span>
                <span className={styles.coverCredArea}>{b.area}</span>
              </div>
            ))}
          </div>
          <div className={styles.coverSite}>www.westarlangroup.kz</div>
        </div>
      </section>

      {/* ═══ ABOUT ════════════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={ABOUT_PAGE} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.about.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.about.title}</h2>
            {/* Credentials moved here from the cover (the cover keeps one line). */}
            <div className={styles.credGrid}>
              {c.cover.badges.map((b) => (
                <div key={b.area} className={styles.cred}>
                  <div className={styles.credLevel}>{b.level}</div>
                  <div className={styles.credArea}>{b.area}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.leadBox}>{c.about.lead}</div>

          <div className={styles.industrySection}>
            <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{c.about.industriesLabel}</div>
            <div className={styles.industryCards}>
              {c.about.industryChips.map((label, i) => (
                <div key={i} className={styles.industryCard}>
                  <div className={styles.industryCardIcon}>{INDUSTRY_ICONS[i]}</div>
                  <div className={styles.industryCardLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.aboutTwoCol}>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{c.about.missionLabel}</div>
              <p>{c.about.mission}</p>
            </div>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{c.about.approachLabel}</div>
              <p>{c.about.approach}</p>
            </div>
          </div>

          <div className={styles.legalBlockLabel}><span />{c.about.legalLabel}</div>
          <div className={`${styles.legalCard} ${styles.legalCardDark} ${styles.legalHqCard}`}>
            <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeGold}`}>HQ</span>
            <div className={styles.legalCardName}>West Arlan Group</div>
            <div className={styles.legalCardRole}>{c.about.hqRole}</div>
            <div className={styles.legalCardMeta}>{c.about.hqMeta}</div>
          </div>
          <div className={styles.legalCards}>
            {c.about.legalCards.map((card, i) => (
              <div key={card.badge} className={styles.legalCard}>
                <span className={`${styles.legalCardBadge} ${LEGAL_BADGE_CLASSES[i]}`}>{card.badge}</span>
                <div className={styles.legalCardName}>{card.name}</div>
                <div className={styles.legalCardRole}>{card.role}</div>
              </div>
            ))}
          </div>

          <div className={styles.legalNote}>{c.about.legalNote}</div>
        </div>
      </section>

      {/* ═══ SCALE + GEOGRAPHY — the map is the page ═══════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={SCALE_PAGE} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.scale.eyebrow}</div>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.scale.title}</h2>
          <div className={`${styles.leadBox} ${styles.leadBoxDark} ${styles.leadBoxScale}`}>{c.scale.lead}</div>

          <div className={`${styles.statBar} ${styles.statBar5}`}>
            <div className={`${styles.statBarItem} ${styles.statBarTeal}`}>
              <div className={styles.statBarNum}>{COUNT_SMR_BUILD}</div>
              <div className={styles.statBarLabel}>{c.scale.statBuildLabel}</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarBlue}`}>
              <div className={styles.statBarNum}>{COUNT_MAINTENANCE}</div>
              <div className={styles.statBarLabel}>{c.scale.statMaintenanceLabel}</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarGold}`}>
              <div className={styles.statBarNum}>{COUNT_PD}</div>
              <div className={styles.statBarLabel}>{c.scale.statPdLabel}</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_YEARS}</div>
              <div className={styles.statBarLabel}>{c.scale.statRegionsLabel}</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_COUNTRIES}</div>
              <div className={styles.statBarLabel}>{c.scale.statCountriesLabel}</div>
            </div>
          </div>

          <div className={styles.mapFrame}>
            <svg
              viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
              className={styles.mapSvg}
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              {KZ_REGIONS.map((r) => {
                const n = geoRegionCount.get(r.code) ?? 0;
                const tier = tierFor(n, geo.works.length);
                return (
                  <path key={r.code} d={r.d} fillRule="evenodd"
                    fill={tier.fill} stroke={tier.stroke} strokeWidth="1" strokeLinejoin="round" />
                );
              })}
              <path d={KZ_OUTLINE} fillRule="evenodd" fill="none"
                stroke="rgba(212,168,67,0.55)" strokeWidth="1.6" strokeLinejoin="round" />

              {geoHubs.map((h) => {
                const r = hubRadius(h.total);
                const ring = r - 2.6;
                const circ = 2 * Math.PI * ring;
                const present = KIND_ORDER.filter((k) => h.byKind[k] > 0);
                const gap = present.length > 1 ? Math.min(6, circ * 0.03) : 0;
                let acc = 0;
                const segs = present.map((k) => {
                  const len = (circ * h.byKind[k]) / h.total;
                  const seg = { k, len: Math.max(len - gap, 0.6), off: -acc };
                  acc += len;
                  return seg;
                });
                return (
                  <g key={h.id} transform={`translate(${h.px} ${h.py})`}>
                    <circle r={r + 3} fill="rgba(4,6,12,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle r={ring - 2} fill="rgba(4,6,12,0.94)" />
                    <g transform="rotate(-90)">
                      {segs.map((s) => (
                        <circle key={s.k} r={ring} fill="none" stroke={KIND_COLOR[s.k]}
                          strokeWidth="4" strokeDasharray={`${s.len} ${circ - s.len}`} strokeDashoffset={s.off} />
                      ))}
                    </g>
                    <text y="3.6" textAnchor="middle" fill="#F0F2F8"
                      fontFamily={SVG_FONT_HEADING} fontSize="11" fontWeight="600">
                      {h.total}
                    </text>
                  </g>
                );
              })}

              {/* The dark halo keeps labels legible where region borders cross
                  them. Chromium writes outlined text as Type3 — build-pdf.mjs
                  allows Type3 only for SVG text drawn with a stroke. */}
              {geoRegionLabels.map((l) => (
                <text key={l.code} x={l.x} y={l.y} textAnchor="middle"
                  fill={l.has ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)'}
                  fontFamily={SVG_FONT_BODY} fontSize="8.5" letterSpacing="1.2"
                  paintOrder="stroke" stroke="rgba(4,6,12,0.55)" strokeWidth="2.5" strokeLinejoin="round">
                  {l.text}
                </text>
              ))}
              {geoHubLabels.map((l) => (
                <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor}
                  fill={l.strong ? '#F0F2F8' : 'rgba(240,242,248,0.7)'}
                  fontFamily={SVG_FONT_BODY} fontSize={l.strong ? 10.5 : 9.5}
                  paintOrder="stroke" stroke="rgba(4,6,12,0.85)" strokeWidth="3" strokeLinejoin="round">
                  {l.text}
                </text>
              ))}
            </svg>
            <div className={styles.mapLegend}>
              {KIND_ORDER.map((k) => (
                <span key={k} className={styles.mapLegendItem}>
                  <i style={{ background: KIND_COLOR[k] }} />
                  {KIND_LABEL[locale][k]} · {geo.totals[k]}
                </span>
              ))}
            </div>
          </div>

          <h3 className={styles.peopleTitle}>{c.scale.peopleTitle}</h3>
          <div className={styles.peopleGrid}>
            {c.scale.people.map((p) => (
              <div key={p.label} className={styles.peopleCard}>
                <div className={styles.peopleNum}>{p.num}</div>
                <div className={styles.peopleLabel}>{p.label}</div>
                <div className={styles.peopleDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LicensePage pageNum={LICENSES_START} numberPrefix={c.licNumberPrefix} {...c.licenses[0]} />
      <LicensePage pageNum={LICENSES_START + 1} numberPrefix={c.licNumberPrefix} {...c.licenses[1]} />
      <LicensePage pageNum={LICENSES_START + 2} numberPrefix={c.licNumberPrefix} {...c.licenses[2]} />
      <AccreditationsPage pageNum={ACCREDITATIONS_PAGE} content={c.accreditations} />

      {/* ═══ DIRECTIONS — a facing pair: design (gold) | construction (teal) ═══ */}
      <DirectionPage pageNum={DIR_DESIGN_PAGE} d={c.dirDesign} accent="gold" count={COUNT_PD}
        icons={SVC_DESIGN_ICONS} entity="Global Construction Project" path="/design" />
      <DirectionPage pageNum={DIR_BUILD_PAGE} d={c.dirBuild} accent="teal" count={COUNT_SMR_BUILD}
        icons={SVC_BUILD_ICONS} entity="West Capital Construction LLP" path="/projects" />

      {/* ═══ PORTFOLIO QR — registry ══════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={QR_PAGE} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.qr.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.qr.title}</h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>{COUNT_REGISTRY}</div>
              <div className={styles.bigBadgeLabel}>{c.qr.badgeLabel}</div>
            </div>
          </div>

          <div className={styles.leadBox}>{c.qr.lead}</div>

          <div className={styles.qrGrid}>
            {[
              { cls: styles.qrCardTeal, n: '01', count: COUNT_SMR_BUILD, qr: '/portfolio/qr-projects.png', path: '/projects' },
              { cls: styles.qrCardBlue, n: '02', count: COUNT_MAINTENANCE, qr: '/portfolio/qr-maintenance.png', path: '/maintenance' },
              { cls: styles.qrCardGold, n: '03', count: COUNT_PD, qr: '/portfolio/qr-design.png', path: '/design' },
            ].map((q, i) => (
              <a key={q.n} href={`https://www.westarlangroup.kz${q.path}`} className={`${styles.qrCard} ${q.cls}`}>
                <div className={styles.qrCardHeader}>
                  <span className={styles.qrCardNum}>{q.n}</span>
                  <span className={styles.qrCardTitle}>{c.qr.cards[i].title}</span>
                </div>
                <div className={styles.qrCount}>
                  <span className={styles.qrCountNum}>{q.count}</span>
                  <span className={styles.qrCountLabel}>{c.qr.cards[i].countLabel}</span>
                </div>
                <img src={q.qr} alt="" className={styles.qrCodeWrap} aria-hidden />
                <div className={styles.qrUrl}>www.westarlangroup.kz<wbr />{q.path}</div>
                <div className={styles.qrHint}>{c.qr.cards[i].hint}</div>
              </a>
            ))}
          </div>

          <div className={`${styles.processLabel} ${styles.processLabelLight}`}><span />{c.qr.infoLabel}</div>
          <div className={styles.qrInfoRow}>
            {c.qr.infoChips.map((chip) => (
              <div key={chip.title} className={styles.qrInfoChip}>
                <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} />{chip.title}</div>
                <div className={styles.qrInfoChipDesc}>{chip.desc}</div>
              </div>
            ))}
          </div>

          {c.qr.remark && (
            <div className={styles.qrRemarkBand}>
              <svg className={styles.qrRemarkArrow} viewBox="0 0 24 24" aria-hidden><path d="M12 3v17M6 14l6 6 6-6" /></svg>
              <span className={styles.qrRemarkText}>{c.qr.remark}</span>
              {c.qr.remarkTag && <span className={styles.qrRemarkTag}>{c.qr.remarkTag}</span>}
            </div>
          )}
        </div>
      </section>

      <PztmShowcase pageStart={PZTM_START} total={TOTAL} stamp={ISSUE_STAMP} locale={locale} />

      {/* A case and its annex share one tone; the tone alternates per case. */}
      {CASES.map((cs, i) => {
        const dark = i % 2 === 0;
        return (
          <Fragment key={cs.index}>
            <CaseSheet p={cs} index={CASE_INDEX[i]} pageNum={CASE_PAGES[i]} total={TOTAL} stamp={ISSUE_STAMP}
              dark={dark} labels={v.caseStamp} />
            {cs.annex && (
              <CaseAnnexPage annex={cs.annex} index={CASE_INDEX[i]} pageNum={CASE_PAGES[i] + 1} total={TOTAL}
                stamp={ISSUE_STAMP} dark={dark} />
            )}
          </Fragment>
        );
      })}

      {/* ═══ TESTIMONIALS — three letters in full, the rest on the site ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={TESTIMONIALS_PAGE} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.testimonials.eyebrow}</div>
          <h2 className={styles.titleH1}>{c.testimonials.title}</h2>
          <div className={styles.leadBox}>{c.testimonials.lead}</div>

          <div className={styles.featList}>
            {featured.map((tm) => (
              <FeaturedLetter key={`${tm.client}-${tm.date}`} t={tm} quoteOpen={c.testimonials.quoteOpen} quoteClose={c.testimonials.quoteClose} />
            ))}
          </div>

          {/* QR card to /testimonials — the whole card is also a link in the PDF. */}
          <a href={TESTIMONIALS_URL} className={styles.testiSite}>
            <BrandQr url={TESTIMONIALS_URL} gradientId="testimonialsQr" className={styles.testiSiteQr} />
            <span className={styles.testiSiteText}>
              <span className={styles.testiSiteKicker}>{v.testimonials.siteKicker}</span>
              <span className={styles.testiSiteTitle}>{v.testimonials.siteTitle}</span>
              <span className={styles.testiSiteUrl}>{TESTIMONIALS_URL.replace('https://', '')}</span>
            </span>
          </a>
        </div>
      </section>

      {/* ═══ PARTNERS — dark, logos in one light tone ═════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={PARTNERS_PAGE} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.partners.eyebrow}</div>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.partners.title}</h2>
          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>{c.partners.lead}</div>

          <div className={styles.partnersGrid}>
            {c.partners.items.map((pa) => (
              <div key={pa.file} className={styles.partnerCard}>
                <div className={styles.partnerLogoWrap}>
                  <img src={`/portfolio/print/v2/img?src=${encodeURIComponent(`/partners/${pa.file}`)}&tone=mono-light`} alt={pa.name} className={styles.partnerLogo} />
                </div>
                <div className={styles.partnerName}>{pa.name}</div>
              </div>
            ))}
          </div>

          <div className={styles.partnerFooter}>
            <div className={styles.partnerFooterLeft}>
              <span className={styles.partnerFooterNum}>5+</span>
              <span className={styles.partnerFooterText}>
                <span className={styles.aboutColRule} />{c.partners.repeatLabel}
              </span>
            </div>
            <div className={styles.partnerFooterRight}>
              <span className={styles.aboutColRule} />{c.partners.registryLabel}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACTS ═════════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={CONTACTS_PAGE} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.contacts.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.contacts.title}</h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeGold}`}>
              <div className={styles.outlinedBadgeTopSmall}>{c.contacts.badgeTopSmall}</div>
              <div className={styles.outlinedBadgeNumBig}>{c.contacts.badgeNumBig}</div>
              <div className={styles.outlinedBadgeBottom}>{c.contacts.badgeBottom}</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>{c.contacts.lead}</div>

          <div className={styles.contactRowGrid}>
            {c.contacts.rows.map((row, i) => (
              <div key={row.label} className={styles.contactRow}>
                <div className={styles.contactRowIcon}>{CONTACT_ICONS[i]}</div>
                <div className={styles.contactRowBody}>
                  <div className={styles.contactRowLabel}>{row.label}</div>
                  <div className={styles.contactRowValue}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            {c.contacts.teamLabel}
          </div>

          <div className={styles.teamGrid}>
            {c.contacts.team.map((tm) => (
              <div key={tm.num} className={styles.teamCard}>
                <div className={styles.teamNum}>{tm.num}</div>
                <div className={styles.teamRole}>{tm.role}</div>
                <div className={styles.teamName}>{tm.name}</div>
                {tm.phone ? <div className={styles.teamPhone}>{tm.phone}</div> : null}
              </div>
            ))}
          </div>

          <div className={styles.contactsFooter}>
            <div className={styles.contactsFooterCol}>
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />{c.contacts.legalLabel}
              </div>
              <div className={styles.contactsFooterValue}>{c.contacts.legalValue}</div>
            </div>
            <div className={styles.contactsFooterCol}>
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />{c.contacts.licensesLabel}
              </div>
              <div className={styles.contactsFooterValue}>{c.contacts.licensesValue}</div>
            </div>
          </div>

          <div className={styles.contactsBottomBar}>
            <div className={styles.contactsBottomLeft}>
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />{c.contacts.siteLabel}
              </div>
              <a href="https://www.westarlangroup.kz" className={styles.contactsSite}>www.westarlangroup.kz</a>
            </div>
            {/* Branded QR to the site — the WAG triangle sits in its centre. */}
            <BrandQr url="https://www.westarlangroup.kz" gradientId="contactsQr" className={styles.contactsQr} />
          </div>
        </div>
      </section>

      {/* ═══ CLOSING MANIFESTO — back cover ═══════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.closing}`}>
        <PageChrome pageNum={CLOSING_PAGE} dark />
        <div className={styles.closingInner}>
          <div className={styles.closingEyebrow}>{c.closing.eyebrow}</div>
          <h2 className={styles.closingQuote}>{c.closing.quote}</h2>
          <p className={styles.closingByline}>{c.closing.byline}</p>
          <div className={styles.closingFooter}>
            <div className={styles.closingFooterValue}>{ISSUE_STAMP}</div>
            <WagMark className={styles.closingMark} gradientId="wagClosing" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

/* Direction page: the registry count is the headline proof, the six
   services each lead with their icon, and the four stages run along one
   line. Design and construction mirror each other across
   the spread, each in its own accent. */
function DirectionPage({
  pageNum,
  d,
  accent,
  count,
  icons,
  entity,
  path,
}: {
  pageNum: number;
  d: PrintContent['dirDesign'];
  accent: 'gold' | 'teal';
  count: number;
  icons: ReactNode[];
  entity: string;
  path: string;
}) {
  return (
    <section className={`${styles.page} ${styles.pageDark} ${accent === 'teal' ? styles.dirTeal : styles.dirGold}`}>
      <PageChrome pageNum={pageNum} dark />
      <div className={styles.pageInner}>
        <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{d.eyebrow}</div>
        <div className={styles.dirHead}>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{d.title}</h2>
          <div className={styles.dirKpi}>
            <div className={styles.dirKpiNum}>{count}</div>
            <div className={styles.dirKpiLabel}>{d.footerLabel}</div>
          </div>
        </div>

        <p className={styles.dirLead}>{d.lead}</p>

        <div className={styles.dirSvcs}>
          {d.svcs.map((sv, i) => (
            <div key={sv.num} className={styles.dirSvc}>
              <div className={styles.dirSvcIcon}>{icons[i]}</div>
              <div className={styles.dirSvcTitle}>{sv.title}</div>
              <div className={styles.dirSvcDesc}>{sv.desc}</div>
            </div>
          ))}
        </div>

        <div className={styles.dirStepsLabel}>{d.processLabel}</div>
        <ol className={styles.dirTimeline}>
          {d.process.map((step) => (
            <li key={step.roman} className={styles.dirStep}>
              <span className={styles.dirStepNode}>{step.roman}</span>
              <span className={styles.dirStepTitle}>{step.title}</span>
              <span className={styles.dirStepMeta}>{step.meta}</span>
            </li>
          ))}
        </ol>

        <div className={styles.dirSign}>
          <span>{entity}</span>
          <span className={styles.dirSignSep}>·</span>
          <a href={`https://www.westarlangroup.kz${path}`}>www.westarlangroup.kz{path}</a>
        </div>
      </div>
    </section>
  );
}

function LicensePage({
  pageNum,
  eyebrow,
  numberPrefix,
  number,
  date,
  titleMain,
  titleAccent,
  badgeNum,
  badgeLabel,
  scan,
  meta,
}: {
  pageNum: number;
  eyebrow: string;
  numberPrefix: string;
  number: string;
  date: string;
  titleMain: string;
  titleAccent: string;
  badgeNum: string;
  badgeLabel: ReactNode;
  scan: string;
  meta: { label: string; value: string }[];
}) {
  return (
    <section className={`${styles.page} ${styles.pageLight}`}>
      <PageChrome pageNum={pageNum} />
      <div className={styles.pageInner}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.licNumber}>{numberPrefix}{number}{' · '}{date}</div>
        <div className={styles.titleRow}>
          <h2 className={styles.licTitle}>
            <span className={styles.titleAccent}>{titleAccent}</span><br />
            {titleMain}
          </h2>
          <div className={styles.bigBadge}>
            <div className={styles.bigBadgeNum}>{badgeNum}</div>
            <div className={styles.bigBadgeLabel}>{badgeLabel}</div>
          </div>
        </div>

        <div className={styles.licScanFrame}>
          <img src={scan} alt={`${titleMain} ${titleAccent}`} className={styles.licScanImg} />
        </div>

        <div className={styles.licMetaGrid}>
          {meta.map((m) => (
            <div key={m.label} className={styles.licMetaItem}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{m.label}</div>
              <div className={styles.licMetaValue}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccreditationsPage({
  pageNum,
  content: a,
}: {
  pageNum: number;
  content: PrintContent['accreditations'];
}) {
  return (
    <section className={`${styles.page} ${styles.pageLight}`}>
      <PageChrome pageNum={pageNum} />
      <div className={styles.pageInner}>
        <div className={styles.eyebrow}>{a.eyebrow}</div>
        <div className={styles.titleRow}>
          <h2 className={styles.titleH1}>{a.title}</h2>
          <div className={styles.bigBadge}>
            <div className={styles.bigBadgeNum}>04</div>
            <div className={styles.bigBadgeLabel}>{a.badgeLabel}</div>
          </div>
        </div>

        <div className={styles.leadBox}>{a.lead}</div>

        <div className={styles.accrGrid}>
          {a.cards.map((card) => (
            <div key={card.number} className={styles.accrCard}>
              <img src={card.scan} alt={card.number} className={styles.accrImg} />
              <div className={styles.accrMeta}>
                <div className={styles.accrNumber}>{card.number}</div>
                <div className={styles.accrScope}>{card.scope}</div>
                <div className={styles.accrTags}>
                  <span className={styles.accrTag}>{card.level}</span>
                  <span className={`${styles.accrTag} ${styles.accrTagHolder}`}>{card.holder}</span>
                </div>
                <div className={styles.accrValid}>
                  <span className={styles.aboutColRule} />{card.validUntil}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Wrap occurrences of the group name in <em> so they read as a distinct
   reference, not just italicised body text. */
function renderQuoteWithLegacyName(text: string) {
  const NAME = 'West Arlan Group';
  const parts = text.split(NAME);
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<em key={`n-${i}`}>{NAME}</em>, part],
  );
}

function FeaturedLetter({ t, quoteOpen, quoteClose }: { t: PrintTestimonial; quoteOpen: string; quoteClose: string }) {
  return (
    <figure className={styles.featCard}>
      <blockquote className={styles.featQuote}>{quoteOpen}{renderQuoteWithLegacyName(t.quote)}{quoteClose}</blockquote>
      <figcaption className={styles.featCaption}>
        <span className={styles.featClient}>{t.client}</span>
        <span className={styles.featSig}>{t.signatory} · {t.role}{t.date ? ` · ${t.date}` : ''}</span>
      </figcaption>
    </figure>
  );
}
