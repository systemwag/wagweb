import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
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

// NOTE: client letters were originally addressed to the legacy juridical name
// «West Capital Construction LLP». Per request, quotes display the group name
// «West Arlan Group». The page-2 legal-entities card keeps the real subsidiary.
const PRINT_TESTIMONIALS: PrintTestimonial[] = [
  { client: 'ТОО «УКИЗ Актобе» · Aktobe Industrial Zone', signatory: 'Тулебаев А. Н.', role: 'Директор', date: '5 января 2020', category: 'Содержание · 4,5 км',
    quote: 'За время сотрудничества текущее содержание подъездных железнодорожных путей осуществляется квалифицированными специалистами. Качественно и своевременно устраняются все дефекты. Профессионализм работников West Arlan Group позволяет нам быть уверенными в безопасной эксплуатации.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Перебортовка · 63 км',
    quote: 'Высококвалифицированный персонал ответственно подошёл к выполнению поставленных задач, и качественно в установленные договором сроки выполнил данные работы. West Arlan Group имеет всю необходимую технику и оборудование для выполнения как демонтажных, так и СМР работ.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Содержание · 7,2 + 20 км',
    quote: 'Техническое обслуживание такого путевого развития требует большой ответственности и профессионального внимания. Был заключён договор с West Arlan Group, т. к. их специалисты зарекомендовали себя как профессиональные и добросовестные работники.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', date: '21 сентября 2018', category: 'Реконструкция · ст. Рудная',
    quote: 'Сотрудники компании оперативно и качественно решали многочисленные вопросы, возникающие в процессе строительства. Все этапы дальнейшего строительства West Arlan Group терпеливо согласовывала с руководством ТОО «АМК». Рекомендуем их как надёжную команду для проектов любой сложности.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', date: 'Сентябрь 2021', category: 'Строительство · 481 м',
    quote: 'Учитывая добросовестность и ответственность работников West Arlan Group, а также серьёзный подход к выполняемой работе, мы уверены в безопасности эксплуатации железнодорожного пути и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', category: 'Демонтаж · 6,7 км',
    quote: 'Ваши специалисты справились с выполнением работ качественно и в установленные сроки, что подтверждает Вашу ответственность и подготовленность. Учитывая, что Ваша компания работала с нами при строительстве, обслуживании и теперь демонтажных работах, мы выражаем готовность на дальнейшее сотрудничество.' },
  { client: 'ТОО «Компания Фаэтон»', signatory: 'Русманова В. Ю.', role: 'Директор', date: '20 октября 2018', category: 'Содержание · рампа 70 м',
    quote: 'Сотрудники West Arlan Group отличаются ответственностью, добропорядочностью и профессионализмом. Обход, осмотр и исправление дефектов подъездного пути осуществляется качественно и своевременно. Их работа даёт нам уверенность в безопасной эксплуатации пути.' },
  { client: 'ТОО «АлтынНұран»', signatory: 'Мурзабеков Ж. Н.', role: 'Директор', date: 'С сентября 2019', category: 'Содержание · 115 м',
    quote: 'Все работы по текущему содержанию железнодорожного пути и сооружений выполнялись высококвалифицированными специалистами. Учитывая добросовестность и ответственность работников, мы уверены в безопасности эксплуатации и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Синтез Урал»', signatory: 'Морозов С. А.', role: 'Директор', date: 'С ноября 2024', category: 'Строительство · 500 м',
    quote: 'Хочется отметить профессионализм и ответственность работников West Arlan Group, а также оперативность решения вопросов в ходе строительства. Высокий уровень организационной работы позволил качественно и в срок сдать объект в эксплуатацию.' },
  { client: 'ТОО «Portal KZ»', signatory: 'Нышанов М. М.', role: 'Директор', category: 'Строительство · ст. Никельтау',
    quote: 'Строительство выполнено с чётким соблюдением всех условий договора: работа была выполнена в срок, в соответствии с техническим заданием. Между нашими организациями сложилась хорошая практика оперативного взаимодействия в согласовании технических решений.' },
  { client: 'ИП «Жанажанов Б. С.»', signatory: 'Жанажанов Б. С.', role: 'Индивидуальный предприниматель', category: 'Строительство · 200 м',
    quote: 'Благодаря профессиональному подходу к работе сотрудниками West Arlan Group строительство нашего железнодорожного пути необщего пользования было завершено раньше намеченного срока, при этом качество и надёжность построенного объекта достойны самых высоких оценок.' },
  { client: 'ТОО «Нефтестройсервис ЛТД» · NSS', signatory: 'Отаров Р. К.', role: 'Директор', date: '01 ноября 2022', category: 'Строительство · ст. Тендык',
    quote: 'Работы выполнены в соответствии с действующими строительными нормами и правилами, согласно техническому заданию и условиям контракта, с надлежащим качеством и в установленный срок. West Arlan Group проявила себя как высокопрофессиональная компания.' },
  { client: 'ЧЛ «Ни К. А.»', signatory: 'Ни К. А.', role: 'Частный заказчик', category: 'Строительство · 41 разъезд',
    quote: 'Компания показала себя как исполнительный подрядчик, выполняющий договорные обязательства с превосходным качеством работ и в установленные сроки. Применяемые компанией современные методы строительства соответствуют требованиям СН РК, СП РК и ГОСТ.' },
  { client: 'ТОО «СП «Сине Мидас Строй»', signatory: 'Иманкулова Б. Т.', role: 'Исполнительный директор', category: 'Демонтаж · 850 м',
    quote: 'Не можем не отметить высокий профессионализм работников West Arlan Group, а также максимальную ответственность при выполнении поставленных задач. Качество работ не оставляет сомнений, надеемся на ещё более тесное сотрудничество.' },
  { client: 'ТОО «ПГС-Тамды»', signatory: 'Испанов А. К.', role: 'Директор', category: 'Строительство · ст. Тамды',
    quote: 'Профессиональный и ответственный подход к выполнению работы сотрудниками West Arlan Group обеспечили строительство нашего железнодорожного пути необщего пользования в стационарный путь «на окно». Все согласования с организациями АО «НК «КТЖ» велись своевременно.' },
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
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="7" y1="7" x2="7" y2="17" />
        <line x1="12" y1="7" x2="12" y2="17" />
        <line x1="17" y1="7" x2="17" y2="17" />
      </svg>
    ),
    label: 'Ж/д и автодороги',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="22" y2="12" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="5" x2="12" y2="9" />
      </svg>
    ),
    label: 'Трубопроводы',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="20" y2="21" />
        <line x1="9" y1="21" x2="12" y2="4" />
        <line x1="15" y1="21" x2="12" y2="4" />
        <line x1="6" y1="11" x2="18" y2="11" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
    label: 'ЛЭП и связь',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V11l5-3v3l5-3v3l5-3v13z" />
        <line x1="7" y1="16" x2="7" y2="18" />
        <line x1="12" y1="16" x2="12" y2="18" />
        <line x1="17" y1="16" x2="17" y2="18" />
      </svg>
    ),
    label: 'Промышленные объекты',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2">
        <circle cx="5" cy="5" r="1.5" />
        <circle cx="19" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="5" cy="19" r="1.5" />
        <circle cx="19" cy="19" r="1.5" />
        <line x1="6" y1="6" x2="11" y2="11" fill="none" />
        <line x1="18" y1="6" x2="13" y2="11" fill="none" />
        <line x1="6" y1="18" x2="11" y2="13" fill="none" />
        <line x1="18" y1="18" x2="13" y2="13" fill="none" />
      </svg>
    ),
    label: 'Инженерные сети',
  },
];

