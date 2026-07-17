import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer/Footer';
import { getTestimonials } from '@/lib/data';
import styles from './testimonials.module.css';

export const metadata: Metadata = {
  title: 'Отзывы клиентов',
  description:
    'Отзывы заказчиков о работе West Arlan Group и подрядной компании группы West Capital Construction LLP — реальные письма с печатями и подписями руководителей предприятий.',
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <main className={styles.main}>
        {/* ── Hero ── */}
        <section className={`${styles.hero} filmgrain`}>
          <div className="hero-hairline" aria-hidden="true" />
          <div className="container hero-parallax">
            <span className="section-label hero-reveal-1">Отзывы клиентов</span>
            <h1 className={`heading-1 ${styles.heroTitle} hero-reveal-2`}>
              Что говорят<br />
              <span className="text-gradient-gold">наши заказчики</span>
            </h1>
            <p className={`${styles.heroDesc} hero-reveal-3`}>
              Реальные письма с печатями и подписями руководителей предприятий — заказчиков,
              для которых группа West Arlan Group выполнила проектирование и строительство
              железнодорожной инфраструктуры.
            </p>
          </div>
          <div className="hero-glow-gold" aria-hidden="true" />
        </section>

        {/* ── Note strip ── */}
        <section className={styles.note}>
          <div className="container">
            <p className={styles.noteText}>
              Большинство писем адресованы подрядной компании группы — <strong>ТОО «West Capital Construction LLP»</strong>.
              Это юридическое лицо в составе группы West Arlan Group, исторически выполняющее
              строительно-монтажные работы по договорам с заказчиками.
            </p>
          </div>
        </section>

        {/* ── List ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.list}>
              {testimonials.map((t, idx) => (
                <article
                  key={t.id}
                  className={`glass-card ${styles.card}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={styles.cardStripe} />

                  <div className={styles.cardTop}>
                    <span className={styles.cardCategory}>{t.category}</span>
                    {t.date_label && <span className={styles.cardDate}>{t.date_label}</span>}
                  </div>

                  <h2 className={styles.clientName}>{t.client}</h2>

                  <p className={styles.projectText}>{t.project}</p>

                  <div className={styles.quoteBlock}>
                    <p className={styles.quoteText}>«{t.quote}»</p>
                  </div>

                  <div className={styles.signature}>
                    <div className={styles.sigName}>{t.signatory}</div>
                    <div className={styles.sigRole}>{t.role}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className="heading-2">Хотите стать следующим?</h2>
              <p className={styles.ctaDesc}>
                Расскажите о вашем объекте — мы подготовим коммерческое предложение
                в течение 24 часов.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/contacts" className="btn btn-primary">Обсудить проект</Link>
                <Link href="/projects" className="btn btn-outline">Реализованные проекты</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
