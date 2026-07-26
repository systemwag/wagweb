import { Fragment, type ReactNode } from 'react';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import styles from '../print.module.css';
import d from './design.module.css';
import type { AnnexFigure, DesignBrochureContent, DesignProjectSheet } from './content/types';
import type { PrintTestimonial } from '../content/types';
import MAIN from '../content/ru';

/* ─────────────────────────────────────────────────────────────────
   Standalone DESIGN-WORKS brochure (13 pages · A4 portrait), focused
   entirely on ПРОЕКТИРОВАНИЕ ИНЖЕНЕРНЫХ СЕТЕЙ:

     01 cover · 02 направление (инженерные сети, собственная копия) ·
     03 реестр+QR · 04–10 кейсы 01–04 с листами чертежей (QazCement, газ и
     канализация получают annex-страницы, Урал — вторую ленту-чертёж) ·
     11 отзывы+партнёры (одна страница) · 12 отсылка к корп. профилю.

   «О компании» удалена сознательно — она есть в основном портфолио.
   Отзывы / Партнёры / Манифест BORROWED verbatim from the main brochure
   (../content/ru → MAIN.testimonials / partners / closing) so they stay
   in sync. Direction copy is design-specific (content/ru.tsx →
   c.direction), NOT the generic main dirDesign page.

   Shell + typography reuse ../print.module.css; sheet layout lives in
   ./design.module.css. Rendered by scripts/build-pdf.mjs with
   OUT_PDF=public/portfolio/portfolio-design.pdf and
   PRINT_URL=…/portfolio/print/design.
   ───────────────────────────────────────────────────────────────── */

/* WAG triangle mark — official logo (assets/logotriangle.svg). Duplicated
   from PrintBrochure.tsx (not exported there) to keep this brochure
   self-contained. */
const WAG_TRIANGLE = 'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

