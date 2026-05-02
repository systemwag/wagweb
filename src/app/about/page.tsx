import type { Metadata } from 'next';
import Link            from 'next/link';
import Footer          from '@/components/Footer/Footer';
import AboutHeroAnim   from '@/components/AboutHeroAnim/AboutHeroAnim';
import styles          from './about.module.css';

export const metadata: Metadata = {
  title: 'О компании | West Arlan Group',
  description:
    'West Arlan Group — профессиональное проектирование и строительство железнодорожной и инженерной инфраструктуры в Казахстане. Наша миссия, ценности и команда.',
};

const values = [
  {
    title: 'Уважение к делу',
    desc: 'Уважение к делу, которым мы занимаемся.',
  },
  {
    title: 'Компетентная самостоятельность',
    desc: 'Мы стремимся принимать обоснованные решения в рамках своих полномочий и несём ответственность за каждый шаг.',
  },
  {
    title: 'Профессионализм и саморазвитие',
    desc: 'Бесспорный профессионализм и постоянное стремление к саморазвитию. Мы непрерывно совершенствуем свои знания и навыки, внедряя лучшие мировые практики в нашу работу.',
  },
  {
    title: 'Командный дух',
    desc: 'Командный дух и позитивное отношение к жизни. Мы ценим командную работу, создаём комфортные условия внутри коллектива и поддерживаем тёплые, дружеские отношения.',
  },
  {
    title: 'Уважение к каждому клиенту',
    desc: 'Мы ценим доверие наших клиентов и обеспечиваем индивидуальный подход к каждому.',
  },
  {
    title: 'Активность и энергичность',
    desc: 'Мы ценим целеустремлённость, инициативность и способность заряжать окружающих позитивом.',
  },
  {
    title: 'Лояльность в компании',
    desc: 'Мы убеждены, что интересы компании — это интересы каждого сотрудника. Личные достижения каждого — это общий успех.',
  },
  {
    title: 'Порядок и чистота во всём',
    desc: 'Это один из главных принципов нашей компании.',
  },
  {
    title: 'Здоровье и здоровый образ жизни',
    desc: 'Мы поддерживаем культуру здорового образа жизни и выступаем против вредных привычек.',
  },
  {
    title: 'Забота о семье',
    desc: 'Для нас семья — это основа и смысл жизни. После рабочего дня нас ждут дома наши близкие.',
  },
  {
    title: 'История и традиции',
    desc: 'Мы знаем, любим и чтим свои корни, гордимся нашей историей и уважаем традиции.',
  },
  {
    title: 'Экология',
    desc: 'Мы бережно относимся к природе и не оставляем после себя негативного следа.',
  },
  {
    title: 'Стиль и имидж',
    desc: 'Мы придерживаемся собственного уникального стиля и последовательно его поддерживаем.',
  },
  {
    title: 'Стабильное процветание и вера в будущее',
    desc: 'Мы уверены, что завтра будем жить лучше, чем сегодня.',
  },
];

const team = [
  { name: 'Генеральный директор и руководство', role: 'Топ-менеджмент', count: 4 },
  { name: 'Инженеры-проектировщики и ГИП', role: 'Проектный отдел', count: 15 },
  { name: 'Геодезисты, геологи, сметчики', role: 'Изыскательский отдел', count: 10 },
  { name: 'Прорабы, мастера, инженеры СЦБ', role: 'Строительные бригады', count: 50 },
];

const leadership = [
  { name: 'Аронов Аян Садиржанович',         role: 'Генеральный директор',                    photo: '/team/aronov.jpg' },
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

        {/* ── Page Hero ── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroContent}`}>
            <span className="section-label">О компании</span>
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              Мы строим<br />
              <span className="text-gradient-gold">инфраструктуру страны</span>
            </h1>
            <p className={styles.heroDesc}>
              Полный цикл: от геодезических изысканий и проектирования
              до строительства и сдачи объекта «под ключ».
            </p>
          </div>
          <div className={styles.heroGlow} aria-hidden="true" />
          <AboutHeroAnim />
        </section>

        {/* ── Mission ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.missionGrid}>
              <div className={styles.missionText}>
                <span className="section-label">Наша миссия</span>
                <h2 className="heading-2">
                  Создавать надёжную инфраструктуру для будущего Казахстана
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
              Ценности нашей компании
            </h2>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <div key={v.title} className={`glass-card ${styles.valueCard}`}>
                  <div className={styles.valueIndex}>{i + 1}</div>
                  <h3 className={`heading-3 ${styles.valueTitle}`}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className={styles.section}>
          <div className="container">
            <span className="section-label">Команда</span>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2xl)' }}>
              Люди, которые строят
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
              Команда руководителей
            </h2>
            <div className={styles.leadershipGrid}>
              {leadership.map((p) => (
                <div key={p.name} className={`glass-card ${styles.leadCard}`}>
                  <div className={styles.leadPhotoWrap}>
                    <img src={p.photo} alt={p.name} className={styles.leadPhoto} />
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
              Парк техники и оборудования
            </h2>
            <p className={styles.body}>
              Высококвалифицированные профессионалы выполнят строительно-монтажные работы
              качественно, надёжно и в срок. Компания располагает собственным парком техники
              и специализированным оборудованием.
            </p>
            <div className={styles.equipmentGrid}>
              {[
                { name: 'Автокран 25т', count: '1 ед.' },
                { name: 'Автосамосвалы 10т', count: '3 ед.' },
                { name: 'Экскаватор-погрузчик', count: '2 ед.' },
                { name: 'Гидромолот на базе экскаватора', count: '1 ед.' },
                { name: 'Виброкаток', count: '1 ед.' },
                { name: 'Седельный тягач с прицепом', count: '2 ед.' },
                { name: 'Автогрейдер', count: '2 ед.' },
                { name: 'Автопогрузчик 5т', count: '2 ед.' },
                { name: 'Трамбовки электрические', count: '8 ед.' },
                { name: 'Домкрат путевой гидравлический', count: '1 ед.' },
                { name: 'Разгонщик гидравлический', count: '1 ед.' },
                { name: 'Рихтовщик гидравлический', count: '1 ед.' },
                { name: 'Станок рельсосверлильный', count: '1 ед.' },
                { name: 'Станок рельсорезный', count: '1 ед.' },
                { name: 'Тахеометр', count: '1 ед.' },
                { name: 'Нивелир', count: '1 ед.' },
              ].map((eq) => (
                <div key={eq.name} className={`glass-card ${styles.equipmentCard}`}>
                  <span className={styles.equipmentName}>{eq.name}</span>
                  <span className={styles.equipmentCount}>{eq.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className="heading-2">Готовы к сотрудничеству?</h2>
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
