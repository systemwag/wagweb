import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { getServices } from '@/lib/data';
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
  title: 'Услуги и направления | West Arlan Group',
  description:
    'Проектная и строительная деятельность West Arlan Group: инженерно-геодезические и геологические изыскания, строительство ж/д путей, инженерные коммуникации, промышленное строительство.',
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

function ServiceIcon({ icon, color }: { icon: string; color: 'gold' | 'teal' | 'blue' }) {
  return (
    <div className={styles.serviceIconWrap} data-color={color}>
      {ICON_MAP[icon] ?? <WrenchIcon width={24} height={24} />}
    </div>
  );
}

export default async function ServicesPage() {
  const allServices = await getServices();
  const design       = allServices.filter((s) => s.direction === 'design');
  const construction = allServices.filter((s) => s.direction === 'construction');
  const control      = allServices.filter((s) => s.direction === 'control');

  return (
    <>
      <main className={styles.main}>

        {/* ── Page Hero ── */}
        <section className={styles.hero}>
          <div className="container">
            {/* Breadcrumb */}
            <div className={styles.heroBreadcrumb}>
              <Link href="/">Главная</Link>
              <span className={styles.heroBreadcrumbSep}>/</span>
              <span className={styles.heroBreadcrumbCurrent}>Услуги</span>
            </div>

            <span className="section-label">Что мы делаем</span>
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              <span className="text-gradient-gold">Услуги</span>
            </h1>
            <p className={styles.heroDesc}>
              Полный цикл работ в сфере инженерной и железнодорожной инфраструктуры —
              от геодезических изысканий до сдачи объектов «под ключ».
            </p>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>3</span>
                <span className={styles.heroStatLabel}>Направления</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>19+</span>
                <span className={styles.heroStatLabel}>Видов работ</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>15+</span>
                <span className={styles.heroStatLabel}>Лет опыта</span>
              </div>
            </div>
          </div>
          <div className={styles.heroGlow} aria-hidden="true" />
        </section>

        {/* ── Direction 01: Design ── */}
        <section className={styles.directionSection} data-accent="gold" id="proektnaya">
          <div className="container">
            <div className={styles.directionHeader}>
              <span className={styles.directionNumBg} aria-hidden="true">01</span>
              <h2 className="heading-2">Проектная деятельность</h2>
              <p className={styles.directionDesc}>
                Специализация на выполнении полного комплекса проектных работ в области
                железнодорожной и инженерной инфраструктуры. Разработка технически
                обоснованных решений, соответствующих национальным и международным стандартам.
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
              <h2 className="heading-2">Строительная деятельность</h2>
              <p className={styles.directionDesc}>
                Осуществление полного цикла строительных работ в сфере транспортной и
                инженерной инфраструктуры. Реализуем проекты любой сложности —
                от подъездных путей до магистральных железнодорожных линий.
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

        {/* ── Direction 03: Works ── */}
        <section className={styles.directionSection} data-accent="blue" id="vidy-rabot">
          <div className="container">
            <div className={styles.directionHeader}>
              <span className={styles.directionNumBg} aria-hidden="true">03</span>
              <h2 className="heading-2">Виды выполняемых работ</h2>
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

        {/* ── Additional services ── */}
        <section className={styles.directionSection} data-accent="gold" id="dopolnitelnye">
          <div className="container">
            <div className={styles.directionHeader}>
              <div className={styles.directionBadge} data-color="gold">Дополнительно</div>
              <h2 className="heading-2">Контроль и поставки</h2>
              <p className={styles.directionDesc}>
                Строительный контроль, технадзор, а также поставка специализированных
                материалов и техники от проверенных поставщиков.
              </p>
            </div>
            <div className={styles.servicesGrid}>
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
