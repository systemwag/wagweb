import type { Metadata } from 'next';
import Link                from 'next/link';
import { Construction, TrainTrack, Truck, Ruler } from 'lucide-react';
import Footer              from '@/components/Footer/Footer';
import HeroCycler          from '@/components/HeroCycler/HeroCycler';
import InteractiveCanvasBg from '@/components/Hero/InteractiveCanvasBg';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import { yearsOnMarket, BIN, LICENSES } from '@/lib/company-facts';
import styles              from './about.module.css';

export const metadata: Metadata = {
  title: 'О компании',
  description:
    'West Arlan Group — инжиниринговая компания полного цикла из Актобе: проектирование, строительство и обслуживание инженерной инфраструктуры по всему Казахстану. Команда, миссия, цифры.',
};

/** `gold` — substring within `title` that gets the gold gradient on render. */
const values = [
  { title: 'Профессионализм и саморазвитие',          gold: 'Профессионализм',         desc: 'Бесспорный профессионализм и постоянное стремление к саморазвитию. Мы непрерывно совершенствуем свои знания и навыки, внедряя лучшие мировые практики в нашу работу.' },
  { title: 'Компетентная самостоятельность',          gold: 'Компетентная',            desc: 'Мы стремимся принимать обоснованные решения в рамках своих полномочий и несём ответственность за каждый шаг.' },
  { title: 'Уважение к каждому клиенту',              gold: 'Уважение',                desc: 'Мы ценим доверие наших клиентов и обеспечиваем индивидуальный подход к каждому.' },
  { title: 'Командный дух',                           gold: 'Командный дух',           desc: 'Мы ценим командную работу, создаём комфортные условия внутри коллектива и поддерживаем тёплые, дружеские отношения.' },
  { title: 'Порядок и чистота во всём',               gold: 'Порядок',                 desc: 'На площадке и в документации: аккуратность исполнения — часть производственной культуры компании.' },
  { title: 'Экология',                                gold: 'Экология',                desc: 'Мы бережно относимся к природе и не оставляем после себя негативного следа. Работы в области охраны окружающей среды лицензированы.' },
];

/* Юридические лица группы — состав по печатной брошюре (content/ru.tsx,
   блок about.legalCards). У первых трёх реквизиты подтверждены сканами
   в public/licenses/; у West Altyn Kyran и West Logistics документов в
   репозитории нет, поэтому их карточки идут без юридических реквизитов —
   только роль в группе. */
const groupCompanies: { badge: string; name: string; role: string; meta?: string }[] = [
  {
    badge: 'HQ',
    name: 'West Arlan Group',
    role: 'Головная компания группы: лицензии I категории на СМР и проектирование, аккредитации на технадзор, обследование зданий и управление проектами.',
    meta: `ТОО · БИН ${BIN} · Актобе`,
  },
  {
    badge: 'ПД',
    name: 'Global Construction Project',
    role: 'Проектная деятельность в составе группы. Аккредитация на технический надзор I уровня ответственности № KZ02VWC00283702.',
    meta: 'ТОО · Актобе',
  },
  {
    badge: 'СМР',
    name: 'West Capital Construction',
    role: 'Строительно-монтажные работы в составе группы. Компания, которой адресованы благодарственные письма заказчиков.',
    meta: 'LLP · Актобе',
  },
  {
    badge: 'СиО',
    name: 'West Altyn Kyran',
    role: 'Поставка материалов, оборудования и обслуживание в составе группы.',
  },
  {
    badge: 'ЛОГ',
    name: 'West Logistics',
    role: 'Логистика группы: перевозка материалов, техники и путевого оборудования на объекты.',
  },
];

/** Render a title with the `gold` substring wrapped in the gold-gradient span. */
function goldTitle(title: string, gold: string) {
  const idx = title.indexOf(gold);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-gradient-gold">{gold}</span>
      {title.slice(idx + gold.length)}
    </>
  );
}

/* Состав отделов — по брошюре (content/ru.tsx, блок scale.people).
   Сметчики относятся к проектному отделу; раньше они дублировались
   и в изыскательском. */
const team = [
  { name: 'Генеральный директор и руководство', role: 'Топ-менеджмент', count: 4 },
  { name: 'Инженеры-проектировщики, ГИП, сметчики', role: 'Проектный отдел', count: 15 },
  { name: 'Геодезисты, геологи', role: 'Изыскательский отдел', count: 10 },
  { name: 'Прорабы, мастера, инженеры СЦБ', role: 'Строительные бригады', count: 50 },
];

