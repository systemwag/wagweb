/* Shared phase model for the 3D construction story.
   Scroll progress p ∈ [0,1] is mapped onto these windows;
   the scene (ConstructionScene) and the overlay (ConstructionView)
   both read from here so they stay in sync.

   Переезд — не отдельный этап: он достраивается во второй половине
   фазы «Ж/д пути» (все его анимации привязаны к phase 3). */

export interface Phase {
  id: string;
  label: string;
  title: string;
  desc: string;
  start: number;
  end: number;
}

export const PHASES: Phase[] = [
  {
    id: 'design',
    label: '01',
    title: 'Проектирование',
    desc: 'Трасса, инженерно-геодезические изыскания, цифровая модель объекта. На этом этапе рождается комплект ПСД.',
    start: 0.0,
    end: 0.16,
  },
  {
    id: 'earth',
    label: '02',
    title: 'Земляные работы',
    desc: 'Планировка площадки, насыпи под автодорогу и ж/д путь, водоотвод. Готовим основание для конструкций.',
    start: 0.16,
    end: 0.3,
  },
  {
    id: 'road',
    label: '03',
    title: 'Автодороги',
    desc: 'Дорожная одежда: щебёночное основание, двухслойный асфальтобетон, разметка и обочины.',
    start: 0.3,
    end: 0.44,
  },
  {
    id: 'rail',
    label: '04',
    title: 'Ж/д пути и переезд',
    desc: 'Балластная призма, железобетонные шпалы, рельсовые плети Р65 — колея 1520 мм. На пересечении с автодорогой — оборудованный переезд с сигнализацией и шлагбаумами.',
    start: 0.44,
    end: 0.6,
  },
  {
    id: 'networks',
    label: '05',
    title: 'Инженерные сети',
    desc: '«Рентген» стройки: водоснабжение и теплотрасса под дорожным полотном, кабель связи, опоры ЛЭП вдоль трассы.',
    start: 0.6,
    end: 0.76,
  },
  {
    id: 'industrial',
    label: '06',
    title: 'Промышленные объекты',
    desc: 'Производственный цех, резервуарный парк и козловой кран на подъездном пути предприятия.',
    start: 0.76,
    end: 0.88,
  },
  {
    id: 'expertise',
    label: '07',
    title: 'ГосЭкспертиза',
    desc: 'Комплект ПСД и рабочей документации — сопровождение РГП «ГосЭкспертиза» до положительного заключения.',
    start: 0.88,
    end: 1.0,
  },
];

/* Helpers shared by scene components (kept dependency-free) */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

/** Progress of phase i for global scroll progress p, clamped to [0,1] */
export const phaseProgress = (p: number, i: number) =>
  clamp01((p - PHASES[i].start) / (PHASES[i].end - PHASES[i].start));

/** Sub-window [a,b] inside a phase progress q, eased */
export const sub = (q: number, a: number, b: number) => ease(clamp01((q - a) / (b - a)));

/**
 * «Рентген» для капитальных конструкций: в фазе инженерных сетей (4)
 * насыпи/покрытия/балласт просвечивают, открывая подземные коммуникации,
 * затем снова твердеют к финалу.
 */
export const xrayOpacity = (p: number) =>
  clamp01(1 - 0.88 * phaseProgress(p, 4) + 0.88 * phaseProgress(p, 5));
