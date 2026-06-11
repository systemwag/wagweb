import PrintBrochure from './PrintBrochure';
import RU_CONTENT from './content/ru';
import PrintButtons from './PrintButtons';

/* Russian print brochure — thin wrapper around the shared layout.
   All copy lives in content/ru.tsx; structure in PrintBrochure.tsx.
   Rendered by scripts/build-pdf.mjs into public/portfolio.pdf. */

export default function PortfolioPrintPage() {
  return <PrintBrochure content={RU_CONTENT} buttons={<PrintButtons />} />;
}
