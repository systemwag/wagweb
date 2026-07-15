import type { Metadata } from 'next';
import Footer from '@/components/Footer/Footer';
import LicenseCards from './LicenseCards';
import CertificateCards from './CertificateCards';
import styles from './licenses.module.css';

export const metadata: Metadata = {
  title: 'Лицензии I категории и сертификаты ISO',
  description:
    'Государственные лицензии РК на проектирование и строительно-монтажные работы I категории, сертификаты ISO 9001. Скан-копии документов West Arlan Group.',
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
              <span className="text-gradient-gold">сертификаты</span>
            </h1>
            <p className={styles.subtitle}>
              Все работы выполняются на основании государственных лицензий
              и международных сертификатов качества.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <LicenseCards />
          </div>
        </section>

        <section className={styles.certSection}>
          <div className="container">
            <h2 className={styles.sectionHeading}>
              <span>Сертификаты</span>
              Международные стандарты качества
            </h2>
            <CertificateCards />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
