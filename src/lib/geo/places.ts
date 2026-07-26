/**
 * Газеттир — единственный источник географии для карты.
 *
 * Зачем: раньше координаты хранились в БД как пиксели (`projects.x_map/y_map`,
 * 0–1024 × 0–800), привязанные к конкретному обведённому контуру. Их нельзя
 * проверить, нельзя переиспользовать и приходилось расставлять руками для
 * каждой строки. Здесь место описывается один раз — реальными широтой/долготой,
 * а строки из БД сопоставляются с ним по тексту `location`.
 *
 * Добавили новый объект → в худшем случае одна новая запись PLACES, а чаще
 * ничего: адрес уже разбирается существующим правилом.
 *
 * precision:
 *   'exact'    — координаты города/станции;
 *   'approx'   — привязка к промзоне/станции рядом с известным центром (±10 км);
 *   'district' — центр района, точная площадка не публиковалась;
 *   'region'   — известна только область.
 */

export type Precision = 'exact' | 'approx' | 'district' | 'region';

export interface Place {
  id: string;
  /** Подпись в списке объектов */
  label: string;
  lat: number;
  lon: number;
  /** Код региона из kz-geo.generated (или RU-* для зарубежья) */
  region: string;
  hub: string;
  precision: Precision;
  /** Оговорка, если координата спорная — показывается в отладке /map-lab */
  note?: string;
  /** 'pin' — координата проставлена вручную в админке, а не выведена из адреса */
  source?: 'gazetteer' | 'pin';
}

/**
 * Место из ручной точки: объект стоит там, где компания больше работать не
 * будет, и заводить его в справочник смысла нет. Такой объект образует
 * собственный узел на карте.
 */
export function pinnedPlace(
  key: string, label: string, lat: number, lon: number, region: string,
): Place {
  return {
    id: `pin:${key}`,
    label,
    lat, lon,
    region,
    hub: `pin:${key}`,
    precision: 'exact',
    source: 'pin',
  };
}

export interface Hub {
  id: string;
  /** Подпись на карте */
  label: string;
  /** Место-якорь: его координаты = позиция хаба */
  anchor: string;
  /** Приоритет подписи: 1 — всегда, 2 — если хватает места */
  rank: 1 | 2;
}

/* ── Хабы ───────────────────────────────────────────────────────────────────
   Хаб = то, что видит заказчик на карте: один маркер на «точку присутствия».
   Внутри может быть 8 разных площадок (как в Актобе) — они раскрываются
   по клику, а не громоздятся друг на друге. */
export const HUBS: Hub[] = [
  { id: 'aktobe',      label: 'Актобе',          anchor: 'aktobe-city',  rank: 1 },
  { id: 'khromtau',    label: 'Хромтау · Коктау', anchor: 'koktau',      rank: 1 },
  { id: 'uralsk',      label: 'Уральск',         anchor: 'uralsk',       rank: 1 },
  { id: 'atyrau',      label: 'Атырау',          anchor: 'atyrau',       rank: 1 },
  { id: 'baiganin',    label: 'Байганин',        anchor: 'koltaban',     rank: 2 },
  { id: 'shubarkuduk', label: 'Шубаркудук',      anchor: 'shubarkuduk',  rank: 2 },
  { id: 'zhem',        label: 'Жем',             anchor: 'zhem',         rank: 2 },
  { id: 'birshogyr',   label: 'Биршогыр',        anchor: 'birshogyr',    rank: 2 },
  { id: 'irgiz',       label: 'Иргиз',           anchor: 'irgiz',        rank: 2 },
  { id: 'aitekebi',    label: 'Айтеке би',       anchor: 'aitekebi',     rank: 2 },
  { id: 'karabulak',   label: 'Карабулак',       anchor: 'karabulak',    rank: 2 },
  { id: 'taskala',     label: 'Тасқала',         anchor: 'taskala',      rank: 2 },
  { id: 'beyneu',      label: 'Бейнеу',          anchor: 'beyneu',       rank: 1 },
  { id: 'astana',      label: 'Астана',          anchor: 'astana',       rank: 1 },
  { id: 'shymkent',    label: 'Шымкент',         anchor: 'shymkent',     rank: 1 },
  { id: 'bakty',       label: 'Бакты',           anchor: 'bakty',        rank: 1 },
  { id: 'khorgos',     label: 'Хоргос',          anchor: 'khorgos',      rank: 1 },
  { id: 'kospan',      label: 'Коспан',          anchor: 'kospan',       rank: 2 },
  { id: 'novotroitsk', label: 'Новотроицк · РФ', anchor: 'novotroitsk',  rank: 1 },
];

