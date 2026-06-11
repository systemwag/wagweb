'use client';

import styles from './portfolio.module.css';

type Stats = {
  realSmrInDb: number;
  realDesignInDb: number;
  realMaintInDb: number;
  realCompleted: number;
  realInProgress: number;
  realPlanned: number;
  realMapMarkers: number;
  displaySmr: number;
  displayPd: number;
  displayRegistry: number;
};

type Premium = { exists: boolean; sizeBytes: number; mtime: string | null };

const fmtBytes = (n: number) => `${(n / (1024 * 1024)).toFixed(2)} МБ`;
const fmtTime  = (iso: string | null) => iso ? new Date(iso).toLocaleString('ru-RU') : 'не собирался';

export function PortfolioClient({ stats, premium }: { stats: Stats; premium: Premium }) {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>ПЕЧАТНЫЙ ДОКУМЕНТ</div>
          <h1 className={styles.title}>Портфолио PDF</h1>
          <p className={styles.subtitle}>
            Брошюра собирается из <code>src/app/portfolio/print</code> (общий макет
            + контент RU/EN) рендером в Chromium. Эту версию скачивают кнопки на
            главной и на странице услуг.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <section className={styles.card}>
            <div className={styles.cardLabel}>ФАЙЛ /portfolio.pdf</div>
            <div className={styles.cardRows}>
              <Row label="Статус" value={premium.exists ? 'готов' : 'не собран'} />
              <Row label="Размер" value={premium.exists ? fmtBytes(premium.sizeBytes) : '—'} />
              <Row label="Собран" value={fmtTime(premium.mtime)} />
            </div>
            <div className={styles.cardActions}>
              <a href="/portfolio.pdf" download="WAG-portfolio.pdf" className={styles.btnPrimary}>
                Скачать
              </a>
            </div>
            <div className={styles.cardNote}>
              Источник: <code>/portfolio/print</code>. Полный CSS, градиенты, тени.
              Пересобрать: <code>npm run build:pdf</code> (RU) /{' '}
              <code>npm run build:pdf:en</code> и закоммитить обновлённый файл.
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardLabel}>ДАННЫЕ ИЗ БАЗЫ</div>
            <div className={styles.cardRows}>
              <Row label="Проектов СМР в БД"  value={stats.realSmrInDb} />
              <Row label="Проектных работ"    value={stats.realDesignInDb} />
              <Row label="Обслуживание"       value={stats.realMaintInDb} />
              <Row label="Маркеров на карте"  value={stats.realMapMarkers} subnote="с координатами" />
              <Row label="Завершено"          value={stats.realCompleted}  dot="#D4A843" />
              <Row label="В работе"           value={stats.realInProgress} dot="#00C4A7" />
              <Row label="В планах"           value={stats.realPlanned}    dot="#4F84FF" />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardLabel}>МАРКЕТИНГОВЫЕ ЦИФРЫ</div>
            <div className={styles.cardRows}>
              <Row label="СМР объектов"      value={stats.displaySmr} />
              <Row label="Проектных работ"   value={stats.displayPd} />
              <Row label="Записей в реестре" value={stats.displayRegistry} subnote="= СМР + ПД" />
            </div>
            <div className={styles.cardNote}>
              Константы брошюры: <code>src/app/portfolio/print/PrintBrochure.tsx</code>.
            </div>
          </section>
        </aside>

        <div className={styles.previewWrap}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>/portfolio.pdf</span>
            <span className={styles.previewHint}>Прокрутка работает в самом PDF-вьюере</span>
          </div>
          <iframe
            src="/portfolio.pdf"
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