const PARTNER_CATEGORIES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M2 10l10-7 10 7" />
        <path d="M3 10h18" />
        <path d="M5 21V10" />
        <path d="M9 21V10" />
        <path d="M12 21V10" />
        <path d="M15 21V10" />
        <path d="M19 21V10" />
      </svg>
    ),
    label: 'Гос корпорации',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="22" y2="12" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="5" x2="12" y2="9" />
      </svg>
    ),
    label: 'Нефтегаз',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V11l5-3v3l5-3v3l5-3v13z" />
        <line x1="7" y1="16" x2="7" y2="18" />
        <line x1="12" y1="16" x2="12" y2="18" />
        <line x1="17" y1="16" x2="17" y2="18" />
      </svg>
    ),
    label: 'Индустриальные зоны',
  },
];

const svcIconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const SVCS_DESIGN = [
  { num: '01', title: 'Комплексные инженерные изыскания', desc: 'Геодезические, геологические, экологические, гидрологические и археологические изыскания для обоснования проектных решений.',
    icon: (<svg {...svcIconProps}><circle cx="10.5" cy="10.5" r="6" /><line x1="10.5" y1="7" x2="10.5" y2="14" /><line x1="7" y1="10.5" x2="14" y2="10.5" /><line x1="19.5" y1="19.5" x2="15" y2="15" /></svg>) },
  { num: '02', title: 'Производственные объекты',          desc: 'Технологическое проектирование заводов, комбинатов и промышленных комплексов производственного назначения.',
    icon: (<svg {...svcIconProps}><path d="M3 21V11l5-3v3l5-3v3l5-3v13z" /><line x1="7" y1="16" x2="7" y2="18" /><line x1="12" y1="16" x2="12" y2="18" /><line x1="17" y1="16" x2="17" y2="18" /></svg>) },
  { num: '03', title: 'Жилые и гражданские объекты',       desc: 'Проектирование зданий и сооружений жилищно-гражданского назначения с учётом действующих норм и стандартов.',
    icon: (<svg {...svcIconProps}><rect x="6" y="3" width="12" height="18" rx="0.5" /><line x1="9" y1="7" x2="10" y2="7" /><line x1="14" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="10" y2="11" /><line x1="14" y1="11" x2="15" y2="11" /><line x1="10.5" y1="21" x2="13.5" y2="21" /></svg>) },
  { num: '04', title: 'Транспортная инфраструктура',       desc: 'Проектирование объектов транспорта, связи и коммуникаций, включая железнодорожные и автодорожные объекты.',
    icon: (<svg {...svcIconProps}><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="7" y1="7" x2="7" y2="17" /><line x1="12" y1="7" x2="12" y2="17" /><line x1="17" y1="7" x2="17" y2="17" /></svg>) },
  { num: '05', title: 'Инженерные системы и сети',         desc: 'Проектная документация для инженерных систем: электро-, водо-, теплоснабжение и слаботочные сети.',
    icon: (<svg {...svcIconProps}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>) },
  { num: '06', title: 'Реконструкция и усиление конструкций', desc: 'Строительное проектирование реконструкции зданий и сооружений, а также усиление несущих конструкций.',
    icon: (<svg {...svcIconProps}><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.9 2.9-2.5-2.5z" /></svg>) },
];

const SVCS_BUILD = [
  { num: '01', title: 'Строительство, капремонт и реконструкция', desc: 'Полный цикл строительных работ, капитального ремонта и реконструкции производственных и промышленных объектов.',
    icon: (<svg {...svcIconProps}><rect x="4" y="8" width="9" height="13" /><path d="M13 21V4l7 3.5V21" /><line x1="7" y1="12" x2="10" y2="12" /><line x1="7" y1="16" x2="10" y2="16" /></svg>) },
  { num: '02', title: 'Расчёт сметной стоимости',         desc: 'Разработка сметной документации и расчёт стоимости строительно-монтажных работ по действующим нормативам.',
    icon: (<svg {...svcIconProps}><rect x="5" y="3" width="14" height="18" rx="1" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="12" x2="8.5" y2="12" /><line x1="12" y1="12" x2="12.5" y2="12" /><line x1="16" y1="12" x2="16.5" y2="12" /><line x1="8" y1="16" x2="8.5" y2="16" /><line x1="12" y1="16" x2="12.5" y2="16" /><line x1="16" y1="16" x2="16.5" y2="16" /></svg>) },
  { num: '03', title: 'Разработка ППР, ГПР, ПОС',          desc: 'Проект производства работ, график производства работ и проект организации строительства.',
    icon: (<svg {...svcIconProps}><path d="M7 3h7l4 4v14H7z" /><polyline points="14 3 14 7 18 7" /><line x1="10" y1="12" x2="15" y2="12" /><line x1="10" y1="16" x2="15" y2="16" /></svg>) },
  { num: '04', title: 'Инжиниринговое сопровождение',      desc: 'Сопровождение строительства промышленных объектов: координация подрядчиков, контроль сроков и качества.',
    icon: (<svg {...svcIconProps}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1" /></svg>) },
  { num: '05', title: 'Сопровождение технической документации', desc: 'Ведение и сопровождение полного пакета технической документации по строительству объектов.',
    icon: (<svg {...svcIconProps}><rect x="6" y="4" width="12" height="17" rx="1" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></svg>) },
  { num: '06', title: 'Сдача и ввод в эксплуатацию',       desc: 'Организация процедур сдачи и ввода объектов в постоянную эксплуатацию, взаимодействие с надзорными органами.',
    icon: (<svg {...svcIconProps}><circle cx="12" cy="12" r="9" /><polyline points="8 12 11 15 16 9" /></svg>) },
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

// Team composition — mirrors the «Люди, которые строят» block on the website.
const PEOPLE = [
  { num: '4+',  label: 'Топ-менеджмент',       desc: 'Генеральный директор и руководство' },
  { num: '15+', label: 'Проектный отдел',      desc: 'Инженеры-проектировщики и ГИП' },
  { num: '10+', label: 'Изыскательский отдел', desc: 'Геодезисты, геологи, сметчики' },
  { num: '50+', label: 'Строительные бригады', desc: 'Прорабы, мастера, инженеры СЦБ' },
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

const TOTAL = 15;   // pages 3+4 merged; testimonials condensed to a single page
const pageNumLabel = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;
const ISSUE_STAMP  = 'WAG · PORTFOLIO · 2026';

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
  // Live counts pulled from the same data layer the website uses:
  //   projects            → СМР, строительство (/projects)
  //   maintenance_projects → обслуживание и ремонт (/maintenance)
  //   design_projects      → проектные работы / ПД (/design)
  // Fallbacks keep the layout sane if a fetch returns empty (seed-less env).
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  const COUNT_SMR_BUILD = projects.length || 29;       // new construction объекты
  const COUNT_MAINTENANCE = maintenance.length || 20;  // maintenance / обслуживание объекты
  const COUNT_SMR = COUNT_SMR_BUILD + COUNT_MAINTENANCE; // total СМР, used elsewhere
  const COUNT_PD = design.length || 87;
  const COUNT_REGISTRY = COUNT_SMR + COUNT_PD;
  // Geography metrics are not derivable from project rows — kept as copy.
  const COUNT_REGIONS = 16;
  const COUNT_COUNTRIES = 2;

  // QR codes are pre-baked by scripts/bake-qr-codes.mjs to PNGs under
  // /public/portfolio/. Saves render time and keeps the build deterministic.
  // NOTE: the printed labels below say arlan-gr.kz, but the QR PNGs currently
  // encode wagweb.vercel.app (temporary, until the domain is migrated — see
  // bake-qr-codes.mjs). Re-bake there if the destination changes.

  // One testimonial per client company — keep the first letter from each,
  // drop the rest (e.g. the 3 АМК quotes collapse to 1, the 2 Зерде to 1).
  // The full archive lives on the website.
  const seenClients = new Set<string>();
  const filteredTestimonials = PRINT_TESTIMONIALS.filter((t) => {
    if (seenClients.has(t.client)) return false;
    seenClients.add(t.client);
    return true;
  });

  return (
    <main className={styles.book}>
      <PrintButtons />

      {/* ═══ 01 · COVER ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <CornerL pos="tl" />
        <CornerL pos="tr" />
        <CornerL pos="bl" />
        <CornerL pos="br" />
        <div className={styles.coverEyebrow}>КОРПОРАТИВНЫЙ ПРОФИЛЬ · 2026</div>
        <div className={styles.coverIssue}>АКТОБЕ · С 2010</div>
        <div className={styles.coverMarkWrap}>
          <WagMark className={styles.coverMark} gradientId="wagCover" />
        </div>
        <h1 className={styles.coverTitle}>
          WEST ARLAN<br />
          <span className={styles.coverTitleAccent}>GROUP</span>
        </h1>
        <div className={styles.coverTitleRule} />
        <div className={styles.coverChips}>
          <div className={styles.coverBadge}>
            <div className={styles.coverBadgeLevel}>I категория</div>
            <div className={styles.coverBadgeArea}>СМР</div>
          </div>
          <div className={styles.coverBadge}>
            <div className={styles.coverBadgeLevel}>I категория</div>
            <div className={styles.coverBadgeArea}>Проектирование</div>
          </div>
          <div className={styles.coverBadge}>
            <div className={styles.coverBadgeLevel}>Аккредитация</div>
            <div className={styles.coverBadgeArea}>Обследование зданий и сооружений</div>
          </div>
        </div>
        <div className={styles.coverTagline}>
          <div className={styles.coverTaglineItem}>
            <span className={styles.coverTaglineRu}>Изыскания</span>
            <span className={styles.coverTaglineEn}>Surveys</span>
          </div>
          <span className={styles.coverTaglineSep}>·</span>
          <div className={styles.coverTaglineItem}>
            <span className={styles.coverTaglineRu}>Проектирование</span>
            <span className={styles.coverTaglineEn}>Engineering</span>
          </div>
          <span className={styles.coverTaglineSep}>·</span>
          <div className={styles.coverTaglineItem}>
            <span className={styles.coverTaglineRu}>Строительство</span>
            <span className={styles.coverTaglineEn}>Construction</span>
          </div>
        </div>
        <div className={styles.coverBottom}>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomLabel}>БИН</div>
            <div className={styles.coverBottomValue}>100340009758</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className={styles.coverBottomValue}>+7 7132 538-288</div>
          </div>
          <div className={styles.coverBottomCol}>
            <div className={styles.coverBottomIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className={styles.coverBottomValue}>arlan-gr.kz</div>
          </div>
        </div>
      </section>

      {/* ═══ 02 · ABOUT ═══════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={2} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>О КОМПАНИИ</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              Мы строим<br />
              <span className={styles.titleAccent}>инфраструктуру страны</span>
            </h2>
            <div className={styles.inlineStats}>
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_SMR}</span><span className={styles.inlineStatLabel}>объектов</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_PD}</span><span className={styles.inlineStatLabel}>проектных работ</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>5</span><span className={styles.inlineStatLabel}>отраслей</span></div>
              <div className={styles.inlineStatDiv} />
              <div className={styles.inlineStat}><span className={styles.inlineStatNum}>{COUNT_REGIONS}</span><span className={styles.inlineStatLabel}>регионов</span></div>
            </div>
          </div>

          <div className={styles.leadBox}>
            <span className={styles.aboutColLede}>Полный цикл</span> — от изысканий и проектирования до строительства и сдачи объекта «под ключ».
            Транспортная, энергетическая, нефтегазовая и промышленная инфраструктура в Казахстане и России:
            ГИПы, инженеры-проектировщики, геодезисты, сметчики, прорабы и инженеры СЦБ работают над проектами,
            которые служат десятилетиями.
          </div>

          <div className={styles.industrySection}>
            <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />ОТРАСЛИ</div>
            <div className={styles.industryCards}>
              {INDUSTRY_CHIPS.map((c) => (
                <div key={c.label} className={styles.industryCard}>
                  <div className={styles.industryCardIcon}>{c.icon}</div>
                  <div className={styles.industryCardLabel}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dashedDivider} />

          <div className={styles.aboutTwoCol}>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />НАША МИССИЯ</div>
              <p><span className={styles.aboutColLede}>Создавать надёжную инфраструктуру для будущего Казахстана.</span>{' '}
                Безопасность эксплуатации, долговечность и точное соблюдение сроков — обязательства,
                которые мы фиксируем в каждом договоре. Техническая дисциплина и проектная точность —
                основа нашей репутации.</p>
            </div>
            <div className={styles.aboutCol}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />ПОДХОД К РАБОТЕ</div>
              <p><span className={styles.aboutColLede}>Один договор — один ответственный.</span>{' '}
                Группа закрывает весь цикл собственными силами:
                инженерные изыскания, проектная и рабочая документация, прохождение РГП «ГосЭкспертиза»,
                СМР и сдача объекта в эксплуатацию. Сроки и качество фиксируются лицензиями I категории
                и системами ISO 9001 / 14001.</p>
            </div>
          </div>

          <div className={styles.legalBlockLabel}><span /> ЮРИДИЧЕСКИЕ ЛИЦА ГРУППЫ</div>
          <div className={`${styles.legalCard} ${styles.legalCardDark} ${styles.legalHqCard}`}>
            <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeGold}`}>HQ</span>
            <div className={styles.legalCardName}>West Arlan Group</div>
            <div className={styles.legalCardRole}>Головная компания · координация группы</div>
            <div className={styles.legalCardMeta}>ТОО · БИН 100340009758 · Актобе</div>
          </div>
          <div className={styles.legalCards}>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeTeal}`}>СМР</span>
              <div className={styles.legalCardName}>West Capital Construction LLP</div>
              <div className={styles.legalCardRole}>Член группы · строительно-монтажные работы</div>
            </div>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeBlue}`}>ПД</span>
              <div className={styles.legalCardName}>Global Construction Project</div>
              <div className={styles.legalCardRole}>Член группы · проектная деятельность</div>
            </div>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeAmber}`}>СиО</span>
              <div className={styles.legalCardName}>West Altyn Kyran</div>
              <div className={styles.legalCardRole}>Член группы · поставка и обслуживание</div>
            </div>
            <div className={styles.legalCard}>
              <span className={`${styles.legalCardBadge} ${styles.legalCardBadgeViolet}`}>ЛОГ</span>
              <div className={styles.legalCardName}>West Logistics</div>
              <div className={styles.legalCardRole}>Член группы · логистика</div>
            </div>
          </div>

          <div className={styles.legalNote}>
            Все подразделения работают под единым управлением и общей политикой качества: лицензии
            I категории, системы ISO 9001 / 14001 и сквозной контроль на каждом этапе — от проектирования
            до сдачи объекта.
          </div>

          <WagMark className={styles.aboutWatermark} gradientId="wagAbout" />
        </div>
      </section>

      {/* ═══ 03 · SCALE + GEOGRAPHY (merged from old 03 + 04) ════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={3} dark />
        <div className={styles.pageInner}>
          <div className={`${styles.eyebrow} ${styles.eyebrowDark}`}>МАСШТАБ И ГЕОГРАФИЯ РАБОТ</div>
          <h2 className={`${styles.titleH1} ${styles.titleH1Dark}`}>
            За <span className={styles.titleAccentGold}>шестнадцать</span> лет<br />
            работы
          </h2>

          <div className={`${styles.leadBox} ${styles.leadBoxDark} ${styles.leadBoxScale}`}>
            Инфраструктура, по которой течёт экономика страны, сети, которые питают города, промышленные
            объекты, на которых держится производство — в десятках регионов Казахстана и за его пределами.
          </div>

          {/* Top row — group metrics, pulled live from the data layer.
              СМР is shown split into new construction vs. maintenance. */}
          <div className={`${styles.statBar} ${styles.statBar5}`}>
            <div className={`${styles.statBarItem} ${styles.statBarGold}`}>
              <div className={styles.statBarNum}>{COUNT_SMR_BUILD}</div>
              <div className={styles.statBarLabel}>Строительство</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarTeal}`}>
              <div className={styles.statBarNum}>{COUNT_MAINTENANCE}</div>
              <div className={styles.statBarLabel}>Обслуживание<br />и ремонт</div>
            </div>
            <div className={`${styles.statBarItem} ${styles.statBarBlue}`}>
              <div className={styles.statBarNum}>{COUNT_PD}</div>
              <div className={styles.statBarLabel}>Проектные<br />работы</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_REGIONS}</div>
              <div className={styles.statBarLabel}>Регионов</div>
            </div>
            <div className={styles.statBarItem}>
              <div className={styles.statBarNum}>{COUNT_COUNTRIES}</div>
              <div className={styles.statBarLabel}>Страны</div>
            </div>
          </div>

          {/* Map visualises the geography. */}
          <div className={styles.mapFrame}>
            <span className={styles.mapCornerCoord} style={{ top: '4mm', left: '4mm' }}>N 55° · E 045°</span>
            <span className={styles.mapCornerCoord} style={{ bottom: '4mm', right: '4mm' }}>N 040° · E 087°</span>
            {/* Pre-baked KZ map background — produced by scripts/bake-kz-map.mjs. */}
            <img src="/portfolio/kz-map.png" alt="" className={styles.mapImg} aria-hidden />
            <svg viewBox="-100 30 1200 820" className={styles.mapSvg} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
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

          {/* People behind the work — team composition. */}
          <h3 className={styles.peopleTitle}>
            <span className={styles.titleAccentGold}>Люди</span>, которые строят
          </h3>
          <div className={styles.peopleGrid}>
            {PEOPLE.map((p) => (
              <div key={p.label} className={styles.peopleCard}>
                <div className={styles.peopleNum}>{p.num}</div>
                <div className={styles.peopleLabel}>{p.label}</div>
                <div className={styles.peopleDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 04 · ISO CERTIFICATES ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={4} />
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
            Аудит процессов проходит регулярно — это закрепляет{' '}
            <span className={styles.aboutColLede}>единый стандарт работы</span> во всех трёх
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

        </div>
      </section>

      {/* ═══ 05 · LICENSE СМР ═════════════════════════════════════ */}
      <LicensePage
        pageNum={5}
        number="25008103"
        date="14.03.2025"
        titleAccent="Строительно-монтажные"
        titleMain="работы"
        badge="I КАТЕГОРИЯ"
        scan="/licenses/license-smr.jpg"
        meta={[
          { label: 'СТАТУС ВЫДАЧИ', value: 'Управление ГАСК Актюбинской области' },
          { label: 'ПЕРВИЧНАЯ ВЫДАЧА', value: '13.07.2010' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'до 25.06.2027' },
          { label: 'ОБЪЁМ', value: 'Все виды СМР I кат.' },
        ]}
      />

      {/* ═══ 06 · LICENSE ПД ══════════════════════════════════════ */}
      <LicensePage
        pageNum={6}
        number="25031072"
        date="05.09.2025"
        titleAccent="Проектная"
        titleMain="деятельность"
        badge="I КАТЕГОРИЯ"
        scan="/portfolio/page7_img3.jpeg"
        meta={[
          { label: 'СТАТУС ВЫДАЧИ', value: 'Управление ГАСК Актюбинской области' },
          { label: 'ПЕРВИЧНАЯ ВЫДАЧА', value: '28.04.2010' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'Бессрочно · класс 1' },
          { label: 'ОБЪЁМ', value: 'Полный цикл ПСД' },
        ]}
      />

      {/* ═══ 07 · LICENSE ОС ══════════════════════════════════════ */}
      <LicensePage
        pageNum={7}
        number="02962Р"
        date="22.09.2025"
        titleAccent="Охрана"
        titleMain="окружающей среды"
        badge="КЛАСС 1"
        scan="/portfolio/page7_img1.jpeg"
        meta={[
          { label: 'ОРГАН ВЫДАЧИ', value: 'Министерство экологии и природных ресурсов РК' },
          { label: 'МЕСТО ВЫДАЧИ', value: 'г. Астана' },
          { label: 'ОСОБЫЕ УСЛОВИЯ', value: 'Неотчуждаемая' },
          { label: 'ОБЪЁМ', value: 'Раздел ОВОС в составе ПСД' },
        ]}
      />

      {/* ═══ 08 · ACCREDITATION ═══════════════════════════════════ */}
      <LicensePage
        pageNum={8}
        number="KZ58VWC00251751"
        date="25.06.2025"
        titleAccent="Аккредитация ·"
        titleMain="экспертные работы"
        badge="I и II УРОВНИ"
        scan="/portfolio/page8_img2.jpeg"
        meta={[
          { label: 'ДЕРЖАТЕЛЬ', value: 'ТОО «Global Construction Project»' },
          { label: 'ОРГАН ВЫДАЧИ', value: 'Комитет по делам строительства и ЖКХ · г. Астана' },
          { label: 'СРОК ДЕЙСТВИЯ', value: 'до 25.06.2027' },
          { label: 'ОБЪЁМ', value: 'Техническое обследование зданий и сооружений' },
        ]}
      />

      {/* ═══ 09 · DIRECTION 01 — DESIGN ═══════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={9} dark />
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
            <span className={styles.aboutColLede}>Лицензия I категории</span>{' '}
            на проектную деятельность с 2010 года. Полный комплект ПСД для прохождения РГП «ГосЭкспертиза» —
            автомобильные и железные дороги, магистральные трубопроводы, ЛЭП, промышленные объекты и
            инженерные сети.
          </div>

          <div className={styles.svcGrid}>
            {SVCS_DESIGN.map((s) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcIcon} ${styles.svcIconGold}`}>{s.icon}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            ЭТАПЫ РАБОТ ПО ПРОЕКТУ
          </div>
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

      {/* ═══ 10 · DIRECTION 02 — BUILD ════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={10} dark />
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
            <span className={styles.aboutColLedeTeal}>Лицензия I категории</span>{' '}
            на СМР с 2010 года. Строительство «под ключ» в пяти отраслях
            инфраструктуры — от автомобильных и железных дорог до магистральных трубопроводов, ЛЭП,
            промышленных объектов и инженерных сетей.
          </div>

          <div className={styles.svcGrid}>
            {SVCS_BUILD.map((s) => (
              <div key={s.num} className={styles.svcItem}>
                <div className={`${styles.svcIcon} ${styles.svcIconTeal}`}>{s.icon}</div>
                <div className={styles.svcBody}>
                  <div className={styles.svcTitle}>{s.title}</div>
                  <div className={styles.svcDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            ЭТАПЫ РАБОТ НА ОБЪЕКТЕ
          </div>
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
            <span className={`${styles.dirFooterNum} ${styles.dirFooterNumTeal}`}>{COUNT_SMR_BUILD}</span>
            <span className={styles.dirFooterLabel}>СМР ОБЪЕКТОВ В РЕЕСТРЕ</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>WEST CAPITAL CONSTRUCTION LLP</span>
            <span className={styles.dirFooterSep}>·</span>
            <span className={styles.dirFooterText}>arlan-gr.kz / projects</span>
          </div>
        </div>
      </section>

      {/* ═══ 11 · PORTFOLIO QR ════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={11} />
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
                <span className={styles.qrCardTitle}>Строительные работы</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_SMR_BUILD}</span>
                <span className={styles.qrCountLabel}>СМР объектов<br />· 2015—2026</span>
              </div>
              <img src="/portfolio/qr-projects.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>arlan-gr.kz/projects</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardBlue}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>02</span>
                <span className={styles.qrCardTitle}>Обслуживание</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_MAINTENANCE}</span>
                <span className={styles.qrCountLabel}>объектов<br />· содержание</span>
              </div>
              <img src="/portfolio/qr-maintenance.png" alt="" className={styles.qrCodeWrap} aria-hidden />
              <div className={styles.qrUrl}>arlan-gr.kz/maintenance</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>
            <div className={`${styles.qrCard} ${styles.qrCardGold}`}>
              <div className={styles.qrCardHeader}>
                <span className={styles.qrCardNum}>03</span>
                <span className={styles.qrCardTitle}>Проектные работы</span>
              </div>
              <div className={styles.qrCount}>
                <span className={styles.qrCountNum}>{COUNT_PD}</span>
                <span className={styles.qrCountLabel}>работ<br />· ПСД и ТЭО</span>
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

      {/* ═══ 12 · TESTIMONIALS 1/2 ════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={12} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ОТЗЫВЫ КЛИЕНТОВ</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              <span className={styles.titleAccent}>Что говорят</span><br />
              наши заказчики
            </h2>
          </div>

          <div className={styles.leadBox}>
            Прямая речь заказчиков — лучший показатель работы. Благодарственные письма за годы
            сотрудничества подтверждают то, что мы фиксируем в каждом договоре: качество, соблюдение
            сроков и ответственность на каждом этапе.
          </div>

          <div className={`${styles.testGrid} ${styles.testGridAll}`}>
            {filteredTestimonials.map((t, i) => (
              <TestimonialCard key={`t-${i}`} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 13 · PARTNERS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <PageChrome pageNum={13} />
        <div className={styles.pageInner}>
          <div className={styles.eyebrow}>ПАРТНЁРЫ И ЗАКАЗЧИКИ · ФРАГМЕНТ РЕЕСТРА</div>
          <div className={styles.titleRow}>
            <h2 className={styles.titleH1}>
              <span className={styles.titleAccent}>Нам доверяют</span><br />
              крупнейшие компании страны
            </h2>
            <div className={styles.categoryCardColumn}>
              {PARTNER_CATEGORIES.map((c) => (
                <div key={c.label} className={styles.categoryCard}>
                  <div className={styles.categoryCardIcon}>{c.icon}</div>
                  <div className={styles.categoryCardLabel}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.leadBox}>
            Среди заказчиков —{' '}
            <span className={styles.aboutColLede}>государственные операторы (АО «НК «КТЖ», СПК)</span>,
            металлургические и нефтегазовые холдинги, индустриальные зоны и частные предприятия
            Казахстана и России.
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
              <span className={styles.partnerFooterText}>
                <span className={styles.aboutColRule} />ПОВТОРНЫХ КОНТРАКТОВ
              </span>
            </div>
            <div className={styles.partnerFooterRight}>
              <span className={styles.aboutColRule} />ПОЛНЫЙ РЕЕСТР ЗАКАЗЧИКОВ · arlan-gr.kz
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 14 · CONTACTS ════════════════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <PageChrome pageNum={14} dark />
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
            Расскажите о проекте — изыскания, проектирование или СМР — и получите коммерческое предложение.{' '}
            <span className={styles.aboutColLede}>Сопровождение от первого звонка до сдачи объекта в эксплуатацию.</span>
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

          <div className={styles.processLabel}>
            <span className={styles.aboutColRule} />
            ПРЯМЫЕ КОНТАКТЫ РУКОВОДСТВА
          </div>

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
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />ЮРИДИЧЕСКОЕ ЛИЦО
              </div>
              <div className={styles.contactsFooterValue}>ТОО «West Arlan Group» · БИН 100340009758</div>
            </div>
            <div className={styles.contactsFooterCol}>
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />ЛИЦЕНЗИИ
              </div>
              <div className={styles.contactsFooterValue}>СМР № 25008103 · ПД № 25031072 · ОС № 02962Р</div>
            </div>
          </div>

          <div className={styles.contactsBottomBar}>
            <div className={styles.contactsBottomLeft}>
              <div className={styles.contactsFooterLabel}>
                <span className={styles.aboutColRule} />САЙТ КОМПАНИИ
              </div>
              <div className={styles.contactsSite}>arlan-gr.kz</div>
            </div>
            <WagMark className={styles.contactsMark} gradientId="wagContacts" />
          </div>
        </div>
      </section>

      {/* ═══ 15 · CLOSING MANIFESTO ═══════════════════════════════ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.closing}`}>
        <PageChrome pageNum={15} dark />
        <div className={styles.closingInner}>
          <div className={styles.closingEyebrow}>МАНИФЕСТ · WAG</div>
          <h2 className={styles.closingQuote}>
            Каждый объект — <span className={styles.titleAccentGold}>обязательство</span> на десятилетия.
          </h2>
          <p className={styles.closingByline}>
            Мы не строим единоразово. Каждый сданный объект остаётся под нашей
            ответственностью — через год, через пять, через двадцать. За этим стоят
            повторные подписи заказчиков, километры путей в эксплуатации, репутация,
            которая копится десятилетиями.
          </p>
          <div className={styles.closingFooter}>
            <div className={styles.closingFooterValue}>{ISSUE_STAMP}</div>
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
  titleMain,
  titleAccent,
  badge,
  scan,
  meta,
}: {
  pageNum: number;
  number: string;
  date: string;
  titleMain: string;
  titleAccent: string;
  badge: string;
  scan: string;
  meta: { label: string; value: string }[];
}) {
  return (
    <section className={`${styles.page} ${styles.pageLight}`}>
      <PageChrome pageNum={pageNum} />
      <div className={styles.pageInner}>
        <div className={styles.licHeader}>
          <div className={styles.licNumber}>№ {number} · {date}</div>
          <span className={styles.licBadgeDark}>{badge}</span>
        </div>
        <h2 className={styles.licTitle}>
          <span className={styles.titleAccent}>{titleAccent}</span><br />
          {titleMain}
        </h2>

        <div className={styles.licScanFrame}>
          <img src={scan} alt={`${titleMain} ${titleAccent}`} className={styles.licScanImg} />
        </div>

        <div className={styles.licMetaGrid}>
          {meta.map((m) => (
            <div key={m.label} className={styles.licMetaItem}>
              <div className={styles.aboutColTitle}><span className={styles.aboutColRule} />{m.label}</div>
              <div className={styles.licMetaValue}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Wrap occurrences of the group name in <em> so they read as a distinct
   reference, not just italicised body text. */
function renderQuoteWithLegacyName(text: string) {
  const NAME = 'West Arlan Group';
  const parts = text.split(NAME);
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<em key={`n-${i}`}>{NAME}</em>, part],
  );
}

function TestimonialCard({ t }: { t: PrintTestimonial }) {
  return (
    <article className={styles.testCard}>
      {/* Header is always rendered (even when date is absent) so the
          decorative « doesn't collide with the client name. */}
      <div className={styles.testCardHeader}>
        {t.date && <span className={styles.testCardDate}>{t.date}</span>}
      </div>
      <h3 className={styles.testCardClient}>{t.client}</h3>
      <p className={styles.testCardQuote}>«{renderQuoteWithLegacyName(t.quote)}»</p>
      <div className={styles.testCardSig}>
        <div className={styles.testCardSigName}>{t.signatory}</div>
        <div className={styles.testCardSigRole}>{t.role}</div>
      </div>
    </article>
  );
}
