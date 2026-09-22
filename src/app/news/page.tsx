import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer/Footer';
import { getNewsItems } from '@/lib/news';
import styles from './news.module.css';

export const metadata: Metadata = {
  title: 'Новости компании',
  description:
    'Новости West Arlan Group: события компании, участие в отраслевых мероприятиях, ' +
    'социальные и спонсорские проекты.',
};

export default function NewsPage() {
  const news = getNewsItems();

  return (
    <>
      <main className={styles.main}>
        {/* ── Hero ── */}
        <section className={`${styles.hero} filmgrain`}>
          <div className="hero-hairline" aria-hidden="true" />
          <div className="container hero-parallax">
            <h1 className={`heading-1 ${styles.heroTitle} hero-reveal-2`}>
              <span className="text-gradient-gold">Новости</span>
            </h1>
            <p className={`${styles.heroDesc} hero-reveal-3`}>
              События West Arlan Group: объекты и отраслевые мероприятия, участие
              в жизни региона, социальные и спонсорские проекты.
            </p>
          </div>
          <div className="hero-glow-gold" aria-hidden="true" />
        </section>

        {/* ── Лента ── */}
        <section className={styles.section}>
          <div className="container">
            {news.length === 0 ? (
              <p className={styles.empty}>Новостей пока нет — заглядывайте позже.</p>
            ) : (
              /* Все карточки одного размера: выделять «главную» новость нечем —
                 лента короткая, и разноширинные плитки читаются как сбой сетки. */
              <div className={styles.grid}>
                {news.map((item, idx) => (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className={`glass-card ${styles.card}`}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className={styles.cardMedia}>
                      <Image
                        src={item.cover}
                        alt={item.coverAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                        priority={idx === 0}
                        className={styles.cardImg}
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.meta}>
                        <span className={styles.category}>{item.category}</span>
                        <time className={styles.date} dateTime={item.date}>{item.dateLabel}</time>
                      </div>

                      <h2 className={styles.cardTitle}>{item.title}</h2>
                      <p className={styles.cardExcerpt}>{item.excerpt}</p>

                      <span className={styles.readMore}>
                        Читать полностью
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className="heading-2">Хотите обсудить объект?</h2>
              <p className={styles.ctaDesc}>
                Расскажите о задаче — мы подготовим коммерческое предложение
                в течение 24 часов.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/contacts" className="btn btn-primary">Связаться с нами</Link>
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
