import type { Metadata } from 'next';
import Link                from 'next/link';
import { Construction, TrainTrack, Truck, Ruler } from 'lucide-react';
import Footer              from '@/components/Footer/Footer';
import HeroCycler          from '@/components/HeroCycler/HeroCycler';
import InteractiveCanvasBg from '@/components/Hero/InteractiveCanvasBg';
import styles              from './about.module.css';

export const metadata: Metadata = {
  title: 'О компании | West Arlan Group',
  description:
    'West Arlan Group — профессиональное проектирование и строительство железнодорожной и инженерной инфраструктуры в Казахстане. Наша миссия, ценности и команда.',
};

/** `gold` — substring within `title` that gets the gold gradient on render. */
const values = [
  { title: 'Уважение к делу',                         gold: 'Уважение',                desc: 'Уважение к делу, которым мы занимаемся.' },
  { title: 'Компетентная самостоятельность',          gold: 'Компетентная',            desc: 'Мы стремимся принимать обоснованные решения в рамках своих полномочий и несём ответственность за каждый шаг.' },
  { title: 'Профессионализм и саморазвитие',          gold: 'Профессионализм',         desc: 'Бесспорный профессионализм и постоянное стремление к саморазвитию. Мы непрерывно совершенствуем свои знания и навыки, внедряя лучшие мировые практики в нашу работу.' },
  { title: 'Командный дух',                           gold: 'Командный дух',           desc: 'Командный дух и позитивное отношение к жизни. Мы ценим командную работу, создаём комфортные условия внутри коллектива и поддерживаем тёплые, дружеские отношения.' },
  { title: 'Уважение к каждому клиенту',              gold: 'Уважение',                desc: 'Мы ценим доверие наших клиентов и обеспечиваем индивидуальный подход к каждому.' },
  { title: 'Активность и энергичность',               gold: 'Активность',              desc: 'Мы ценим целеустремлённость, инициативность и способность заряжать окружающих позитивом.' },
  { title: 'Лояльность в компании',                   gold: 'Лояльность',              desc: 'Мы убеждены, что интересы компании — это интересы каждого сотрудника. Личные достижения каждого — это общий успех.' },
  { title: 'Порядок и чистота во всём',               gold: 'Порядок',                 desc: 'Это один из главных принципов нашей компании.' },
  { title: 'Здоровье и здоровый образ жизни',         gold: 'Здоровье',                desc: 'Мы поддерживаем культуру здорового образа жизни и выступаем против вредных привычек.' },
  { title: 'Забота о семье',                          gold: 'Забота',                  desc: 'Для нас семья — это основа и смысл жизни. После рабочего дня нас ждут дома наши близкие.' },
  { title: 'История и традиции',                      gold: 'История',                 desc: 'Мы знаем, любим и чтим свои корни, гордимся нашей историей и уважаем традиции.' },
  { title: 'Экология',                                gold: 'Экология',                desc: 'Мы бережно относимся к природе и не оставляем после себя негативного следа.' },
  { title: 'Стиль и имидж',                           gold: 'Стиль',                   desc: 'Мы придерживаемся собственного уникального стиля и последовательно его поддерживаем.' },
  { title: 'Стабильное процветание и вера в будущее', gold: 'Стабильное процветание',  desc: 'Мы уверены, что завтра будем жить лучше, чем сегодня.' },
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

const team = [
  { name: 'Генеральный директор и руководство', role: 'Топ-менеджмент', count: 4 },
  { name: 'Инженеры-проектировщики и ГИП', role: 'Проектный отдел', count: 15 },
  { name: 'Геодезисты, геологи, сметчики', role: 'Изыскательский отдел', count: 10 },
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

export default function AboutPage() {
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
                  Важной причиной успеха нашей компании является слаженная работа
                  специалистов, их целеустремлённость и нацеленность на результат.
                  Мы неукоснительно следуем нашим ценностям, формируя положительный
                  имидж компании и укрепляя доверие наших партнёров.
                </p>
                <p className={styles.body}>
                  Компания ведёт инженерно-изыскательскую деятельность, проектную деятельность
                  I категории и строительно-монтажные работы I категории. Мы выполняем полный цикл работ:
                  от геодезических изысканий до сдачи объектов под ключ.
                </p>
              </div>
              <div className={styles.missionStats}>
                {[
                  { value: '2010', label: 'Год основания' },
                  { value: '15+',  label: 'Лет на рынке' },
                  { value: '300+', label: 'Сданных объектов' },
                  { value: '16',   label: 'Регионов охвата' },
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
            <div className={styles.valuesCarousel} aria-label="Карусель ценностей компании">
              <div className={styles.valuesTrack}>
                {/* Cards rendered twice for seamless marquee loop */}
                {[...values, ...values].map((v, i) => (
                  <article
                    key={i}
                    className={`glass-card ${styles.valueCard}`}
                    aria-hidden={i >= values.length ? 'true' : undefined}
                  >
                    <div className={styles.valueIndex}>{(i % values.length) + 1}</div>
                    <h3 className={`heading-3 ${styles.valueTitle}`}>
                      {goldTitle(v.title, v.gold)}
                    </h3>
                    <p className={styles.valueDesc}>{v.desc}</p>
                  </article>
                ))}
              </div>
            </div>
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
                Обсудим ваш проект и подготовим предложение в течение 24 часов.
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
