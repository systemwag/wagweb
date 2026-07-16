import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { BIN, PHONE, PHONE_HREF, EMAIL } from '@/lib/company-facts';
import styles from './kz.module.css';

export const metadata: Metadata = {
  title: 'West Arlan Group — жобалау, құрылыс, қызмет көрсету',
  description:
    'West Arlan Group — Ақтөбедегі толық циклді инжинирингтік компания: инженерлік іздестіру, жобалау, құрылыс-монтаж жұмыстары және инфрақұрылымға қызмет көрсету. І санатты мемлекеттік лицензиялар.',
};

const directions = [
  {
    title: 'Жобалау',
    desc: 'Инженерлік іздестіру, жобалау-сметалық құжаттама, мемлекеттік сараптамадан өткізу. І санатты лицензия — 2010 жылдан бері.',
    href: '/design',
  },
  {
    title: 'Құрылыс',
    desc: 'Инженерлік желілер, автомобиль және темір жолдар, өнеркәсіптік объектілер — «кілт тапсыру» әдісімен. І санатты лицензия.',
    href: '/projects',
  },
  {
    title: 'Қызмет көрсету',
    desc: 'Кірме жолдар мен кәсіпорын инфрақұрылымын ағымдағы ұстау, жөндеу және қауіпсіз пайдалануды қамтамасыз ету.',
    href: '/maintenance',
  },
];

export default function KzPage() {
  return (
    <>
      <main className={styles.main}>

        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">West Arlan Group · Ақтөбе · 2010 жылдан бері</span>
            <h1 className={`heading-1 ${styles.title}`}>
              Қазақстанның инфрақұрылымын<br />
              <span className="text-gradient-gold">жобалаймыз және саламыз</span>
            </h1>
            <p className={styles.subtitle}>
              Толық цикл: инженерлік іздестіруден бастап объектіні пайдалануға
              тапсырғанға дейін. Құрылыс-монтаж жұмыстары мен жобалау қызметіне
              І санатты мемлекеттік лицензиялар, техникалық қадағалау мен
              ғимараттарды техникалық тексеруге аккредиттеу.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contacts" className="btn btn-primary">Жоба талқылау</Link>
              <a href={PHONE_HREF} className="btn btn-outline">{PHONE}</a>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.dirGrid}>
              {directions.map((d) => (
                <Link key={d.title} href={d.href} className={`glass-card ${styles.dirCard}`}>
                  <h2 className={styles.dirTitle}>{d.title}</h2>
                  <p className={styles.dirDesc}>{d.desc}</p>
                  <span className={styles.dirMore}>Толығырақ →</span>
                </Link>
              ))}
            </div>

            <div className={`glass-card ${styles.contactCard}`}>
              <h2 className={styles.contactTitle}>Байланыс</h2>
              <dl className={styles.contactList}>
                <div className={styles.contactRow}>
                  <dt>Мекенжай</dt>
                  <dd>Ақтөбе қ., Қазанғап көшесі, 57В үй, 34 кеңсе</dd>
                </div>
                <div className={styles.contactRow}>
                  <dt>Телефон</dt>
                  <dd><a href={PHONE_HREF}>{PHONE}</a></dd>
                </div>
                <div className={styles.contactRow}>
                  <dt>Email</dt>
                  <dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd>
                </div>
                <div className={styles.contactRow}>
                  <dt>Жұмыс уақыты</dt>
                  <dd>Дс–Жм · 09:00–18:00 (GMT+5)</dd>
                </div>
                <div className={styles.contactRow}>
                  <dt>БСН</dt>
                  <dd>{BIN}</dd>
                </div>
              </dl>
              <p className={styles.note}>
                Жобаңыз туралы айтыңыз — бір жұмыс күні ішінде жауап береміз.
                Сайттың толық нұсқасы — <Link href="/">орыс тілінде</Link>.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
