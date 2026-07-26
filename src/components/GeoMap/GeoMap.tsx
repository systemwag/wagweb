'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './GeoMap.module.css';
import { KZ_REGIONS, KZ_NEIGHBORS, KZ_OUTLINE, VIEWBOX } from '@/lib/geo/kz-geo.generated';
import {
  hubRadius, relaxHubs, tierFor, layoutHubLabels, layoutRegionLabels,
  type PlacedHub,
} from '@/lib/geo/layout';
import {
  filterIndex, KIND_META, KIND_ORDER,
  type GeoIndex, type HubAgg, type WorkKind,
} from '@/lib/geo/works';

const REGION_BY_CODE = new Map(KZ_REGIONS.map(r => [r.code, r]));

/** Сколько узел держится в автопоказе, мс */
const TOUR_DWELL = 4600;
/** Размер карточки автопоказа в единицах viewBox */
const CALLOUT_W = 252;
const CALLOUT_H = 152;

/**
 * Карточка автопоказа стоит в фиксированном углу, а к узлу тянется выноска.
 * Плавающая карточка рядом с узлом не работает: у Актобе с любой стороны
 * вплотную сидят соседние узлы, и она закрывала пол-кластера. Заодно
 * неподвижная карточка не заставляет взгляд бегать за ней по карте.
 */
function calloutLayout(hub: PlacedHub, others: PlacedHub[], m: number) {
  const pad = 16;
  /* Верх справа — единственный угол, куда за всю историю проектов не попадает
     ни один узел, поэтому карточка не прыгает между кадрами тура. */
  const slots = [
    { x: VIEWBOX.w - CALLOUT_W - pad, y: pad },
    { x: VIEWBOX.w - CALLOUT_W - pad, y: VIEWBOX.h - CALLOUT_H - pad },
  ];

  /* Если в слоте оказался узел — берём запасной */
  const occupied = (s: { x: number; y: number }) => others.some(p => {
    const r = hubRadius(p.total, m) + 6;
    return p.px + r > s.x && p.px - r < s.x + CALLOUT_W
        && p.py + r > s.y && p.py - r < s.y + CALLOUT_H;
  });
  const slot = occupied(slots[0]) ? slots[1] : slots[0];

  const anchorX = slot.x;
  const anchorY = slot.y + 44;
  /* Колено на трети пути — линия читается как чертёжная выноска, а не как диагональ */
  return {
    side: 'left' as const,
    cardX: slot.x, cardY: slot.y,
    anchorX, anchorY,
    elbowX: hub.px + (anchorX - hub.px) * 0.45,
  };
}

type Selection =
  | { type: 'none' }
  | { type: 'hub'; id: string }
  | { type: 'region'; code: string };

interface Props {
  index: GeoIndex;
  /** Какие типы работ включены при первом показе. По умолчанию все три. */
  initialKinds?: WorkKind[];
  /** Показывать отладочную сводку разбора адресов (только /map-lab) */
  debug?: boolean;
}

