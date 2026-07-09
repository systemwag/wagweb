import DesignBrochure from './DesignBrochure';
import RU_DESIGN_CONTENT from './content/ru';
import PrintButtons from './PrintButtons';

/* Standalone DESIGN-works brochure (RU) — thin wrapper around the shared
   layout. Copy lives in content/ru.tsx; structure in DesignBrochure.tsx.
   Rendered by scripts/build-pdf.mjs (OUT_PDF=public/portfolio/portfolio-design.pdf
   PRINT_URL=http://localhost:3000/portfolio/print/design). */

export default function PortfolioDesignPrintPage() {
  return <DesignBrochure content={RU_DESIGN_CONTENT} buttons={<PrintButtons />} />;
}
