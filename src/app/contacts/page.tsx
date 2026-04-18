import type { Metadata } from 'next';
import Footer       from '@/components/Footer/Footer';
import ContactForm  from '@/components/ContactForm/ContactForm';
import styles       from './contacts.module.css';

export const metadata: Metadata = {
  title: 'Контакты | West Arlan Group',
  description:
    'Свяжитесь с West Arlan Group: офис в Актобе, телефон, email. Оставьте заявку на проект — ответим в течение 24 часов.',
};

const contacts = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 6.5 7 13 7 13s7-6.5 7-13c0-3.9-3.1-7-7-7z" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    label: 'Адрес',
    value: 'Республика Казахстан, Актюбинская область, г. Актобе, ул. Казангапа дом 57В, офис 34',
    link: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M5 4h4l2 5-2.5 1.5C9.7 13.5 11 15 13.5 16.5L15 14l5 2v4c-9 1.5-17-6.5-15-16z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Телефон',
    value: '8(7132) 538-288',
    link: 'tel:+77132538288',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Email',
    value: 'west_arlan-group@mail.ru',
    link: 'mailto:west_arlan-group@mail.ru',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Режим работы',
    value: 'Пн–Пт: 09:00–18:00 (GMT+5)',
    link: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 12h20M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    label: 'Сайт',
    value: 'arlan-gr.kz',
    link: 'https://arlan-gr.kz',
  },
];

export default function ContactsPage() {
  return (
    <>

      <main className={styles.main}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">Контакты</span>
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              Давайте обсудим<br />
              <span className="text-gradient-gold">ваш проект</span>
            </h1>
            <p className={styles.heroDesc}>
              Оставьте заявку или свяжитесь с нами напрямую —
              ответим в течение 24 часов и подготовим коммерческое предложение.
            </p>
          </div>
          <div className={styles.heroGlow} aria-hidden="true" />
        </section>

        {/* ── Main content ── */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.contentGrid}>

              {/* Contact info */}
              <div className={styles.info}>
                <h2 className={`heading-3 ${styles.infoTitle}`}>Наши контакты</h2>

                <div className={styles.contactList}>
                  {contacts.map((c) => (
                    <div key={c.label} className={styles.contactItem}>
                      <div className={styles.contactIcon}>{c.icon}</div>
                      <div>
                        <div className={styles.contactLabel}>{c.label}</div>
                        {c.link ? (
                          <a href={c.link} className={styles.contactValue}>
                            {c.value}
                          </a>
                        ) : (
                          <span className={styles.contactValue}>{c.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key contacts — management */}
                <div className={`glass-card ${styles.requisites}`} style={{ marginBottom: 'var(--space-lg)' }}>
                  <h3 className={styles.reqTitle}>Руководство</h3>
                  <dl className={styles.reqList}>
                    <dt>Генеральный директор</dt>
                    <dd><a href="tel:+77776699989">Аронов Аян Садиржанович — +7(777)669-99-89</a></dd>
                    <dt>Директор проектной группы</dt>
                    <dd><a href="tel:+77756459051">Валеев Алексей Сергеевич — +7(775)645-90-51</a></dd>
                    <dt>Директор по производству</dt>
                    <dd><a href="tel:+77471351492">Прусс Альберт Русланович — +7(747)135-14-92</a></dd>
                    <dt>ГИП (главный инженер проекта)</dt>
                    <dd><a href="tel:+77712293878">Штурмилов Валентин Петрович — +7(771)229-38-78</a></dd>
                  </dl>
                </div>

                {/* Key specialists */}
                <div className={`glass-card ${styles.requisites}`} style={{ marginBottom: 'var(--space-lg)' }}>
                  <h3 className={styles.reqTitle}>Специалисты</h3>
                  <dl className={styles.reqList}>
                    <dt>Главный технолог по линейным сооружениям</dt>
                    <dd><a href="tel:+77016417479">Аргумбаев Болат Клбергенович — +7(701)641-74-79</a></dd>
                    <dt>Главный инженер СЦБ</dt>
                    <dd><a href="tel:+77710213630">Абакумов Владимир — +7(771)021-36-30</a></dd>
                    <dt>Руководитель сметного отдела</dt>
                    <dd><a href="tel:+77014047048">Николаева Ольга Юрьевна — +7(701)404-70-48</a></dd>
                    <dt>Специалист по БиОТ</dt>
                    <dd><a href="tel:+77016757781">Айекешов Айбек Карлович — +7(701)675-77-81</a></dd>
                  </dl>
                </div>

                {/* Requisites */}
                <div className={`glass-card ${styles.requisites}`}>
                  <h3 className={styles.reqTitle}>Реквизиты</h3>
                  <dl className={styles.reqList}>
                    <dt>Полное наименование</dt>
                    <dd>ТОО «West Arlan Group»</dd>
                    <dt>БИН</dt>
                    <dd>090940003245</dd>
                    <dt>Банк</dt>
                    <dd>АО «Халык Банк»</dd>
                    <dt>ИИК</dt>
                    <dd>KZ748560000000123456</dd>
                    <dt>БИК</dt>
                    <dd>HSBKKZKX</dd>
                  </dl>
                </div>
              </div>

              {/* Form */}
              <div className={`glass-card ${styles.formWrap}`}>
                <div className={styles.formHeader}>
                  <h2 className={`heading-3 ${styles.formTitle}`}>Оставить заявку</h2>
                  <p className={styles.formSubtitle}>
                    Опишите ваш проект — мы подберём оптимальное решение.
                  </p>
                </div>
                <ContactForm />
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
