import type { ReactNode } from 'react';
import styles from './print.module.css';
import d from './design/design.module.css';

/* ─────────────────────────────────────────────────────────────────
   ПЗТМ LTD — bespoke СМР (construction) showcase, 2 pages, opening the
   project section. Unlike the drawing-based CaseSheet, this leads with
   the list of COMPLETED works and real construction-site photos
   (public/portfolio/pztm/pztm-*.jpg). Copy lives here in a per-locale
   dict (ru/en) — keep both variants in sync when editing.
   ───────────────────────────────────────────────────────────────── */

type PztmCopy = {
  eyebrow1: string;
  title1: string;
  metaClient: string;
  metaLocation: string;
  status: string;
  lead: ReactNode;
  metrics: { value: string; unit: string; label: string }[];
  worksLabel: string;
  works: string[];
  stage: string;
  eyebrow2: string;
  title2: string;
  portLabel: string;
  netTitle: string;
  networks: { value: string; label: string }[];
};

const COPY: Record<'ru' | 'en', PztmCopy> = {
  ru: {
    eyebrow1: '01 · РЕЛЬСОСВАРОЧНОЕ ПРЕДПРИЯТИЕ «ПЗТМ LTD»',
    title1: 'Рельсосварочное предприятие ТОО «ПЗТМ LTD»',
    metaClient: 'ТОО «ПЗТМ LTD» · рельсосварочное предприятие (РСП)',
    metaLocation: 'г. Актобе, р-н Астана · ст. Кызгалдакты',
    status: 'РЕАЛИЗОВАНО',
    lead: (
      <>
        Строительно-монтажные работы по железнодорожной инфраструктуре
        рельсосварочного предприятия ТОО «ПЗТМ LTD» на станции Кызгалдакты в городе Актобе:
        строительство железнодорожных путей, примыкание соединительного пути, искусственные сооружения
        и переустройство инженерных сетей связи и электроснабжения в зоне строительства.
      </>
    ),
    metrics: [
      { value: '9,504', unit: 'км', label: 'Строительство железнодорожных путей' },
      { value: '0,527', unit: 'км', label: 'Примыкание соединительного пути к ст. Кызгалдакты' },
      { value: '8,3', unit: 'км', label: 'Переустройство инженерных сетей' },
    ],
    worksLabel: 'ВЫПОЛНЕННЫЕ РАБОТЫ',
    works: [
      'Строительство железнодорожных путей — 9,504 км',
      'Примыкание соединительного пути к станционному пути ст. Кызгалдакты — 0,527 км',
      'Устройство двух ж/б водопропускных труб Ø1,0 м длиной по 20 м (ПК 3+03 и ПК 3+35)',
      'Устройство водоотвода от земляного полотна',
      'Реконструкция устройств электрической централизации (ЭЦ)',
      'Вынос кабельных линий СЦБ из зоны строительства',
      'Монтаж освещения стрелочных переводов №24 и №26 · электромонтаж',
      'Строительство электроснабжения сигнальной точки на ПК 17684+79',
      'Переустройство воздушной линии связи АО «НК «Қазақстан Темір Жолы»',
      'Переустройство сетей связи Дальсвязь в зоне строительства',
      'Переустройство инженерных коммуникаций служб ШЧ и ЭЧ',
    ],
    stage:
      'СМР · примыкание и расширение путей, ИССО, переустройство сетей · проект пути ТОО «GeoTrack» · 2024–2026',
    eyebrow2: '01 · ПЗТМ LTD · СТРОИТЕЛЬНАЯ ПЛОЩАДКА',
    title2: 'Строительно-монтажные работы на площадке',
    portLabel: 'СЕТИ И ЭЛЕКТРОСНАБЖЕНИЕ',
    netTitle: 'ПЕРЕУСТРОЙСТВО ИНЖЕНЕРНЫХ СЕТЕЙ · 8,3 КМ',
    networks: [
      { value: '1 612 м', label: 'Дальсвязь · оптокабель в ПЭ трубе' },
      { value: '1 738 м', label: 'ШЧ · сигнально-блокировочный кабель' },
      { value: 'ГНБ', label: 'Транстелеком · оптокабель, ж/б плиты' },
      { value: '4 925 м', label: 'ЭЧ · ВЛ-10 кВ, 28 опор, провод АС-50' },
    ],
  },
  en: {
    eyebrow1: '01 · PZTM LTD RAIL WELDING PLANT',
    title1: 'Rail welding plant of PZTM LTD LLP',
    metaClient: 'PZTM LTD LLP · rail welding plant',
    metaLocation: 'Aktobe city, Astana district · Kyzgaldakty station',
    status: 'DELIVERED',
    lead: (
      <>
        Construction and installation works on the railway infrastructure of the PZTM LTD rail
        welding plant at Kyzgaldakty station in Aktobe: construction of railway tracks, a
        connecting-track junction, culvert structures, and the relocation of communication and
        power networks within the construction zone.
      </>
    ),
    metrics: [
      { value: '9.504', unit: 'km', label: 'Construction of railway tracks' },
      { value: '0.527', unit: 'km', label: 'Connecting-track junction at Kyzgaldakty station' },
      { value: '8.3', unit: 'km', label: 'Utility network relocations' },
    ],
    worksLabel: 'COMPLETED WORKS',
    works: [
      'Construction of railway tracks — 9.504 km',
      'Junction of the connecting track to the Kyzgaldakty station track — 0.527 km',
      'Two Ø1.0 m reinforced-concrete culverts, 20 m each (stations 3+03 and 3+35)',
      'Subgrade drainage works',
      'Reconstruction of the electric interlocking equipment',
      'Relocation of signalling cable lines out of the construction zone',
      'Lighting of turnouts No. 24 and No. 26 · electrical installation',
      'Power supply for the signalling point at station 17684+79',
      'Relocation of the KTZ national railway overhead communication line',
      'Relocation of Dalsvyaz communication networks in the construction zone',
      'Relocation of the signalling and power divisions’ utilities',
    ],
    stage:
      'Construction · track junction and extension, culverts, network relocations · track design by GeoTrack LLP · 2024–2026',
    eyebrow2: '01 · PZTM LTD · CONSTRUCTION SITE',
    title2: 'Construction works on site',
    portLabel: 'NETWORKS AND POWER SUPPLY',
    netTitle: 'UTILITY NETWORK RELOCATIONS · 8.3 KM',
    networks: [
      { value: '1,612 m', label: 'Dalsvyaz · fibre cable in PE duct' },
      { value: '1,738 m', label: 'Signalling division · signal cable' },
      { value: 'HDD', label: 'Transtelecom · fibre cable, concrete slabs' },
      { value: '4,925 m', label: 'Power division · 10 kV line, 28 poles, AC-50 wire' },
    ],
  },
};

