import PrintBrochure from '../PrintBrochure';
import EN_CONTENT from '../content/en';
import PrintButtons from './PrintButtons';

/* English print brochure — thin wrapper around the shared layout.
   All copy lives in content/en.tsx; structure in ../PrintBrochure.tsx.
   Rendered by scripts/build-pdf.mjs (OUT_PDF=public/portfolio/portfolio-en.pdf
   PRINT_URL=http://localhost:3000/portfolio/print/en). */

export default function PortfolioPrintPageEn() {
  return <PrintBrochure content={EN_CONTENT} buttons={<PrintButtons />} locale="en" />;
}
