import { getProjects } from '@/lib/data';
import styles from './print.module.css';
import PrintButtons from './PrintButtons';

/* ─────────────────────────────────────────────────────────────────
   WAG triangle mark — official logo from assets/logotriangle.svg
   ───────────────────────────────────────────────────────────────── */
const WAG_TRIANGLE = 'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

function WagMark({ className, gradientId = 'wagGold' }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 719.49 635.66" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#D4A843" />
          <stop offset="50%"  stopColor="#F0C85A" />
          <stop offset="100%" stopColor="#C49A30" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`} d={WAG_TRIANGLE} />
    </svg>
  );
}

/* The KZ map is no longer inlined as SVG path data — it's pre-baked to
   public/portfolio/kz-map.png by scripts/bake-kz-map.mjs. Saves ~50 KB
   from the rendered PDF and avoids Chromium re-parsing the path on every
   build. */

/* ─────────────────────────────────────────────────────────────────
   Content data
   ───────────────────────────────────────────────────────────────── */

type PrintTestimonial = {
  client: string;
  signatory: string;
  role: string;
  date?: string;
  category: string;
  quote: string;
};

// NOTE: «West Capital Construction LLP» in quotes is the legacy juridical
// name used in the actual client letters — DO NOT replace with «WAG».
const PRINT_TESTIMONIALS: PrintTestimonial[] = [
  { client: 'ТОО «УКИЗ Актобе» · Aktobe Industrial Zone', signatory: 'Тулебаев А. Н.', role: 'Директор', date: '5 января 2020', category: 'Содержание · 4,5 км',
    quote: 'За время сотрудничества текущее содержание подъездных железнодорожных путей осуществляется квалифицированными специалистами. Качественно и своевременно устраняются все дефекты. Профессионализм работников West Capital Construction LLP позволяет нам быть уверенными в безопасной эксплуатации.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Перебортовка · 63 км',
    quote: 'Высококвалифицированный персонал ответственно подошёл к выполнению поставленных задач, и качественно в установленные договором сроки выполнил данные работы. West Capital Construction LLP имеет всю необходимую технику и оборудование для выполнения как демонтажных, так и СМР работ.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Содержание · 7,2 + 20 км',
    quote: 'Техническое обслуживание такого путевого развития требует большой ответственности и профессионального внимания. Был заключён договор с West Capital Construction LLP, т. к. их специалисты зарекомендовали себя как профессиональные и добросовестные работники.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', date: '21 сентября 2018', category: 'Реконструкция · ст. Рудная',
    quote: 'Сотрудники компании оперативно и качественно решали многочисленные вопросы, возникающие в процессе строительства. Все этапы дальнейшего строительства West Capital Construction LLP терпеливо согласовывала с руководством ТОО «АМК». Рекомендуем их как надёжную команду для проектов любой сложности.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', date: 'Сентябрь 2021', category: 'Строительство · 481 м',
    quote: 'Учитывая добросовестность и ответственность работников West Capital Construction LLP, а также серьёзный подход к выполняемой работе, мы уверены в безопасности эксплуатации железнодорожного пути и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', category: 'Демонтаж · 6,7 км',
    quote: 'Ваши специалисты справились с выполнением работ качественно и в установленные сроки, что подтверждает Вашу ответственность и подготовленность. Учитывая, что Ваша компания работала с нами при строительстве, обслуживании и теперь демонтажных работах, мы выражаем готовность на дальнейшее сотрудничество.' },
  { client: 'ТОО «Компания Фаэтон»', signatory: 'Русманова В. Ю.', role: 'Директор', date: '20 октября 2018', category: 'Содержание · рампа 70 м',
    quote: 'Сотрудники West Capital Construction LLP отличаются ответственностью, добропорядочностью и профессионализмом. Обход, осмотр и исправление дефектов подъездного пути осуществляется качественно и своевременно. Их работа даёт нам уверенность в безопасной эксплуатации пути.' },
  { client: 'ТОО «АлтынНұран»', signatory: 'Мурзабеков Ж. Н.', role: 'Директор', date: 'С сентября 2019', category: 'Содержание · 115 м',
    quote: 'Все работы по текущему содержанию железнодорожного пути и сооружений выполнялись высококвалифицированными специалистами. Учитывая добросовестность и ответственность работников, мы уверены в безопасности эксплуатации и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Синтез Урал»', signatory: 'Морозов С. А.', role: 'Директор', date: 'С ноября 2024', category: 'Строительство · 500 м',
    quote: 'Хочется отметить профессионализм и ответственность работников West Capital Construction LLP, а также оперативность решения вопросов в ходе строительства. Высокий уровень организационной работы позволил качественно и в срок сдать объект в эксплуатацию.' },
  { client: 'ТОО «Portal KZ»', signatory: 'Нышанов М. М.', role: 'Директор', category: 'Строительство · ст. Никельтау',
    quote: 'Строительство выполнено с чётким соблюдением всех условий договора: работа была выполнена в срок, в соответствии с техническим заданием. Между нашими организациями сложилась хорошая практика оперативного взаимодействия в согласовании технических решений.' },
  { client: 'ИП «Жанажанов Б. С.»', signatory: 'Жанажанов Б. С.', role: 'Индивидуальный предприниматель', category: 'Строительство · 200 м',
    quote: 'Благодаря профессиональному подходу к работе сотрудниками West Capital Construction LLP строительство нашего железнодорожного пути необщего пользования было завершено раньше намеченного срока, при этом качество и надёжность построенного объекта достойны самых высоких оценок.' },
  { client: 'ТОО «Нефтестройсервис ЛТД» · NSS', signatory: 'Отаров Р. К.', role: 'Директор', date: '01 ноября 2022', category: 'Строительство · ст. Тендык',
    quote: 'Работы выполнены в соответствии с действующими строительными нормами и правилами, согласно техническому заданию и условиям контракта, с надлежащим качеством и в установленный срок. West Capital Construction LLP проявила себя как высокопрофессиональная компания.' },
  { client: 'ЧЛ «Ни К. А.»', signatory: 'Ни К. А.', role: 'Частный заказчик', category: 'Строительство · 41 разъезд',
    quote: 'Компания показала себя как исполнительный подрядчик, выполняющий договорные обязательства с превосходным качеством работ и в установленные сроки. Применяемые компанией современные методы строительства соответствуют требованиям СН РК, СП РК и ГОСТ.' },
  { client: 'ТОО «СП «Сине Мидас Строй»', signatory: 'Иманкулова Б. Т.', role: 'Исполнительный директор', category: 'Демонтаж · 850 м',
    quote: 'Не можем не отметить высокий профессионализм работников West Capital Construction LLP, а также максимальную ответственность при выполнении поставленных задач. Качество работ не оставляет сомнений, надеемся на ещё более тесное сотрудничество.' },
  { client: 'ТОО «ПГС-Тамды»', signatory: 'Испанов А. К.', role: 'Директор', category: 'Строительство · ст. Тамды',
    quote: 'Профессиональный и ответственный подход к выполнению работы сотрудниками West Capital Construction LLP обеспечили строительство нашего железнодорожного пути необщего пользования в стационарный путь «на окно». Все согласования с организациями АО «НК «КТЖ» велись своевременно.' },
];

const PARTNERS = [
  { file: '9.png',          name: 'Қазақстан Темір Жолы' },
  { file: '1.png',          name: 'Русская Медная Компания' },
  { file: '5554453.png',    name: 'Урал Синтез' },
  { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Группа Синтез' },
  { file: '4.png',          name: 'Shubarkol Premium' },
  { file: '7.png',          name: 'Altynex' },
  { file: 'metprom-logo-rus-Photoroom.png',           name: 'Метпром' },
  { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg', name: 'Тенізшевройл' },
  { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg', name: 'Khorgos Gateway' },
  { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
  { file: '5.png',          name: 'NSS' },
  { file: '3.png',          name: 'Сине Мидас Строй' },
  { file: '6.png',          name: 'Актобе Стекло' },
  { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'СПК «Актобе»' },
  { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg', name: 'СПС Энерго' },
  { file: '2.png',          name: 'Зерде Керамика' },
];

const INDUSTRY_CHIPS = [
  { icon: '☰', label: 'Ж/д и автодороги' },
  { icon: '▶', label: 'Трубопроводы' },
  { icon: '⚡', label: 'ЛЭП и связь' },
  { icon: '⌂', label: 'Промышленные объекты' },
  { icon: '◉', label: 'Инженерные сети' },
];

const KEY_REGIONS = ['Актюбинская', 'ЗКО', 'Атырауская', 'Мангистауская', 'Карагандинская', 'Алматы', 'Астана', 'Оренбург (РФ)'];

const PARTNER_CATEGORIES = ['КТЖ', 'ТМК', 'НЕФТЕГАЗ', 'ИНДУСТР. ЗОНЫ'];

const SVCS_DESIGN = [
  { num: '01', title: 'Инженерно-геодезические изыскания', desc: 'Топосъёмка, разбивка осей, геодезические сети, мониторинг деформаций — для линейных и площадных объектов.' },
  { num: '02', title: 'Инженерно-геологические изыскания', desc: 'Бурение, лабораторные испытания грунтов, гидрогеология, оценка сейсмичности на проектируемых площадках.' },
  { num: '03', title: 'Проектно-сметная документация',     desc: 'Рабочая документация и ТЭО для дорог, трубопроводов и ЛЭП; прохождение экспертизы в РГП «ГосЭкспертиза».' },
  { num: '04', title: 'Технические условия примыкания',    desc: 'Согласование с филиалами АО «НК «КТЖ» и сетевыми компаниями, ТЭО, план путевого и сетевого развития.' },
  { num: '05', title: 'Проектирование инженерных сетей',    desc: 'ВЛ 10/110 кВ, газо- и нефтепроводы, водопровод, канализация, теплоснабжение, кабельные линии связи.' },
  { num: '06', title: 'Землеустроительные проекты',         desc: 'Формирование участков, документация для отвода земель под капитальное строительство и линейные объекты.' },
];

const SVCS_BUILD = [
  { num: '01', title: 'Автомобильные и железные дороги',  desc: 'Верхнее строение пути — РШР Р65, стрелочные переводы 1/9 и 1/7, балластировка; автодороги I–V технической категории, ВПП аэродромов.' },
  { num: '02', title: 'Магистральные трубопроводы и резервуары', desc: 'Нефте- и газопроводы высокого/среднего давления, продуктопроводы, стальные резервуары — в т. ч. под опасные среды.' },
  { num: '03', title: 'Линии электропередач и связи',     desc: 'ВЛ до 35 кВ, до 110 кВ и выше, контактная сеть ж/д путей, общереспубликанские линии связи и телекоммуникаций.' },
  { num: '04', title: 'Промышленные объекты и сооружения', desc: 'Несущие и ограждающие конструкции, монтаж металлических и ж/б конструкций, дымовые трубы, силосы, мосты и эстакады.' },
  { num: '05', title: 'Инженерные сети, СЦБ и контактная сеть', desc: 'Водо-, тепло-, газоснабжение, наружное освещение, электрификация ж/д, светофоры и переездная сигнализация.' },
  { num: '06', title: 'Содержание ж/д путей и демонтаж',  desc: 'Промеры пути 2 раза в месяц, замена шпал и рельсов, обслуживание стрелочных переводов, демонтаж РШР и устройств БМРЦ.' },
];

const PROCESS_DESIGN = [
  { roman: 'I',  title: 'Изыскания',     meta: 'Геодезия · геология · гидрология' },
  { roman: 'II', title: 'ПСД и РД',       meta: 'Проектно-сметная и рабочая' },
  { roman: 'III',title: 'ГосЭкспертиза', meta: 'Согласование РГП' },
  { roman: 'IV', title: 'Авторский надзор', meta: 'Сопровождение СМР' },
];

const PROCESS_BUILD = [
  { roman: 'I',  title: 'Подготовка',       meta: 'Мобилизация · временные сети' },
  { roman: 'II', title: 'Земляные работы',  meta: 'Выемка · насыпь · основание' },
  { roman: 'III',title: 'Верхнее строение', meta: 'РШР · покрытия · монтаж' },
  { roman: 'IV', title: 'Сдача и ПНР',       meta: 'Пусконаладка · акт ввода' },
];

const TEAM = [
  { num: '01', role: 'Генеральный директор',     name: 'Аронов Аян Садиржанович',    phone: '+7 (777) 669-99-89' },
  { num: '02', role: 'Директор проектной группы', name: 'Валеев Алексей Сергеевич',    phone: '+7 (775) 645-90-51' },
  { num: '03', role: 'Директор по производству', name: 'Прусс Альберт Русланович',    phone: '+7 (747) 135-14-92' },
  { num: '04', role: 'Главный инженер проекта',  name: 'Штурмилов Валентин Петрович', phone: '+7 (771) 229-38-78' },
];

/* ─────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────── */

const TOTAL = 17;   // 16 content pages + 1 editorial closer
const pageNumLabel = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;
const ISSUE_STAMP  = 'WAG · PORTFOLIO · VOL.06 · 2026';

function CornerL({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const cls = pos === 'tl' ? styles.cornerTL : pos === 'tr' ? styles.cornerTR : pos === 'bl' ? styles.cornerBL : styles.cornerBR;
  return <span className={`${styles.cornerL} ${cls}`} aria-hidden />;
}

function PageChrome({ pageNum, dark = false }: { pageNum?: number; dark?: boolean }) {
  return (
    <>
      <CornerL pos="tl" />
      <CornerL pos="tr" />
      <CornerL pos="bl" />
      <CornerL pos="br" />
      {pageNum != null && (
        <>
          <div className={`${styles.pageNum} ${dark ? styles.pageNumDark : ''}`}>{pageNumLabel(pageNum)}</div>
          <div className={`${styles.pageStamp} ${dark ? styles.pageStampDark : ''}`}>{ISSUE_STAMP}</div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page component
   ───────────────────────────────────────────────────────────────── */

export default async function PortfolioPrintPage() {
  const projects = await getProjects();

  // All marketing numbers are tuned copy (per project memory: every stat is
  // invented). The target PDF locks these — keep them deterministic instead
  // of pulling from the DB so seed mode doesn't break the layout.
  const COUNT_SMR = 49;
  const COUNT_PD = 87;
  const COUNT_REGISTRY = COUNT_SMR + COUNT_PD;        // 136
  const COUNT_REGIONS = 16;
  const COUNT_COUNTRIES = 2;
  const COUNT_TESTIMONIALS = PRINT_TESTIMONIALS.length;

  // Map dots: derived from real DB rows when available.
  const completed  = projects.filter(p => p.status === 'completed').length || 43;
  const inProgress = projects.filter(p => p.status === 'in-progress').length || 3;
  const planned    = projects.filter(p => p.status === 'planned').length || 3;

  // QR codes are pre-baked by scripts/bake-qr-codes.mjs to PNGs under
  // /public/portfolio/. Saves render time and keeps the build deterministic.
  // (Source URLs: arlan-gr.kz/projects and arlan-gr.kz/design — re-run the
  // bake script if these change.)

  // Testimonial chunks: 8 on page 13, 7 on page 14.
  const testChunks: PrintTestimonial[][] = [
    PRINT_TESTIMONIALS.slice(0, 8),
    PRINT_TESTIMONIALS.slice(8),
  ];

  return (
    <main className={styles.book}>
      <PrintButtons />

      {/* ═══ 01 · COVER ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <CornerL pos="tl" />
        <CornerL pos="tr" />
        <CornerL pos="bl" />
        <CornerL pos="br" />
        <div className={styles.coverEyebrow}>КОРПОРАТИВНЫЙ ПРОФИЛЬ</div>
        <div className={styles.coverIssue}>VOL. 06 · 2026</div>
        <div className={styles.coverMarkWrap}>
          <WagMark className={styles.coverMark} gradientId="wagCover" />
        </div>
        <div className={styles.coverIntro}>5 отраслей · 16 регионов · 2 страны · 15 лет</div>
        <h1 className={styles.coverTitle}>
          WEST ARLAN<br />
          <span className={styles.coverTitleAccent}>GROUP</span>
        </h1>
        <div className={styles.coverTagline}>
          Полный цикл — от инженерных изысканий и проектирования до сдачи объекта под ключ.
        </div>
        <div className={styles.coverChips}>
          <span>I КАТЕГОРИЯ</span>
          <span>·</span>
          <span>ISO 9001</span>
          <span>·</span>
          <span>ISO 14001</span>
          <span>·</span>
          <span>С 2010 ГОДА</span>
        </div>
        <div className={styles.coverBottom}>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomLabel}>БИН</div>
            <div className={styles.coverBottomValue}>090940003245</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomLabel}>PHONE</div>
            <div className={styles.coverBottomValue}>+7 7132 538-288</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomLabel}>SITE</div>
            <div className={styles.coverBottomValue}>arlan-gr.kz</div>
          </div>
        </div>
      </section>

      {/* ═══ 02 · ABOUT ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={2} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>О КОМПАНИИ · С 2010 ГОДА</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              Мы строим<br />
              <span className={styles.titleAccent}>инфраструктуру страны</span>
            </h2>
            <div className={styles.inlineStats}>
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>15+</span><span className={styles.inlineStatLabel}>лет на рынке</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>5</span><span className={styles.inlineStatLabel}>отраслей</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_REGIONS}</span><span className={styles.inlineStatLabel}>регионов</span></div>
            </div>
          </div>

          <div className={styles.leadBox}>
            Полный цикл — от изысканий и проектирования до строительства и сдачи объекта «под ключ».
            Транспортная, энергетическая, нефтегазовая и промышленная инфраструктура в Казахстане и России:
            ГИПы, инженеры-проектировщики, геодезисты, сметчики, прорабы и инженеры СЦБ работают над проектами,
            которые служат десятилетиями.
          </div>

          <div className={styles.industryChipsRow}>
            <span className={styles.miniLabel}>ОТРАСЛИ</span>
            <div className={styles.industryChipsGroup}>
              {INDUSTRY_CHIPS.map((c) => (
                <span key={c.label} className={styles.industryChip}>
                  <span className={styles.industryChipIcon}>{c.icon}</span>
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.dashedDivider} />

          <div className={styles.aboutTwoCol}>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}>· НАША МИССИЯ</div>
              <p>Создавать надёжную инфраструктуру для будущего Казахстана. Важной причиной успеха
                компании является слаженная работа специалистов, их целеустремлённость и нацеленность
                на результат. Мы неукоснительно следуем нашим ценностям, формируя положительный имидж
                компании и укрепляя доверие партнёров.</p>
            </div>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}>· ПОДХОД К РАБОТЕ</div>
              <p>Один договор — один ответственный. Группа закрывает весь цикл собственными силами:
                инженерные изыскания, проектная и рабочая документация, прохождение РГП «ГосЭкспертиза»,
                СМР и сдача объекта в эксплуатацию. Сроки и качество фиксируются лицензиями I категории
                и системами ISO 9001 / 14001.</p>
            </div>
          </div>

          <div className={styles.legalBlockLabel}><span /> ЮРИДИЧЕСКИЕ ЛИЦА ГРУППЫ</div>
          <div className={styles.legalCards}>
            <div className={`${styles.legalCard} ${styles.legalCardDark}`}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeGold}`}>HQ</span>
              <div className={styles.legalCardName}>West Arlan Group</div>
              <div className={styles.legalCardRole}>Головная компания · координация</div>
              <div className={styles.legalCardMeta}>ТОО · БИН 090940003245 · Актобе</div>
            </div>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeTeal}`}>СМР</span>
              <div className={styles.legalCardName}>West Capital Construction LLP</div>
              <div className={styles.legalCardRole}>Член группы · строительно-монтажные работы</div>
              <div className={styles.legalCardMeta}>Договорная история с 2010 г.</div>
            </div>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeBlue}`}>ПД</span>
              <div className={styles.legalCardName}>Global Construction Project</div>
              <div className={styles.legalCardRole}>Член группы · проектная деятельность</div>
              <div className={styles.legalCardMeta}>ПСД, ТЭО, экспертиза</div>
            </div>
          </div>

          <div className={styles.legalNote}>
            West Capital Construction LLP и Global Construction Project входят в состав группы под
            управлением West Arlan Group и работают по единой политике качества с лицензиями I категории.
          </div>

          <WagMark className={styles.aboutWatermark} gradientId="wagAbout" />
        </div>
      </section>

      {/* ═══ 03 · SCALE (BIG NUMBERS) ═════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={3} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>МАСШТАБ РАБОТ</div>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
            За пятнадцать лет<br />работы
          </h2>

          <div className={styles.scaleGrid}>
            <div className={`${styles.scaleBlock} ${styles.scaleGold}`}>
              <div className={styles.scaleBar} />
              <div className={styles.scaleBody}>
                <div className={styles.scaleNum}>{COUNT_SMR}</div>
                <div className={styles.scaleLabel}>СМР объектов</div>
                <div className={styles.scaleDesc}>Реализованных и текущих строительно-монтажных проектов в реестре с 2015 года</div>
              </div>
            </div>
            <div className={`${styles.scaleBlock} ${styles.scaleTeal}`}>
              <div className={styles.scaleBar} />
              <div className={styles.scaleBody}>
                <div className={styles.scaleNum}>{COUNT_PD}</div>
                <div className={styles.scaleLabel}>Проектных работ</div>
                <div className={styles.scaleDesc}>Рабочих проектов, ТЭО, землеустроительных проектов, пройденных экспертиз</div>
              </div>
            </div>
            <div className={`${styles.scaleBlock} ${styles.scaleBlue}`}>
              <div className={styles.scaleBar} />
              <div className={styles.scaleBody}>
                <div className={styles.scaleNum}>{COUNT_REGIONS}</div>
                <div className={styles.scaleLabel}>Регионов</div>
                <div className={styles.scaleDesc}>Актюбинская, ЗКО, Атырауская, Мангистауская, Алматы, Астана и другие</div>
              </div>
            </div>
            <div className={`${styles.scaleBlock} ${styles.scaleGold}`}>
              <div className={styles.scaleBar} />
              <div className={styles.scaleBody}>
                <div className={styles.scaleNum}>{COUNT_COUNTRIES}</div>
                <div className={styles.scaleLabel}>Страны</div>
                <div className={styles.scaleDesc}>Казахстан и Россия (АО «Уральская Сталь», Оренбургская область)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 04 · MAP / GEOGRAPHY ═════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={4} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>ГЕОГРАФИЯ РАБОТ · {COUNT_REGIONS} РЕГИОНОВ · {COUNT_COUNTRIES} СТРАНЫ</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
              <span className={styles.titleAccentGold}>Карта</span> объектов
            </h2>
            <div className={styles.regionsBadge}>
              <div className={styles.regionsBadgeNum}>{COUNT_REGIONS}</div>
              <div className={styles.regionsBadgeLabel}>РЕГИОНОВ<br />КАЗАХСТАНА</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>
            Объекты по всему Казахстану — от Атырау до Хоргоса, от Уральска до Семея — и в Оренбургской
            области Российской Федерации (АО «Уральская Сталь», г. Новотроицк).
          </div>

          <div className={styles.mapFrame}>
            <span className={styles.mapCornerCoord} style={{ top: '4mm', left: '4mm' }}>N 55° · E 045°</span>
            <span className={styles.mapCornerCoord} style={{ bottom: '4mm', right: '4mm' }}>N 040° · E 087°</span>
            {/* Pre-baked KZ map background — produced by scripts/bake-kz-map.mjs. */}
            <img src="/portfolio/kz-map.png" alt="" className={styles.mapImg} aria-hidden />
            <svg viewBox="-100 30 1200 820" className={styles.mapSvg} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              {/* Project dots from DB. No text callouts on the map itself —
                  the stat bar + region chips below carry that information. */}
              {projects.filter((pr) => pr.x_map != null && pr.y_map != null).slice(0, 40).map((pr) => {
                const color = pr.status === 'completed' ? '#D4A843' : pr.status === 'in-progress' ? '#00C4A7' : '#4F84FF';
                return (
                  <g key={pr.id}>
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="12" fill={color} opacity="0.20" />
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="4.5" fill={color} />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className={styles.statBar}>
            <div className={`${styles.statBarItem} ${styles.statBarGold}`}>
              <div className={styles.statBarNum}>{completed}</div>
              <div className={styles.statBarLabel}>ЗАВЕРШЕНО</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarTeal}`}>
              <div className={styles.statBarNum}>{inProgress}</div>
              <div className={styles.statBarLabel}>В РАБОТЕ</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarBlue}`}>
              <div className={styles.statBarNum}>{planned}</div>
              <div className={styles.statBarLabel}>В ПЛАНАХ</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarGold}`}>
              <div className={styles.statBarNum}>{COUNT_COUNTRIES}</div>
              <div className={styles.statBarLabel}>СТРАНЫ</div>
            </div>
          </div>

          <div className={styles.chipRow}>
            <span className={styles.miniLabel}>КЛЮЧЕВЫЕ РЕГИОНЫ</span>
            <div className={styles.chipGroup}>
              {KEY_REGIONS.map((r) => (
                <span key={r} className={`${styles.chip} ${styles.chipDark}`}>{r}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 05 · ISO CERTIFICATES ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={5} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>СЕРТИФИКАТЫ · ISO</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              Международные<br />
              <span className={styles.titleAccent}>стандарты качества</span>
            </h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>04</div>
              <div className={styles.bigBadgeLabel}>СЕРТИФИКАТА<br />ISO</div>
            </div>
          </div>

          <div className={styles.leadBox}>
            Группа сертифицирована по международным стандартам качества и экологического менеджмента.
            Аудит процессов проходит регулярно — это закрепляет единый стандарт работы во всех трёх
            юридических лицах группы.
          </div>

          <div className={styles.isoGrid}>
            <div className={styles.isoCard}>
              <img src="/licenses/sertifikat-iso-9001-ru.webp" alt="ISO 9001" className={styles.isoImg} />
              <div className={styles.isoMeta}>
                <div className={styles.isoName}>ISO 9001 · Quality Management</div>
                <div className={styles.isoDetail}>Система менеджмента качества</div>
              </div>
            </div>
            <div className={styles.isoCard}>
              <img src="/licenses/sertifikat-iso-9001-kz.webp" alt="ISO 9001 KZ" className={styles.isoImg} />
              <div className={styles.isoMeta}>
                <div className={styles.isoName}>ISO 9001 · KZ</div>
                <div className={styles.isoDetail}>Сертификат качества Республики Казахстан</div>
              </div>
            </div>
            <div className={styles.isoCard}>
              <img src="/licenses/sertifikat-ekologicheskiy-menedzhment.webp" alt="ISO 14001" className={styles.isoImg} />
              <div className={styles.isoMeta}>
                <div className={styles.isoName}>ISO 14001 · Environmental</div>
                <div className={styles.isoDetail}>Экологический менеджмент</div>
              </div>
            </div>
            <div className={styles.isoCard}>
              <img src="/licenses/sertifikat-iso-9001-2016.webp" alt="ISO 9001:2016" className={styles.isoImg} />
              <div className={styles.isoMeta}>
                <div className={styles.isoName}>ISO 9001:2016</div>
                <div className={styles.isoDetail}>Аудит процессов · ресертификация</div>
              </div>
            </div>
          </div>

          <div className={styles.isoFooter}>
            <div className={styles.isoFooterItem}>
              <div className={styles.isoFooterLabel}>ОРГАН СЕРТИФИКАЦИИ</div>
              <div className={styles.isoFooterValue}>Аккредитованные органы РК и СНГ</div>
            </div>
            <div className={styles.isoFooterItem}>
              <div className={styles.isoFooterLabel}>ОБЪЕКТЫ ПРИМЕНЕНИЯ</div>
              <div className={styles.isoFooterValue}>Изыскания · проектирование · СМР</div>
            </div>
            <div className={styles.isoFooterItem}>
              <div className={styles.isoFooterLabel}>АУДИТ</div>
              <div className={styles.isoFooterValue}>Ежегодный надзорный · ресертификация</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 06 · LICENSE СМР ═════════════════════════════════════ */}
      <LicensePage
        pageNum={6}
        number="25008103"
        date="14.03.2025"
        title="Строительно-монтажные работы"
        badge="I КАТЕГОРИЯ"
        scan="/licenses/license-smr.jpg"
        meta={[
          { label: 'СТАТУС ВЫДАЧИ', value: 'Управление ГАСК Актюбинской области' },
          { label: 'ПЕРВИЧНАЯ ВЫДАЧА', value: '13.07.2010' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'до 25.06.2027' },
          { label: 'ОБЪЁМ', value: 'Все виды СМР I кат.' },
        ]}
      />

      {/* ═══ 07 · LICENSE ПД ══════════════════════════════════════ */}
      <LicensePage
        pageNum={7}
        number="25031072"
        date="05.09.2025"
        title="Проектная деятельность"
        badge="I КАТЕГОРИЯ"
        scan="/portfolio/page7_img3.jpeg"
        meta={[
          { label: 'СТАТУС ВЫДАЧИ', value: 'Управление ГАСК Актюбинской области' },
          { label: 'ПЕРВИЧНАЯ ВЫДАЧА', value: '28.04.2010' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'Бессрочно · класс 1' },
          { label: 'ОБЪЁМ', value: 'Полный цикл ПСД' },
        ]}
      />

      {/* ═══ 08 · LICENSE ОС ══════════════════════════════════════ */}
      <LicensePage
        pageNum={8}
        number="02962Р"
        date="22.09.2025"
        title="Охрана окружающей среды"
        badge="КЛАСС 1"
        scan="/portfolio/page7_img1.jpeg"
        meta={[
          { label: 'ОРГАН ВЫДАЧИ', value: 'Министерство экологии и природных ресурсов РК' },
          { label: 'МЕСТО ВЫДАЧИ', value: 'г. Астана' },
          { label: 'ОСОБЫЕ УСЛОВИЯ', value: 'Неотчуждаемая' },
          { label: 'ОБЪЁМ', value: 'Раздел ОВОС в составе ПСД' },
        ]}
      />

      {/* ═══ 09 · ACCREDITATION ═══════════════════════════════════ */}
      <LicensePage
        pageNum={9}
        number="KZ58VWC00251751"
        date="25.06.2025"
        title="Аккредитация · экспертные работы"
        badge="I и II УРОВНИ"
        scan="/portfolio/page8_img2.jpeg"
        meta={[
          { label: 'ДЕРЖАТЕЛЬ', value: 'ТОО «Global Construction Project»' },
          { label: 'ОРГАН ВЫДАЧИ', value: 'Комитет по делам строительства и ЖКХ · г. Астана' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'до 25.06.2027' },
          { label: 'ОБЪЁМ', value: 'Техническое обследование зданий и сооружений' },
        ]}
      />

      {/* ═══ 10 · DIRECTION 01 — DESIGN ═══════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={10} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>НАПРАВЛЕНИЕ 01 · ПРОЕКТНАЯ ДЕЯТЕЛЬНОСТЬ</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
              <span className={styles.titleAccentGold}>Проектирование</span><br />
              и инженерные изыскания
            </h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeGold}`}>
              <div className={styles.outlinedBadgeTop}>I КАТ.</div>
              <div className={styles.outlinedBadgeBottom}>С 2010</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>
            Полный комплект ПСД для прохождения РГП «ГосЭкспертиза» — автомобильные и железные дороги,
            магистральные трубопроводы, ЛЭП, промышленные объекты и инженерные сети. Лицензия I категории
            на проектную деятельность с 2010 года.
          </div>

          <div className={styles.svcGrid}>
            {SVCS_DESIGN.map((s) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcNum} ${styles.svcNumGold}`}>{s.num}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}><span /> ЭТАПЫ РАБОТ ПО ПРОЕКТУ</div>
          <div className={styles.processFlow}>
            {PROCESS_DESIGN.map((step, i) => (
              <div key={step.roman} className={styles.processGroup}>
                <div className={`${styles.processStep} ${styles.processStepGold}`}>
                  <div className={styles.processRoman}>{step.roman}</div>
                  <div className={styles.processTitle}>{step.title}</div>
                  <div className={styles.processMeta}>{step.meta}</div>
                </div>
                {i < PROCESS_DESIGN.length - 1 && <div className={styles.processArrow}>→</div>}
              </div>
            ))}
          </div>

          <div className={styles.dirFooter}>
            <span className={styles.dirFooterNum}>{COUNT_PD}</span>
            <span className={styles.dirFooterLabel}>ПРОЕКТНЫХ РАБОТ В РЕЕСТРЕ</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>GLOBAL CONSTRUCTION PROJECT</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>arlan-gr.kz / design</span>
          </div>
        </div>
      </section>

      {/* ═══ 11 · DIRECTION 02 — BUILD ════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={11} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>НАПРАВЛЕНИЕ 02 · СТРОИТЕЛЬНО-МОНТАЖНЫЕ РАБОТЫ</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
              <span className={styles.titleAccentTeal}>Строительно-монтажные</span><br />
              работы
            </h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeTeal}`}>
              <div className={styles.outlinedBadgeTop}>I КАТ.</div>
              <div className={styles.outlinedBadgeBottom}>С 2010</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>
            Лицензия I категории на СМР с 2010 года. Строительство «под ключ» в пяти отраслях
            инфраструктуры — от автомобильных и железных дорог до магистральных трубопроводов, ЛЭП,
            промышленных объектов и инженерных сетей.
          </div>

          <div className={styles.svcGrid}>
            {SVCS_BUILD.map((s) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcNum} ${styles.svcNumTeal}`}>{s.num}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}><span /> ЭТАПЫ РАБОТ НА ОБЪЕКТЕ</div>
          <div className={styles.processFlow}>
            {PROCESS_BUILD.map((step, i) => (
              <div key={step.roman} className={styles.processGroup}>
                <div className={`${styles.processStep} ${styles.processStepTeal}`}>
                  <div className={styles.processRoman}>{step.roman}</div>
                  <div className={styles.processTitle}>{step.title}</div>
                  <div className={styles.processMeta}>{step.meta}</div>
                </div>
                {i < PROCESS_BUILD.length - 1 && <div className={styles.processArrow}>→</div>}
              </div>
            ))}
          </div>

          <div className={styles.dirFooter}>
            <span className={`${styles.dirFooterNum} ${styles.dirFooterNumTeal}`}>{COUNT_SMR}</span>
            <span className={styles.dirFooterLabel}>СМР ОБЪЕКТОВ В РЕЕСТРЕ</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>WEST CAPITAL CONSTRUCTION LLP</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>arlan-gr.kz / projects</span>
          </div>
        </div>
      </section>

      {/* ═══ 12 · PORTFOLIO QR ════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={12} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ПОЛНЫЙ РЕЕСТР · ОНЛАЙН</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              <span className={styles.titleAccent}>Портфолио</span><br />
              проектов и работ
            </h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>{COUNT_REGISTRY}</div>
              <div className={styles.bigBadgeLabel}>ЗАПИСЕЙ<br />В РЕЕСТРЕ</div>
            </div>
          </div>

          <div className={styles.leadBox}>
            Актуальный реестр проектов с полным составом работ, заказчиками, сроками и статусами — на сайте.
            Реестр обновляется по мере сдачи новых объектов и прохождения экспертизы.
          </div>

          <div className={styles.qrGrid}>
            <div className={`${styles.qrCard} ${styles.qrCardTeal}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>01</span>
                <span className={styles.qrCardTitle}>Строительные<br />работы</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_SMR}</span>
                <span className={styles.qrCountLabel}>СМР объектов<br />· 2015—2026</span>
              </div>
              <img src="/portfolio/qr-projects.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>arlan-gr.kz/projects</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardGold}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>02</span>
                <span className={styles.qrCardTitle}>Проектные<br />работы</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_PD}</span>
                <span className={styles.qrCountLabel}>проектных работ<br />· ПСД и ТЭО</span>
              </div>
              <img src="/portfolio/qr-design.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>arlan-gr.kz/design</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>
          </div>

          <div className={styles.processLabel}><span /> ЧТО ВЫ НАЙДЁТЕ В РЕЕСТРЕ</div>
          <div className={styles.qrInfoRow}>
            <div className={styles.qrInfoChip}>
              <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} /> Состав работ</div>
              <div className={styles.qrInfoChipDesc}>Объёмы, сроки, статус по каждому объекту</div>
            </div>
            <div className={styles.qrInfoChip}>
              <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} /> Заказчики</div>
              <div className={styles.qrInfoChipDesc}>КТЖ, индустриальные зоны, частные заказчики</div>
            </div>
            <div className={styles.qrInfoChip}>
              <div className={styles.qrInfoChipTitle}><span className={styles.qrInfoDot} /> География</div>
              <div className={styles.qrInfoChipDesc}>Карта с координатами и регионами</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 13 · TESTIMONIALS 1/2 ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={13} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ОТЗЫВЫ КЛИЕНТОВ · {COUNT_TESTIMONIALS} ПИСЕМ</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              <span className={styles.titleAccent}>Что говорят</span><br />
              наши заказчики
            </h2>
            <div className={styles.bigBadge}>
              <div className={styles.bigBadgeNum}>{COUNT_TESTIMONIALS}</div>
              <div className={styles.bigBadgeLabel}>БЛАГОДАРСТВЕННЫХ<br />ПИСЕМ</div>
            </div>
          </div>

          <div className={styles.leadBox}>
            Большинство писем адресованы подрядной компании группы — West Capital Construction LLP — по
            железнодорожным объектам, сданным в эксплуатацию. Тот же стандарт качества и сроков
            обеспечиваем на автодорогах, трубопроводах, ЛЭП и промышленных объектах.
          </div>

          <div className={styles.testGrid}>
            {testChunks[0].map((t, i) => (
              <TestimonialCard key={`t0-${i}`} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 14 · TESTIMONIALS 2/2 ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={14} />
        <div className={styles.pageInner}>
          <div className={styles.testContd}>
            <span className={styles.eyebrow}>ОТЗЫВЫ КЛИЕНТОВ · ПРОДОЛЖЕНИЕ</span>
            <span className={styles.testContdRight}>СТР. 2 ИЗ 2</span>
          </div>

          <div className={`${styles.testGrid} ${styles.testGridContd}`}>
            {testChunks[1].map((t, i) => (
              <TestimonialCard key={`t1-${i}`} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 15 · PARTNERS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={15} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ПАРТНЁРЫ И ЗАКАЗЧИКИ · ФРАГМЕНТ РЕЕСТРА</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              <span className={styles.titleAccent}>Нам доверяют</span><br />
              крупнейшие компании<br />страны
            </h2>
            <div className={styles.categoryChipColumn}>
              {PARTNER_CATEGORIES.map((c) => (
                <span key={c} className={`${styles.chip} ${styles.chipFilled}`}>{c}</span>
              ))}
            </div>
          </div>

          <div className={styles.leadBox}>
            Среди заказчиков — государственные операторы (АО «НК «КТЖ», СПК), металлургические
            и нефтегазовые холдинги, индустриальные зоны и частные предприятия Казахстана и России.
          </div>

          <div className={styles.partnersGrid}>
            {PARTNERS.map((pa) => (
              <div key={pa.file} className={styles.partnerCard}>
                <div className={styles.partnerLogoWrap}>
                  <img src={`/partners/${pa.file}`} alt={pa.name} className={styles.partnerLogo} />
                </div>
                <div className={styles.partnerName}>{pa.name}</div>
              </div>
            ))}
          </div>

          <div className={styles.partnerFooter}>
            <div className={styles.partnerFooterLeft}>
              <span className={styles.partnerFooterNum}>94%</span>
              <span className={styles.partnerFooterText}>ПОВТОРНЫХ КОНТРАКТОВ</span>
            </div>
            <div className={styles.partnerFooterRight}>
              ПОЛНЫЙ РЕЕСТР ЗАКАЗЧИКОВ · arlan-gr.kz
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 16 · CONTACTS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={16} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>КОНТАКТЫ · ОФИС В АКТОБЕ</div>
          <div className={styles.titleRow}>
            <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
              <span className={styles.titleAccentGold}>Готовы</span><br />к сотрудничеству
            </h2>
            <div className={`${styles.outlinedBadge} ${styles.outlinedBadgeGold}`}>
              <div className={styles.outlinedBadgeTopSmall}>СРОК ОТВЕТА</div>
              <div className={styles.outlinedBadgeNumBig}>1<span>день</span></div>
              <div className={styles.outlinedBadgeBottom}>ПН — ПТ</div>
            </div>
          </div>

          <div className={`${styles.leadBox} ${styles.leadBoxDark}`}>
            Расскажите о проекте — изыскания, проектирование или СМР — и получите коммерческое предложение.
            Сопровождение от первого звонка до сдачи объекта в эксплуатацию.
          </div>

          <div className={styles.contactRowGrid}>
            <div className={styles.contactRow}>
              <div className={styles.contactRowIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className={styles.contactRowBody}>
                <div className={styles.contactRowLabel}>ТЕЛЕФОН ОФИСА</div>
                <div className={styles.contactRowValue}>8 (7132) 538-288</div>
              </div>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.contactRowIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className={styles.contactRowBody}>
                <div className={styles.contactRowLabel}>EMAIL</div>
                <div className={styles.contactRowValue}>west_arlan-group@mail.ru</div>
              </div>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.contactRowIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className={styles.contactRowBody}>
                <div className={styles.contactRowLabel}>АДРЕС ОФИСА</div>
                <div className={styles.contactRowValue}>г. Актобе, ул. Казангапа,<br />дом 57В, офис 34</div>
              </div>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.contactRowIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className={styles.contactRowBody}>
                <div className={styles.contactRowLabel}>РЕЖИМ РАБОТЫ</div>
                <div className={styles.contactRowValue}>Пн — Пт · 09:00 — 18:00 (GMT+5)</div>
              </div>
            </div>
          </div>

          <div className={styles.processLabel}><span /> ПРЯМЫЕ КОНТАКТЫ РУКОВОДСТВА</div>

          <div className={styles.teamGrid}>
            {TEAM.map((t) => (
              <div key={t.num} className={styles.teamCard}>
                <div className={styles.teamNum}>{t.num}</div>
                <div className={styles.teamRole}>{t.role}</div>
                <div className={styles.teamName}>{t.name}</div>
                <div className={styles.teamPhone}>{t.phone}</div>
              </div>
            ))}
          </div>

          <div className={styles.contactsFooter}>
            <div className={styles.contactsFooterCol}>
              <div className={styles.contactsFooterLabel}>ЮРИДИЧЕСКОЕ ЛИЦО</div>
              <div className={styles.contactsFooterValue}>ТОО «West Arlan Group» · БИН 090940003245</div>
            </div>
            <div className={styles.contactsFooterCol}>
              <div className={styles.contactsFooterLabel}>ЛИЦЕНЗИИ</div>
              <div className={styles.contactsFooterValue}>СМР № 25008103 · ПД № 25031072 · ОС № 02962Р</div>
            </div>
          </div>

          <div className={styles.contactsBottomBar}>
            <div className={styles.contactsBottomLeft}>
              <div className={styles.contactsFooterLabel}>САЙТ КОМПАНИИ</div>
              <div className={styles.contactsSite}>arlan-gr.kz</div>
            </div>
            <WagMark className={styles.contactsMark} gradientId="wagContacts" />
          </div>
        </div>
      </section>

      {/* ═══ 17 · CLOSING MANIFESTO ═══════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.closing}`}>
        <PageChrome pageNum={17} dark />
        <div className={styles.closingInner}>
          <div className={styles.closingEyebrow}>МАНИФЕСТ · WAG</div>
          <h2 className={styles.closingQuote}>
            Каждый объект — обязательство на десятилетия.
          </h2>
          <p className={styles.closingByline}>
            Мы не строим единоразово. Каждая лицензия I&nbsp;категории, каждая
            повторная подпись заказчика, каждый километр пути — это часть длинной
            истории, в которой мы отвечаем за результат и через год, и через двадцать.
          </p>
          <div className={styles.closingFooter}>
            <div>
              <div className={styles.closingFooterLabel}>Издание</div>
              <div className={styles.closingFooterValue}>{ISSUE_STAMP}</div>
            </div>
            <WagMark className={styles.closingMark} gradientId="wagClosing" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

function LicensePage({
  pageNum,
  number,
  date,
  title,
  badge,
  scan,
  meta,
}: {
  pageNum: number;
  number: string;
  date: string;
  title: string;
  badge: string;
  scan: string;
  meta: { label: string; value: string }[];
}) {
  return (
    <section className={`${styles.page} ${styles.pageLight}`}>
      <PageChrome pageNum={pageNum} />
      <div className={styles.pageInner}>
        <div className={styles.licHeader}>
          <div className={styles.licNumber}>▸ {number} · от {date}</div>
          <span className={styles.licBadgeDark}>{badge}</span>
        </div>
        <h2 className={styles.licTitle}>{title}</h2>

        <div className={styles.licScanFrame}>
          <img src={scan} alt={title} className={styles.licScanImg} />
        </div>

        <div className={styles.licMetaGrid}>
          {meta.map((m) => (
            <div key={m.label} className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>{m.label}</div>
              <div className={styles.licMetaValue}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: PrintTestimonial }) {
  return (
    <article className={styles.testCard}>
      <div className={styles.testCardHeader}>
        <span className={styles.testCardCategory}>{t.category}</span>
        {t.date && <span className={styles.testCardDate}>{t.date}</span>}
      </div>
      <h3 className={styles.testCardClient}>{t.client}</h3>
      <p className={styles.testCardQuote}>«{t.quote}»</p>
      <div className={styles.testCardSig}>
        <div className={styles.testCardSigName}>{t.signatory}</div>
        <div className={styles.testCardSigRole}>{t.role}</div>
      </div>
    </article>
  );
}
