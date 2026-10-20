import BrochureV2 from './BrochureV2';
import RU_CONTENT from '../content/ru';
import PrintButtons from '../PrintButtons';

/* Redesign candidate of the main brochure (2026-10-19): same copy as
   /portfolio/print, new visual system. Rendered by scripts/build-pdf.mjs
   into versions/portfolio-v2.pdf (npm run build:pdf:v2). Once approved it
   replaces the original layout. */

export default function PortfolioPrintV2Page() {
  return <BrochureV2 content={RU_CONTENT} buttons={<PrintButtons />} />;
}
