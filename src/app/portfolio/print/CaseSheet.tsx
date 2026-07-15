import styles from './print.module.css';
import d from './design/design.module.css';
import type { AnnexFigure, DesignProjectSheet } from './design/content/types';

type CaseAnnex = NonNullable<DesignProjectSheet['annex']>;

/* ─────────────────────────────────────────────────────────────────
   Shared project case sheet — the one-project-per-page layout born in
   the design-works brochure, extracted so the MAIN portfolio can render
   project cases in the same visual system. Content shape is
   DesignProjectSheet (design/content/types); styles come from
   print.module.css (shell) + design/design.module.css (sheet grid).

   Chrome (corners, page number, issue stamp) is self-contained here and
   parameterised by `total` and `stamp`, since each brochure has its own
   pagination and masthead.
   ───────────────────────────────────────────────────────────────── */

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

export default function CaseSheet({
  p,
  pageNum,
  total,
  stamp,
  dark,
}: {
  p: DesignProjectSheet;
  pageNum: number;
  total: number;
  stamp: string;
  dark: boolean;
}) {
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <span className={`${styles.cornerL} ${styles.cornerTL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerTR}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBR}`} aria-hidden />
      <div className={`${styles.pageNum} ${dark ? styles.pageNumDark : ''}`}>
        {String(pageNum).padStart(2, '0')} / {total}
      </div>
      <div className={`${styles.pageStamp} ${dark ? styles.pageStampDark : ''}`}>{stamp}</div>

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

/* Optional follow-up page of extra project drawings — mirrors the design
   brochure's AnnexPage but wears the main-portfolio case chrome. Used when a
   case carries more drawings than the sheet's hero + band can hold (e.g. the
   merged «Уральская Сталь» project: сети 0,4 кВ + пост ЭЦ). */
export function CaseAnnexPage({
  annex,
  pageNum,
  total,
  stamp,
  dark,
}: {
  annex: CaseAnnex;
  pageNum: number;
  total: number;
  stamp: string;
  dark: boolean;
}) {
  return (
    <section className={`${styles.page} ${dark ? styles.pageDark : styles.pageLight}`}>
      <span className={`${styles.cornerL} ${styles.cornerTL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerTR}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBL}`} aria-hidden />
      <span className={`${styles.cornerL} ${styles.cornerBR}`} aria-hidden />
      <div className={`${styles.pageNum} ${dark ? styles.pageNumDark : ''}`}>
        {String(pageNum).padStart(2, '0')} / {total}
      </div>
      <div className={`${styles.pageStamp} ${dark ? styles.pageStampDark : ''}`}>{stamp}</div>

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
