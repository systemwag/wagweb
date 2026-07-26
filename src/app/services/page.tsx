import type { Metadata } from 'next';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import ServicesHeroAnim from '@/components/ServicesHeroAnim/ServicesHeroAnim';
import { getServices, getMaintenanceProjects } from '@/lib/data';
import { SITE_URL } from '@/lib/site';
import styles from './services.module.css';
import {
  MagnifyingGlassCircleIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  TruckIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  BeakerIcon,
  CubeIcon,
  WrenchIcon,
  MapIcon,
  FireIcon,
  SignalIcon,
  CircleStackIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Услуги: проектирование, СМР, инженерные сети',
  description:
    'Строительно-монтажные работы и проектирование в Казахстане: инженерные сети (водоснабжение, газ, канализация, электроснабжение), промышленные объекты, дороги и пути. Лицензии I категории.',
};

// Map DB icon strings → Heroicon components
const ICON_MAP: Record<string, React.ReactNode> = {
  // Design
  '🧭': <MagnifyingGlassCircleIcon width={24} height={24} />,
  '🏭': <BuildingOffice2Icon      width={24} height={24} />,
  '🏛️': <HomeModernIcon           width={24} height={24} />,
  '🚆': <TruckIcon                width={24} height={24} />,
  '⚡': <BoltIcon                 width={24} height={24} />,
  '🔩': <WrenchScrewdriverIcon    width={24} height={24} />,
  // Construction
  '🏗️': <BuildingOfficeIcon       width={24} height={24} />,
  '📊': <CalculatorIcon           width={24} height={24} />,
  '📁': <DocumentTextIcon         width={24} height={24} />,
  '⚙️': <CogIcon                  width={24} height={24} />,
  '📄': <ClipboardDocumentListIcon width={24} height={24} />,
  '✅': <CheckBadgeIcon           width={24} height={24} />,
  // Control
  '🔬': <BeakerIcon               width={24} height={24} />,
  '🚚': <CubeIcon                 width={24} height={24} />,
  // Fallback
  '📐': <WrenchIcon               width={24} height={24} />,
  '🗺️': <MapIcon                  width={24} height={24} />,
  '📋': <ClipboardDocumentListIcon width={24} height={24} />,
};

/* Размер брошюры берём с диска, а не из константы: файл пересобирается
   `npm run build:pdf`, и захардкоженное число устаревает молча (до 26.07.2026
   в кнопке стояло «8 МБ» при реальных 24,7 МБ). Возвращаем null, если файла
   нет, — тогда просто не показываем размер. */
function portfolioSizeMb(): string | null {
  try {
    const bytes = statSync(join(process.cwd(), 'public', 'portfolio.pdf')).size;
    return (bytes / (1024 * 1024)).toFixed(0);
  } catch {
    return null;
  }
}

function ServiceIcon({ icon, color }: { icon: string; color: 'gold' | 'teal' | 'blue' }) {
  return (
    <div className={styles.serviceIconWrap} data-color={color}>
      {ICON_MAP[icon] ?? <WrenchIcon width={24} height={24} />}
    </div>
  );
}

