/**
 * Portfolio manifest — composes all 16 pages into a single <Document>.
 *
 * To add a new page: import the block, drop it into this list in the
 * desired position. Page numbers (2-16) and the total count are passed
 * explicitly so the chrome stays consistent.
 *
 * To rearrange pages: move the lines. To change a page's content: edit
 * src/lib/pdf/content/ru.ts. To change counts: nothing — they come from
 * the data adapter automatically.
 */
import { Document } from '@react-pdf/renderer';
import '@/lib/pdf/fonts';        // register Inter on import (top-level side effect)
import { Cover } from './blocks/Cover';
import { About } from './blocks/About';
import { Scale } from './blocks/Scale';
import { MapBlock } from './blocks/Map';
import { Iso } from './blocks/Iso';
import { License } from './blocks/License';
import { Direction } from './blocks/Direction';
import { QR } from './blocks/QR';
import { TestimonialsPage1, TestimonialsPage2 } from './blocks/Testimonials';
import { Partners } from './blocks/Partners';
import { Contacts } from './blocks/Contacts';
import type { Content } from './content/types';
import type { PortfolioData } from './data/getPortfolioData';

type Props = {
  content: Content;
  data: PortfolioData;
  qrBuffers: Buffer[];     // [smr QR, pd QR]
};

export function Portfolio({ content, data, qrBuffers }: Props) {
  return (
    <Document
      title="West Arlan Group — Portfolio 2026"
      author="West Arlan Group"
      subject="Корпоративный профиль · 2026"
      keywords="инфраструктура, СМР, проектирование, Казахстан, тендер"
      creator="WAG print engine"
      producer="@react-pdf/renderer"
    >
      <Cover content={content.cover} />
      <About             pageNum={2}  content={content.about} />
      <Scale             pageNum={3}  content={content.scale} data={data} />
      <MapBlock          pageNum={4}  content={content.map}   data={data} />
      <Iso               pageNum={5}  content={content.iso} />
      <License           pageNum={6}  license={content.licenses.smr} />
      <License           pageNum={7}  license={content.licenses.pd} />
      <License           pageNum={8}  license={content.licenses.eco} />
      <License           pageNum={9}  license={content.licenses.accreditation} />
      <Direction         pageNum={10} direction={content.direction01} variant="gold" count={data.countPd} />
      <Direction         pageNum={11} direction={content.direction02} variant="teal" count={data.countSmr} />
      <QR                pageNum={12} content={content.qr} data={data} qrBuffers={qrBuffers} />
      <TestimonialsPage1 pageNum={13} content={content.testimonials} />
      <TestimonialsPage2 pageNum={14} content={content.testimonials} />
      <Partners          pageNum={15} content={content.partners} />
      <Contacts          pageNum={16} content={content.contacts} />
    </Document>
  );
}
