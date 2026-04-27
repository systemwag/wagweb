import type { Metadata } from 'next';
import Footer from '@/components/Footer/Footer';
import LicenseCards from './LicenseCards';
import CertificateCards from './CertificateCards';
import styles from './licenses.module.css';

export const metadata: Metadata = {
  title: 'Лицензии и сертификаты | West Arlan Group',
  description:
    'Лицензии, сертификаты и допуски West Arlan Group. Проектирование I категории, строительно-монтажные работы I категории.',
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
