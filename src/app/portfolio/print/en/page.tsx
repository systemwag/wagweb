import Image from 'next/image';
import { getProjects, getDesignProjects } from '@/lib/data';
// QR codes are pre-baked into /public/portfolio/qr-*.png by scripts/bake-qr-codes.mjs.
import styles from '../print.module.css';
import PrintButtons from './PrintButtons';

/* ── WAG triangle path (from Hero.tsx) ────────────────────────── */
const WAG_PATH = 'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

// KZ map outline is no longer inlined here — it's pre-baked to
// /public/portfolio/kz-map.png by scripts/bake-kz-map.mjs.

function WagTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 719.49 635.66" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#C9941F" d={WAG_PATH} />
    </svg>
  );
}

type PrintTestimonial = {
  client: string;
  signatory: string;
  role: string;
  date?: string;
  category: string;
  quote: string;
};

const PRINT_TESTIMONIALS: PrintTestimonial[] = [
  { client: 'UKIZ Aktobe LLP · Aktobe Industrial Zone', signatory: 'A. N. Tulebayev', role: 'Director', date: 'January 5, 2020', category: 'Maintenance · 4.5 km',
    quote: 'Throughout our cooperation, the routine maintenance of access railway tracks has been carried out by qualified specialists. All defects are resolved promptly and to a high standard. The professionalism of West Capital Construction LLP staff allows us to be confident in safe operation.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', category: 'Re-rolling · 63 km',
    quote: 'The highly qualified personnel approached the assigned tasks responsibly and completed the work to a high standard within the contractual deadlines. West Capital Construction LLP has all the necessary equipment and machinery to perform both dismantling and construction & installation works.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', category: 'Maintenance · 7.2 + 20 km',
    quote: 'Maintenance of such a track network requires great responsibility and professional attention. We entered into a contract with West Capital Construction LLP because their specialists have proven themselves to be professional and conscientious workers.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', date: 'September 21, 2018', category: 'Reconstruction · Rudnaya station',
    quote: 'The company\'s staff resolved the numerous issues arising during construction promptly and to a high standard. All subsequent stages of construction were patiently coordinated by West Capital Construction LLP with the management of Aktobe Copper Company LLP. We recommend them as a reliable team for projects of any complexity.' },
  { client: 'Zerde-Keramika Aktobe LLP', signatory: 'E. R. Tleukabylov', role: 'Director', date: 'September 2021', category: 'Construction · 481 m',
    quote: 'Given the diligence and responsibility of West Capital Construction LLP staff, as well as their serious approach to the work, we are confident in the safety of railway track operation and look forward to further cooperation.' },
  { client: 'Zerde-Keramika Aktobe LLP', signatory: 'E. R. Tleukabylov', role: 'Director', category: 'Dismantling · 6.7 km',
    quote: 'Your specialists completed the work to a high standard and within the established deadlines, which confirms your responsibility and competence. Considering that your company has worked with us on construction, maintenance, and now dismantling, we express our willingness for further cooperation.' },
  { client: 'Phaeton Company LLP', signatory: 'V. Yu. Rusmanova', role: 'Director', date: 'October 20, 2018', category: 'Maintenance · ramp 70 m',
    quote: 'West Capital Construction LLP staff stand out for their responsibility, integrity and professionalism. Inspection and rectification of defects on the access track are carried out promptly and to a high standard. Their work gives us confidence in the safe operation of the track.' },
  { client: 'AltynNuran LLP', signatory: 'Zh. N. Murzabekov', role: 'Director', date: 'Since September 2019', category: 'Maintenance · 115 m',
    quote: 'All routine maintenance work on the railway track and structures has been performed by highly qualified specialists. Given the diligence and responsibility of the staff, we are confident in safe operation and look forward to further cooperation.' },
  { client: 'Sintez Ural LLP', signatory: 'S. A. Morozov', role: 'Director', date: 'Since November 2024', category: 'Construction · 500 m',
    quote: 'We would like to highlight the professionalism and responsibility of West Capital Construction LLP staff, as well as the efficiency in resolving issues during construction. The high level of organizational work allowed the facility to be commissioned on time and to a high standard.' },
  { client: 'Portal KZ LLP', signatory: 'M. M. Nyshanov', role: 'Director', category: 'Construction · Nikeltau station',
    quote: 'Construction was carried out in strict compliance with all contract terms: the work was completed on time, in accordance with the technical specification. A productive practice of efficient cooperation in coordinating technical decisions has developed between our organizations.' },
  { client: 'Sole Proprietor B. S. Zhanazhanov', signatory: 'B. S. Zhanazhanov', role: 'Sole Proprietor', category: 'Construction · 200 m',
    quote: 'Thanks to the professional approach of West Capital Construction LLP staff, the construction of our private-use railway track was completed ahead of schedule, while the quality and reliability of the constructed facility deserve the highest marks.' },
  { client: 'Neftestroyservis LTD LLP · NSS', signatory: 'R. K. Otarov', role: 'Director', date: 'November 1, 2022', category: 'Construction · Tendyk station',
    quote: 'The work was performed in accordance with current building codes and regulations, in line with the technical specification and contract terms, with proper quality and within the established deadlines. West Capital Construction LLP has proven itself to be a highly professional company.' },
  { client: 'Private Customer K. A. Ni', signatory: 'K. A. Ni', role: 'Private Customer', category: 'Construction · Siding 41',
    quote: 'The company has proven itself as a diligent contractor, fulfilling contractual obligations with excellent quality of work and within established deadlines. The modern construction methods used by the company comply with the requirements of SN RK, SP RK and GOST.' },
  { client: 'JV Sine Midas Story LLP', signatory: 'B. T. Imankulova', role: 'Executive Director', category: 'Dismantling · 850 m',
    quote: 'We cannot fail to note the high professionalism of West Capital Construction LLP staff, as well as their utmost responsibility in carrying out the assigned tasks. The quality of work leaves no doubt; we hope for even closer cooperation.' },
  { client: 'PGS-Tamdy LLP', signatory: 'A. K. Ispanov', role: 'Director', category: 'Construction · Tamdy station',
    quote: 'The professional and responsible approach to work by West Capital Construction LLP staff ensured the construction of our private-use railway track into a permanent line during a track-possession window. All approvals with branches of JSC NC KTZ were carried out in a timely manner.' },
];