export default async function ServicesPage() {
  const [allServices, maintenanceProjects] = await Promise.all([
    getServices(),
    getMaintenanceProjects(),
  ]);
  const design       = allServices.filter((s) => s.direction === 'design');
  const construction = allServices.filter((s) => s.direction === 'construction');
  const control      = allServices.filter((s) => s.direction === 'control');
  const maintenanceCount = maintenanceProjects.length;
  const pdfSizeMb        = portfolioSizeMb();

  const servicesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allServices.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.title,
        description: s.description,
        serviceType: s.title,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'Country', name: 'Казахстан' },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <main className={styles.main}>

        {/* ── Page Hero ── */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              Услуги <span className="text-gradient-gold">полного цикла</span>
            </h1>
            <p className={styles.heroDesc}>
              Проектирование, строительство, обслуживание и инженерный контроль.
              Полный цикл от геодезических изысканий до сдачи объектов
              «под&nbsp;ключ» — для инженерной, транспортной и промышленной
              инфраструктуры Казахстана и России.
            </p>

            {/* CTAs */}
            <div className={styles.heroCtas}>
              <a
                href="/portfolio.pdf"
                download="WAG-portfolio.pdf"
                className="btn btn-primary"
                aria-label={
                  pdfSizeMb
                    ? `Скачать профиль компании в PDF (${pdfSizeMb} МБ)`
                    : 'Скачать профиль компании в PDF'
                }
              >
                Скачать профиль компании
              </a>
              <Link href="/contacts" className="btn btn-outline">
                Обсудить проект
              </Link>
            </div>
          </div>
          <div className={styles.heroGlow} aria-hidden="true" />
          <ServicesHeroAnim />
        </section>

        {/* ── Principle: полный цикл внутри группы ── */}
        <section className={styles.principleSection}>
          <div className="container">
            <div className={`glass-card ${styles.principleBox}`}>
              <div className={styles.principleText}>
                <h2 className={`heading-3 ${styles.principleTitle}`}>
                  Один договор — <span className="text-gradient-gold">один ответственный</span>
                </h2>
                <p className={styles.principleDesc}>
                  Группа закрывает весь цикл собственными силами: инженерные изыскания,
                  проектная и рабочая документация, прохождение РГП «ГосЭкспертиза»,
                  строительно-монтажные работы и сдача объекта в эксплуатацию —
                  без субподрядных цепочек и размытой ответственности.
                </p>
              </div>
              <ol className={styles.principleSteps}>
                {[
                  { roman: 'I',   label: 'Изыскания',     meta: 'геодезия · геология · гидрология' },
                  { roman: 'II',  label: 'ПСД и РД',      meta: 'проектно-сметная и рабочая' },
                  { roman: 'III', label: 'ГосЭкспертиза', meta: 'согласование РГП' },
                  { roman: 'IV',  label: 'СМР и сдача',   meta: 'строительство · ввод в эксплуатацию' },
                ].map((s) => (
                  <li key={s.roman} className={styles.principleStep}>
                    <span className={styles.principleStepRoman}>{s.roman}</span>
                    <span className={styles.principleStepLabel}>{s.label}</span>
                    <span className={styles.principleStepMeta}>{s.meta}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Direction 01: Design ── */}
        <section className={styles.directionSection} data-accent="gold" id="proektnaya">
          <div className="container">
            <div className={styles.directionHeader}>
              <span className={styles.directionNumBg} aria-hidden="true">01</span>
              <h2 className="heading-2">
                <span className="text-gradient-gold">Проектная</span> деятельность
              </h2>
              <p className={styles.directionDesc}>
                Полный комплекс проектных работ в области инженерной и транспортной
                инфраструктуры: лицензия I категории с 2010 года. Комплект ПСД
                и рабочей документации с сопровождением прохождения РГП «ГосЭкспертиза».
              </p>
              <Link href="/design" className={`btn btn-outline ${styles.directionBtn}`}>
                Подробнее о проектировании
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className={styles.servicesGrid}>
              {design.map((s) => (
                <div key={s.id} className={`glass-card ${styles.serviceCard}`}>
                  <ServiceIcon icon={s.icon} color="gold" />
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Direction 02: Construction ── */}
        <section className={styles.directionSection} data-accent="teal" id="stroitelnaya">
          <div className="container">
            <div className={styles.directionHeader}>
              <span className={styles.directionNumBg} aria-hidden="true">02</span>
              <h2 className="heading-2">
                <span className="text-gradient-gold">Строительная</span> деятельность
              </h2>
              <p className={styles.directionDesc}>
                Осуществление полного цикла строительных работ в сфере транспортной и
                инженерной инфраструктуры: подъездные и станционные железнодорожные пути,
                автомобильные дороги, инженерные сети и промышленные объекты.
              </p>
              <Link href="/projects" className={`btn btn-outline ${styles.directionBtn}`}>
                Наши объекты
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className={styles.servicesGrid}>
              {construction.map((s) => (
                <div key={s.id} className={`glass-card ${styles.serviceCard}`}>
                  <ServiceIcon icon={s.icon} color="teal" />
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Maintenance teaser — реестр обслуживания живёт на /maintenance ── */}
        <section className={styles.directionSection} data-accent="blue" id="obsluzhivanie">
          <div className="container">
            <div className={styles.directionHeader}>
              <div className={styles.directionBadge} data-color="gold">Обслуживание</div>
              <h2 className="heading-2">
                Текущее содержание <span className="text-gradient-gold">и ремонт</span>
              </h2>
              <p className={styles.directionDesc}>
                Текущее содержание, ремонт и демонтаж подъездных путей и инфраструктуры
                предприятий: {maintenanceCount} объектов в реестре обслуживания.
                Регулярные осмотры, устранение дефектов и ответственность
                за безопасную эксплуатацию — то, за что нас благодарят заказчики
                в письмах годами.
              </p>
              <Link href="/maintenance" className={`btn btn-outline ${styles.directionBtn}`}>
                Реестр обслуживания
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Direction 03: Works ── */}
        <section className={styles.directionSection} data-accent="blue" id="vidy-rabot">
          <div className="container">
            <div className={styles.directionHeader}>
              <span className={styles.directionNumBg} aria-hidden="true">03</span>
              <h2 className="heading-2">
                Виды выполняемых <span className="text-gradient-gold">работ</span>
              </h2>
              <p className={styles.directionDesc}>
                Полный спектр строительно-монтажных, специальных и проектно-сметных работ
                в соответствии с лицензионными требованиями Республики Казахстан.
              </p>
            </div>

            <div className={styles.accordionList}>

              {/* Проектно-сметные работы — single card */}
              <div className={`glass-card ${styles.workTypeCard}`}>
                <div className={styles.workTypeIconWrap}>
                  <ClipboardDocumentListIcon width={20} height={20} />
                </div>
                <span className={styles.workTypeTitle}>Проектно-сметные работы</span>
              </div>

              {/* Инженерные сети */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <FireIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Устройство инженерных сетей и систем, включая капремонт и реконструкцию
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Сети холодного и горячего водоснабжения, теплоснабжения, централизованной канализации бытовых, производственных и ливневых стоков, внутренние системы водопровода, отопления и канализации',
                      'Сети электроснабжения и устройство наружного электроосвещения, внутренние системы электроосвещения и электроотопления',
                      'Сети электроснабжения железнодорожных путей сообщения, сети электроснабжения и электроосвещения предприятий воздушного транспорта',
                      'Сети газоснабжения высокого и среднего давления, бытового и производственного газоснабжения низкого давления, внутренние системы газоснабжения',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Автомобильные и железные дороги */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <TruckIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Строительство автомобильных и железных дорог, включая капремонт и реконструкцию
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Основания и покрытия, защитные сооружения и обустройство автомобильных дорог III, IV и V технической категории, а также проезжей части улиц населённых пунктов, не являющихся магистральными',
                      'Основания и покрытия взлётно-посадочных полос аэродромов и вертолётных площадок',
                      'Основания и верхние строения железнодорожных путей',
                      'Основания и покрытия, защитные сооружения и обустройство автомобильных дорог I и II технической категории, а также внутригородских магистральных дорог скоростного и регулируемого движения',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Монтаж оборудования */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <CogIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Монтаж технологического оборудования, пусконаладочные работы
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Объекты театрально-зрелищного, образовательного, спортивного назначения',
                      'Связь, противоаварийная защита, системы контроля и сигнализации, блокировки на транспорте, объектах электроэнергетики и водоснабжения, приборы учёта и контроля производственного назначения',
                      'Гидротехнические и мелиоративные сооружения',
                      'Производство строительных материалов, изделий и конструкций',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Специальные работы в грунтах */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <CircleStackIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Специальные работы в грунтах
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Буровые работы в грунте',
                      'Устройство оснований',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Несущие конструкции */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <HomeIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Возведение несущих и/или ограждающих конструкций зданий и сооружений, включая капремонт и реконструкцию
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Монтаж строительных конструкций подъёмных сооружений (лифтов, эскалаторов, шахтных копров и подъёмников, канатных дорог)',
                      'Дымовые трубы, силосные сооружения, градирни, надшахтные копры',
                      'Кровельные работы',
                      'Устройство монолитных, а также монтаж сборных бетонных и железобетонных конструкций, кладка штучных элементов стен и перегородок',
                      'Монтаж строительных конструкций башенного и мачтового типа, дымовых труб',
                      'Монтаж металлических конструкций',
                      'Гидротехнические и селезащитные сооружения, плотины, дамбы',
                      'Монтаж несущих конструкций мостов и мостовых переходов',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Линейные сооружения */}
              <details className={`glass-card ${styles.accordionItem}`}>
                <summary className={styles.accordionSummary}>
                  <div className={styles.accordionIconWrap}>
                    <SignalIcon width={20} height={20} />
                  </div>
                  <span className={styles.accordionSummaryText}>
                    Специальные строительные и монтажные работы по прокладке линейных сооружений, включая капремонт и реконструкцию
                  </span>
                  <svg className={styles.accordionIconPlus} viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <div className={styles.accordionBody}>
                  <ul className={styles.accordionSubList}>
                    {[
                      'Магистральные линии электропередач с напряжением до 35 кВ и до 110 кВ и выше',
                      'Общереспубликанские и международные линии связи и телекоммуникаций',
                      'Стальные резервуары (ёмкости), включая работающие под давлением либо предназначенные для хранения взрывопожароопасных или иных опасных жидких или газообразных веществ',
                      'Промысловые и магистральные сети нефтепроводов, газопроводов, а также магистральные сети нефтепродуктопроводов',
                    ].map((item, i) => (
                      <li key={i} className={styles.accordionSubItem}>
                        <span className={styles.accordionSubNum}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

            </div>
          </div>
        </section>

        {/* ── Additional services: контроль, аккредитованный надзор, поставки ── */}
        <section className={styles.directionSection} data-accent="gold" id="dopolnitelnye">
          <div className="container">
            <div className={styles.directionHeader}>
              <div className={styles.directionBadge} data-color="gold">Дополнительно</div>
              <h2 className="heading-2">Контроль, надзор и поставки</h2>
              <p className={styles.directionDesc}>
                Аккредитованные инжиниринговые услуги — технический надзор,
                обследование зданий и управление проектами (свидетельства
                уполномоченных органов действуют до 26.06.2028), а также
                строительный контроль и поставка специализированных материалов
                и техники.
              </p>
              <Link href="/licenses#akkreditacii" className={`btn btn-outline ${styles.directionBtn}`}>
                Свидетельства об аккредитации
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className={styles.servicesGrid}>
              {[
                {
                  id: 'accr-supervision',
                  icon: '✅',
                  title: 'Технический надзор',
                  description:
                    'Инжиниринговые услуги по техническому надзору на технически и технологически сложных объектах I уровня ответственности — для сторонних заказчиков. Аккредитация № KZ56VWC00283700.',
                },
                {
                  id: 'accr-survey',
                  icon: '🔬',
                  title: 'Обследование зданий и сооружений',
                  description:
                    'Экспертные работы по техническому обследованию надёжности и устойчивости зданий и сооружений, I–II уровни ответственности. Аккредитация № KZ83VWC00283699.',
                },
                {
                  id: 'accr-pm',
                  icon: '📋',
                  title: 'Управление проектами',
                  description:
                    'Управление проектами в области архитектуры, градостроительства и строительства. Свидетельство № KZ29VWC00283701.',
                },
                {
                  id: 'accr-supervision-gcp',
                  icon: '✅',
                  title: 'Технический надзор — Global Construction Project',
                  description:
                    'Инжиниринговые услуги по техническому надзору на технически и технологически сложных объектах I уровня ответственности. Держатель — ТОО «Global Construction Project», компания группы. Аккредитация № KZ02VWC00283702.',
                },
              ].map((s) => (
                <div key={s.id} className={`glass-card ${styles.serviceCard}`}>
                  <ServiceIcon icon={s.icon} color="gold" />
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.description}</p>
                </div>
              ))}
              {control.map((s) => (
                <div key={s.id} className={`glass-card ${styles.serviceCard}`}>
                  <ServiceIcon icon={s.icon} color="gold" />
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className="heading-2">Нужна консультация?</h2>
              <p className={styles.ctaDesc}>
                Расскажите о своём проекте — мы подберём оптимальный комплекс услуг
                и подготовим коммерческое предложение.
              </p>
              <div className={styles.ctaActions}>
                <a href="/contacts" className="btn btn-primary">Оставить заявку</a>
                <Link href="/projects" className="btn btn-outline">Наши проекты</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