function WagMark({ className, gradientId = 'wagGoldD' }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 719.49 635.66" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A843" />
          <stop offset="50%" stopColor="#F0C85A" />
          <stop offset="100%" stopColor="#C49A30" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`} d={WAG_TRIANGLE} />
    </svg>
  );
}

/* Icon sets. Partner-category icons are copied from PrintBrochure so the
   borrowed Партнёры page renders identically. */
const PARTNER_CATEGORY_ICONS: ReactNode[] = [
  (<svg key="building" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M2 10l10-7 10 7" /><path d="M3 10h18" /><path d="M5 21V10" /><path d="M9 21V10" /><path d="M12 21V10" /><path d="M15 21V10" /><path d="M19 21V10" /></svg>),
  (<svg key="pipeline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="5" x2="12" y2="9" /></svg>),
  (<svg key="factory" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V11l5-3v3l5-3v3l5-3v13z" /><line x1="7" y1="16" x2="7" y2="18" /><line x1="12" y1="16" x2="12" y2="18" /><line x1="17" y1="16" x2="17" y2="18" /></svg>),
];

const svcIconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/* Direction-page icons, zipped with c.direction.svcs: power/pylon · gas ·
   water · survey · rail crossing · state review. */
const SVC_NET_ICONS: ReactNode[] = [
  (<svg key="n1" {...svcIconProps}><line x1="4" y1="21" x2="20" y2="21" /><line x1="9" y1="21" x2="12" y2="4" /><line x1="15" y1="21" x2="12" y2="4" /><line x1="6" y1="11" x2="18" y2="11" /><line x1="8" y1="16" x2="16" y2="16" /></svg>),
  (<svg key="n2" {...svcIconProps}><path d="M12 3c3 3.5 5 6 5 9a5 5 0 0 1-10 0c0-1.6.6-3 1.5-4.2" /><path d="M12 21v-4" /></svg>),
  (<svg key="n3" {...svcIconProps}><path d="M12 3c3.5 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6 6-11z" /></svg>),
  (<svg key="n4" {...svcIconProps}><circle cx="10.5" cy="10.5" r="6" /><line x1="10.5" y1="7" x2="10.5" y2="14" /><line x1="7" y1="10.5" x2="14" y2="10.5" /><line x1="19.5" y1="19.5" x2="15" y2="15" /></svg>),
  (<svg key="n5" {...svcIconProps}><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="12" y1="3" x2="12" y2="21" /></svg>),
  (<svg key="n6" {...svcIconProps}><path d="M4 5h16v12H4z" /><path d="M8 21h8" /><polyline points="9 11 11 13 15 9" /></svg>),
];

const TOTAL = 14;
const pageNumLabel = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;
const ISSUE_STAMP = 'WAG · ПРОЕКТНЫЕ РАБОТЫ · 2026';

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

/* Wrap occurrences of the group name in <em> — copied from PrintBrochure. */
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

function FramedFigure({ fig, band = false, compactHero = false }: { fig: AnnexFigure; band?: boolean; compactHero?: boolean }) {
  return (
    <figure className={`${d.figure} ${band ? d.figBandExtra : ''} ${compactHero ? d.figCompact : ''}`}>
      <div className={`${styles.licScanFrame} ${d.figFrame}`}>
        <img src={fig.drawing} alt={fig.caption} className={styles.licScanImg} />
      </div>
      <figcaption className={d.figCap}>
        <span className={d.figCapText}>{fig.caption}</span>
        <span className={d.figKind}>{fig.kind}</span>
      </figcaption>
    </figure>
  );
}

/* One project sheet: header rail, metrics, hero drawing (+optional extra
   band), scope grid, stage footer. */
function ProjectSheet({ p, pageNum, dark }: { p: DesignProjectSheet; pageNum: number; dark: boolean }) {
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <PageChrome pageNum={pageNum} dark={dark} />
      <div className={`${styles.pageInner} ${dark ? d.sheetDark : ''} ${p.extraDrawing ? d.sheetCompact : ''}`}>
        <div className={`${styles.eyebrow} ${dark ? styles.eyebrowDark : ''}`}>{p.index} · {p.category}</div>
        <h2 className={d.sheetTitle}>{p.title}</h2>
        <div className={d.sheetMeta}>
          <span className={d.sheetMetaClient}>{p.client}</span>
          <span className={d.sheetMetaSep}>·</span>
          <span>{p.location}</span>
          <span className={d.sheetStatus}>{p.status}</span>
        </div>

        <p className={d.sheetLead}>{p.lead}</p>

        <div className={d.metricRow}>
          {p.metrics.map((m) => (
            <div key={m.label} className={d.metric}>
              <div className={d.metricValueRow}>
                <span className={d.metricValue}>{m.value}</span>
                {m.unit && <span className={d.metricUnit}>{m.unit}</span>}
              </div>
              <div className={d.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        <FramedFigure
          fig={{ drawing: p.drawing, caption: p.drawingCaption, kind: p.drawingKind }}
          compactHero={p.extraDrawing != null}
        />
        {p.extraDrawing && <FramedFigure fig={p.extraDrawing} band />}

        <div className={d.scopeWrap}>
          <div className={d.scopeLabel}>СОСТАВ РАБОТ</div>
          <div className={d.scopeGrid}>
            {p.scope.map((s) => (
              <div key={s} className={d.scopeItem}>{s}</div>
            ))}
          </div>
        </div>

        <div className={d.sheetStage}>{p.stage}</div>
      </div>
    </section>
  );
}

/* Annex page — additional project drawings, same tone as its sheet. */
function AnnexPage({ annex, pageNum, dark }: { annex: NonNullable<DesignProjectSheet['annex']>; pageNum: number; dark: boolean }) {
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <PageChrome pageNum={pageNum} dark={dark} />
      <div className={`${styles.pageInner} ${dark ? d.sheetDark : ''}`}>
        <div className={`${styles.eyebrow} ${dark ? styles.eyebrowDark : ''}`}>{annex.eyebrow}</div>
        <h2 className={d.sheetTitle}>{annex.title}</h2>
        <div className={d.annexFigs}>
          {annex.figures.map((f) => (
            <div key={f.drawing} className={`${d.annexFig} ${f.band ? d.annexFigBand : ''}`}>
              <div className={`${styles.licScanFrame} ${d.annexFigFrame}`}>
                <img src={f.drawing} alt={f.caption} className={styles.licScanImg} />
              </div>
              <figcaption className={d.figCap}>
                <span className={d.figCapText}>{f.caption}</span>
                <span className={d.figKind}>{f.kind}</span>
              </figcaption>
            </div>
          ))}
        </div>
        {annex.metrics && (
          <>
            {annex.metricsLabel && <div className={d.scopeLabel}>{annex.metricsLabel}</div>}
            <div className={d.metricRow}>
              {annex.metrics.map((m) => (
                <div key={m.label} className={d.metric}>
                  <div className={d.metricValueRow}>
                    <span className={d.metricValue}>{m.value}</span>
                    {m.unit && <span className={d.metricUnit}>{m.unit}</span>}
                  </div>
                  <div className={d.metricLabel}>{m.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default async function DesignBrochure({ content: c, buttons }: { content: DesignBrochureContent; buttons: ReactNode }) {
  // Live counts from the same data layer the website uses.
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);
  // Фоллбэки сверены с прод-БД 26.07.2026 — держать в согласии с PrintBrochure.tsx.
  const COUNT_PD = design.length || 100;
  const COUNT_REGISTRY = (projects.length || 32) + (maintenance.length || 20) + COUNT_PD;

  // The merged «Отзывы + Партнёры» page shows a curated subset: 3 letters
  // with quality-focused (not rail-specific) quotes and 12 of the 16 partner
  // logos, so both blocks fit one A4. Full sets live in the main brochure.
  const FEATURED_TESTIMONIAL_CLIENTS = [
    'ТОО «Portal KZ»',
    'ТОО «Синтез Урал»',
    'ТОО «Нефтестройсервис ЛТД» · NSS',
  ];
  const featuredTestimonials = FEATURED_TESTIMONIAL_CLIENTS.flatMap((client) => {
    const t = MAIN.testimonials.items.find((x) => x.client === client);
    return t ? [t] : [];
  });
  const PARTNER_EXCLUDE = ['Тенізшевройл', 'СПК', 'СПС', 'Зерде'];
  const partnerItems = MAIN.partners.items
    .filter((pa) => !PARTNER_EXCLUDE.some((x) => pa.name.includes(x)))
    .slice(0, 12);

  // Case pages start after cover(1) + direction(2) + registry(3); annex
  // pages interleave, so page numbers are computed with a running counter.
  let nextPage = 4;
  const casePages = c.projects.map((p) => {
    const sheet = nextPage++;
    const annex = p.annex ? nextPage++ : null;
    return { sheet, annex };
  });
  const afterCases = nextPage; // отзывы

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
          <WagMark className={styles.coverMark} gradientId="wagCoverD" />
        </div>
        <h1 className={styles.coverTitle}>
          WEST ARLAN<br />
          <span className={styles.coverTitleAccent}>GROUP</span>
        </h1>
        <div className={styles.coverTitleRule} />
        <div className={d.coverSubtitle}>{c.cover.subtitle}</div>
        <div className={d.coverSupplement}>{c.cover.supplement}</div>
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

      {/* ═══ 02 · ПРОЕКТИРОВАНИЕ ИНЖЕНЕРНЫХ СЕТЕЙ ═════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={2} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.direction.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>{c.direction.title}</h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeGold}`}>
              <div className={styles.outlinedBadgeTop}>{c.direction.badgeTop}</div>
              <div className={styles.outlinedBadgeBottom}>{c.direction.badgeBottom}</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>{c.direction.lead}</div>

          <div className={styles.svcGrid}>
            {c.direction.svcs.map((s, i) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcIcon} ${styles.svcIconGold}`}>{SVC_NET_ICONS[i]}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            {c.direction.processLabel}
          </div>
          <div className={styles.processFlow}>
            {c.direction.process.map((step, i) => (
              <div key={step.roman} className={styles.processGroup}>
                <div className={`${styles.processStep} ${styles.processStepGold}`}>
                  <div className={styles.processRoman}>{step.roman}</div>
                  <div className={styles.processTitle}>{step.title}</div>
                  <div className={styles.processMeta}>{step.meta}</div>
                </div>
                {i < c.direction.process.length - 1 && <div className={styles.processArrow}>→</div>}
              </div>
            ))}
          </div>

          <div className={styles.dirFooter}>
            <span className={styles.dirFooterNum}>{COUNT_PD}</span>
            <span className={styles.dirFooterLabel}>{c.direction.footerLabel}</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>ЛИЦЕНЗИЯ I КАТЕГОРИИ · С 2010</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>www.westarlangroup.kz / design</span>
          </div>
        </div>
      </section>

      {/* ═══ 03 · РЕЕСТР ПРОЕКТНЫХ РАБОТ + QR ════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={3} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.more.eyebrow}</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{c.more.title}</h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>{COUNT_PD}</div>
              <div className={styles.bigBadgeLabel}>{c.more.badgeLabel}</div>
            </div>
          </div>

          <div className={styles.leadBox}>{c.more.lead}</div>

          <div className={d.moreQrGrid}>
            <div className={`${styles.qrCard} ${styles.qrCardGold}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>01</span>
                <span className={styles.qrCardTitle}>{c.more.cards[0].title}</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_PD}</span>
                <span className={styles.qrCountLabel}>{c.more.cards[0].countLabel}</span>
              </div>
              <img src="/portfolio/qr-design.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>{c.more.cards[0].url}</div>
              <div className={styles.qrHint}>{c.more.cards[0].hint}</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardTeal}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>02</span>
                <span className={styles.qrCardTitle}>{c.more.cards[1].title}</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_REGISTRY}</span>
                <span className={styles.qrCountLabel}>{c.more.cards[1].countLabel}</span>
              </div>
              <img src="/portfolio/qr-portfolio-main.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>{c.more.cards[1].url}</div>
              <div className={styles.qrHint}>{c.more.cards[1].hint}</div>
            </div>
          </div>

          <div className={d.sectionLabel}><span />{c.more.infoLabel}</div>
          <div className={styles.qrInfoRow}>
            {c.more.infoChips.map((chip) => (
              <div key={chip.title} className={styles.qrInfoChip}>
                <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} />{chip.title}</div>
                <div className={styles.qrInfoChipDesc}>{chip.desc}</div>
              </div>
            ))}
          </div>

          <div className={d.remarkBand}>
            <span className={d.remarkArrow} aria-hidden>↓</span>
            <span className={d.remarkText}>{c.more.remark}</span>
            <span className={d.remarkTag}>{c.more.remarkTag}</span>
          </div>
        </div>
      </section>

      {/* ═══ 04–10 · КЕЙСЫ 01–05 (+ листы чертежей) ═══════════════ */}
      {c.projects.map((p, i) => {
        const dark = i % 2 === 0; // 01, 03, 05 dark · 02, 04 light
        const pages = casePages[i];
        return (
          <Fragment key={p.index}>
            <ProjectSheet p={p} pageNum={pages.sheet} dark={dark} />
            {p.annex && pages.annex != null && (
              <AnnexPage annex={p.annex} pageNum={pages.annex} dark={dark} />
            )}
          </Fragment>
        );
      })}

      {/* ═══ 11 · ОТЗЫВЫ + ПАРТНЁРЫ (merged, borrowed from main) ══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={afterCases} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ОТЗЫВЫ И ПАРТНЁРЫ</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>{MAIN.partners.title}</h2>
            <div className={`${styles.categoryCardColumn} ${d.mergedCatCol}`}>
              {MAIN.partners.categories.map((label, i) => (
                <div key={label} className={styles.categoryCard}>
                  <div className={styles.categoryCardIcon}>{PARTNER_CATEGORY_ICONS[i]}</div>
                  <div className={styles.categoryCardLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.leadBox} ${d.mergedLead}`}>
            {MAIN.partners.lead}{' '}
            Благодарственные письма охватывают весь цикл работ группы — от проектной
            документации до сдачи объекта.
          </div>

          <div className={d.sectionLabel}><span />{MAIN.testimonials.eyebrow}</div>
          <div className={`${styles.testGrid} ${styles.testGridAll} ${d.mergedTestRow}`}>
            {featuredTestimonials.map((t, i) => (
              <TestimonialCard key={`t-${i}`} t={t} quoteOpen={MAIN.testimonials.quoteOpen} quoteClose={MAIN.testimonials.quoteClose} />
            ))}
          </div>

          <div className={d.sectionLabel}><span />{MAIN.partners.eyebrow}</div>
          <div className={`${styles.partnersGrid} ${d.mergedPartnersGrid}`}>
            {partnerItems.map((pa) => (
              <div key={pa.file} className={styles.partnerCard}>
                <div className={styles.partnerLogoWrap}>
                  <img src={`/partners/${pa.file}`} alt={pa.name} className={styles.partnerLogo} />
                </div>
                <div className={styles.partnerName}>{pa.name}</div>
              </div>
            ))}
          </div>

          <div className={`${styles.partnerFooter} ${d.mergedFooterPad}`}>
            <div className={styles.partnerFooterLeft}>
              <span className={styles.partnerFooterNum}>5+</span>
              <span className={styles.partnerFooterText}>
                <span className={styles.aboutColRule} />{MAIN.partners.repeatLabel}
              </span>
            </div>
            <div className={styles.partnerFooterRight}>
              <span className={styles.aboutColRule} />{MAIN.partners.registryLabel}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 12 · CLOSING — отсылка к корпоративному профилю ══════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.closing}`}>
        <CornerL pos="tl" />
        <CornerL pos="tr" />
        <CornerL pos="bl" />
        <CornerL pos="br" />
        <div className={`${styles.pageNum} ${styles.pageNumDark}`}>{pageNumLabel(afterCases + 1)}</div>
        <div className={styles.closingInner}>
          <div className={styles.closingEyebrow}>{c.closing.eyebrow}</div>
          <h2 className={styles.closingQuote}>{c.closing.quote}</h2>
          <p className={styles.closingByline}>{c.closing.byline}</p>
          <div className={styles.closingFooter}>
            <div className={d.closingContactCol}>
              <div className={styles.closingFooterValue}>+7 7132 538-288 · www.westarlangroup.kz</div>
              <div className={styles.closingFooterValue}>{ISSUE_STAMP}</div>
            </div>
            <WagMark className={styles.closingMark} gradientId="wagClosingD" />
          </div>
        </div>
      </section>
    </main>
  );
}