/* ── Места ─────────────────────────────────────────────────────────────────── */
export const PLACES: Place[] = [
  /* Актюбинская агломерация */
  { id: 'aktobe-city',  label: 'Актобе',                      lat: 50.2839, lon: 57.1670, region: 'AKT', hub: 'aktobe', precision: 'exact' },
  { id: 'zhinishke',    label: 'ст. Жинишке · промзона',      lat: 50.3500, lon: 57.3000, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'ind-zone',     label: 'Индустриальная зона',         lat: 50.3450, lon: 57.2850, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'razezd41',     label: '41-й разъезд · р-н Алматы',   lat: 50.2400, lon: 57.0700, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'aktobe-1',     label: 'ст. Актобе-1',                lat: 50.2830, lon: 57.2100, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'kyzgaldakty',  label: 'ст. Кызгалдакты · р-н Астана', lat: 50.3100, lon: 57.1400, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'arbz',         label: 'Завод АРБЗ',                  lat: 50.2600, lon: 57.2400, region: 'AKT', hub: 'aktobe', precision: 'approx' },
  { id: 'ilek',         label: 'Илекский водозабор',          lat: 50.4200, lon: 57.1500, region: 'AKT', hub: 'aktobe', precision: 'approx' },

  /* Хромтауский узел */
  { id: 'koktau',     label: 'пос. Коктау · Хромтауский р-н', lat: 50.2500, lon: 58.4500, region: 'AKT', hub: 'khromtau', precision: 'approx' },
  { id: 'nikeltau',   label: 'ст. Никельтау',                 lat: 50.2900, lon: 58.3500, region: 'AKT', hub: 'khromtau', precision: 'approx' },
  { id: 'kyzylkain',  label: 'ст. Кызыл-Каин — Рудная',       lat: 50.2600, lon: 58.4800, region: 'AKT', hub: 'khromtau', precision: 'approx' },
  { id: 'limannoe',   label: 'м-е Лиманное',                  lat: 50.3000, lon: 58.5000, region: 'AKT', hub: 'khromtau', precision: 'approx' },

  /* Западный Казахстан */
  { id: 'uralsk',  label: 'Уральск',              lat: 51.2333, lon: 51.3667, region: 'ZKO', hub: 'uralsk',  precision: 'exact' },
  { id: 'kardon',  label: 'с. Кардон · ст. Кардон', lat: 51.1800, lon: 51.5000, region: 'ZKO', hub: 'uralsk', precision: 'approx' },
  { id: 'taskala', label: 'Тасқалинский район',    lat: 51.1000, lon: 50.3000, region: 'ZKO', hub: 'taskala', precision: 'district' },

  /* Прикаспий */
  { id: 'atyrau', label: 'Атырау',                        lat: 47.0945, lon: 51.9238, region: 'ATY', hub: 'atyrau', precision: 'exact' },
  { id: 'tendyk', label: 'ст. Тендык · аул Новокирпичный', lat: 47.0500, lon: 51.9800, region: 'ATY', hub: 'atyrau', precision: 'approx' },
  { id: 'isatay', label: 'с. Исатай · ст. Исатай',        lat: 47.0000, lon: 51.7000, region: 'ATY', hub: 'atyrau', precision: 'approx' },
  { id: 'beyneu', label: 'Бейнеуский район',              lat: 45.3200, lon: 55.2000, region: 'MAN', hub: 'beyneu', precision: 'district' },

  /* Актюбинская область — районы и линейные станции */
  { id: 'koltaban',    label: 'Кольтабанский с.о. · Байганинский р-н', lat: 48.6000, lon: 55.7000, region: 'AKT', hub: 'baiganin',    precision: 'district' },
  { id: 'kenzhaly',    label: 'ст. Кенжалы',              lat: 48.6500, lon: 55.8000, region: 'AKT', hub: 'baiganin',    precision: 'approx' },
  { id: 'shubarkuduk', label: 'ст. Шубаркудук',           lat: 49.1400, lon: 56.4900, region: 'AKT', hub: 'shubarkuduk', precision: 'exact' },
  { id: 'zhem',        label: 'ст. Жем (Эмба)',           lat: 48.8300, lon: 58.1400, region: 'AKT', hub: 'zhem',        precision: 'exact' },
  { id: 'birshogyr',   label: 'ст. Биршогыр',             lat: 48.5500, lon: 58.5000, region: 'AKT', hub: 'birshogyr',   precision: 'approx' },
  { id: 'irgiz',       label: 'Иргизский район',          lat: 48.6100, lon: 61.2700, region: 'AKT', hub: 'irgiz',       precision: 'district' },
  { id: 'aitekebi',    label: 'Айтекебийский район',      lat: 50.2000, lon: 62.1400, region: 'AKT', hub: 'aitekebi',    precision: 'district' },
  { id: 'karabulak',   label: 'Карабулакский с.о.',       lat: 50.7500, lon: 56.5000, region: 'AKT', hub: 'karabulak',   precision: 'district',
    note: 'Сельский округ не уточнён в БД — координата по Мартукскому району. Проверить.' },

  /* Центр, юг, восток */
  { id: 'astana',   label: 'Астана',                    lat: 51.1605, lon: 71.4704, region: 'AST', hub: 'astana',   precision: 'exact' },
  { id: 'shymkent', label: 'Шымкент',                   lat: 42.3417, lon: 69.5901, region: 'SHY', hub: 'shymkent', precision: 'exact' },
  { id: 'bakty',    label: 'Бакты · Урджарский р-н',    lat: 46.6800, lon: 82.7200, region: 'ABA', hub: 'bakty',    precision: 'approx' },
  { id: 'khorgos',  label: 'СЭЗ «Хоргос — Восточные ворота»', lat: 44.2100, lon: 80.3600, region: 'ZHE', hub: 'khorgos', precision: 'approx',
    note: 'В БД указана Алматинская обл.; после реформы 2022 г. Панфиловский р-н — Жетысуская обл.' },
  { id: 'kospan',   label: 'с. Коспан',                 lat: 44.2000, lon: 78.4000, region: 'ZHE', hub: 'kospan',   precision: 'region',
    note: 'Точное село не подтверждено источником — координата ориентировочная.' },

  /* Зарубежье */
  { id: 'novotroitsk', label: 'Новотроицк · Оренбургская обл.', lat: 51.2000, lon: 58.3100, region: 'RU-ORE', hub: 'novotroitsk', precision: 'exact' },
];

