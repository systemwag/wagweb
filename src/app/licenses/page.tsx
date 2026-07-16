import type { Metadata } from 'next';
import Footer from '@/components/Footer/Footer';
import LicenseCards from './LicenseCards';
import AccreditationCards from './AccreditationCards';
import styles from './licenses.module.css';

export const metadata: Metadata = {
  title: 'Лицензии I категории и аккредитации',
  description:
    'Государственные лицензии РК I категории на СМР и проектирование, лицензия по охране окружающей среды, аккредитации на технадзор, техническое обследование зданий и управление проектами. Скан-копии документов West Arlan Group.',
};

export default function LicensesPage() {
  return (
    <>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">Документы</span>
            <h1 className={`heading-1 ${styles.title}`}>
              Лицензии и<br />
              <span className="text-gradient-gold">аккредитации</span>
            </h1>
            <p className={styles.subtitle}>
              Все работы выполняются на основании государственных лицензий
              I категории и свидетельств об аккредитации уполномоченных
              органов Республики Казахстан.
            </p>
          </div>
        </section>

        <section className={styles.section} id="licenzii">
          <div className="container">
            <h2 className={styles.sectionHeading}>
              <span>Лицензии</span>
              Государственные лицензии РК
            </h2>
            <LicenseCards />
          </div>
        </section>

        <section className={styles.certSection} id="akkreditacii">
          <div className="container">
            <h2 className={styles.sectionHeading}>
              <span>Аккредитации</span>
              Технадзор, обследование зданий, управление проектами
            </h2>
            <AccreditationCards />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
