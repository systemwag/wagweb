import { Fragment, type ReactNode } from 'react';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import styles from './print.module.css';
import type { PrintContent, PrintTestimonial } from './content/types';

/* ─────────────────────────────────────────────────────────────────
   Shared print-brochure layout. All locale-specific copy comes in
   via the `content` prop (content/ru.tsx, content/en.tsx); everything
   here — structure, classNames, icons, images, live counts — is
   locale-invariant. Rendered by Puppeteer (scripts/build-pdf.mjs)
   into public/portfolio.pdf and public/portfolio/portfolio-en.pdf,
   so any change here must be re-baked into both PDFs.
   ───────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────
   WAG triangle mark — official logo from assets/logotriangle.svg
   ───────────────────────────────────────────────────────────────── */
const WAG_TRIANGLE = 'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

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

/* The KZ map is no longer inlined as SVG path data — it's pre-baked to
   public/portfolio/kz-map.png by scripts/bake-kz-map.mjs. Saves ~50 KB
   from the rendered PDF and avoids Chromium re-parsing the path on every
   build. */

/* ─────────────────────────────────────────────────────────────────
   Locale-invariant assets — icons & scan images, zipped by index
   with the matching label arrays from the content object.
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

const PARTNER_CATEGORY_ICONS: ReactNode[] = [
  (
    <svg key="building" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M2 10l10-7 10 7" />
      <path d="M3 10h18" />
      <path d="M5 21V10" />
      <path d="M9 21V10" />
      <path d="M12 21V10" />
      <path d="M15 21V10" />
      <path d="M19 21V10" />
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
    <svg key="factory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V11l5-3v3l5-3v3l5-3v13z" />
      <line x1="7" y1="16" x2="7" y2="18" />
      <line x1="12" y1="16" x2="12" y2="18" />
      <line x1="17" y1="16" x2="17" y2="18" />
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

const ISO_SCANS = [
  { src: '/licenses/sertifikat-iso-9001-ru.webp', alt: 'ISO 9001' },
  { src: '/licenses/sertifikat-iso-9001-kz.webp', alt: 'ISO 9001 KZ' },
  { src: '/licenses/sertifikat-ekologicheskiy-menedzhment.webp', alt: 'ISO 14001' },
  { src: '/licenses/sertifikat-iso-9001-2016.webp', alt: 'ISO 9001:2016' },
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

/* Badge color classes for the four group-member legal cards, in order. */
const LEGAL_BADGE_CLASSES = [
  styles.legalCardBadgeTeal,
  styles.legalCardBadgeBlue,
  styles.legalCardBadgeAmber,
  styles.legalCardBadgeViolet,
];

/* ─────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────── */

const TOTAL = 15;   // pages 3+4 merged; testimonials condensed to a single page
const pageNumLabel = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;
const ISSUE_STAMP  = 'WAG · PORTFOLIO · 2026';

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