export const PLACE_BY_ID = new Map(PLACES.map(p => [p.id, p]));
export const HUB_BY_ID = new Map(HUBS.map(h => [h.id, h]));

/* ── Разбор строки `location` ───────────────────────────────────────────────
   Правила проверяются сверху вниз — от самого конкретного к общему.
   «г. Актобе, р-н Астана · ст. Кызгалдакты» обязан попасть в Кызгалдакты,
   а не в Астану, поэтому порядок здесь — часть логики, а не оформление. */
const RULES: Array<{ place: string; match: RegExp }> = [
  { place: 'kyzgaldakty', match: /кызгалдакты/ },
  { place: 'razezd41',    match: /41[-\s]?(й\s)?разъезд/ },
  { place: 'ilek',        match: /илекск/ },
  { place: 'arbz',        match: /арбз/ },
  { place: 'aktobe-1',    match: /актобе[-\s]?(1|i{1,2}|2)\b/ },
  { place: 'zhinishke',   match: /жинишке/ },
  { place: 'ind-zone',    match: /индустриальн[а-я]*\s*зон/ },

  { place: 'kyzylkain',   match: /кызыл[-\s]?каин/ },
  { place: 'limannoe',    match: /лиманное/ },
  { place: 'nikeltau',    match: /никельтау/ },
  { place: 'koktau',      match: /коктау|хромтау/ },

  { place: 'kardon',      match: /кардон/ },
  { place: 'taskala',     match: /таскалинск/ },
  { place: 'uralsk',      match: /уральск/ },

  { place: 'tendyk',      match: /тенд(ы|и)к/ },
  { place: 'isatay',      match: /исатай/ },
  { place: 'atyrau',      match: /атырау/ },
  { place: 'beyneu',      match: /бейнеу/ },

  { place: 'kenzhaly',    match: /кенжалы/ },
  { place: 'koltaban',    match: /кольтабан|байганинск/ },
  { place: 'shubarkuduk', match: /шубаркудук/ },
  /* \b по кириллице не работает (\w — только латиница), поэтому границы вручную */
  { place: 'zhem',        match: /(^|[^а-я])жем([^а-я]|$)|эмба/ },
  { place: 'birshogyr',   match: /биршогыр|бирыштр|биршогир/ },
  { place: 'irgiz',       match: /иргиз/ },
  { place: 'aitekebi',    match: /айтекеби/ },
  { place: 'karabulak',   match: /карабулак/ },

  { place: 'novotroitsk', match: /новотроицк/ },
  { place: 'khorgos',     match: /хоргос/ },
  { place: 'kospan',      match: /коспан/ },
  { place: 'bakty',       match: /бакты|бахты/ },
  { place: 'shymkent',    match: /шымкент/ },
  { place: 'astana',      match: /астана|нур[-\s]?султан/ },

  /* Самые общие — в самом низу */
  { place: 'aktobe-city', match: /актобе|актюбинск/ },
];

/** Казахские буквы → русские аналоги, чтобы «Тасқалинский» = «Таскалинский». */
export function normalizeLocation(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/қ/g, 'к').replace(/ә/g, 'а').replace(/ө/g, 'о')
    .replace(/ұ/g, 'у').replace(/ү/g, 'у').replace(/ғ/g, 'г')
    .replace(/і/g, 'и').replace(/ң/g, 'н').replace(/һ/g, 'х')
    .replace(/[«»"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Строка адреса из БД → место. `null`, если правила не сработали. */
export function resolvePlace(location: string | null | undefined): Place | null {
  if (!location) return null;
  const s = normalizeLocation(location);
  for (const rule of RULES) {
    if (rule.match.test(s)) return PLACE_BY_ID.get(rule.place) ?? null;
  }
  return null;
}