const PARTNERS = [
  { file: '9.png',          name: 'Kazakhstan Temir Zholy' },
  { file: '1.png',          name: 'Russian Copper Company' },
  { file: '5554453.png',    name: 'Ural Sintez' },
  { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Sintez Group' },
  { file: '4.png',          name: 'Shubarkol Premium' },
  { file: '7.png',          name: 'Altynex' },
  { file: 'metprom-logo-rus-Photoroom.png',           name: 'Metprom' },
  { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg', name: 'Tengizchevroil' },
  { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg', name: 'Khorgos Gateway' },
  { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
  { file: '5.png',          name: 'NSS' },
  { file: '3.png',          name: 'Sine Midas Story' },
  { file: '6.png',          name: 'Aktobe Steklo' },
  { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'SPK Aktobe' },
  { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg', name: 'SPS Energo' },
  { file: '2.png',          name: 'Zerde Keramika' },
];

function Corners({ pageNum }: { pageNum: string }) {
  return (
    <>
      <div className={`${styles.cornerMark} ${styles.cornerTopRight}`}><span className={styles.pageNum}>{pageNum}</span></div>
      <div className={`${styles.cornerMark} ${styles.cornerBottomRight}`}>arlan-gr.kz</div>
    </>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

const ABOUT_PAGE_CSS = `
.wag-section-about { padding: 20mm 22mm 16mm !important; }

.wag-about-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10mm;
  margin-bottom: 4mm;
  padding-bottom: 3mm;
  border-bottom: 1px solid rgba(176,121,28,0.25);
}
.wag-about-head-left { flex: 1; min-width: 0; }
.wag-about-stats {
  display: flex; align-items: stretch; gap: 4mm;
  padding: 2mm 0 0;
}
.wag-about-stat {
  display: flex; flex-direction: column; align-items: flex-start; gap: 1mm;
  min-width: 16mm;
}
.wag-about-stat-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 22pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.02em;
}
.wag-about-stat-label {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
}
.wag-about-stat-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(176,121,28,0.45), transparent);
}
.wag-about-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10.5pt; line-height: 1.55;
  color: #2a2a2a; margin: 0 0 4mm;
  max-width: 165mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}
.wag-about-industries {
  display: flex; align-items: center; gap: 5mm;
  padding: 3mm 0 3mm;
  margin-bottom: 3mm;
  border-bottom: 1px dashed rgba(176,121,28,0.3);
}
.wag-about-industries-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.22em;
  color: #B0791C; text-transform: uppercase;
  flex-shrink: 0;
}
.wag-about-industry-row {
  display: flex; flex-wrap: wrap; gap: 2mm;
  flex: 1;
}
.wag-about-chip {
  display: inline-flex; align-items: center; gap: 1.5mm;
  padding: 1.2mm 3mm;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8pt; font-weight: 600;
  color: #1a1a1a;
  background: rgba(201,148,31,0.08);
  border: 1px solid rgba(201,148,31,0.35);
  border-radius: 999px;
  letter-spacing: -0.005em;
}
.wag-about-chip svg { color: #C9941F; flex-shrink: 0; }
.wag-about-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 1mm;
}
.wag-about-col {
  display: flex; flex-direction: column; gap: 2mm;
  padding: 4mm 4mm 4mm 5mm;
  background: rgba(201,148,31,0.05);
  border-left: 2px solid #C9941F;
}
.wag-about-col h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10pt; font-weight: 700; margin: 0;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #B0791C;
}
.wag-about-col p {
  font-family: 'Onest', sans-serif;
  font-size: 9pt; line-height: 1.5;
  color: #2a2a2a; margin: 0;
}
.wag-legal-label {
  margin-top: 5mm;
  font-family: 'Courier New', monospace;
  font-size: 8pt;
  letter-spacing: 0.22em;
  color: #B0791C;
  text-transform: uppercase;
  margin-bottom: 5mm;
  position: relative;
  padding-left: 14mm;
}
.wag-legal-label::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 11mm; height: 1px;
  background: #C9941F;
  transform: translateY(-50%);
}
.wag-legal-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4mm;
}
.wag-legal-card {
  position: relative;
  border: 1px solid rgba(176,121,28,0.35);
  background: rgba(201,148,31,0.04);
  padding: 5mm 4mm 3.5mm;
  display: flex;
  flex-direction: column;
  gap: 1.2mm;
  break-inside: avoid;
}
.wag-legal-card-primary {
  background: #1a1a1a;
  border-color: #C9941F;
}
.wag-legal-card-primary .wag-legal-name { color: #F0F2F8; }
.wag-legal-card-primary .wag-legal-role { color: #F0C85A; }
.wag-legal-card-primary .wag-legal-meta {
  color: rgba(240,242,248,0.6);
  border-top-color: rgba(201,148,31,0.35);
}
.wag-legal-badge {
  position: absolute;
  top: -2.5mm; right: 4mm;
  font-family: 'Courier New', monospace;
  font-size: 7pt; font-weight: 700;
  letter-spacing: 0.18em;
  background: #C9941F;
  color: #04060C;
  padding: 0.8mm 2.5mm;
  border-radius: 2px;
}
.wag-legal-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10.5pt;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.25;
}
.wag-legal-role {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8pt;
  font-weight: 500;
  color: #B0791C;
  line-height: 1.3;
}
.wag-legal-meta {
  margin-top: auto;
  padding-top: 2.5mm;
  border-top: 1px solid rgba(176,121,28,0.2);
  font-family: 'Courier New', monospace;
  font-size: 7pt;
  letter-spacing: 0.05em;
  color: #555;
  line-height: 1.4;
}
`;

const GEO_PAGE_CSS = `
.wag-geo-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  position: relative; z-index: 3;
  display: flex; flex-direction: column;
}

.wag-geo-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(201,148,31,0.35);
  margin-bottom: 4mm;
}
.wag-geo-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-geo-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 26pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #F0F2F8;
}
.wag-geo-title strong { color: #C9941F; font-weight: 700; }

.wag-geo-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: flex-end;
  border-left: 2px solid #C9941F;
  padding-left: 5mm;
}
.wag-geo-stamp-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 36pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.025em;
}
.wag-geo-stamp-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
  text-align: right; line-height: 1.3;
  margin-top: 1.5mm;
}

.wag-geo-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10pt; line-height: 1.55;
  color: rgba(240,242,248,0.85);
  max-width: 165mm;
  margin: 0 0 5mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}

.wag-geo-mapframe {
  position: relative;
  flex: 1;
  min-height: 130mm;
  margin: 0 -2mm 5mm;
  border: 1px solid rgba(201,148,31,0.25);
  background: rgba(13,18,34,0.4);
  padding: 4mm;
}
.wag-geo-mapimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.wag-geo-mapsvg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

.wag-geo-corner {
  position: absolute;
  width: 6mm; height: 6mm;
  border-color: #C9941F;
  border-style: solid;
  border-width: 0;
}
.wag-geo-corner-tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
.wag-geo-corner-tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
.wag-geo-corner-bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
.wag-geo-corner-br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }

.wag-geo-corner-coords {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.14em;
  color: rgba(201,148,31,0.55);
  text-transform: uppercase;
}
.wag-geo-corner-coords-tl { top: 2mm; left: 8mm; }
.wag-geo-corner-coords-br { bottom: 2mm; right: 8mm; }

.wag-geo-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 4mm;
  margin-bottom: 5mm;
}
.wag-geo-stat {
  display: flex; flex-direction: column; align-items: flex-start; gap: 1mm;
  padding: 3mm 4mm;
  border-left: 2px solid #C9941F;
  background: rgba(255,255,255,0.02);
}
.wag-geo-stat-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 24pt;
  line-height: 1;
  letter-spacing: -0.025em;
}
.wag-geo-stat-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.16em;
  color: rgba(240,242,248,0.65); text-transform: uppercase;
}

.wag-geo-regions {
  display: flex; align-items: center; gap: 5mm;
  padding-top: 4mm;
  border-top: 1px solid rgba(201,148,31,0.25);
}
.wag-geo-regions-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  flex-shrink: 0;
}
.wag-geo-regions-row {
  display: flex; flex-wrap: wrap; gap: 2mm;
  flex: 1;
}
.wag-geo-region {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.5pt; font-weight: 600;
  color: rgba(240,242,248,0.85);
  padding: 1mm 3mm;
  background: rgba(201,148,31,0.08);
  border: 1px solid rgba(201,148,31,0.3);
  border-radius: 999px;
  letter-spacing: -0.005em;
}
`;

const ISO_PAGE_CSS = `
.wag-section-iso { padding: 18mm 22mm 14mm !important; }

.wag-iso-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 10mm; margin-bottom: 5mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(176,121,28,0.25);
}

.wag-iso-stamp {
  display: flex; flex-direction: column; align-items: flex-end;
  flex-shrink: 0;
  border-left: 2px solid #C9941F;
  padding-left: 5mm;
}
.wag-iso-stamp-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 36pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.025em;
}
.wag-iso-stamp-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
  text-align: right; line-height: 1.3;
  margin-top: 1.5mm;
}

.wag-iso-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10pt; line-height: 1.5;
  color: #2a2a2a; margin: 0 0 6mm;
  max-width: 165mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
  font-style: italic;
}

.wag-iso-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5mm;
  margin-bottom: 7mm;
}

.wag-iso-card {
  display: flex; gap: 4mm;
  padding: 4mm;
  background: #fff;
  border: 1px solid #C9941F;
  break-inside: avoid;
}

.wag-iso-card-imgwrap {
  flex-shrink: 0;
  width: 30mm; height: 40mm;
  background: #f0ead8;
  border: 1px solid rgba(176,121,28,0.25);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.wag-iso-img {
  max-width: 100%; max-height: 100%;
  width: auto; height: auto;
  object-fit: contain;
  display: block;
}

.wag-iso-meta {
  display: flex; flex-direction: column; justify-content: center;
  gap: 1.5mm; flex: 1; min-width: 0;
}
.wag-iso-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10pt; font-weight: 700;
  color: #1a1a1a; line-height: 1.25;
}
.wag-iso-detail {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.05em;
  color: #B0791C; line-height: 1.4;
}

.wag-iso-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6mm;
  padding-top: 5mm;
  border-top: 1px solid rgba(176,121,28,0.3);
  margin-top: auto;
}
.wag-iso-footer-item {
  display: flex; flex-direction: column; gap: 1mm;
  padding-left: 4mm;
  border-left: 2px solid #C9941F;
}
.wag-iso-footer-label {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.18em;
  color: #B0791C; text-transform: uppercase;
}
.wag-iso-footer-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9pt; font-weight: 600;
  color: #1a1a1a; line-height: 1.35;
}
`;

const DESIGN_PAGE_CSS = `
.wag-design-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  position: relative; z-index: 3;
  display: flex; flex-direction: column;
}

.wag-design-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(201,148,31,0.3);
  margin-bottom: 5mm;
}
.wag-design-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-design-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 26pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #F0F2F8;
}
.wag-design-title strong {
  color: #C9941F; font-weight: 700;
}
.wag-design-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  gap: 1mm;
  padding: 4mm 5mm;
  border: 1.5px solid #C9941F;
  background: rgba(201,148,31,0.08);
  border-radius: 2px;
}
.wag-design-stamp-cat {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 16pt;
  color: #C9941F; letter-spacing: 0.02em;
  line-height: 1;
}
.wag-design-stamp-since {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.18em;
  color: rgba(240,242,248,0.7); text-transform: uppercase;
}

.wag-design-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10.5pt; line-height: 1.55;
  color: rgba(240,242,248,0.85);
  max-width: 165mm;
  margin: 0 0 8mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}

.wag-design-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5mm 8mm;
  margin-bottom: 9mm;
}
.wag-design-item {
  display: grid;
  grid-template-columns: 9mm 1fr;
  gap: 3mm;
  padding: 3mm 0 3mm 0;
  border-top: 1px solid rgba(201,148,31,0.18);
  break-inside: avoid;
}
.wag-design-item-num {
  font-family: 'Outfit', sans-serif;
  font-size: 16pt;
  font-weight: 300;
  color: rgba(201,148,31,0.55);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  padding-top: 0.5mm;
}
.wag-design-item-body { display: flex; flex-direction: column; gap: 1.5mm; flex: 1; }
.wag-design-item-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10.5pt; font-weight: 700;
  color: #F0F2F8; line-height: 1.3;
}
.wag-design-item-desc {
  font-family: 'Onest', sans-serif;
  font-size: 8.5pt; line-height: 1.55;
  color: rgba(240,242,248,0.7);
}

.wag-design-flow-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  margin-bottom: 4mm;
  padding-left: 14mm;
  position: relative;
}
.wag-design-flow-label::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 11mm; height: 1px;
  background: #C9941F;
  transform: translateY(-50%);
}

.wag-design-flow {
  display: flex; align-items: stretch;
  gap: 2mm;
  margin-bottom: auto;
  padding-bottom: 4mm;
}
.wag-design-flow-step {
  flex: 1;
  display: flex; flex-direction: column;
  gap: 1.5mm;
  padding: 4mm 4mm 4mm 5mm;
  background: rgba(201,148,31,0.06);
  border-left: 2px solid #C9941F;
}
.wag-design-flow-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 18pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.02em;
}
.wag-design-flow-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10pt; font-weight: 700;
  color: #F0F2F8; line-height: 1.2;
  margin-top: 1mm;
}
.wag-design-flow-desc {
  font-family: 'Onest', sans-serif;
  font-size: 8pt; line-height: 1.4;
  color: rgba(240,242,248,0.65);
}
.wag-design-flow-arrow {
  flex-shrink: 0;
  align-self: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16pt;
  color: #C9941F;
  font-weight: 300;
  padding: 0 1mm;
}

.wag-design-footer {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-top: 4mm;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.wag-design-footer-stat {
  display: flex; align-items: baseline; gap: 3mm;
}
.wag-design-footer-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 24pt;
  color: #C9941F; line-height: 1;
  letter-spacing: -0.02em;
}
.wag-design-footer-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.16em;
  color: rgba(240,242,248,0.6); text-transform: uppercase;
}
.wag-design-footer-meta {
  display: flex; align-items: center; gap: 3mm;
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.14em;
  color: rgba(240,242,248,0.55);
  text-transform: uppercase;
}
.wag-design-footer-dot { color: #C9941F; }
`;

const CONTACTS_PAGE_CSS = `
.wag-contacts-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  position: relative; z-index: 3;
  display: flex; flex-direction: column;
}

.wag-contacts-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(201,148,31,0.35);
  margin-bottom: 5mm;
}
.wag-contacts-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-contacts-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 28pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #F0F2F8;
}
.wag-contacts-title strong {
  color: #C9941F; font-weight: 700;
}

.wag-contacts-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  gap: 1mm;
  padding: 4mm 6mm;
  border: 1.5px solid #C9941F;
  background: rgba(201,148,31,0.08);
  border-radius: 2px;
}
.wag-contacts-stamp-tag {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.2em;
  color: rgba(240,242,248,0.7); text-transform: uppercase;
}
.wag-contacts-stamp-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 22pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.02em;
  margin: 0.5mm 0;
}

.wag-contacts-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10pt; line-height: 1.55;
  color: rgba(240,242,248,0.85);
  max-width: 165mm;
  margin: 0 0 6mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}

.wag-contacts-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4mm 8mm;
  margin-bottom: 6mm;
}
.wag-contact-item {
  display: flex; gap: 4mm; align-items: flex-start;
  padding-left: 4mm;
  border-left: 2px solid #C9941F;
}
.wag-contact-icon {
  flex-shrink: 0;
  width: 8mm; height: 8mm;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(201,148,31,0.4);
  background: rgba(201,148,31,0.08);
  border-radius: 2px;
  color: #C9941F;
  margin-top: 0.5mm;
}
.wag-contact-body { display: flex; flex-direction: column; gap: 1mm; flex: 1; min-width: 0; }
.wag-contact-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.2em;
  color: #C9941F; text-transform: uppercase;
}
.wag-contact-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12pt; font-weight: 600;
  color: #F0F2F8; line-height: 1.3;
}
.wag-contact-value-sm { font-size: 10pt; line-height: 1.4; }

.wag-contacts-team-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #C9941F; text-transform: uppercase;
  margin-bottom: 4mm;
  padding-left: 14mm;
  position: relative;
}
.wag-contacts-team-label::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 11mm; height: 1px;
  background: #C9941F;
  transform: translateY(-50%);
}

.wag-contacts-team {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4mm 6mm;
  margin-bottom: auto;
}
.wag-team-item {
  display: grid;
  grid-template-columns: 9mm 1fr;
  gap: 3mm;
  padding: 3mm 4mm;
  background: rgba(201,148,31,0.05);
  border-left: 2px solid #C9941F;
  break-inside: avoid;
}
.wag-team-num {
  font-family: 'Outfit', sans-serif;
  font-size: 18pt; font-weight: 400;
  color: #C9941F;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  padding-top: 0.5mm;
}
.wag-team-body { display: flex; flex-direction: column; gap: 1mm; min-width: 0; }
.wag-team-role {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.16em;
  color: #C9941F; text-transform: uppercase;
}
.wag-team-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9.5pt; font-weight: 600;
  color: #F0F2F8; line-height: 1.25;
}
.wag-team-phone {
  font-family: 'Courier New', monospace;
  font-size: 9pt; font-weight: 700;
  color: #F0F2F8; letter-spacing: 0.04em;
  margin-top: 0.5mm;
}

.wag-contacts-legal {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4mm 6mm;
  padding: 4mm 0;
  margin-top: 5mm;
  border-top: 1px solid rgba(201,148,31,0.25);
  border-bottom: 1px solid rgba(201,148,31,0.25);
}
.wag-contacts-legal-item { display: flex; flex-direction: column; gap: 1mm; }
.wag-contacts-legal-label {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.2em;
  color: #C9941F; text-transform: uppercase;
}
.wag-contacts-legal-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9pt; font-weight: 500;
  color: rgba(240,242,248,0.85);
  letter-spacing: 0;
  line-height: 1.4;
}

.wag-contacts-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 4mm;
}
.wag-contacts-footer-left { display: flex; flex-direction: column; gap: 1mm; }
.wag-contacts-footer-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.2em;
  color: #C9941F; text-transform: uppercase;
}
.wag-contacts-footer-site {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 28pt;
  color: #C9941F; letter-spacing: -0.01em;
  line-height: 1;
}
.wag-contacts-triangle {
  width: 24mm; height: 22mm;
  opacity: 0.85;
}
`;

const PARTNERS_PAGE_CSS = `
.wag-partners-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  display: flex; flex-direction: column;
}

.wag-partners-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(176,121,28,0.3);
  margin-bottom: 5mm;
}
.wag-partners-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #B0791C; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-partners-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 24pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #1a1a1a;
}
.wag-partners-title strong { color: #B0791C; font-weight: 700; }
.wag-partners-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: flex-end;
  border-left: 2px solid #C9941F;
  padding-left: 5mm;
}
.wag-partners-stamp-tags {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 1.5mm;
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
}
.wag-partners-stamp-tags span {
  padding: 0.8mm 2.5mm;
  background: rgba(201,148,31,0.08);
  border: 1px solid rgba(201,148,31,0.35);
  border-radius: 999px;
  white-space: nowrap;
}

.wag-partners-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10.5pt; line-height: 1.55;
  color: #2a2a2a;
  max-width: 165mm;
  margin: 0 0 6mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}

.wag-partners-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4mm;
  flex: 1;
  align-content: start;
  margin-bottom: 5mm;
}

.wag-partner-card {
  display: flex; flex-direction: column;
  align-items: center; gap: 2mm;
  padding: 4mm 3mm 3mm;
  background: #fff;
  border: 1px solid rgba(176,121,28,0.22);
  border-top: 2px solid #C9941F;
  border-radius: 2px;
  break-inside: avoid;
}
.wag-partner-logo {
  width: 100%;
  height: 18mm;
  object-fit: contain;
  display: block;
}
.wag-partner-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 7.5pt; font-weight: 600;
  color: #1a1a1a; text-align: center;
  line-height: 1.25;
}

.wag-partners-footer {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-top: 4mm;
  border-top: 1px solid rgba(0,0,0,0.1);
  margin-top: auto;
}
.wag-partners-footer-stat {
  display: flex; align-items: baseline; gap: 3mm;
}
.wag-partners-footer-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 24pt;
  color: #C9941F; line-height: 1;
  letter-spacing: -0.02em;
}
.wag-partners-footer-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.16em;
  color: #777; text-transform: uppercase;
}
.wag-partners-footer-meta {
  display: flex; align-items: center; gap: 3mm;
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.14em;
  color: #777; text-transform: uppercase;
}
.wag-partners-footer-dot { color: #C9941F; }
`;

const TESTIMONIALS_PAGE_CSS = `
.wag-test-inner {
  padding: 16mm 18mm 12mm;
  height: 100%;
  display: flex; flex-direction: column;
}

.wag-test-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(176,121,28,0.3);
  margin-bottom: 4mm;
}
.wag-test-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #B0791C; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-test-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 24pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #1a1a1a;
}
.wag-test-title strong { color: #B0791C; font-weight: 700; }
.wag-test-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: flex-end;
  border-left: 2px solid #C9941F;
  padding-left: 5mm;
}
.wag-test-stamp-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 30pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.025em;
}
.wag-test-stamp-label {
  font-family: 'Courier New', monospace;
  font-size: 7pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
  text-align: right; line-height: 1.3;
  margin-top: 1mm;
}

.wag-test-contd {
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.18em;
  color: #B0791C; text-transform: uppercase;
  padding-bottom: 3mm; margin-bottom: 4mm;
  border-bottom: 1px solid rgba(176,121,28,0.3);
}

.wag-test-lead {
  font-family: 'Onest', sans-serif;
  font-size: 9pt; line-height: 1.5;
  color: #555;
  font-style: italic;
  margin: 0 0 4mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
  max-width: 165mm;
}

.wag-test-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3mm;
  flex: 1;
  align-content: start;
}

.wag-test-card {
  background: #fff;
  border: 1px solid rgba(176,121,28,0.22);
  border-top: 2px solid #C9941F;
  padding: 3mm 3.5mm;
  display: flex; flex-direction: column; gap: 1.5mm;
  break-inside: avoid;
}

.wag-test-card-head {
  display: flex; justify-content: space-between; align-items: center;
  gap: 2mm;
}
.wag-test-card-cat {
  font-family: 'Courier New', monospace;
  font-size: 6.5pt; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #C9941F;
  background: rgba(201,148,31,0.08);
  border: 1px solid rgba(201,148,31,0.25);
  border-radius: 999px;
  padding: 0.7mm 2.2mm;
  white-space: nowrap;
}
.wag-test-card-date {
  font-family: 'Courier New', monospace;
  font-size: 6.5pt; letter-spacing: 0.04em;
  color: #999; white-space: nowrap;
}

.wag-test-card-client {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8.5pt !important; font-weight: 700 !important;
  color: #1a1a1a !important; line-height: 1.25 !important;
  margin: 0; letter-spacing: -0.005em;
  display: block !important;
}

.wag-test-card-quote {
  font-family: 'Onest', sans-serif;
  font-size: 7pt !important; line-height: 1.4 !important;
  color: #2a2a2a !important;
  margin: 0;
  padding: 1.5mm 2mm;
  background: rgba(201,148,31,0.05);
  border-left: 1.5px solid #C9941F;
  font-style: italic;
  display: block !important;
}

.wag-test-card-sig {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 2mm;
  padding-top: 1.5mm;
  border-top: 1px solid rgba(0,0,0,0.08);
}
.wag-test-card-sig-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 7.5pt; font-weight: 700;
  color: #1a1a1a;
}
.wag-test-card-sig-role {
  font-family: 'Courier New', monospace;
  font-size: 6.5pt; letter-spacing: 0.04em;
  color: #777; text-align: right;
}
`;

const QR_PAGE_CSS = `
.wag-qr-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  display: flex; flex-direction: column;
}

.wag-qr-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(176,121,28,0.3);
  margin-bottom: 5mm;
}
.wag-qr-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #B0791C; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-qr-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 26pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #1a1a1a;
}
.wag-qr-title strong { color: #B0791C; font-weight: 700; }

.wag-qr-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: flex-end;
  border-left: 2px solid #C9941F;
  padding-left: 5mm;
}
.wag-qr-stamp-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 36pt;
  line-height: 1; color: #C9941F;
  letter-spacing: -0.025em;
}
.wag-qr-stamp-label {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.16em;
  color: #B0791C; text-transform: uppercase;
  text-align: right; line-height: 1.3;
  margin-top: 1.5mm;
}

.wag-qr-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10.5pt; line-height: 1.55;
  color: #2a2a2a;
  max-width: 165mm;
  margin: 0 0 7mm;
  padding-left: 5mm;
  border-left: 2px solid #C9941F;
}

.wag-qr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5mm;
  margin-bottom: 7mm;
}
.wag-qr-card {
  position: relative;
  display: flex; flex-direction: column;
  background: #fff;
  border: 1px solid rgba(176,121,28,0.4);
  padding: 5mm 5mm 5mm;
  break-inside: avoid;
}
.wag-qr-card-gold { border-top: 3px solid #C9941F; }
.wag-qr-card-teal { border-top: 3px solid #00A88E; }

.wag-qr-card-head {
  display: grid;
  grid-template-columns: 9mm 1fr;
  gap: 3mm;
  align-items: start;
  padding-bottom: 3mm;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
.wag-qr-card-num {
  font-family: 'Outfit', sans-serif;
  font-size: 16pt; font-weight: 300;
  color: rgba(176,121,28,0.55);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  padding-top: 0.5mm;
}
.wag-qr-card-teal .wag-qr-card-num { color: rgba(0,168,142,0.6); }
.wag-qr-card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14pt; font-weight: 700;
  color: #1a1a1a; line-height: 1.2;
}

.wag-qr-card-stat {
  display: flex; align-items: baseline; gap: 3mm;
  padding: 4mm 0 4mm;
}
.wag-qr-card-count {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 36pt;
  line-height: 1;
  letter-spacing: -0.025em;
}
.wag-qr-card-countlabel {
  font-family: 'Courier New', monospace;
  font-size: 7.5pt; letter-spacing: 0.1em;
  color: #555; text-transform: uppercase;
  line-height: 1.4;
}

.wag-qr-code {
  width: 42mm; height: 42mm;
  align-self: center;
  padding: 2mm;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  margin: 1mm 0 4mm;
}
.wag-qr-code svg { width: 100%; height: 100%; display: block; }

.wag-qr-card-foot {
  margin-top: auto;
  padding-top: 3mm;
  border-top: 1px dashed rgba(0,0,0,0.12);
  text-align: center;
}
.wag-qr-card-url {
  font-family: 'Courier New', monospace;
  font-size: 9pt; font-weight: 700;
  color: #1a1a1a; letter-spacing: 0.03em;
}
.wag-qr-card-hint {
  margin-top: 1mm;
  font-family: 'Onest', sans-serif;
  font-size: 7.5pt; color: #888;
}

.wag-qr-info-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #B0791C; text-transform: uppercase;
  margin-bottom: 4mm;
  padding-left: 14mm;
  position: relative;
}
.wag-qr-info-label::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 11mm; height: 1px;
  background: #C9941F;
  transform: translateY(-50%);
}

.wag-qr-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5mm;
  margin-bottom: auto;
}
.wag-qr-info-item {
  display: flex; gap: 3mm; align-items: flex-start;
  padding: 3mm 4mm 3mm 5mm;
  background: rgba(201,148,31,0.05);
  border-left: 2px solid #C9941F;
}
.wag-qr-info-num {
  font-family: 'Outfit', sans-serif;
  font-size: 18pt; line-height: 0.6;
  color: #C9941F;
  font-weight: 800;
}
.wag-qr-info-body { display: flex; flex-direction: column; gap: 1mm; flex: 1; }
.wag-qr-info-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 9.5pt; font-weight: 700;
  color: #1a1a1a; line-height: 1.25;
}
.wag-qr-info-desc {
  font-family: 'Onest', sans-serif;
  font-size: 8pt; line-height: 1.45;
  color: #555;
}

.wag-qr-footer {
  display: flex; align-items: center; gap: 3mm;
  padding-top: 4mm;
  margin-top: 5mm;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.14em;
  color: #777; text-transform: uppercase;
  justify-content: space-between;
}
.wag-qr-footer-dot { color: #C9941F; }
`;

const BUILD_PAGE_CSS = `
.wag-build-inner {
  padding: 18mm 22mm 14mm;
  height: 100%;
  position: relative; z-index: 3;
  display: flex; flex-direction: column;
}

.wag-build-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid rgba(0,168,142,0.35);
  margin-bottom: 5mm;
}
.wag-build-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #00C4A7; text-transform: uppercase;
  margin-bottom: 3mm;
}
.wag-build-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700; font-size: 26pt;
  line-height: 1.05; margin: 0;
  letter-spacing: -0.015em;
  color: #F0F2F8;
}
.wag-build-title strong {
  color: #00C4A7; font-weight: 700;
}
.wag-build-stamp {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  gap: 1mm;
  padding: 4mm 5mm;
  border: 1.5px solid #00C4A7;
  background: rgba(0,168,142,0.1);
  border-radius: 2px;
}
.wag-build-stamp-cat {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 16pt;
  color: #00C4A7; letter-spacing: 0.02em;
  line-height: 1;
}
.wag-build-stamp-since {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.18em;
  color: rgba(240,242,248,0.7); text-transform: uppercase;
}

.wag-build-lead {
  font-family: 'Onest', sans-serif;
  font-size: 10.5pt; line-height: 1.55;
  color: rgba(240,242,248,0.85);
  max-width: 165mm;
  margin: 0 0 8mm;
  padding-left: 5mm;
  border-left: 2px solid #00C4A7;
}

.wag-build-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5mm 8mm;
  margin-bottom: 9mm;
}
.wag-build-item {
  display: grid;
  grid-template-columns: 9mm 1fr;
  gap: 3mm;
  padding: 3mm 0;
  border-top: 1px solid rgba(0,168,142,0.22);
  break-inside: avoid;
}
.wag-build-item-num {
  font-family: 'Outfit', sans-serif;
  font-size: 16pt;
  font-weight: 300;
  color: rgba(0,196,167,0.6);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  padding-top: 0.5mm;
}
.wag-build-item-body { display: flex; flex-direction: column; gap: 1.5mm; flex: 1; }
.wag-build-item-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10.5pt; font-weight: 700;
  color: #F0F2F8; line-height: 1.3;
}
.wag-build-item-desc {
  font-family: 'Onest', sans-serif;
  font-size: 8.5pt; line-height: 1.55;
  color: rgba(240,242,248,0.7);
}

.wag-build-flow-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.22em;
  color: #00C4A7; text-transform: uppercase;
  margin-bottom: 4mm;
  padding-left: 14mm;
  position: relative;
}
.wag-build-flow-label::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  width: 11mm; height: 1px;
  background: #00C4A7;
  transform: translateY(-50%);
}

.wag-build-flow {
  display: flex; align-items: stretch;
  gap: 2mm;
  margin-bottom: auto;
  padding-bottom: 4mm;
}
.wag-build-flow-step {
  flex: 1;
  display: flex; flex-direction: column;
  gap: 1.5mm;
  padding: 4mm 4mm 4mm 5mm;
  background: rgba(0,168,142,0.07);
  border-left: 2px solid #00C4A7;
}
.wag-build-flow-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 18pt;
  line-height: 1; color: #00C4A7;
  letter-spacing: -0.02em;
}
.wag-build-flow-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10pt; font-weight: 700;
  color: #F0F2F8; line-height: 1.2;
  margin-top: 1mm;
}
.wag-build-flow-desc {
  font-family: 'Onest', sans-serif;
  font-size: 8pt; line-height: 1.4;
  color: rgba(240,242,248,0.65);
}
.wag-build-flow-arrow {
  flex-shrink: 0;
  align-self: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16pt;
  color: #00C4A7;
  font-weight: 300;
  padding: 0 1mm;
}

.wag-build-footer {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-top: 4mm;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.wag-build-footer-stat {
  display: flex; align-items: baseline; gap: 3mm;
}
.wag-build-footer-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800; font-size: 24pt;
  color: #00C4A7; line-height: 1;
  letter-spacing: -0.02em;
}
.wag-build-footer-label {
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.16em;
  color: rgba(240,242,248,0.6); text-transform: uppercase;
}
.wag-build-footer-meta {
  display: flex; align-items: center; gap: 3mm;
  font-family: 'Courier New', monospace;
  font-size: 8pt; letter-spacing: 0.14em;
  color: rgba(240,242,248,0.55);
  text-transform: uppercase;
}
.wag-build-footer-dot { color: #00C4A7; }
`;

const SVCS_DESIGN = [
  { title: 'Engineering & geodetic surveys',     desc: 'Topographic survey, axis layout, geodetic networks, deformation monitoring — for linear and area facilities.' },
  { title: 'Engineering & geological surveys',   desc: 'Drilling, laboratory soil testing, hydrogeology, seismicity assessment at design sites.' },
  { title: 'Design & estimate documentation',    desc: 'Working documentation and feasibility studies for roads, pipelines and power lines; clearing State Expert Review (GosExpertiza).' },
  { title: 'Technical conditions for connection', desc: 'Coordination with branches of JSC NC KTZ and grid companies, feasibility studies, track and network development plans.' },
  { title: 'Engineering networks design',        desc: '10/110 kV overhead lines, gas and oil pipelines, water supply, sewerage, heat supply, fibre and communication cable lines.' },
  { title: 'Land management projects',           desc: 'Land plot formation, documentation for land allocation for capital construction and linear facilities.' },
];

const SVCS_BUILD = [
  { title: 'Roads & railways',                   desc: 'Track superstructure — R65 rail lattice, 1/9 and 1/7 turnouts, ballasting; Class I–V roads, airfield runways.' },
  { title: 'Trunk pipelines & tanks',            desc: 'High/medium pressure oil and gas pipelines, product pipelines, steel tanks — including for hazardous media.' },
  { title: 'Power transmission & communication lines', desc: 'Overhead lines up to 35 kV, up to 110 kV and above, railway contact network, national communication and telecommunication lines.' },
  { title: 'Industrial facilities & structures', desc: 'Load-bearing and enclosing structures, installation of metal and reinforced concrete structures, smoke stacks, silos, bridges and overpasses.' },
  { title: 'Engineering networks, signalling & contact lines', desc: 'Water, heat and gas supply, outdoor lighting, railway electrification, traffic lights and crossing signalling.' },
  { title: 'Railway maintenance & dismantling', desc: 'Track measurements twice a month, sleeper and rail replacement, turnout maintenance, dismantling of track superstructure and BMRC equipment.' },
];

export default async function PortfolioPrintPage() {
  const projects = await getProjects();
  const designProjects = await getDesignProjects();

  const completed  = projects.filter(p => p.status === 'completed').length;
  const inProgress = projects.filter(p => p.status === 'in-progress').length;
  const planned    = projects.filter(p => p.status === 'planned').length;

  const TOTAL = 16;
  const p = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;

  return (
    <main className={styles.book}>
      <PrintButtons />

      {/* ═══ 01 · COVER ═══ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <div className={styles.coverGrid} />
        <div className={styles.coverContent}>
          <div className={styles.coverEyebrow}>PORTFOLIO · 2026</div>
          <WagTriangle className={styles.coverTriangle} />
          <h1 className={styles.coverTitle}>
            WEST ARLAN<br />
            <span className={styles.coverTitleAccent}>GROUP</span>
          </h1>
          <p className={styles.coverPositioning}>
            Surveys · design · construction<br />
            of infrastructure in Kazakhstan and Russia
          </p>
        </div>
        <div className={styles.coverBottom}>
          <span>AKTOBE · REPUBLIC OF KAZAKHSTAN</span>
          <span>ARLAN-GR.KZ</span>
        </div>
      </section>

      {/* ═══ 02 · ABOUT ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(2)} />
        <style>{ABOUT_PAGE_CSS}</style>
        <div className={`${styles.sectionInner} wag-section-about`}>

          <div className="wag-about-head">
            <div className="wag-about-head-left">
              <div className={styles.sectionLabel}>About the company · since 2010</div>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                We build the country&apos;s<br />
                <span className={styles.sectionTitleAccent}>infrastructure</span>
              </div>
            </div>
            <div className="wag-about-stats">
              <div className="wag-about-stat">
                <span className="wag-about-stat-num">15+</span>
                <span className="wag-about-stat-label">years on market</span>
              </div>
              <div className="wag-about-stat-divider" aria-hidden="true" />
              <div className="wag-about-stat">
                <span className="wag-about-stat-num">5</span>
                <span className="wag-about-stat-label">industries</span>
              </div>
              <div className="wag-about-stat-divider" aria-hidden="true" />
              <div className="wag-about-stat">
                <span className="wag-about-stat-num">16</span>
                <span className="wag-about-stat-label">regions</span>
              </div>
            </div>
          </div>

          <div className="wag-about-lead">
            Full cycle — from surveys and design through construction to turnkey commissioning.
            Transport, energy, oil & gas and industrial infrastructure in Kazakhstan and Russia:
            chief project engineers, design engineers, surveyors, estimators, foremen and signalling
            engineers working on projects that serve for decades.
          </div>

          {/* ── Industry chips ── */}
          <div className="wag-about-industries">
            <span className="wag-about-industries-label">Industries</span>
            <div className="wag-about-industry-row">
              <span className="wag-about-chip">
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 12h12M4 8h8M3 4h10" />
                </svg>
                Railways & roads
              </span>
              <span className="wag-about-chip">
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 5h12M2 11h12" /><circle cx="5" cy="5" r="1.2" /><circle cx="11" cy="11" r="1.2" />
                </svg>
                Pipelines
              </span>
              <span className="wag-about-chip">
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" />
                </svg>
                Power & communication lines
              </span>
              <span className="wag-about-chip">
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 14V6l5-3 5 3v8M2 14h12M6 14V9h2v5" />
                </svg>
                Industrial facilities
              </span>
              <span className="wag-about-chip">
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2v12M3.5 4.5l9 7M12.5 4.5l-9 7" />
                </svg>
                Engineering networks
              </span>
            </div>
          </div>

          <div className="wag-about-grid">
            <div className="wag-about-col">
              <h3>· Our mission</h3>
              <p>
                To build reliable infrastructure for the future of Kazakhstan. A key reason for
                the company&apos;s success is the coordinated work of our specialists, their
                dedication and result-driven mindset. We rigorously follow our values, building
                a positive company image and strengthening partner trust.
              </p>
            </div>
            <div className="wag-about-col">
              <h3>· Approach to work</h3>
              <p>
                One contract — one accountable party. The group covers the entire cycle in-house:
                engineering surveys, design and working documentation, clearance through the State
                Expert Review (GosExpertiza), construction works and facility commissioning. Timing
                and quality are backed by Class I licenses and ISO 9001 / 14001 systems.
              </p>
            </div>
          </div>

          {/* ── Legal entities ── */}
          <div className="wag-legal-label">Group legal entities</div>
          <div className="wag-legal-cards">
            <div className="wag-legal-card wag-legal-card-primary">
              <div className="wag-legal-badge">HQ</div>
              <div className="wag-legal-name">West Arlan Group</div>
              <div className="wag-legal-role">Holding company · coordination</div>
              <div className="wag-legal-meta">LLP · BIN 090940003245 · Aktobe</div>
            </div>
            <div className="wag-legal-card">
              <div className="wag-legal-badge">CIW</div>
              <div className="wag-legal-name">West Capital Construction LLP</div>
              <div className="wag-legal-role">Group member · construction & installation works</div>
              <div className="wag-legal-meta">Contracting history since 2010</div>
            </div>
            <div className="wag-legal-card">
              <div className="wag-legal-badge">DSGN</div>
              <div className="wag-legal-name">Global Construction Project</div>
              <div className="wag-legal-role">Group member · design activity</div>
              <div className="wag-legal-meta">Design docs, feasibility studies, expert review</div>
            </div>
          </div>
          <div className={styles.legalNote}>
            West Capital Construction LLP and Global Construction Project are part of the group
            under West Arlan Group, operating under a unified quality policy with Class I
            licenses.
          </div>

          <WagTriangle className={styles.aboutWatermark} />
        </div>
      </section>

      {/* ═══ 03 · NUMBERS ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(3)} />
        <div className={styles.numbersInner}>
          <div className={`${styles.sectionLabel} ${styles.darkLabel}`}>Scale of work</div>
          <div className={styles.darkTitle}>Over fifteen years<br />of operation</div>
          <div className={styles.numbersGrid}>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>{projects.length}</div>
              <div className={styles.numberLabel}>CIW projects</div>
              <div className={styles.numberDesc}>
                Completed and current construction & installation projects in the registry since 2015
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>{designProjects.length}</div>
              <div className={styles.numberLabel}>Design works</div>
              <div className={styles.numberDesc}>
                Working drafts, feasibility studies, land-management projects with completed expert review
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>16</div>
              <div className={styles.numberLabel}>regions</div>
              <div className={styles.numberDesc}>
                Aktobe, West Kazakhstan, Atyrau, Mangistau, Almaty, Astana regions and others
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>2</div>
              <div className={styles.numberLabel}>countries</div>
              <div className={styles.numberDesc}>
                Kazakhstan and Russia (JSC Uralskaya Stal, Orenburg Region)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 04 · GEOGRAPHY ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(4)} />
        <style>{GEO_PAGE_CSS}</style>
        <div className="wag-geo-inner">

          <div className="wag-geo-head">
            <div>
              <div className="wag-geo-eyebrow">Work geography · 16 regions · 2 countries</div>
              <div className="wag-geo-title">
                <strong>Map</strong> of projects
              </div>
            </div>
            <div className="wag-geo-stamp">
              <span className="wag-geo-stamp-num">16</span>
              <span className="wag-geo-stamp-label">regions of<br />Kazakhstan</span>
            </div>
          </div>

          <div className="wag-geo-lead">
            Projects across Kazakhstan — from Atyrau to Khorgos, from Uralsk to Semey — and in the
            Orenburg Region of the Russian Federation (JSC Uralskaya Stal, Novotroitsk).
          </div>

          <div className="wag-geo-mapframe">
            <span className="wag-geo-corner wag-geo-corner-tl" aria-hidden="true" />
            <span className="wag-geo-corner wag-geo-corner-tr" aria-hidden="true" />
            <span className="wag-geo-corner wag-geo-corner-bl" aria-hidden="true" />
            <span className="wag-geo-corner wag-geo-corner-br" aria-hidden="true" />
            <span className="wag-geo-corner-coords wag-geo-corner-coords-tl">N 55°  ·  E 045°</span>
            <span className="wag-geo-corner-coords wag-geo-corner-coords-br">N 040°  ·  E 087°</span>

            {/* Pre-baked KZ outline (see scripts/bake-kz-map.mjs). The stat bar
                + region chips below carry the informational load — the map is
                purely visual, no markers. */}
            <img src="/portfolio/kz-map.png" alt="" className="wag-geo-mapimg" aria-hidden />
          </div>

          <div className="wag-geo-stats">
            <div className="wag-geo-stat" style={{ borderColor: '#C9941F' }}>
              <span className="wag-geo-stat-num" style={{ color: '#C9941F' }}>{completed}</span>
              <span className="wag-geo-stat-label">completed</span>
            </div>
            <div className="wag-geo-stat" style={{ borderColor: '#00A88E' }}>
              <span className="wag-geo-stat-num" style={{ color: '#00A88E' }}>{inProgress}</span>
              <span className="wag-geo-stat-label">in progress</span>
            </div>
            <div className="wag-geo-stat" style={{ borderColor: '#4F84FF' }}>
              <span className="wag-geo-stat-num" style={{ color: '#4F84FF' }}>{planned}</span>
              <span className="wag-geo-stat-label">planned</span>
            </div>
            <div className="wag-geo-stat" style={{ borderColor: '#F0C85A' }}>
              <span className="wag-geo-stat-num" style={{ color: '#F0C85A' }}>2</span>
              <span className="wag-geo-stat-label">countries</span>
            </div>
          </div>

          <div className="wag-geo-regions">
            <span className="wag-geo-regions-label">Key regions</span>
            <div className="wag-geo-regions-row">
              <span className="wag-geo-region">Aktobe</span>
              <span className="wag-geo-region">West Kazakhstan</span>
              <span className="wag-geo-region">Atyrau</span>
              <span className="wag-geo-region">Mangistau</span>
              <span className="wag-geo-region">Karaganda</span>
              <span className="wag-geo-region">Almaty</span>
              <span className="wag-geo-region">Astana</span>
              <span className="wag-geo-region">Orenburg (RU)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 05 · ISO ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(5)} />
        <style>{ISO_PAGE_CSS}</style>
        <div className={`${styles.sectionInner} wag-section-iso`}>

          <div className="wag-iso-head">
            <div>
              <div className={styles.sectionLabel}>Certificates · ISO</div>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                International<br />
                <span className={styles.sectionTitleAccent}>quality standards</span>
              </div>
            </div>
            <div className="wag-iso-stamp">
              <div className="wag-iso-stamp-num">04</div>
              <div className="wag-iso-stamp-label">ISO<br />certificates</div>
            </div>
          </div>

          <div className="wag-iso-lead">
            The group is certified to international quality and environmental management standards.
            Process audits are conducted regularly — maintaining a unified work standard across all
            three group entities.
          </div>

          <div className="wag-iso-grid">
            <div className="wag-iso-card">
              <div className="wag-iso-card-imgwrap">
                <Image src="/licenses/sertifikat-iso-9001-ru.webp" alt="ISO 9001" width={600} height={800} className="wag-iso-img" priority unoptimized />
              </div>
              <div className="wag-iso-meta">
                <div className="wag-iso-name">ISO 9001 · Quality Management</div>
                <div className="wag-iso-detail">Quality management system</div>
              </div>
            </div>
            <div className="wag-iso-card">
              <div className="wag-iso-card-imgwrap">
                <Image src="/licenses/sertifikat-iso-9001-kz.webp" alt="ISO 9001 KZ" width={600} height={800} className="wag-iso-img" priority unoptimized />
              </div>
              <div className="wag-iso-meta">
                <div className="wag-iso-name">ISO 9001 · KZ</div>
                <div className="wag-iso-detail">Republic of Kazakhstan quality certificate</div>
              </div>
            </div>
            <div className="wag-iso-card">
              <div className="wag-iso-card-imgwrap">
                <Image src="/licenses/sertifikat-ekologicheskiy-menedzhment.webp" alt="ISO 14001" width={600} height={800} className="wag-iso-img" priority unoptimized />
              </div>
              <div className="wag-iso-meta">
                <div className="wag-iso-name">ISO 14001 · Environmental</div>
                <div className="wag-iso-detail">Environmental management</div>
              </div>
            </div>
            <div className="wag-iso-card">
              <div className="wag-iso-card-imgwrap">
                <Image src="/licenses/sertifikat-iso-9001-2016.webp" alt="ISO 9001 2016" width={600} height={800} className="wag-iso-img" priority unoptimized />
              </div>
              <div className="wag-iso-meta">
                <div className="wag-iso-name">ISO 9001:2016</div>
                <div className="wag-iso-detail">Process audit · recertification</div>
              </div>
            </div>
          </div>

          <div className="wag-iso-footer">
            <div className="wag-iso-footer-item">
              <div className="wag-iso-footer-label">Certification body</div>
              <div className="wag-iso-footer-value">Accredited bodies in Kazakhstan and CIS</div>
            </div>
            <div className="wag-iso-footer-item">
              <div className="wag-iso-footer-label">Scope of application</div>
              <div className="wag-iso-footer-value">Surveys · design · construction</div>
            </div>
            <div className="wag-iso-footer-item">
              <div className="wag-iso-footer-label">Audit</div>
              <div className="wag-iso-footer-value">Annual surveillance · recertification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 06 · LICENSE: СМР ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(6)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>No. 25008103 · 14.03.2025</span>
              <div className={styles.licTitleLarge}>Construction & installation works</div>
            </div>
            <span className={styles.licCategoryBadge}>CLASS I</span>
          </div>
          <div className={styles.licScanWrap}>
            <Image src="/licenses/license-smr.jpg" alt="CIW License" width={1100} height={1556} className={styles.licScanImg} priority unoptimized />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Issuing authority</div>
              <div className={styles.licMetaValue}>GASK Department of the Aktobe Region</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>First issued</div>
              <div className={styles.licMetaValue}>13.07.2010</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Valid until</div>
              <div className={styles.licMetaValue}>25.06.2027</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Scope</div>
              <div className={styles.licMetaValue}>All Class I CIW types</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 07 · LICENSE: DESIGN ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(7)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>No. 25031072 · 05.09.2025</span>
              <div className={styles.licTitleLarge}>Design activity</div>
            </div>
            <span className={styles.licCategoryBadge}>CLASS I</span>
          </div>
          <div className={styles.licScanWrap}>
            <Image src="/portfolio/page7_img3.jpeg" alt="Design License" width={1200} height={1600} className={styles.licScanImg} priority unoptimized />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Issuing authority</div>
              <div className={styles.licMetaValue}>GASK Department of the Aktobe Region</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>First issued</div>
              <div className={styles.licMetaValue}>28.04.2010</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Valid until</div>
              <div className={styles.licMetaValue}>Indefinite · class 1</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Scope</div>
              <div className={styles.licMetaValue}>Full design documentation cycle</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 08 · LICENSE: ENVIRONMENTAL ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(8)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>No. 02962R · 22.09.2025</span>
              <div className={styles.licTitleLarge}>Environmental protection</div>
            </div>
            <span className={styles.licCategoryBadge}>CLASS 1</span>
          </div>
          <div className={styles.licScanWrap}>
            <Image src="/portfolio/page7_img1.jpeg" alt="Environmental License" width={1200} height={1600} className={styles.licScanImg} priority unoptimized />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Issuing authority</div>
              <div className={styles.licMetaValue}>Ministry of Ecology and Natural Resources of Kazakhstan</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Place of issue</div>
              <div className={styles.licMetaValue}>Astana</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Special conditions</div>
              <div className={styles.licMetaValue}>Non-transferable</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Scope</div>
              <div className={styles.licMetaValue}>EIA section as part of design documentation</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 09 · ACCREDITATION (Global Construction Project) ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(9)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>No. KZ58VWC00251751 · 25.06.2025</span>
              <div className={styles.licTitleLarge}>Accreditation · expert work</div>
            </div>
            <span className={styles.licCategoryBadge}>LEVELS I & II</span>
          </div>
          <div className={styles.licScanWrap}>
            <Image src="/portfolio/page8_img2.jpeg" alt="Accreditation Certificate" width={1200} height={1600} className={styles.licScanImg} priority unoptimized />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Holder</div>
              <div className={styles.licMetaValue}>Global Construction Project LLP</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Issuing authority</div>
              <div className={styles.licMetaValue}>Construction & Housing Affairs Committee · Astana</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Valid until</div>
              <div className={styles.licMetaValue}>25.06.2027</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Scope</div>
              <div className={styles.licMetaValue}>Technical inspection of buildings and structures</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 10 · DESIGN SERVICES ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(10)} />
        <style>{DESIGN_PAGE_CSS}</style>
        <div className="wag-design-inner">

          <div className="wag-design-head">
            <div>
              <div className="wag-design-eyebrow">Direction 01 · Design activity</div>
              <div className="wag-design-title">
                <strong>Design</strong><br />
                and engineering surveys
              </div>
            </div>
            <div className="wag-design-stamp">
              <span className="wag-design-stamp-cat">CLASS I</span>
              <span className="wag-design-stamp-since">since 2010</span>
            </div>
          </div>

          <div className="wag-design-lead">
            Full design package for clearing the State Expert Review (GosExpertiza) — roads and
            railways, trunk pipelines, power transmission lines, industrial facilities and
            engineering networks. Class I design activity license since 2010.
          </div>

          <div className="wag-design-grid">
            {SVCS_DESIGN.map((s, i) => (
              <div key={s.title} className="wag-design-item">
                <div className="wag-design-item-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="wag-design-item-body">
                  <div className="wag-design-item-title">{s.title}</div>
                  <div className="wag-design-item-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="wag-design-flow-label">Project work stages</div>
          <div className="wag-design-flow">
            <div className="wag-design-flow-step">
              <div className="wag-design-flow-num">I</div>
              <div className="wag-design-flow-name">Surveys</div>
              <div className="wag-design-flow-desc">Geodesy · geology · hydrology</div>
            </div>
            <span className="wag-design-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-design-flow-step">
              <div className="wag-design-flow-num">II</div>
              <div className="wag-design-flow-name">Design & working docs</div>
              <div className="wag-design-flow-desc">Design-estimate and working documentation</div>
            </div>
            <span className="wag-design-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-design-flow-step">
              <div className="wag-design-flow-num">III</div>
              <div className="wag-design-flow-name">State Expert Review</div>
              <div className="wag-design-flow-desc">State enterprise approval</div>
            </div>
            <span className="wag-design-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-design-flow-step">
              <div className="wag-design-flow-num">IV</div>
              <div className="wag-design-flow-name">Author supervision</div>
              <div className="wag-design-flow-desc">Construction support</div>
            </div>
          </div>

          <div className="wag-design-footer">
            <div className="wag-design-footer-stat">
              <span className="wag-design-footer-num">{designProjects.length}</span>
              <span className="wag-design-footer-label">design works in registry</span>
            </div>
            <div className="wag-design-footer-meta">
              <span>Global Construction Project</span>
              <span className="wag-design-footer-dot">·</span>
              <span>arlan-gr.kz / design</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 11 · BUILD SERVICES ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(11)} />
        <style>{BUILD_PAGE_CSS}</style>
        <div className="wag-build-inner">

          <div className="wag-build-head">
            <div>
              <div className="wag-build-eyebrow">Direction 02 · Construction & installation works</div>
              <div className="wag-build-title">
                <strong>Construction &</strong><br />
                installation works
              </div>
            </div>
            <div className="wag-build-stamp">
              <span className="wag-build-stamp-cat">CLASS I</span>
              <span className="wag-build-stamp-since">since 2010</span>
            </div>
          </div>

          <div className="wag-build-lead">
            Class I CIW license since 2010. Turnkey construction across five infrastructure
            sectors — from roads and railways to trunk pipelines, power transmission lines,
            industrial facilities and engineering networks.
          </div>

          <div className="wag-build-grid">
            {SVCS_BUILD.map((s, i) => (
              <div key={s.title} className="wag-build-item">
                <div className="wag-build-item-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="wag-build-item-body">
                  <div className="wag-build-item-title">{s.title}</div>
                  <div className="wag-build-item-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="wag-build-flow-label">Site work stages</div>
          <div className="wag-build-flow">
            <div className="wag-build-flow-step">
              <div className="wag-build-flow-num">I</div>
              <div className="wag-build-flow-name">Preparation</div>
              <div className="wag-build-flow-desc">Mobilization · temporary utilities</div>
            </div>
            <span className="wag-build-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-build-flow-step">
              <div className="wag-build-flow-num">II</div>
              <div className="wag-build-flow-name">Earthworks</div>
              <div className="wag-build-flow-desc">Excavation · embankment · subgrade</div>
            </div>
            <span className="wag-build-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-build-flow-step">
              <div className="wag-build-flow-num">III</div>
              <div className="wag-build-flow-name">Track superstructure</div>
              <div className="wag-build-flow-desc">Rails · surfaces · installation</div>
            </div>
            <span className="wag-build-flow-arrow" aria-hidden="true">→</span>
            <div className="wag-build-flow-step">
              <div className="wag-build-flow-num">IV</div>
              <div className="wag-build-flow-name">Handover & commissioning</div>
              <div className="wag-build-flow-desc">Commissioning · acceptance certificate</div>
            </div>
          </div>

          <div className="wag-build-footer">
            <div className="wag-build-footer-stat">
              <span className="wag-build-footer-num">{projects.length}</span>
              <span className="wag-build-footer-label">CIW projects in registry</span>
            </div>
            <div className="wag-build-footer-meta">
              <span>West Capital Construction LLP</span>
              <span className="wag-build-footer-dot">·</span>
              <span>arlan-gr.kz / projects</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 12 · QR PORTFOLIO ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(12)} />
        <style>{QR_PAGE_CSS}</style>
        <div className="wag-qr-inner">

          <div className="wag-qr-head">
            <div>
              <div className="wag-qr-eyebrow">Full registry · online</div>
              <div className="wag-qr-title">
                <strong>Portfolio</strong><br />
                of projects and works
              </div>
            </div>
            <div className="wag-qr-stamp">
              <span className="wag-qr-stamp-num">{projects.length + designProjects.length}</span>
              <span className="wag-qr-stamp-label">entries<br />in registry</span>
            </div>
          </div>

          <div className="wag-qr-lead">
            An up-to-date project registry with full scope of work, clients, timelines and statuses
            — available on the website. The registry is updated as new facilities are commissioned
            and pass expert review.
          </div>

          <div className="wag-qr-grid">
            <div className="wag-qr-card wag-qr-card-teal">
              <div className="wag-qr-card-head">
                <div className="wag-qr-card-num">01</div>
                <div className="wag-qr-card-title">Construction<br />works</div>
              </div>
              <div className="wag-qr-card-stat">
                <span className="wag-qr-card-count" style={{ color: '#00A88E' }}>{projects.length}</span>
                <span className="wag-qr-card-countlabel">CIW projects<br />· 2015—2026</span>
              </div>
              <img src="/portfolio/qr-projects.png" alt="" className="wag-qr-code" aria-hidden />
              <div className="wag-qr-card-foot">
                <div className="wag-qr-card-url">arlan-gr.kz/projects</div>
                <div className="wag-qr-card-hint">Scan with phone camera</div>
              </div>
            </div>

            <div className="wag-qr-card wag-qr-card-gold">
              <div className="wag-qr-card-head">
                <div className="wag-qr-card-num">02</div>
                <div className="wag-qr-card-title">Design<br />works</div>
              </div>
              <div className="wag-qr-card-stat">
                <span className="wag-qr-card-count" style={{ color: '#C9941F' }}>{designProjects.length}</span>
                <span className="wag-qr-card-countlabel">design works<br />· docs & FS</span>
              </div>
              <img src="/portfolio/qr-design.png" alt="" className="wag-qr-code" aria-hidden />
              <div className="wag-qr-card-foot">
                <div className="wag-qr-card-url">arlan-gr.kz/design</div>
                <div className="wag-qr-card-hint">Scan with phone camera</div>
              </div>
            </div>
          </div>

          <div className="wag-qr-info-label">What you&apos;ll find in the registry</div>
          <div className="wag-qr-info">
            <div className="wag-qr-info-item">
              <div className="wag-qr-info-num">·</div>
              <div className="wag-qr-info-body">
                <div className="wag-qr-info-name">Scope of work</div>
                <div className="wag-qr-info-desc">Volumes, timelines, status for each project</div>
              </div>
            </div>
            <div className="wag-qr-info-item">
              <div className="wag-qr-info-num">·</div>
              <div className="wag-qr-info-body">
                <div className="wag-qr-info-name">Clients</div>
                <div className="wag-qr-info-desc">KTZ, industrial zones, private clients</div>
              </div>
            </div>
            <div className="wag-qr-info-item">
              <div className="wag-qr-info-num">·</div>
              <div className="wag-qr-info-body">
                <div className="wag-qr-info-name">Geography</div>
                <div className="wag-qr-info-desc">Map with coordinates and regions</div>
              </div>
            </div>
          </div>

          <div className="wag-qr-footer">
            <span>Updated as projects are commissioned</span>
            <span className="wag-qr-footer-dot">·</span>
            <span>arlan-gr.kz</span>
          </div>
        </div>
      </section>

      {/* ═══ 13–14 · TESTIMONIALS (compact: 8 + rest on 2 pages) ═══ */}
      {(() => {
        const FIRST = 8;
        const chunks: PrintTestimonial[][] = [
          PRINT_TESTIMONIALS.slice(0, FIRST),
          PRINT_TESTIMONIALS.slice(FIRST),
        ];
        return chunks.map((chunk, ci) => (
          <section key={`test-${ci}`} className={`${styles.page} ${styles.pageLight}`}>
            <Corners pageNum={p(13 + ci)} />
            <style>{TESTIMONIALS_PAGE_CSS}</style>
            <div className="wag-test-inner">
              {ci === 0 ? (
                <div className="wag-test-head">
                  <div>
                    <div className="wag-test-eyebrow">Client testimonials · {PRINT_TESTIMONIALS.length} letters</div>
                    <div className="wag-test-title">
                      <strong>What our clients</strong><br />
                      say about us
                    </div>
                  </div>
                  <div className="wag-test-stamp">
                    <span className="wag-test-stamp-num">{PRINT_TESTIMONIALS.length}</span>
                    <span className="wag-test-stamp-label">letters of<br />appreciation</span>
                  </div>
                </div>
              ) : (
                <div className="wag-test-contd">
                  <span>Client testimonials · continued</span>
                  <span>page {ci + 1} of {chunks.length}</span>
                </div>
              )}

              {ci === 0 && (
                <div className="wag-test-lead">
                  Most letters are addressed to the group&apos;s contracting company — West
                  Capital Construction LLP — for railway facilities commissioned. We provide
                  the same standard of quality and timing across roads, pipelines, power lines
                  and industrial facilities.
                </div>
              )}

              <div className="wag-test-grid">
                {chunk.map((t, ti) => (
                  <article key={`${ci}-${ti}`} className="wag-test-card">
                    <div className="wag-test-card-head">
                      <span className="wag-test-card-cat">{t.category}</span>
                      {t.date && <span className="wag-test-card-date">{t.date}</span>}
                    </div>
                    <div className="wag-test-card-client">{t.client}</div>
                    <div className="wag-test-card-quote">&ldquo;{t.quote}&rdquo;</div>
                    <div className="wag-test-card-sig">
                      <span className="wag-test-card-sig-name">{t.signatory}</span>
                      <span className="wag-test-card-sig-role">{t.role}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ));
      })()}

      {/* ═══ 15 · PARTNERS ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(15)} />
        <style>{PARTNERS_PAGE_CSS}</style>
        <div className="wag-partners-inner">

          <div className="wag-partners-head">
            <div>
              <div className="wag-partners-eyebrow">Partners & clients · registry excerpt</div>
              <div className="wag-partners-title">
                <strong>Trusted by</strong><br />
                the country&apos;s largest companies
              </div>
            </div>
            <div className="wag-partners-stamp">
              <span className="wag-partners-stamp-tags">
                <span>KTZ</span>
                <span>Mining</span>
                <span>Oil & Gas</span>
                <span>Industrial zones</span>
              </span>
            </div>
          </div>

          <div className="wag-partners-lead">
            Our clients include state operators (JSC NC KTZ, SPK), metallurgical and oil & gas
            holdings, industrial zones and private enterprises in Kazakhstan and Russia.
          </div>

          <div className="wag-partners-grid">
            {PARTNERS.map((pa) => (
              <div key={pa.file} className="wag-partner-card">
                <Image src={`/partners/${pa.file}`} alt={pa.name} width={240} height={120} className="wag-partner-logo" priority unoptimized />
                <div className="wag-partner-name">{pa.name}</div>
              </div>
            ))}
          </div>

          <div className="wag-partners-footer">
            <div className="wag-partners-footer-stat">
              <span className="wag-partners-footer-num">94%</span>
              <span className="wag-partners-footer-label">repeat contracts</span>
            </div>
            <div className="wag-partners-footer-meta">
              <span>Full client registry</span>
              <span className="wag-partners-footer-dot">·</span>
              <span>arlan-gr.kz</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 16 · CONTACTS / BACK COVER ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(16)} />
        <style>{CONTACTS_PAGE_CSS}</style>
        <div className="wag-contacts-inner">

          <div className="wag-contacts-head">
            <div>
              <div className="wag-contacts-eyebrow">Contacts · office in Aktobe</div>
              <div className="wag-contacts-title">
                <strong>Ready</strong> to<br />
                cooperate
              </div>
            </div>
            <div className="wag-contacts-stamp">
              <span className="wag-contacts-stamp-tag">Response time</span>
              <span className="wag-contacts-stamp-num">1 day</span>
              <span className="wag-contacts-stamp-tag">Mon — Fri</span>
            </div>
          </div>

          <div className="wag-contacts-lead">
            Tell us about your project — surveys, design or construction — and receive a commercial
            proposal. Full support from the first call to facility commissioning.
          </div>

          <div className="wag-contacts-grid">
            <div className="wag-contact-item">
              <div className="wag-contact-icon"><IconPhone /></div>
              <div className="wag-contact-body">
                <div className="wag-contact-label">Office phone</div>
                <div className="wag-contact-value">8 (7132) 538-288</div>
              </div>
            </div>
            <div className="wag-contact-item">
              <div className="wag-contact-icon"><IconMail /></div>
              <div className="wag-contact-body">
                <div className="wag-contact-label">Email</div>
                <div className="wag-contact-value wag-contact-value-sm">west_arlan-group@mail.ru</div>
              </div>
            </div>
            <div className="wag-contact-item">
              <div className="wag-contact-icon"><IconPin /></div>
              <div className="wag-contact-body">
                <div className="wag-contact-label">Office address</div>
                <div className="wag-contact-value wag-contact-value-sm">
                  Aktobe, Kazangapa St.,<br />57V, office 34
                </div>
              </div>
            </div>
            <div className="wag-contact-item">
              <div className="wag-contact-icon"><IconClock /></div>
              <div className="wag-contact-body">
                <div className="wag-contact-label">Working hours</div>
                <div className="wag-contact-value wag-contact-value-sm">Mon — Fri · 09:00 — 18:00 (GMT+5)</div>
              </div>
            </div>
          </div>

          <div className="wag-contacts-team-label">Direct management contacts</div>
          <div className="wag-contacts-team">
            <div className="wag-team-item">
              <div className="wag-team-num">01</div>
              <div className="wag-team-body">
                <div className="wag-team-role">General Director</div>
                <div className="wag-team-name">Ayan Sadirzhanovich Aronov</div>
                <div className="wag-team-phone">+7 (777) 669-99-89</div>
              </div>
            </div>
            <div className="wag-team-item">
              <div className="wag-team-num">02</div>
              <div className="wag-team-body">
                <div className="wag-team-role">Design Group Director</div>
                <div className="wag-team-name">Aleksey Sergeyevich Valeev</div>
                <div className="wag-team-phone">+7 (775) 645-90-51</div>
              </div>
            </div>
            <div className="wag-team-item">
              <div className="wag-team-num">03</div>
              <div className="wag-team-body">
                <div className="wag-team-role">Production Director</div>
                <div className="wag-team-name">Albert Ruslanovich Pruss</div>
                <div className="wag-team-phone">+7 (747) 135-14-92</div>
              </div>
            </div>
            <div className="wag-team-item">
              <div className="wag-team-num">04</div>
              <div className="wag-team-body">
                <div className="wag-team-role">Chief Project Engineer</div>
                <div className="wag-team-name">Valentin Petrovich Shturmilov</div>
                <div className="wag-team-phone">+7 (771) 229-38-78</div>
              </div>
            </div>
          </div>

          <div className="wag-contacts-legal">
            <div className="wag-contacts-legal-item">
              <div className="wag-contacts-legal-label">Legal entity</div>
              <div className="wag-contacts-legal-value">West Arlan Group LLP · BIN 090940003245</div>
            </div>
            <div className="wag-contacts-legal-item">
              <div className="wag-contacts-legal-label">Licenses</div>
              <div className="wag-contacts-legal-value">CIW No. 25008103 · Design No. 25031072 · Env. No. 02962R</div>
            </div>
          </div>

          <div className="wag-contacts-footer">
            <div className="wag-contacts-footer-left">
              <div className="wag-contacts-footer-label">Company website</div>
              <div className="wag-contacts-footer-site">arlan-gr.kz</div>
            </div>
            <WagTriangle className="wag-contacts-triangle" />
          </div>
        </div>
      </section>
    </main>
  );
}