const leadership = [
  { name: 'Аронов Аян Садиржанович',         role: 'Генеральный директор',                    photo: '/team/aronov.jpg' },
  { name: 'Ақдәулет Айдос Мейірханұлы',      role: 'Директор по развитию',                    photo: '' },
  { name: 'Валеев Алексей Сергеевич',        role: 'Директор проектной группы',               photo: '/team/valeev.jpg' },
  { name: 'Прусс Альберт Русланович',        role: 'Директор по производству',                photo: '/team/pruss.jpg' },
  { name: 'Штурмилов Валентин Петрович',     role: 'Главный инженер проекта (ГИП)',           photo: '/team/shturmilov.jpg' },
  { name: 'Аргумбаев Болат Клбергенович',    role: 'Главный технолог по линейным сооружениям', photo: '/team/argumbaev.jpg' },
  { name: 'Абакумов Владимир',               role: 'Главный инженер СЦБ',                     photo: '/team/abakumov.jpg' },
  { name: 'Николаева Ольга Юрьевна',         role: 'Руководитель сметного отдела',            photo: '/team/nikolaeva.jpg' },
  { name: 'Айекешов Айбек Карлович',         role: 'Специалист по БиОТ',                      photo: '/team/ayekeshov.jpg' },
];

export default async function AboutPage() {
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);
  const registryTotal = projects.length + maintenance.length + design.length;
  const years = yearsOnMarket();

  return (
    <>

      <main className={styles.main}>

        {/* ── Page Hero — cycling animation + magnetic particle backdrop ── */}
        <section className={styles.hero}>
          <InteractiveCanvasBg particleCount={100} />
          <div className={`container ${styles.heroContent}`}>
            <HeroCycler />
          </div>
        </section>

        {/* ── Mission ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.missionGrid}>
              <div className={styles.missionText}>
                <span className="section-label">Наша миссия</span>
                <h2 className="heading-2">
                  Создавать надёжную инфраструктуру для{' '}
                  <span className="text-gradient-gold">будущего&nbsp;Казахстана</span>
                </h2>
                <p className={styles.body}>
                  Безопасность эксплуатации, долговечность и точное соблюдение
                  сроков — обязательства, которые мы фиксируем в каждом договоре.
                  Техническая дисциплина и проектная точность — основа нашей репутации.
                </p>
                <p className={styles.body}>
                  Компания ведёт инженерно-изыскательскую деятельность, проектную деятельность
                  I категории и строительно-монтажные работы I категории. Мы выполняем полный цикл работ:
                  от геодезических изысканий до сдачи объектов под ключ.
                </p>
              </div>
              <div className={styles.missionStats}>
                {[
                  { value: '2010',                 label: 'Год основания' },
                  { value: String(years),          label: 'Лет на рынке' },
                  { value: String(registryTotal),  label: 'Объектов и работ в реестре' },
                  { value: '2',                    label: 'Страны: Казахстан и Россия' },
                ].map((s) => (
                  <div key={s.label} className={`glass-card ${styles.miniStat}`}>
                    <span className={`text-gradient-gold ${styles.miniStatValue}`}>{s.value}</span>
                    <span className={styles.miniStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Ценности</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2xl)' }}>
              <span className="text-gradient-gold">Ценности</span> нашей компании
            </h2>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <article key={v.title} className={`glass-card ${styles.valueCard}`}>
                  <div className={styles.valueIndex}>{i + 1}</div>
                  <h3 className={`heading-3 ${styles.valueTitle}`}>
                    {goldTitle(v.title, v.gold)}
                  </h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Group structure ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Структура группы</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2xl)' }}>
              <span className="text-gradient-gold">Компании</span> группы
            </h2>
            <div className={styles.groupGrid}>
              {groupCompanies.map((c) => (
                <div key={c.name} className={`glass-card ${styles.groupCard}`}>
                  <div className={styles.groupBadge}>{c.badge}</div>
                  <div className={styles.groupName}>{c.name}</div>
                  <p className={styles.groupRole}>{c.role}</p>
                  {c.meta && <div className={styles.groupMeta}>{c.meta}</div>}
                </div>
              ))}
            </div>
            <p className={styles.groupNote}>
              Подразделения работают под единым управлением и общей политикой качества.
              Лицензии: СМР № {LICENSES.smr.number} и проектирование № {LICENSES.pd.number} —
              I категория, охрана окружающей среды № {LICENSES.eco.number}.{' '}
              <Link href="/licenses" className={styles.groupNoteLink}>Скан-копии документов →</Link>
            </p>
          </div>
        </section>

        {/* ── Team ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Команда</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2xl)' }}>
              <span className="text-gradient-gold">Люди</span>, которые строят
            </h2>
            <div className={styles.teamGrid}>
              {team.map((t) => (
                <div key={t.name} className={`glass-card ${styles.teamCard}`}>
                  <div className={styles.teamCount}>{t.count}+</div>
                  <div className={styles.teamRole}>{t.role}</div>
                  <div className={styles.teamName}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Leadership ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Руководство</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2xl)' }}>
              <span className="text-gradient-gold">Команда</span> руководителей
            </h2>
            <div className={styles.leadershipGrid}>
              {leadership.map((p) => (
                <div key={p.name} className={`glass-card ${styles.leadCard}`}>
                  <div className={styles.leadPhotoWrap}>
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className={styles.leadPhoto} loading="lazy" decoding="async" />
                    ) : (
                      <span className={styles.leadInitials} aria-hidden="true">
                        {p.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className={styles.leadRole}>{p.role}</div>
                  <div className={styles.leadName}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Equipment ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Техническое оснащение</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="text-gradient-gold">Парк техники</span> и оборудования
            </h2>
            <p className={styles.body}>
              Высококвалифицированные профессионалы выполнят строительно-монтажные работы
              качественно, надёжно и в срок. Компания располагает собственным парком техники
              и специализированным оборудованием.
            </p>
            {[
              {
                title: 'Спецтехника',
                Icon: Construction,
                items: [
                  { name: 'Автокран',                       count: '1 ед.'  },
                  { name: 'Автокран 25 т',                  count: '1 ед.'  },
                  { name: 'Кран-манипулятор',               count: '1 ед.'  },
                  { name: 'Экскаватор-погрузчик',           count: '1 ед.'  },
                  { name: 'Гидромолот на базе экскаватора', count: '1 ед.'  },
                  { name: 'Автогрейдер',                    count: '2 ед.'  },
                  { name: 'Виброкаток',                     count: '4 ед.'  },
                  { name: 'Автопогрузчик 5т',               count: '4 ед.'  },
                  { name: 'Трамбовки электрические',        count: '8 ед.'  },
                ],
              },
              {
                title: 'Путевое оборудование',
                Icon: TrainTrack,
                items: [
                  { name: 'Домкрат путевой гидравлический', count: '1 ед.'  },
                  { name: 'Разгонщик гидравлический',       count: '2 ед.'  },
                  { name: 'Рихтовщик гидравлический',       count: '10 ед.' },
                ],
              },
              {
                title: 'Транспорт',
                Icon: Truck,
                items: [
                  { name: 'Автосамосвал 10т',               count: '5 ед.'  },
                  { name: 'Автосамосвал 25т',               count: '6 ед.'  },
                  { name: 'Седельный тягач с прицепом',     count: '1 ед.'  },
                  { name: 'Тралл',                          count: '1 ед.'  },
                  { name: 'Тоннар',                         count: '1 ед.'  },
                  { name: 'Легковой транспорт',             count: '7 ед.'  },
                  { name: 'Легковой прицеп',                count: '1 ед.'  },
                ],
              },
              {
                title: 'Приборы и инструменты',
                Icon: Ruler,
                items: [
                  { name: 'Нивелир',                        count: '3 ед.'  },
                  { name: 'GPS-приёмник (база + ровер)',    count: '2 ед.'  },
                  { name: 'Тахеометр',                      count: '3 ед.'  },
                  { name: 'Малая механизация (генераторы и инструмент)', count: '60 ед.' },
                ],
              },
            ].map(({ title, Icon, items }) => (
              <div key={title} className={styles.equipmentCategory}>
                <h3 className={styles.equipmentCategoryTitle}>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {title}
                </h3>
                <div className={styles.equipmentGrid}>
                  {items.map((eq) => (
                    <div key={eq.name} className={`glass-card ${styles.equipmentCard}`}>
                      <span className={styles.equipmentName}>{eq.name}</span>
                      <span className={styles.equipmentCount}>{eq.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className="heading-2">
                Готовы к <span className="text-gradient-gold">сотрудничеству</span>?
              </h2>
              <p className={styles.ctaDesc}>
                Расскажите о проекте — ответим в течение одного рабочего дня.
              </p>
              <div className={styles.ctaActions}>
                <a href="/contacts" className="btn btn-primary">Написать нам</a>
                <Link href="/licenses" className="btn btn-outline">Лицензии</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
