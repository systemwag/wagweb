import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer/Footer';
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd';
import NewsGallery from './NewsGallery';
import VideoEmbed from './VideoEmbed';
import { getNewsItem, getNewsItems, getNewsSlugs } from '@/lib/news';
import { SITE_URL } from '@/lib/site';
import styles from './article.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsItem(slug);
  if (!item) return { title: 'Новость не найдена' };

  return {
    // Суффикс «| West Arlan Group» добавит title.template из корневого layout.
    title: item.title,
    description: item.excerpt,
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.excerpt,
      publishedTime: item.date,
      images: [{ url: item.cover, alt: item.coverAlt }],
    },
  };
}

export function generateStaticParams() {
  return getNewsSlugs().map((slug) => ({ slug }));
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const item = getNewsItem(slug);

  if (!item) notFound();

  const others = getNewsItems().filter((n) => n.slug !== item.slug).slice(0, 3);
  /* У видео-новости обложка = постер ролика. Показывать её ещё и отдельным
     кадром сверху — тот же самый снимок дважды на одном экране. */
  const showCover = item.cover !== item.video?.poster;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt,
    datePublished: item.date,
    image: [`${SITE_URL}${item.cover}`],
    mainEntityOfPage: `${SITE_URL}/news/${item.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'West Arlan Group',
      url: SITE_URL,
    },
    ...(item.photoCredit ? { creditText: item.photoCredit } : {}),
  };

  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Новости', path: '/news' },
          { name: item.title },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className={styles.main}>
        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <div className="container">
            <nav className={styles.breadcrumbNav} aria-label="Навигация">
              <Link href="/" className={styles.breadcrumbLink}>Главная</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/news" className={styles.breadcrumbLink}>Новости</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{item.category}</span>
            </nav>
          </div>
        </div>

        {/* ── Заголовок ── */}
        <header className={styles.head}>
          <div className="container">
            <div className={styles.meta}>
              <span className={styles.category}>{item.category}</span>
              <time className={styles.date} dateTime={item.date}>{item.dateLabel}</time>
              {item.location && <span className={styles.location}>{item.location}</span>}
            </div>

            <h1 className={`heading-1 ${styles.title}`}>{item.title}</h1>
            <p className={styles.lead}>{item.excerpt}</p>
          </div>
        </header>

        {/* ── Обложка ── */}
        {showCover && (
        <div className={styles.coverWrap}>
          <div className="container">
            <figure className={styles.cover}>
              <div className={styles.coverMedia}>
                <Image
                  src={item.cover}
                  alt={item.coverAlt}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  priority
                  className={styles.coverImg}
                />
              </div>
              {item.coverCaption && (
                <figcaption className={styles.coverCaption}>{item.coverCaption}</figcaption>
              )}
            </figure>
          </div>
        </div>
        )}

        {/* ── Текст + факты ── */}
        <section className={`${styles.bodySection} ${showCover ? '' : styles.bodySectionNoCover}`}>
          <div className="container">
            <div className={styles.layout}>
              <article className={styles.article}>
                {item.body.map((para, idx) => (
                  <p key={idx} className={styles.para}>{para}</p>
                ))}
                {item.video && <VideoEmbed video={item.video} />}
              </article>

              <aside className={styles.facts} aria-label="Коротко о событии">
                <div className={`glass-card ${styles.factsCard}`}>
                  <h2 className={styles.factsTitle}>Коротко</h2>
                  <dl className={styles.factsList}>
                    {item.facts.map((fact) => (
                      <div key={fact.label} className={styles.fact}>
                        <dt className={styles.factLabel}>{fact.label}</dt>
                        <dd className={styles.factValue}>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Фоторепортаж ── */}
        {item.photos.length > 0 && (
          <section className={styles.gallerySection}>
            <div className="container">
              <div className={styles.galleryHead}>
                <h2 className={styles.galleryTitle}>Фоторепортаж</h2>
                {item.photoCredit && (
                  <span className={styles.credit}>Фото: {item.photoCredit}</span>
                )}
              </div>

              <NewsGallery photos={item.photos} />
            </div>
          </section>
        )}

        {/* ── Другие новости / возврат ── */}
        <section className={styles.moreSection}>
          <div className="container">
            {others.length > 0 && (
              <div className={styles.more}>
                <h2 className={styles.moreTitle}>Другие новости</h2>
                <div className={styles.moreGrid}>
                  {others.map((other) => (
                    <Link key={other.slug} href={`/news/${other.slug}`} className={`glass-card ${styles.moreCard}`}>
                      <time className={styles.date} dateTime={other.date}>{other.dateLabel}</time>
                      <span className={styles.moreCardTitle}>{other.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.backRow}>
              <Link href="/news" className="btn btn-outline">Все новости</Link>
              <Link href="/contacts" className="btn btn-primary">Связаться с нами</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
