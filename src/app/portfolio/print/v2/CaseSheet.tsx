import styles from './print.module.css';
import d from './design.module.css';
import type { AnnexFigure, DesignProjectSheet } from '../design/content/types';
import type { V2Copy } from './copy';

type CaseAnnex = NonNullable<DesignProjectSheet['annex']>;

/* ─────────────────────────────────────────────────────────────────
   v2 project case sheet. Differences from ../CaseSheet.tsx:
   · drawings are toned to the page (./img/route.ts) and sit on it without
     a frame, taking whatever height is left — a sheet never overflows or
     leaves a hole;
   · the status sits as a seal in the header;
   · the index is the display number from BrochureV2 (cases are
     renumbered in reading order), not the one stored in content.
   ───────────────────────────────────────────────────────────────── */

/* Drawing URL toned for the page: blueprint on dark, paper on light. */
const toned = (src: string, dark: boolean) =>
  `/portfolio/print/v2/img?src=${encodeURIComponent(src)}&tone=${dark ? 'blueprint' : 'paper'}`;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={d.sealIcon}>
      <path d="M2 6.4l2.6 2.5L10 3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chrome({ pageNum, total, stamp, dark }: { pageNum: number; total: number; stamp: string; dark: boolean }) {
  return (
    <>
      <span className={`${styles.cornerL} ${styles.cornerTL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerTR}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBR}`} aria-hidden />
      <div className={`${styles.pageNum} ${dark ? styles.pageNumDark : ''}`}>
        {String(pageNum).padStart(2, '0')} / {total}
      </div>
      <div className={`${styles.pageStamp} ${dark ? styles.pageStampDark : ''}`}>{stamp}</div>
    </>
  );
}

function Figure({ fig, dark, band = false }: { fig: AnnexFigure; dark: boolean; band?: boolean }) {
  return (
    <figure className={`${d.fig} ${band ? d.figBand : ''}`}>
      <div className={d.plate}>
        <img src={toned(fig.drawing, dark)} alt={fig.caption} className={d.plateImg} />
      </div>
      <figcaption className={d.figCap}>
        <span className={d.figCapText}>{fig.caption}</span>
        <span className={d.figKind}>{fig.kind}</span>
      </figcaption>
    </figure>
  );
}

export default function CaseSheet({
  p,
  index,
  pageNum,
  total,
  stamp,
  dark,
  labels,
}: {
  p: DesignProjectSheet;
  index: string;
  pageNum: number;
  total: number;
  stamp: string;
  dark: boolean;
  labels: V2Copy['caseStamp'];
}) {
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <Chrome pageNum={pageNum} total={total} stamp={stamp} dark={dark} />

      <div className={`${styles.pageInner} ${dark ? d.sheetDark : ''}`}>
        <div className={d.caseHead}>
          <div className={d.caseHeadMain}>
            <div className={`${styles.eyebrow} ${dark ? styles.eyebrowDark : ''}`}>{index} · {p.category}</div>
            <h2 className={d.sheetTitle}>{p.title}</h2>
            <div className={d.sheetMeta}>
              <span className={d.sheetMetaClient}>{p.client}</span>
              <span className={d.sheetMetaSep}>·</span>
              <span>{p.location}</span>
            </div>
          </div>
          <div className={d.seal}>
            <div className={d.sealStatus}><CheckIcon />{p.status}</div>
          </div>
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

        <div className={d.figs}>
          <Figure fig={{ drawing: p.drawing, caption: p.drawingCaption, kind: p.drawingKind }} dark={dark} />
          {p.extraDrawing && <Figure fig={p.extraDrawing} dark={dark} band />}
        </div>

        <div className={d.scopeWrap}>
          <div className={d.scopeLabel}>{labels.scope}</div>
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

/* Follow-up page of extra drawings; shares the sheet's tone and index. */
export function CaseAnnexPage({
  annex,
  index,
  pageNum,
  total,
  stamp,
  dark,
}: {
  annex: CaseAnnex;
  index: string;
  pageNum: number;
  total: number;
  stamp: string;
  dark: boolean;
}) {
  const eyebrow = annex.eyebrow.replace(/^\s*[\d.]+\s*·\s*/, `${index} · `);
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <Chrome pageNum={pageNum} total={total} stamp={stamp} dark={dark} />

      <div className={`${styles.pageInner} ${dark ? d.sheetDark : ''}`}>
        <div className={`${styles.eyebrow} ${dark ? styles.eyebrowDark : ''}`}>{eyebrow}</div>
        <h2 className={d.sheetTitle}>{annex.title}</h2>
        <div className={`${d.figs} ${d.figsAnnex}`}>
          {annex.figures.map((f) => (
            <Figure key={f.drawing} fig={f} dark={dark} band={f.band} />
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