export default async function PrintBrochure({ content: c, buttons }: { content: PrintContent; buttons: ReactNode }) {
  // Live counts pulled from the same data layer the website uses:
  //   projects            → СМР, строительство (/projects)
  //   maintenance_projects → обслуживание и ремонт (/maintenance)
  //   design_projects      → проектные работы / ПД (/design)
  // Fallbacks keep the layout sane if a fetch returns empty (seed-less env).
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  const COUNT_SMR_BUILD = projects.length || 29;       // new construction объекты
  const COUNT_MAINTENANCE = maintenance.length || 20;  // maintenance / обслуживание объекты
  const COUNT_SMR = COUNT_SMR_BUILD + COUNT_MAINTENANCE; // total СМР, used elsewhere
  const COUNT_PD = design.length || 87;
  const COUNT_REGISTRY = COUNT_SMR + COUNT_PD;
  // Geography metrics are not derivable from project rows — kept as copy.
  const COUNT_REGIONS = 16;
  const COUNT_COUNTRIES = 2;

  // QR codes are pre-baked by scripts/bake-qr-codes.mjs to PNGs under
  // /public/portfolio/. Saves render time and keeps the build deterministic.
  // Both the printed labels below and the QR PNGs use www.westarlangroup.kz —
  // re-bake in bake-qr-codes.mjs if the destination changes.

  // One testimonial per client company — keep the first letter from each,
  // drop the rest (e.g. the 3 АМК quotes collapse to 1, the 2 Зерде to 1).
  // The full archive lives on the website.
  const seenClients = new Set<string>();
  const filteredTestimonials = c.testimonials.items.filter((t) => {
    if (seenClients.has(t.client)) return false;
    seenClients.add(t.client);
    return true;
  });

  return (
    <main className={styles.book}>
      {buttons}

      {/* ═══ 01 · COVER ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <CornerL pos="tl" />
        <CornerL pos="tr" />
        <CornerL pos="bl" />
        <CornerL pos="br" />
        <div className={styles.coverEyebrow}>{c.cover.eyebrow}</div>
        <div className={styles.coverIssue}>{c.cover.issue}</div>
        <div className={styles.coverMarkWrap}>
          <WagMark className={styles.coverMark} gradientId="wagCover" />
        </div>
        <h1 className={styles.coverTitle}>
          WEST ARLAN<br />
          <span className={styles.coverTitleAccent}>GROUP</span>
        </h1>
        <div className={styles.coverTitleRule} />
        <div className={styles.coverChips}>
          {c.cover.badges.map((b) => (
            <div key={b.area} className={styles.coverBadge}>
              <div className={styles.coverBadgeLevel}>{b.level}</div>
              <div className={styles.coverBadgeArea}>{b.area}</div>
            </div>
          ))}
        </div>
        <div className={styles.coverTagline}>
          {c.cover.tagline.map((t, i) => (
            <Fragment key={t.main}>
              {i > 0 && <span className={styles.coverTaglineSep}>·</span>}
              <div className={styles.coverTaglineItem}>
                <span className={styles.coverTaglineRu}>{t.main}</span>
                {t.sub != null && <span className={styles.coverTaglineEn}>{t.sub}</span>}
              </div>
            </Fragment>
          ))}
        </div>
        <div className={styles.coverBottom}>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomLabel}>{c.cover.binLabel}</div>
            <div className={styles.coverBottomValue}>100340009758</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className={styles.coverBottomValue}>+7 7132 538-288</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className={styles.coverBottomValue}>www.westarlangroup.kz</div>
          </div>
        </div>
      </section>

      {/* ═══ 02 · ABOUT ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={2} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.about.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.about.title}</h2>
            <div className={styles.inlineStats}>
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_SMR}</span><span className={styles.inlineStatLabel}>{c.about.statSmrLabel}</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_PD}</span><span className={styles.inlineStatLabel}>{c.about.statPdLabel}</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>5</span><span className={styles.inlineStatLabel}>{c.about.statSectorsLabel}</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_REGIONS}</span><span className={styles.inlineStatLabel}>{c.about.statRegionsLabel}</span></div>
            </div>
          </div>

          <div className={styles.leadBox}>{c.about.lead}</div>

          <div className={styles.industrySection}>
            <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{c.about.industriesLabel}</div>
            <div className={styles.industryCards}>
              {c.about.industryChips.map((label, i) => (
                <div key={label} className={styles.industryCard}>
                  <div className={styles.industryCardIcon}>{INDUSTRY_ICONS[i]}</div>
                  <div className={styles.industryCardLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dashedDivider} />

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

          <WagMark className={styles.aboutWatermark} gradientId="wagAbout" />
        </div>
      </section>

      {/* ═══ 03 · SCALE + GEOGRAPHY (merged from old 03 + 04) ════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={3} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.scale.eyebrow}</div>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.scale.title}</h2>

          <div className={`${styles.leadBox} ${styles.leadBoxDark} ${styles.leadBoxScale}`}>{c.scale.lead}</div>

          {/* Top row — group metrics, pulled live from the data layer.
              СМР is shown split into new construction vs. maintenance. */}
          <div className={`${styles.statBar} ${styles.statBar5}`}>
            <div className={`${styles.statBarItem} ${styles.statBarGold}`}>
              <div className={styles.statBarNum}>{COUNT_SMR_BUILD}</div>
              <div className={styles.statBarLabel}>{c.scale.statBuildLabel}</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarTeal}`}>
              <div className={styles.statBarNum}>{COUNT_MAINTENANCE}</div>
              <div className={styles.statBarLabel}>{c.scale.statMaintenanceLabel}</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarBlue}`}>
              <div className={styles.statBarNum}>{COUNT_PD}</div>
              <div className={styles.statBarLabel}>{c.scale.statPdLabel}</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_REGIONS}</div>
              <div className={styles.statBarLabel}>{c.scale.statRegionsLabel}</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_COUNTRIES}</div>
              <div className={styles.statBarLabel}>{c.scale.statCountriesLabel}</div>
            </div>
          </div>

          {/* Map visualises the geography. */}
          <div className={styles.mapFrame}>
            <span className={styles.mapCornerCoord} style={{ top: '4mm', left: '4mm' }}>N 55° · E 045°</span>
            <span className={styles.mapCornerCoord} style={{ bottom: '4mm', right: '4mm' }}>N 040° · E 087°</span>
            {/* Pre-baked KZ map background — produced by scripts/bake-kz-map.mjs. */}
            <img src="/portfolio/kz-map.png" alt="" className={styles.mapImg} aria-hidden />
            <svg viewBox="-100 30 1200 820" className={styles.mapSvg} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              {projects.filter((pr) => pr.x_map != null && pr.y_map != null).slice(0, 40).map((pr) => {
                const color = pr.status === 'completed' ? '#D4A843' : pr.status === 'in-progress' ? '#00C4A7' : '#4F84FF';
                return (
                  <g key={pr.id}>
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="12" fill={color} opacity="0.20" />
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="4.5" fill={color} />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* People behind the work — team composition. */}
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

      {/* ═══ 04 · ISO CERTIFICATES ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={4} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.iso.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.iso.title}</h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>04</div>
              <div className={styles.bigBadgeLabel}>{c.iso.badgeLabel}</div>
            </div>
          </div>

          <div className={styles.leadBox}>{c.iso.lead}</div>

          <div className={styles.isoGrid}>
            {ISO_SCANS.map((scan, i) => (
              <div key={scan.src} className={styles.isoCard}>
                <img src={scan.src} alt={scan.alt} className={styles.isoImg} />
                <div className={styles.isoMeta}>
                  <div className={styles.isoName}>{c.iso.cards[i].name}</div>
                  <div className={styles.isoDetail}>{c.iso.cards[i].detail}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ 05 · LICENSE СМР ═════════════════════════════════════ */}
      <LicensePage pageNum={5} numberPrefix={c.licNumberPrefix} {...c.licenses[0]} />

      {/* ═══ 06 · LICENSE ПД ══════════════════════════════════════ */}
      <LicensePage pageNum={6} numberPrefix={c.licNumberPrefix} {...c.licenses[1]} />

      {/* ═══ 07 · LICENSE ОС ══════════════════════════════════════ */}
      <LicensePage pageNum={7} numberPrefix={c.licNumberPrefix} {...c.licenses[2]} />

      {/* ═══ 08 · ACCREDITATIONS (2×2 grid, 2026 certificates) ════ */}
      <AccreditationsPage pageNum={8} content={c.accreditations} />

      {/* ═══ 09 · DIRECTION 01 — DESIGN ═══════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={9} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.dirDesign.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.dirDesign.title}</h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeGold}`}>
              <div className={styles.outlinedBadgeTop}>{c.dirDesign.badgeTop}</div>
              <div className={styles.outlinedBadgeBottom}>{c.dirDesign.badgeBottom}</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>{c.dirDesign.lead}</div>

          <div className={styles.svcGrid}>
            {c.dirDesign.svcs.map((s, i) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcIcon} ${styles.svcIconGold}`}>{SVC_DESIGN_ICONS[i]}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            {c.dirDesign.processLabel}
          </div>
          <div className={styles.processFlow}>
            {c.dirDesign.process.map((step, i) => (
              <div key={step.roman} className={styles.processGroup}>
                <div className={`${styles.processStep} ${styles.processStepGold}`}>
                  <div className={styles.processRoman}>{step.roman}</div>
                  <div className={styles.processTitle}>{step.title}</div>
                  <div className={styles.processMeta}>{step.meta}</div>
                </div>
                {i < c.dirDesign.process.length - 1 && <div className={styles.processArrow}>→</div>}
              </div>
            ))}
          </div>

          <div className={styles.dirFooter}>
            <span className={styles.dirFooterNum}>{COUNT_PD}</span>
            <span className={styles.dirFooterLabel}>{c.dirDesign.footerLabel}</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>GLOBAL CONSTRUCTION PROJECT</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>www.westarlangroup.kz / design</span>
          </div>
        </div>
      </section>

      {/* ═══ 10 · DIRECTION 02 — BUILD ════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={10} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.dirBuild.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.dirBuild.title}</h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeTeal}`}>
              <div className={styles.outlinedBadgeTop}>{c.dirBuild.badgeTop}</div>
              <div className={styles.outlinedBadgeBottom}>{c.dirBuild.badgeBottom}</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>{c.dirBuild.lead}</div>

          <div className={styles.svcGrid}>
            {c.dirBuild.svcs.map((s, i) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcIcon} ${styles.svcIconTeal}`}>{SVC_BUILD_ICONS[i]}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            {c.dirBuild.processLabel}
          </div>
          <div className={styles.processFlow}>
            {c.dirBuild.process.map((step, i) => (
              <div key={step.roman} className={styles.processGroup}>
                <div className={`${styles.processStep} ${styles.processStepTeal}`}>
                  <div className={styles.processRoman}>{step.roman}</div>
                  <div className={styles.processTitle}>{step.title}</div>
                  <div className={styles.processMeta}>{step.meta}</div>
                </div>
                {i < c.dirBuild.process.length - 1 && <div className={styles.processArrow}>→</div>}
              </div>
            ))}
          </div>

          <div className={styles.dirFooter}>
            <span className={`${styles.dirFooterNum} ${styles.dirFooterNumTeal}`}>{COUNT_SMR_BUILD}</span>
            <span className={styles.dirFooterLabel}>{c.dirBuild.footerLabel}</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>WEST CAPITAL CONSTRUCTION LLP</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>www.westarlangroup.kz / projects</span>
          </div>
        </div>
      </section>

      {/* ═══ 11 · PORTFOLIO QR ════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={11} />
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
            <div className={`${styles.qrCard} ${styles.qrCardTeal}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>01</span>
                <span className={styles.qrCardTitle}>{c.qr.cards[0].title}</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_SMR_BUILD}</span>
                <span className={styles.qrCountLabel}>{c.qr.cards[0].countLabel}</span>
              </div>
              <img src="/portfolio/qr-projects.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>www.westarlangroup.kz/projects</div>
              <div className={styles.qrHint}>{c.qr.cards[0].hint}</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardBlue}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>02</span>
                <span className={styles.qrCardTitle}>{c.qr.cards[1].title}</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_MAINTENANCE}</span>
                <span className={styles.qrCountLabel}>{c.qr.cards[1].countLabel}</span>
              </div>
              <img src="/portfolio/qr-maintenance.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>www.westarlangroup.kz/maintenance</div>
              <div className={styles.qrHint}>{c.qr.cards[1].hint}</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardGold}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>03</span>
                <span className={styles.qrCardTitle}>{c.qr.cards[2].title}</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_PD}</span>
                <span className={styles.qrCountLabel}>{c.qr.cards[2].countLabel}</span>
              </div>
              <img src="/portfolio/qr-design.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>www.westarlangroup.kz/design</div>
              <div className={styles.qrHint}>{c.qr.cards[2].hint}</div>
            </div>
          </div>

          <div className={styles.processLabel}><span />{c.qr.infoLabel}</div>
          <div className={styles.qrInfoRow}>
            {c.qr.infoChips.map((chip) => (
              <div key={chip.title} className={styles.qrInfoChip}>
                <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} />{chip.title}</div>
                <div className={styles.qrInfoChipDesc}>{chip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 12 · TESTIMONIALS ════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={12} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.testimonials.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.testimonials.title}</h2>
          </div>

          <div className={styles.leadBox}>{c.testimonials.lead}</div>

          <div className={`${styles.testGrid} ${styles.testGridAll}`}>
            {filteredTestimonials.map((t, i) => (
              <TestimonialCard key={`t-${i}`} t={t} quoteOpen={c.testimonials.quoteOpen} quoteClose={c.testimonials.quoteClose} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 13 · PARTNERS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={13} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.partners.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.partners.title}</h2>
            <div className={styles.categoryCardColumn}>
              {c.partners.categories.map((label, i) => (
                <div key={label} className={styles.categoryCard}>
                  <div className={styles.categoryCardIcon}>{PARTNER_CATEGORY_ICONS[i]}</div>
                  <div className={styles.categoryCardLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.leadBox}>{c.partners.lead}</div>

          <div className={styles.partnersGrid}>
            {c.partners.items.map((pa) => (
              <div key={pa.file} className={styles.partnerCard}>
                <div className={styles.partnerLogoWrap}>
                  <img src={`/partners/${pa.file}`} alt={pa.name} className={styles.partnerLogo} />
                </div>
                <div className={styles.partnerName}>{pa.name}</div>
              </div>
            ))}
          </div>

          <div className={styles.partnerFooter}>
            <div className={styles.partnerFooterLeft}>
              <span className={styles.partnerFooterNum}>94%</span>
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

      {/* ═══ 14 · CONTACTS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={14} dark />
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
            {c.contacts.team.map((t) => (
              <div key={t.num} className={styles.teamCard}>
                <div className={styles.teamNum}>{t.num}</div>
                <div className={styles.teamRole}>{t.role}</div>
                <div className={styles.teamName}>{t.name}</div>
                <div className={styles.teamPhone}>{t.phone}</div>
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
              <div className={styles.contactsSite}>www.westarlangroup.kz</div>
            </div>
            <WagMark className={styles.contactsMark} gradientId="wagContacts" />
          </div>
        </div>
      </section>

      {/* ═══ 15 · CLOSING MANIFESTO ═══════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.closing}`}>
        <PageChrome pageNum={15} dark />
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
  /* '№ ' (RU) / 'No. ' (EN) — includes the trailing space so the SSR
     text-node split matches the original `№ {number} · {date}` JSX. */
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
        {/* Section kicker (like page 04), then the number/date line; the
            category badge moves down into the title row as a bigBadge,
            mirroring page 08, so it no longer collides with the top-right
            page number. */}
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

function TestimonialCard({ t, quoteOpen, quoteClose }: { t: PrintTestimonial; quoteOpen: string; quoteClose: string }) {
  return (
    <article className={styles.testCard}>
      {/* Header is always rendered (even when date is absent) so the
          decorative « doesn't collide with the client name. */}
      <div className={styles.testCardHeader}>
        {t.date && <span className={styles.testCardDate}>{t.date}</span>}
      </div>
      <h3 className={styles.testCardClient}>{t.client}</h3>
      <p className={styles.testCardQuote}>{quoteOpen}{renderQuoteWithLegacyName(t.quote)}{quoteClose}</p>
      <div className={styles.testCardSig}>
        <div className={styles.testCardSigName}>{t.signatory}</div>
        <div className={styles.testCardSigRole}>{t.role}</div>
      </div>
    </article>
  );
}
