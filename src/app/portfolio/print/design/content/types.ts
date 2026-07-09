import type { ReactNode } from 'react';
import type { DirectionContent } from '../../content/types';

/* ─────────────────────────────────────────────────────────────────
   Shape of the standalone DESIGN brochure copy
   (src/app/portfolio/print/design). RU lives in content/ru.tsx; the
   layout in ../DesignBrochure.tsx is locale-invariant. Kept separate
   from the main brochure's content types on purpose — this brochure
   has a different structure (one sheet per flagship project).
   ───────────────────────────────────────────────────────────────── */

export type DesignMetric = {
  value: string;      // «24», «110/10», «1 419», «Ø110»
  unit?: string;      // «МВт», «кВ», «м», «км»
  label: string;      // short caption under the number
};

export type AnnexFigure = {
  drawing: string;    // image src under /portfolio/design
  caption: string;    // caption strip under the frame
  kind: string;       // small tag, e.g. «Наружный газопровод · лист 2»
  band?: boolean;     // ultra-wide strip sheet — rendered as a short full-width band
};

export type DesignProjectSheet = {
  index: string;          // «01»
  status: string;         // «РЕАЛИЗОВАНО»
  category: string;       // eyebrow, e.g. «ЭНЕРГОСНАБЖЕНИЕ · СХЕМА 110 кВ»
  title: ReactNode;       // project headline
  client: string;         // customer / object
  location: string;       // region line
  stage: string;          // design stage (РП / схема / сопровождение ГЭ)
  lead: ReactNode;        // 2–3 sentence description
  metrics: DesignMetric[]; // 3 key figures
  scope: string[];         // 4 bullets — what was designed
  drawing: string;         // image src under /portfolio/design
  drawingCaption: string;  // caption strip under the framed drawing
  drawingKind: string;     // small tag, e.g. «Генеральный план · стадия РП»
  /* Optional second drawing rendered as a short band under the hero
     (e.g. план освещения on the Уральская Сталь sheet). */
  extraDrawing?: AnnexFigure;
  /* Optional follow-up page with more project drawings. */
  annex?: {
    eyebrow: string;    // «03 · ГАЗОСНАБЖЕНИЕ · ЧЕРТЕЖИ ПРОЕКТА»
    title: ReactNode;
    figures: AnnexFigure[];
  };
};

export interface DesignBrochureContent {
  /* COVER */
  cover: {
    eyebrow: string;
    issue: string;
    subtitle: string;
    /* Small line under the subtitle: «Дополнение к основному портфолио…» */
    supplement: string;
    tagline: { main: string; sub?: string }[];
    binLabel: string;
  };

  /* DIRECTION — «Проектирование инженерных сетей», reworked for this
     brochure (NOT borrowed from the main dirDesign page). Same structural
     shape as the main brochure's direction pages so it reuses the
     svcGrid/processFlow styles. */
  direction: DirectionContent;

  /* PROJECT SHEETS (5 flagship engineering-network projects; some carry
     an extraDrawing band and/or an annex drawings page) */
  projects: DesignProjectSheet[];

  /* REGISTRY — full design registry + QR to site & main brochure. Sits
     BEFORE the project sheets and its `remark` introduces them as recent
     examples (not the full set).
     The About / Проектирование / Отзывы / Партнёры / Манифест pages are
     borrowed verbatim from the main brochure content (../content/ru) in
     DesignBrochure.tsx, so their copy is NOT duplicated here. */
  more: {
    eyebrow: string;
    title: ReactNode;
    badgeLabel: ReactNode;
    lead: ReactNode;
    cards: { title: string; countLabel: string; url: string; hint: string }[];
    infoLabel: string;
    infoChips: { title: string; desc: string }[];
    /* Lead-in band pointing at the 4 example sheets that follow. */
    remark: ReactNode;
    remarkTag: string;
  };

  /* CLOSING — final page in the manifesto style, pointing the reader at
     the corporate profile (main portfolio) for full company information. */
  closing: {
    eyebrow: string;
    quote: ReactNode;
    byline: ReactNode;
  };
}
