'use client';

import { useState } from 'react';
import styles from './portfolio.module.css';

type Stats = {
  realSmrInDb: number;
  realCompleted: number;
  realInProgress: number;
  realPlanned: number;
  realMapMarkers: number;
  displaySmr: number;
  displayPd: number;
  displayRegistry: number;
  testimonials: number;
  partners: number;
};

type Premium = { exists: boolean; sizeBytes: number; mtime: string | null };

const fmtBytes = (n: number) => `${(n / (1024 * 1024)).toFixed(2)} МБ`;
const fmtTime  = (iso: string | null) => iso ? new Date(iso).toLocaleString('ru-RU') : 'не собирался';

export function PortfolioClient({ stats, premium }: { stats: Stats; premium: Premium }) {
  const [tab, setTab]               = useState<'premium' | 'quick'>('premium');
  const [building, setBuilding]     = useState(false);
  const [version, setVersion]       = useState(0);   // bumps to bust iframe cache
  const [meta, setMeta]             = useState(premium);
  const [error, setError]           = useState<string | null>(null);

  const rebuild = async () => {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/rebuild-portfolio', { method: 'POST' });
      const body = await res.json();
      if (!body.ok) throw new Error(body.error ?? 'rebuild failed');
      setMeta({ exists: true, sizeBytes: body.sizeBytes, mtime: body.mtime });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBuilding(false);
    }
  };

  const refreshQuick = () => setVersion((v) => v + 1);

  const premiumSrc      = `/portfolio.pdf?t=${version}`;
  const premiumDownload = `/portfolio.pdf?t=${version}`;
  const quickSrc        = `/api/portfolio.pdf?t=${version}`;
  const quickDownload   = `/api/portfolio.pdf?download=1&t=${version}`;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>ПЕЧАТНЫЙ ДОКУМЕНТ · ДВА ДВИЖКА</div>
          <h1 className={styles.title}>Портфолио PDF</h1>
          <p className={styles.subtitle}>
            Документ собирается из текущих данных Supabase + контента в&nbsp;
            <code>src/app/portfolio/print/page.tsx</code> (Premium) и&nbsp;
            <code>src/lib/pdf/content/ru.ts</code> (Quick).
            Любое изменение проектов в админке отразится в обоих после пересборки/перезапроса.
          </p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'premium' ? styles.tabActive : ''}`}
          onClick={() => setTab('premium')}
        >
          <span className={styles.tabBadge}>PREMIUM</span>
          <span className={styles.tabName}>Chromium</span>
          <span className={styles.tabMeta}>{meta.exists ? `${fmtBytes(meta.sizeBytes)} · ${fmtTime(meta.mtime)}` : 'не собран'}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'quick' ? styles.tabActive : ''}`}
          onClick={() => setTab('quick')}
        >
          <span className={styles.tabBadge}>QUICK</span>
          <span className={styles.tabName}>react-pdf</span>
          <span className={styles.tabMeta}>генерируется на лету · ~2 сек</span>
        </button>
      </div>

      <div className={styles.layout}>
        <aside className={styles.side}>
          {tab === 'premium' ? (
            <>
              <section className={styles.card}>
                <div className={styles.cardLabel}>PREMIUM (CHROMIUM)</div>
                <div className={styles.cardRows}>
                  <Row label="Статус" value={meta.exists ? 'готов' : 'не собран'} />
                  <Row label="Размер" value={meta.exists ? fmtBytes(meta.sizeBytes) : '—'} />
                  <Row label="Собран" value={fmtTime(meta.mtime)} />
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={rebuild}
                    className={styles.btnPrimary}
                    disabled={building}
                  >
                    {building ? 'Сборка идёт…' : 'Пересобрать'}
                  </button>
                  <a
                    href={premiumDownload}
                    download="WAG-portfolio.pdf"
                    className={styles.btnSecondary}
                  >
                    Скачать
                  </a>
                </div>
                {error && <div className={styles.cardError}>{error}</div>}
                <div className={styles.cardNote}>
                  Источник: <code>/portfolio/print</code>. Полный CSS, градиенты, тени.
                  Сборка ~10-15 сек, размер 3-4 МБ. Эту версию читает Hero-кнопка сайта.
                </div>
              </section>
            </>
          ) : (
            <>
              <section className={styles.card}>
                <div className={styles.cardLabel}>QUICK (REACT-PDF)</div>
                <div className={styles.cardRows}>
                  <Row label="Источник" value="src/lib/pdf/" />
                  <Row label="Генерация" value="~2 сек, on-demand" />
                  <Row label="Размер" value="~2 МБ" />
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={refreshQuick}
                    className={styles.btnPrimary}
                  >
                    Перегенерировать
                  </button>
                  <a
                    href={quickDownload}
                    className={styles.btnSecondary}
                  >
                    Скачать
                  </a>
                </div>
                <div className={styles.cardNote}>
                  Альтернативный движок — без браузера, упрощённый CSS. Полезен для быстрых
                  проверок после изменения проектов в БД.
                </div>
              </section>
            </>
          )}

          <section className={styles.card}>
            <div className={styles.cardLabel}>ДАННЫЕ ИЗ БАЗЫ</div>
            <div className={styles.cardRows}>
              <Row label="Проектов СМР в БД"  value={stats.realSmrInDb} />
              <Row label="Маркеров на карте"  value={stats.realMapMarkers} subnote="из них с координатами" />
              <Row label="Завершено"          value={stats.realCompleted}  dot="#D4A843" />
              <Row label="В работе"           value={stats.realInProgress} dot="#00C4A7" />
              <Row label="В планах"           value={stats.realPlanned}    dot="#4F84FF" />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardLabel}>МАРКЕТИНГОВЫЕ ЦИФРЫ</div>
            <div className={styles.cardRows}>
              <Row label="СМР объектов"     value={stats.displaySmr} />
              <Row label="Проектных работ"  value={stats.displayPd} />
              <Row label="Записей в реестре" value={stats.displayRegistry} subnote="= СМР + ПД" />
              <Row label="Отзывов"           value={stats.testimonials} />
              <Row label="Партнёров"         value={stats.partners} />
            </div>
            <div className={styles.cardNote}>
              Premium: <code>src/app/portfolio/print/page.tsx</code> (константы внутри).<br />
              Quick: <code>src/lib/pdf/data/getPortfolioData.ts</code>.
            </div>
          </section>
        </aside>

        <div className={styles.previewWrap}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>
              {tab === 'premium' ? '/portfolio.pdf' : '/api/portfolio.pdf'}
            </span>
            <span className={styles.previewHint}>Прокрутка работает в самом PDF-вьюере</span>
          </div>
          <iframe
            key={`${tab}-${version}`}
            src={tab === 'premium' ? premiumSrc : quickSrc}
            className={styles.iframe}
            title="Portfolio PDF preview"
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label, value, subnote, dot,
}: { label: string; value: string | number; subnote?: string; dot?: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        {dot && <span className={styles.rowDot} style={{ background: dot }} />}
        {label}
      </div>
      <div className={styles.rowRight}>
        <span className={styles.rowValue}>{value}</span>
        {subnote && <span className={styles.rowSubnote}>{subnote}</span>}
      </div>
    </div>
  );
}
