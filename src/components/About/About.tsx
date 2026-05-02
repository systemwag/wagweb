import Link from 'next/link';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.section} id="about">
      <div className={`container ${styles.grid}`}>

        <div className={styles.header}>
          <span className="section-label">О компании</span>
          <h2 className={`heading-2 ${styles.title}`}>
            Строим Казахстан —<br />
            <span className="text-gradient-gold">с опытом и гордостью</span>
          </h2>
        </div>

        <div className={styles.manifesto}>
          <p className={styles.manifestoLead}>
            С 2010 года West Arlan Group работает в Актобе и реализует объекты
            по всему Казахстану. Полный цикл — от инженерных изысканий
            до сдачи объекта под ключ.
          </p>

          <p className={styles.manifestoBody}>
            Над проектами работают ГИПы, инженеры-проектировщики, геодезисты,
            сметчики, прорабы и инженеры СЦБ. Мы строим то, что должно служить
            десятилетиями: железнодорожные пути, объекты нефтегазовой и
            энергетической инфраструктуры, промышленные комплексы.
          </p>

          <Link href="/about" className={styles.aboutLink}>
            Команда, ценности, парк техники
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