export default function GeoMap({ index, initialKinds, debug = false }: Props) {
  const [kinds, setKinds] = useState<Set<WorkKind>>(
    () => new Set(initialKinds?.length ? initialKinds : KIND_ORDER),
  );
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [hovered, setHovered] = useState<PlacedHub | null>(null);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  /* Узкий контейнер → крупнее маркеры, иначе на телефоне в них не попасть */
  useEffect(() => {
    const el = mapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width || 1;
      setScale(Math.min(2, Math.max(1, 760 / w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Анимация входа — только когда секция попала в кадр */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setReady(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Вступление играет ОДИН раз. Иначе смена фильтра меняет порядок узлов,
     а вместе с ним animation-delay — и маркеры на секунду исчезают. */
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setEntered(true), 2200);
    return () => clearTimeout(t);
  }, [ready]);

  const view = useMemo(() => filterIndex(index, kinds), [index, kinds]);
  const regionCount = useMemo(
    () => new Map(view.regions.map(r => [r.code, r.total])),
    [view.regions],
  );

  const selectedHub = selection.type === 'hub'
    ? view.hubs.find(h => h.id === selection.id) ?? null
    : null;
  /* Выбор не сбрасывается, а просто перестаёт действовать, если фильтр убрал
     объект с карты: вернули галочку — вернулась и панель. */
  const selectedRegion = selection.type === 'region'
      && view.regions.some(r => r.code === selection.code)
    ? selection.code
    : null;

  const toggleKind = (k: WorkKind) => {
    setKinds(prev => {
      const next = new Set(prev);
      if (next.has(k)) { if (next.size > 1) next.delete(k); }
      else next.add(k);
      return next;
    });
  };

  /* Узлы в Актюбинской области стоят в 20–60 км друг от друга — в масштабе
     страны это несколько пикселей. Раздвигаем их, оставляя поводок к настоящей
     точке, иначе половина маркеров прячется под соседями. */
  const placed = useMemo(() => relaxHubs(view.hubs, scale), [view.hubs, scale]);
  /* Названия областей раскладываются ПЕРВЫМИ: «где основная масса работ» —
     более важный факт, чем подпись отдельного узла, и место в плотной
     Актюбинской достаётся ей. Подписи узлов затем обходят занятое. */
  const regionLabels = useMemo(
    () => layoutRegionLabels(view.regions, placed, scale),
    [view.regions, placed, scale],
  );
  const labels = useMemo(
    () => layoutHubLabels(placed, selectedHub?.id ?? null, regionLabels.map(l => l.box), scale),
    [placed, selectedHub, regionLabels, scale],
  );

  /* ── Автопоказ ────────────────────────────────────────────────
     Как на старой карте: узлы показываются по очереди сами. Тур молчит, пока
     идёт вступление, и уступает пользователю — при наведении или выборе узла
     он замирает, а как только выбор снят, продолжает с того же места. */
  const [tourStep, setTourStep] = useState(0);
  const tourPaused = hovered !== null || selection.type !== 'none' || !entered;

  useEffect(() => {
    if (tourPaused || placed.length < 2) return;
    const t = setInterval(() => setTourStep(i => i + 1), TOUR_DWELL);
    return () => clearInterval(t);
  }, [tourPaused, placed.length]);

  const tourHub = tourPaused || !placed.length ? null : placed[tourStep % placed.length];
  const callout = tourHub ? calloutLayout(tourHub, placed, scale) : null;

  return (
    <div className={styles.root} ref={wrapRef} data-ready={ready} data-entered={entered}>
      {/* ── Фильтры ─────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.chips}>
          {KIND_ORDER.map(k => {
            const on = kinds.has(k);
            return (
              <button
                key={k}
                type="button"
                className={styles.chip}
                data-kind={k}
                data-on={on}
                onClick={() => toggleKind(k)}
                aria-pressed={on}
              >
                <span className={styles.chipDot} />
                <span className={styles.chipLabel}>{KIND_META[k].short}</span>
                <span className={styles.chipCount}>{index.totals[k]}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.toolbarMeta}>
          <strong>{view.total}</strong> объектов · <strong>{view.hubs.length}</strong> точек присутствия
          {' · '}<strong>{view.regions.length}</strong> регионов
        </p>
      </div>

      <div className={styles.mapWrap} ref={mapRef} style={{ '--m': scale } as React.CSSProperties}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Карта объектов West Arlan Group по регионам Казахстана"
            onClick={() => setSelection({ type: 'none' })}
          >
            <defs>
              <pattern id="geoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0v40" fill="none" stroke="rgba(212,168,67,0.05)" strokeWidth="0.5" />
              </pattern>
              <clipPath id="geoClip">
                <rect x="0" y="0" width={VIEWBOX.w} height={VIEWBOX.h} />
              </clipPath>
              <filter id="geoGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <rect width={VIEWBOX.w} height={VIEWBOX.h} fill="url(#geoGrid)" />

            <g clipPath="url(#geoClip)">
              {/* Соседи — только контекст границы */}
              <g className={styles.neighbors}>
                {KZ_NEIGHBORS.map(n => (
                  <path key={n.code} d={n.d} />
                ))}
              </g>

              {/* Области */}
              <g className={styles.regions}>
                {KZ_REGIONS.map((r, i) => {
                  const n = regionCount.get(r.code) ?? 0;
                  const tier = tierFor(n, view.total);
                  const active = selectedRegion === r.code;
                  return (
                    <path
                      key={r.code}
                      d={r.d}
                      fillRule="evenodd"
                      className={styles.region}
                      data-has={n > 0}
                      data-active={active}
                      style={{
                        '--fill': tier.fill,
                        '--stroke': tier.stroke,
                        '--i': i,
                      } as React.CSSProperties}
                      onClick={e => {
                        e.stopPropagation();
                        if (n > 0) setSelection(active ? { type: 'none' } : { type: 'region', code: r.code });
                      }}
                    >
                      <title>{`${r.name} — ${n} ${plural(n, 'объект', 'объекта', 'объектов')}`}</title>
                    </path>
                  );
                })}
              </g>

              {/* Контур страны — поверх заливок, чтобы силуэт РК читался сразу */}
              <path className={styles.outlineGlow} d={KZ_OUTLINE} fillRule="evenodd" />
              <path className={styles.outline} d={KZ_OUTLINE} fillRule="evenodd" />

              {/* Подписи областей — под маркерами */}
              <g className={styles.regionLabels}>
                {regionLabels.map(l => (
                  <text key={l.code} x={l.x} y={l.y} className={styles.regionLabel} data-has={l.has}>
                    {l.text}
                  </text>
                ))}
              </g>

              {/* Выноска автопоказа — от узла к карточке */}
              {callout && tourHub && (
                <g className={styles.calloutLine} key={`cl-${tourHub.id}`}>
                  <path
                    d={`M${tourHub.px} ${tourHub.py}
                        L${callout.elbowX} ${tourHub.py}
                        L${callout.elbowX + 26} ${callout.anchorY}
                        L${callout.anchorX} ${callout.anchorY}`}
                    fill="none"
                  />
                  <circle cx={tourHub.px} cy={tourHub.py} r={2.2 * scale} />
                </g>
              )}

              {/* Поводки к настоящим координатам раздвинутых узлов */}
              <g className={styles.leaders}>
                {placed.filter(h => h.offset > 2.5).map(h => (
                  <g key={h.id}>
                    <line x1={h.x} y1={h.y} x2={h.px} y2={h.py} />
                    <circle cx={h.x} cy={h.y} r="1.6" />
                  </g>
                ))}
              </g>

              {/* Хабы */}
              <g className={styles.hubs}>
                {placed.map((h, i) => (
                  <HubMarker
                    key={h.id}
                    hub={h}
                    order={i}
                    m={scale}
                    active={selectedHub?.id === h.id || tourHub?.id === h.id}
                    dimmed={
                      (selectedHub != null && selectedHub.id !== h.id) ||
                      (selectedRegion != null && h.regionCode !== selectedRegion)
                    }
                    onSelect={() => setSelection(
                      selectedHub?.id === h.id ? { type: 'none' } : { type: 'hub', id: h.id },
                    )}
                    onHover={setHovered}
                  />
                ))}
              </g>

              {/* Подписи хабов — с проверкой на перекрытие */}
              <g className={styles.hubLabels}>
                {labels.map(l => (
                  <text
                    key={l.id}
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    className={styles.hubLabel}
                    data-strong={l.strong}
                    style={{ '--i': l.order } as React.CSSProperties}
                  >
                    {l.text}
                  </text>
                ))}
              </g>
            </g>
          </svg>

          {/* Карточка автопоказа */}
          {callout && tourHub && (
            <button
              type="button"
              key={`card-${tourHub.id}`}
              className={styles.callout}
              data-side={callout.side}
              style={{
                left:   `${(callout.cardX / VIEWBOX.w) * 100}%`,
                top:    `${(callout.cardY / VIEWBOX.h) * 100}%`,
                width:  `${(CALLOUT_W / VIEWBOX.w) * 100}%`,
              }}
              onClick={() => setSelection({ type: 'hub', id: tourHub.id })}
            >
              <span className={styles.calloutHead}>
                <span className={styles.calloutTitle}>{tourHub.label}</span>
                <span className={styles.calloutTotal}>{tourHub.total}</span>
              </span>
              <span className={styles.calloutWork}>{tourHub.groups[0]?.works[0]?.title}</span>
              <span className={styles.calloutKinds}>
                {KIND_ORDER.filter(k => tourHub.byKind[k] > 0).map(k => (
                  <span key={k} className={styles.kindPill} data-kind={k}>
                    {KIND_META[k].short} {tourHub.byKind[k]}
                  </span>
                ))}
              </span>
              <span className={styles.calloutBar} />
            </button>
          )}

          {hovered && (
            <div
              className={styles.tip}
              style={{
                left: `${(hovered.px / VIEWBOX.w) * 100}%`,
                top: `${(hovered.py / VIEWBOX.h) * 100}%`,
              }}
            >
              <span className={styles.tipTitle}>{hovered.label}</span>
              <span className={styles.tipTotal}>
                {hovered.total} {plural(hovered.total, 'объект', 'объекта', 'объектов')}
              </span>
              <span className={styles.tipBreak}>
                {KIND_ORDER.filter(k => hovered.byKind[k] > 0).map(k => (
                  <span key={k} className={styles.tipKind} data-kind={k}>
                    {KIND_META[k].short} {hovered.byKind[k]}
                  </span>
                ))}
              </span>
            </div>
          )}

          <p className={styles.tapHint}>Нажмите на узел или область — покажем объекты</p>

          <ul className={styles.legend}>
            <li><span className={styles.legendSwatch} data-tier="core" /> ядро работ</li>
            <li><span className={styles.legendSwatch} data-tier="strong" /> значимое присутствие</li>
            <li><span className={styles.legendSwatch} data-tier="some" /> отдельные объекты</li>
          </ul>

          {/* Объекты открываются накладной карточкой поверх карты: постоянная
              боковая таблица занимала треть ширины ради данных, которые нужны
              только по запросу. */}
          {(selectedHub || selectedRegion) && (
            <div className={styles.sheet} key={selectedHub?.id ?? selectedRegion}>
              {selectedHub
                ? <HubPanel hub={selectedHub} onClose={() => setSelection({ type: 'none' })} />
                : <RegionPanel
                    code={selectedRegion!}
                    hubs={view.hubs.filter(h => h.regionCode === selectedRegion)}
                    onClose={() => setSelection({ type: 'none' })}
                    onHub={id => setSelection({ type: 'hub', id })}
                  />}
            </div>
          )}
      </div>

      <p className={styles.footnote}>
        Проектные работы показаны только те, по которым в архиве есть чертежи —
        {' '}{index.sourceTotals.design} из {index.designTotal} в реестре ПД.
        Координаты районов и сельских округов даны по административному центру.
      </p>

      {debug && <DebugPanel index={index} />}
    </div>
  );
}

/* ── Маркер хаба: кольцо из сегментов по типам работ ──────────────────────── */
function HubMarker({ hub, order, m, active, dimmed, onSelect, onHover }: {
  hub: PlacedHub; order: number; m: number; active: boolean; dimmed: boolean;
  onSelect: () => void; onHover: (h: PlacedHub | null) => void;
}) {
  const r = hubRadius(hub.total, m);
  const ring = r - 2.6 * m;
  const circ = 2 * Math.PI * ring;
  const present = KIND_ORDER.filter(k => hub.byKind[k] > 0);
  const gap = present.length > 1 ? Math.min(6, circ * 0.03) : 0;

  const segments: Array<{ kind: WorkKind; len: number; offset: number }> = [];
  for (let i = 0, acc = 0; i < present.length; i++) {
    const k = present[i];
    const len = (circ * hub.byKind[k]) / hub.total;
    segments.push({ kind: k, len: Math.max(len - gap, 0.6), offset: -acc });
    acc += len;
  }

  return (
    <g
      className={styles.hub}
      data-active={active}
      data-dimmed={dimmed}
      style={{ '--i': order, '--r': r } as React.CSSProperties}
      transform={`translate(${hub.px} ${hub.py})`}
      onClick={e => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => onHover(hub)}
      onMouseLeave={() => onHover(null)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      aria-label={`${hub.label}: ${hub.total} объектов`}
    >
      {/* Пульс — только у крупных узлов, иначе карта «дышит» слишком шумно */}
      {hub.total >= 4 && (
        <circle className={styles.hubPulse} r={r} fill="none" />
      )}
      <circle className={styles.hubHalo} r={r + 3 * m} />
      <circle className={styles.hubCore} r={ring - 2 * m} />
      <g transform="rotate(-90)" filter="url(#geoGlow)">
        {segments.map(s => (
          <circle
            key={s.kind}
            r={ring}
            fill="none"
            stroke={KIND_META[s.kind].color}
            strokeWidth={4 * m}
            strokeLinecap="butt"
            strokeDasharray={`${s.len} ${circ - s.len}`}
            strokeDashoffset={s.offset}
            className={styles.hubSeg}
          />
        ))}
      </g>
      <text className={styles.hubCount} dy="0.36em">{hub.total}</text>
      <circle className={styles.hubHit} r={r + 8 * m} fill="transparent" />
    </g>
  );
}

/* ── Панели ───────────────────────────────────────────────────────────────── */

function RegionPanel({ code, hubs, onClose, onHub }: {
  code: string; hubs: HubAgg[]; onClose: () => void; onHub: (id: string) => void;
}) {
  const meta = REGION_BY_CODE.get(code);
  const total = hubs.reduce((s, h) => s + h.total, 0);
  return (
    <>
      <header className={styles.panelHead}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">×</button>
        <h3 className={styles.panelTitle}>{meta?.name ?? foreignName(code)}</h3>
        <p className={styles.panelSub}>{total} {plural(total, 'объект', 'объекта', 'объектов')}</p>
      </header>
      <ul className={styles.hubList}>
        {hubs.map(h => (
          <li key={h.id}>
            <button type="button" className={styles.hubRow} onClick={() => onHub(h.id)}>
              <span className={styles.hubRowName}>{h.label}</span>
              <span className={styles.hubRowKinds}>
                {KIND_ORDER.filter(k => h.byKind[k] > 0).map(k => (
                  <span key={k} className={styles.kindPill} data-kind={k}>{h.byKind[k]}</span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function HubPanel({ hub, onClose }: { hub: HubAgg; onClose: () => void }) {
  return (
    <>
      <header className={styles.panelHead}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">×</button>
        <h3 className={styles.panelTitle}>{hub.label}</h3>
        <p className={styles.panelSub}>
          {hub.total} {plural(hub.total, 'объект', 'объекта', 'объектов')} на {hub.groups.length}{' '}
          {plural(hub.groups.length, 'площадке', 'площадках', 'площадках')}
        </p>
      </header>
      <div className={styles.works}>
        {hub.groups.map(g => (
          <section key={g.place.id} className={styles.group}>
            <h4 className={styles.groupTitle}>
              {g.place.label}
              {g.place.precision !== 'exact' && (
                <span className={styles.precision} title={precisionHint(g.place.precision)}>
                  {precisionMark(g.place.precision)}
                </span>
              )}
            </h4>
            <ul className={styles.workList}>
              {g.works.map(w => (
                <li key={w.key}>
                  <Link href={w.href} className={styles.work} data-kind={w.kind}>
                    <span className={styles.workBar} />
                    <span className={styles.workBody}>
                      <span className={styles.workTitle}>{w.title}</span>
                      <span className={styles.workMeta}>
                        {w.meta}{w.year ? ` · ${w.year}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function DebugPanel({ index }: { index: GeoIndex }) {
  const byPrecision = index.works.reduce<Record<string, number>>((acc, w) => {
    acc[w.place.precision] = (acc[w.place.precision] ?? 0) + 1;
    return acc;
  }, {});
  const notes = index.works
    .map(w => w.place)
    .filter((p, i, arr) => p.note && arr.findIndex(q => q.id === p.id) === i);

  return (
    <details className={styles.debug} open={index.unresolved.length > 0}>
      <summary>
        Отладка разбора: {index.works.length} распознано, {index.unresolved.length} нет
      </summary>
      <div className={styles.debugBody}>
        <p className={styles.debugLine}>
          Точность координат:{' '}
          {Object.entries(byPrecision).map(([k, v]) => `${precisionHint(k as never)} — ${v}`).join(' · ')}
        </p>
        {notes.length > 0 && (
          <>
            <p className={styles.debugLine}>Спорные координаты:</p>
            <ul className={styles.debugList}>
              {notes.map(p => <li key={p.id}><b>{p.label}</b> — {p.note}</li>)}
            </ul>
          </>
        )}
        {index.unresolved.length > 0 && (
          <>
            <p className={styles.debugLine}>Не распознаны:</p>
            <ul className={styles.debugList}>
              {index.unresolved.map((u, i) => (
                <li key={i}>
                  <b>{KIND_META[u.kind].short}</b> · {u.location ?? '— адрес не заполнен —'} · {u.title}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </details>
  );
}

/* ── Утилиты ──────────────────────────────────────────────────────────────── */

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const FOREIGN: Record<string, string> = { 'RU-ORE': 'Оренбургская обл.' };
const foreignName = (code: string) => FOREIGN[code] ?? code;

const precisionMark = (p: 'approx' | 'district' | 'region' | 'exact') =>
  p === 'district' ? '≈ район' : p === 'region' ? '≈ область' : '≈';

const precisionHint = (p: 'approx' | 'district' | 'region' | 'exact') => ({
  exact:    'точная координата',
  approx:   'привязка к площадке рядом с известным центром',
  district: 'координата административного центра района',
  region:   'известна только область',
}[p]);
