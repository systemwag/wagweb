import BrochureV2 from '../BrochureV2';
import EN_CONTENT from '../../content/en';
import PrintButtons from '../../en/PrintButtons';

/* English twin of the v2 redesign — see ../page.tsx. */

export default function PortfolioPrintV2PageEn() {
  return <BrochureV2 content={EN_CONTENT} buttons={<PrintButtons />} locale="en" />;
}