/* Landscape site photos — shown first, in landscape cells (never cropped
   into a vertical frame). */
const GALLERY_LAND = [
  '/portfolio/pztm/pztm-l1.jpg',
  '/portfolio/pztm/pztm-l2.jpg',
  '/portfolio/pztm/pztm-l3.jpg',
  '/portfolio/pztm/pztm-l4.jpg',
  '/portfolio/pztm/pztm-l5.jpg',
  '/portfolio/pztm/pztm-l6.jpg',
];
/* Portrait photos — placed in a row at the bottom (сети/электро works). */
const GALLERY_PORT = [
  '/portfolio/pztm/pztm-p1.jpg',
  '/portfolio/pztm/pztm-p2.jpg',
  '/portfolio/pztm/pztm-p3.jpg',
];

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

export default function PztmShowcase({
  pageStart,
  total,
  stamp,
  locale = 'ru',
}: {
  pageStart: number;
  total: number;
  stamp: string;
  locale?: 'ru' | 'en';
}) {
  const c = COPY[locale];
  return (
    <>
      {/* ── Page 1 · выполненные работы (light) ─────────────────────── */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Chrome pageNum={pageStart} total={total} stamp={stamp} dark={false} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>{c.eyebrow1}</div>
          <h2 className={d.sheetTitle}>{c.title1}</h2>
          <div className={d.sheetMeta}>
            <span className={d.sheetMetaClient}>{c.metaClient}</span>
            <span className={d.sheetMetaSep}>·</span>
            <span>{c.metaLocation}</span>
            <span className={d.sheetStatus}>{c.status}</span>
          </div>

          <p className={d.sheetLead}>{c.lead}</p>

          <div className={styles.pztmHeroWrap}>
            <img src="/portfolio/pztm/pztm-hero.jpg" alt="" className={styles.pztmHeroImg} />
          </div>

          <div className={d.metricRow}>
            {c.metrics.map((m) => (
              <div key={m.label} className={d.metric}>
                <div className={d.metricValueRow}>
                  <span className={d.metricValue}>{m.value}</span>
                  {m.unit && <span className={d.metricUnit}>{m.unit}</span>}
                </div>
                <div className={d.metricLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          <div className={d.scopeWrap}>
            <div className={d.scopeLabel}>{c.worksLabel}</div>
            <div className={d.scopeGrid}>
              {c.works.map((w) => (
                <div key={w} className={d.scopeItem}>{w}</div>
              ))}
            </div>
          </div>

          <div className={d.sheetStage}>{c.stage}</div>
        </div>
      </section>

      {/* ── Page 2 · фоторепортаж + сети (dark) ─────────────────────── */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Chrome pageNum={pageStart + 1} total={total} stamp={stamp} dark />
        <div className={`${styles.pageInner} ${d.sheetDark}`}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>{c.eyebrow2}</div>
          <h2 className={d.sheetTitle}>{c.title2}</h2>

          <div className={styles.pztmLandGrid}>
            {GALLERY_LAND.map((src) => (
              <div key={src} className={styles.pztmPhoto}>
                <img src={src} alt="" className={styles.pztmPhotoImg} />
              </div>
            ))}
          </div>

          <div className={styles.pztmPortLabel}>{c.portLabel}</div>
          <div className={styles.pztmPortRow}>
            {GALLERY_PORT.map((src) => (
              <div key={src} className={styles.pztmPhoto}>
                <img src={src} alt="" className={styles.pztmPhotoImg} />
              </div>
            ))}
          </div>

          <div className={styles.pztmNetBand}>
            <div className={styles.pztmNetTitle}>{c.netTitle}</div>
            <div className={styles.pztmNetGrid}>
              {c.networks.map((n) => (
                <div key={n.label} className={styles.pztmNetItem}>
                  <span className={styles.pztmNetVal}>{n.value}</span>
                  <span className={styles.pztmNetLbl}>{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
