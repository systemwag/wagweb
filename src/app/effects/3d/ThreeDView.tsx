'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import styles from './page.module.css';

/* WebGL has no SSR meaning — load these only on the client */
const Hero3D = dynamic(() => import('@/components/Hero/Hero3D'), { ssr: false });
const Geography3D = dynamic(() => import('@/components/Map/Geography3D'), { ssr: false });

export default function ThreeDView({ projects }: { projects: Project[] }) {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/effects" className={styles.back}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to UI Kit
        </Link>
        <h1 className={`heading-2 ${styles.title}`}>
          <span className="text-gradient-gold">3D</span> Playground
        </h1>
        <p className={styles.lead}>
          WebGL-эксперименты под Hero и Geography. Обе сцены подгружаются динамически
          (<code>ssr: false</code>), используют <code>frameloop=&quot;demand&quot;</code> и паузу
          при выходе из viewport. Уважают <code>prefers-reduced-motion</code> — там
          показываются статичные градиентные fallback&apos;ы.
        </p>
      </div>

      <section className={styles.row}>
        <header className={styles.rowHeader}>
          <span className="section-label">01 · Railway track</span>
          <h2 className={`heading-3 ${styles.rowTitle}`}>Фрагмент железнодорожного пути</h2>
          <p className={styles.rowDesc}>
            Две параллельных рельсы (P65-профиль, металлический шейдер), деревянные
            шпалы, балластное основание. Тёплый золотой key-light + холодный teal fill,
            медленный орбитальный облёт. Это «moment of truth» для отраслевых заказчиков.
          </p>
        </header>
        <div className={styles.stage}>
          <Hero3D />
        </div>
      </section>

      <section className={styles.row}>
        <header className={styles.rowHeader}>
          <span className="section-label">02 · Kazakhstan markers</span>
          <h2 className={`heading-3 ${styles.rowTitle}`}>Карта проектов в 3D</h2>
          <p className={styles.rowDesc}>
            Точки из таблицы <code>projects</code> с заполненными
            <code> x_map/y_map</code> поднимаются столбиками над плоскостью. Высота
            кодирует флаг <code>featured</code>, цвет — статус
            (<span style={{ color: '#D4A843' }}>completed</span>{' '}/{' '}
            <span style={{ color: '#00C4A7' }}>in-progress</span>{' '}/{' '}
            <span style={{ color: '#4F84FF' }}>planned</span>). Координаты те же, что
            и в плоской <code>KazakhstanMap</code>, поэтому замена/совмещение не требует
            миграции данных.
          </p>
        </header>
        <div className={styles.stage}>
          <Geography3D projects={projects} />
        </div>
      </section>

      <div className={styles.footnote}>
        <p>
          Чтобы вынести сцены в продакшен: импортируй компонент с тем же
          <code> dynamic(..., {`{ ssr: false }`}) </code> в нужном месте (Hero или Geography).
          Bundle оба компонента шарят один <code>three</code> chunk.
        </p>
      </div>
    </main>
  );
}
