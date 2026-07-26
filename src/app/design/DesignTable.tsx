'use client';

import { useState, useMemo, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { DesignProject, DesignCategory } from '@/lib/types';
import styles from './design.module.css';

const CATEGORY_LABEL: Record<DesignCategory, string> = {
  'full-cycle':    'Полный цикл',
  'design':        'Рабочий проект',
  'documentation': 'Документация',
  'feasibility':   'Тех. возможность',
};

const ALL_CATS: DesignCategory[] = ['full-cycle', 'design', 'documentation', 'feasibility'];

/* 1 работа · 2–4 работы · 5+ работ, с оговоркой на 11–14. */
function pluralWorks(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'работ';
  const mod10 = n % 10;
  if (mod10 === 1) return 'работа';
  if (mod10 >= 2 && mod10 <= 4) return 'работы';
  return 'работ';
}

const TABS = [
  { key: 'all',           label: 'Все работы' },
  { key: 'full-cycle',    label: 'Полный цикл' },
  { key: 'design',        label: 'Рабочий проект' },
  { key: 'documentation', label: 'Документация' },
  { key: 'feasibility',   label: 'ТЭО' },
];

type SortKey = 'number' | 'client' | 'category';
type SortDir = 'asc' | 'desc';

function SortIndicator({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  return (
    <span className={styles.sortIndicator}>
      <svg viewBox="0 0 8 12" fill="none" width="7" height="10">
        <path d="M4 1L1 4.5h6L4 1z" fill={sortKey === col && sortDir === 'asc' ? 'currentColor' : 'rgba(255,255,255,0.2)'}/>
        <path d="M4 11L1 7.5h6L4 11z" fill={sortKey === col && sortDir === 'desc' ? 'currentColor' : 'rgba(255,255,255,0.2)'}/>
      </svg>
    </span>
  );
}

export default function DesignTable({ projects }: { projects: DesignProject[] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [sortKey, setSortKey]     = useState<SortKey>('number');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');

  const counts = useMemo(() => {
    const c: Record<string, number> = { 'full-cycle': 0, 'design': 0, 'documentation': 0, 'feasibility': 0 };
    projects.forEach(p => { c[p.category] = (c[p.category] ?? 0) + 1; });
    return c;
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (activeTab !== 'all') list = list.filter(p => p.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.client.toLowerCase().includes(q) ||
        p.works.some(w => w.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      let av: string | number = '', bv: string | number = '';
      if (sortKey === 'number')   { av = a.number ?? 0; bv = b.number ?? 0; }
      if (sortKey === 'client')   { av = a.client;      bv = b.client; }
      if (sortKey === 'category') { av = a.category;    bv = b.category; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [projects, activeTab, search, sortKey, sortDir]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const resetFilters = () => { setSearch(''); setActiveTab('all'); };
  const isFiltered = !!(search || activeTab !== 'all');

  /* Работы с чертежами показываем карточками над таблицей — у них есть что
     показать глазами, и они должны быть первым, что видит посетитель.
     Остальные остаются строками, чтобы реестр на сотню записей оставался
     обозримым. Разбиение идёт уже после фильтров и поиска, поэтому обе
     части всегда согласованы между собой. */
  const withDrawings = useMemo(() => filtered.filter(p => p.images.length > 0), [filtered]);
  const rest         = useMemo(() => filtered.filter(p => p.images.length === 0), [filtered]);

  return (
    <div className={styles.tableBlock}>

      {/* ── Category stats ─────────────────────────────── */}
      <div className={styles.statsStrip}>
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            className={`${styles.statCard} ${styles[`statCard_${cat}`]} ${activeTab === cat ? styles.statCardActive : ''}`}
            onClick={() => setActiveTab(activeTab === cat ? 'all' : cat)}
          >
            <div className={styles.statHeader}>
              <span className={styles.statCount}>{counts[cat]}</span>
              <span className={styles.statPct}>{Math.round((counts[cat] / projects.length) * 100)}%</span>
            </div>
            <span className={styles.statLabel}>{CATEGORY_LABEL[cat]}</span>
            <div className={styles.statTrack}>
              <div
                className={`${styles.statFill} ${styles[`statFill_${cat}`]}`}
                style={{ width: `${(counts[cat] / projects.length) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* ── Controls ────────────────────────────────────── */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className={styles.tabCount}>
                {t.key === 'all' ? projects.length : (counts[t.key] ?? 0)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" width="14" height="14">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.search}
            placeholder="Заказчик или вид работ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Очистить">✕</button>
          )}
        </div>
      </div>

      {/* ── Карточки работ с чертежами ──────────────────── */}
      {withDrawings.length > 0 && (
        <div className={styles.showcase}>
          <div className={styles.showcaseHead}>
            <h2 className={styles.showcaseTitle}>С чертежами</h2>
            <span className={styles.showcaseCount}>
              {withDrawings.length} {pluralWorks(withDrawings.length)}
            </span>
          </div>
          <div className={styles.showcaseGrid}>
            {withDrawings.map((p, index) => (
              /* Без data-tilt — см. /projects: наклон мешает попадать по карточке. */
              <Link
                key={p.id}
                href={`/design/${p.id}`}
                className={`${styles.dCard} ${styles[`dCard_${p.category}`]}`}
                style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
              >
                {/* Лист вписывается целиком: планы и профили кадрировать нельзя. */}
                <div className={styles.dCardImage}>
                  <Image
                    src={p.images[0]}
                    alt={`${p.client} — чертёж проекта`}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 420px"
                    className={styles.dCardImageReal}
                  />
                  <span className={styles.dCardNum}>
                    {String(p.number ?? '—').padStart(2, '0')}
                  </span>
                  {p.images.length > 1 && (
                    <span className={styles.dCardSheets}>
                      <svg viewBox="0 0 16 16" fill="none" width="11" height="11" aria-hidden>
                        <rect x="2" y="2.5" width="12" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M2 6h12M6 6v7.5" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      {p.images.length} листов
                    </span>
                  )}
                </div>

                <div className={styles.dCardBody}>
                  <div className={styles.dCardTop}>
                    <span className={`${styles.badge} ${styles[`badge_${p.category}`]}`}>
                      {CATEGORY_LABEL[p.category]}
                    </span>
                    {p.year && <span className={styles.dCardYear}>{p.year}</span>}
                  </div>

                  <h3 className={styles.dCardTitle}>{p.client}</h3>
                  {p.description && <p className={styles.dCardDesc}>{p.description}</p>}

                  {p.location && (
                    <span className={styles.dCardMeta}>
                      <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
                        <path d="M7 1C4.8 1 3 2.8 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="7" cy="5" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      {p.location}
                    </span>
                  )}

                  <span className={styles.dCardArrow}>
                    Смотреть чертежи
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyGlyph}>◻</div>
          <p className={styles.emptyText}>Ничего не найдено</p>
          <button className={styles.emptyReset} onClick={resetFilters}>Сбросить фильтры</button>
        </div>
      ) : rest.length === 0 ? null : (
        <div className={styles.tableWrap}>
          {withDrawings.length > 0 && (
            <div className={styles.showcaseHead}>
              <h2 className={styles.showcaseTitle}>Остальной реестр</h2>
              <span className={styles.restCount}>{rest.length}</span>
            </div>
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={`${styles.th} ${styles.thNum} ${styles.thSortable} ${sortKey === 'number' ? styles.thActive : ''}`}
                  onClick={() => handleSort('number')}
                >
                  № <SortIndicator col="number" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${sortKey === 'client' ? styles.thActive : ''}`}
                  onClick={() => handleSort('client')}
                >
                  Заказчик <SortIndicator col="client" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th
                  className={`${styles.th} ${styles.thCat} ${styles.thSortable} ${sortKey === 'category' ? styles.thActive : ''}`}
                  onClick={() => handleSort('category')}
                >
                  Категория <SortIndicator col="category" sortKey={sortKey} sortDir={sortDir} />
                </th>
                <th className={`${styles.th} ${styles.thWorks}`}>Состав работ</th>
                <th className={`${styles.th} ${styles.thChevron}`}></th>
              </tr>
            </thead>
            <tbody>
              {rest.map(p => {
                const isOpen = expanded.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <tr
                      className={`${styles.row} ${styles[`row_${p.category}`]} ${isOpen ? styles.rowOpen : ''}`}
                      onClick={() => toggleExpand(p.id)}
                    >
                      <td className={styles.tdNum}>
                        <span className={`${styles.numBadge} ${styles[`numBadge_${p.category}`]}`}>
                          {String(p.number ?? '—').padStart(2, '0')}
                        </span>
                      </td>
                      <td className={styles.tdClient}>
                        <span className={styles.clientName}>{p.client}</span>
                        {p.year && <span className={styles.yearPill}>{p.year}</span>}
                      </td>
                      <td className={styles.tdCat}>
                        <span className={`${styles.badge} ${styles[`badge_${p.category}`]}`}>
                          <span className={`${styles.badgeDot} ${styles[`badgeDot_${p.category}`]}`} />
                          {CATEGORY_LABEL[p.category]}
                        </span>
                      </td>
                      <td className={styles.tdWorks}>
                        <span className={styles.workPrimary}>{p.works[0]}</span>
                        {p.works.length > 1 && !isOpen && (
                          <span className={`${styles.moreTag} ${styles[`moreTag_${p.category}`]}`}>
                            +{p.works.length - 1}
                          </span>
                        )}
                      </td>
                      <td className={styles.tdChevron}>
                        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                          <svg viewBox="0 0 10 6" fill="none" width="10" height="6">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className={styles.expandRow}>
                        <td colSpan={5} className={`${styles.expandCell} ${styles[`expandCell_${p.category}`]}`}>
                          <div className={styles.expandContent}>
                            <div className={styles.worksList}>
                              {p.works.map((w, i) => (
                                <div key={i} className={styles.worksItem}>
                                  <span className={`${styles.worksIndex} ${styles[`worksIndex_${p.category}`]}`}>
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <span className={styles.worksText}>{w}</span>
                                </div>
                              ))}
                            </div>
                            <Link
                              href={`/design/${p.id}`}
                              className={`${styles.cardLink} ${styles[`cardLink_${p.category}`]}`}
                              onClick={e => e.stopPropagation()}
                            >
                              Открыть карточку
                              <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          <div className={styles.tableFooter}>
            {isFiltered ? (
              <span>
                Найдено <strong className={styles.footerCount}>{filtered.length}</strong> из {projects.length}
                {withDrawings.length > 0 && (
                  <>, из них {withDrawings.length} с чертежами — карточками выше</>
                )}
                <span className={styles.footerSep}>·</span>
                <button className={styles.clearBtn} onClick={resetFilters}>Сбросить фильтры</button>
              </span>
            ) : (
              <span>
                {projects.length} проектных записей в реестре
                {withDrawings.length > 0 && (
                  <>, {withDrawings.length} из них с чертежами</>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
