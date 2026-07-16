import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { BIN, LEGAL_NAME, ADDRESS, PHONE, PHONE_HREF, EMAIL, LICENSES, ACCREDITATIONS_VALID_UNTIL } from '@/lib/company-facts';
import styles from './zakazchikam.module.css';

export const metadata: Metadata = {
  title: 'Заказчикам: реквизиты и документы для квалификации',
  description:
    'Карточка предприятия West Arlan Group для тендерной квалификации: реквизиты, лицензии I категории на СМР и проектирование, аккредитации на технадзор и обследование зданий. Скачать пакет документов одним архивом.',
};

const requisites = [
  { label: 'Полное наименование', value: LEGAL_NAME },
  { label: 'БИН', value: BIN },
  { label: 'Юридический адрес', value: ADDRESS },
  { label: 'Банк', value: 'АО «Банк ЦентрКредит»' },
  { label: 'ИИК (₸)', value: 'KZ298562203116437574' },
  { label: 'ИИК (₽)', value: 'KZ838562203341257091' },
  { label: 'БИК', value: 'KCJBKZKX' },
  { label: 'Телефон', value: PHONE },
  { label: 'Email', value: EMAIL },
];

const documents = [
  {
    name: 'Лицензия на СМР — I категория',
    detail: `№ ${LICENSES.smr.number} · первичная выдача ${LICENSES.smr.firstIssued} · бессрочная`,
  },
  {
    name: 'Лицензия на проектную деятельность — I категория',
    detail: `№ ${LICENSES.pd.number} · первичная выдача ${LICENSES.pd.firstIssued} · бессрочная`,
  },
  {
    name: 'Лицензия — охрана окружающей среды',
    detail: `№ ${LICENSES.eco.number} · Минэкологии РК`,
  },
  {
    name: 'Аккредитация — технический надзор, I уровень',
    detail: `№ KZ56VWC00283700 · до ${ACCREDITATIONS_VALID_UNTIL}`,
  },
  {
    name: 'Аккредитация — обследование зданий, I–II уровни',
    detail: `№ KZ83VWC00283699 · до ${ACCREDITATIONS_VALID_UNTIL}`,
  },
  {
    name: 'Аккредитация — управление проектами',
    detail: `№ KZ29VWC00283701 · до ${ACCREDITATIONS_VALID_UNTIL}`,
  },
];

export default function ZakazchikamPage() {
  return (
    <>
      <main className={styles.main}>

        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">Заказчикам</span>
            <h1 className={`heading-1 ${styles.title}`}>
              Документы для<br />
              <span className="text-gradient-gold">квалификации</span>
            </h1>
            <p className={styles.subtitle}>
              Всё, что нужно тендерному специалисту: реквизиты, лицензии,
              аккредитации и подтверждение опыта — на одной странице
              и одним архивом.
            </p>
            <div className={styles.heroActions}>
              <a href="/docs/wag-documents.zip" download className="btn btn-primary">
                Скачать пакет документов (ZIP)
              </a>
              <a href="/portfolio.pdf" download="WAG-portfolio.pdf" className="btn btn-outline">
                Профиль компании (PDF)
              </a>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>

              <div className={`glass-card ${styles.card}`}>
                <h2 className={styles.cardTitle}>Карточка предприятия</h2>
                <dl className={styles.reqList}>
                  {requisites.map((r) => (
                    <div key={r.label} className={styles.reqRow}>
                      <dt>{r.label}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={`glass-card ${styles.card}`}>
                <h2 className={styles.cardTitle}>Разрешительные документы</h2>
                <ul className={styles.docList}>
                  {documents.map((d) => (
                    <li key={d.name} className={styles.docItem}>
                      <span className={styles.docName}>{d.name}</span>
                      <span className={styles.docDetail}>{d.detail}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/licenses" className={styles.docsLink}>
                  Скан-копии всех документов →
                </Link>
              </div>

            </div>

            <div className={styles.proofRow}>
              <div className={`glass-card ${styles.proofCard}`}>
                <h3 className={styles.proofTitle}>Подтверждение опыта</h3>
                <p className={styles.proofDesc}>
                  Публичный реестр выполненных работ с составом, заказчиками
                  и сроками: <Link href="/projects">строительство</Link>,{' '}
                  <Link href="/maintenance">обслуживание</Link>,{' '}
                  <Link href="/design">проектные работы</Link>. Благодарственные
                  письма заказчиков — в разделе{' '}
                  <Link href="/testimonials">отзывов</Link>.
                </p>
              </div>
              <div className={`glass-card ${styles.proofCard}`}>
                <h3 className={styles.proofTitle}>Безопасность и охрана труда</h3>
                <p className={styles.proofDesc}>
                  В штате — специалист по безопасности и охране труда;
                  работы выполняются в соответствии с требованиями
                  СН РК и СП РК. Раздел ООС в составе ПСД выполняется
                  по собственной экологической лицензии № {LICENSES.eco.number}.
                </p>
              </div>
            </div>

            <div className={styles.cta}>
              <p className={styles.ctaText}>
                Нужны заверенные копии или справки по конкретному тендеру?
                Ответим в течение одного рабочего дня.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/contacts" className="btn btn-primary">Запросить документы</Link>
                <a href={PHONE_HREF} className="btn btn-outline">{PHONE}</a>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
