// ============================================================
// WAG — Новости компании
// ============================================================
// Локальный источник правды. Новостей немного и они редко меняются,
// поэтому таблицы в Supabase и админки у раздела пока нет — в отличие
// от projects/design/maintenance (см. src/lib/data.ts). Если новости
// начнут выходить регулярно, этот модуль заменяется на пару фетчеров
// с тем же интерфейсом, а страницы /news останутся как есть.

export interface NewsPhoto {
  /** Путь в public/ — например `/news/<slug>/01.webp` */
  src: string;
  alt: string;
  /** Подпись под кадром в лайтбоксе; необязательна */
  caption?: string;
}

export interface NewsVideo {
  /** ID ролика на YouTube (часть после youtu.be/) */
  youtubeId: string;
  /** Локальный постер в public/ — фасад, чтобы не грузить YouTube до клика */
  poster: string;
  /** Идёт в title iframe и в aria-label кнопки воспроизведения */
  title: string;
  caption?: string;
}

export interface NewsFact {
  label: string;
  value: string;
}

export interface NewsItem {
  slug: string;
  /** ISO-дата события — для <time dateTime> и сортировки */
  date: string;
  /** Человеческая дата для вёрстки: «17–21 августа 2026» */
  dateLabel: string;
  category: string;
  title: string;
  /** Лид: он же анонс в списке и og:description */
  excerpt: string;
  /** Город/площадка — если известны; иначе строка в шапке не выводится */
  location?: string;
  cover: string;
  coverAlt: string;
  coverCaption?: string;
  /** Абзацы основного текста */
  body: string[];
  facts: NewsFact[];
  /** Ролик под текстом статьи; необязателен */
  video?: NewsVideo;
  photos: NewsPhoto[];
  /** Автор снимков — выводится под галереей */
  photoCredit?: string;
}

const NEWS: NewsItem[] = [
  {
    slug: 'para-athletics-2026',
    date: '2026-08-21',
    dateLabel: '17–21 августа 2026',
    category: 'Спонсорство',
    title: 'Михаил Холостенко — серебро и бронза чемпионата Казахстана по пара лёгкой атлетике',
    excerpt:
      'Компания помогла Михаилу Холостенко приехать на чемпионат Республики Казахстан в Алматы. ' +
      'Три дисциплины — ядро, диск и копьё; второе и третье место в своём классе.',
    location: 'Алматы',
    cover: '/news/para-athletics-2026/cover.webp',
    coverAlt:
      'Михаил Холостенко с флагом West Arlan Group у пьедестала чемпионата Казахстана по пара лёгкой атлетике',
    coverCaption:
      'Алматы, чемпионат Республики Казахстан по пара лёгкой атлетике, август 2026 года',
    body: [
      'С 17 по 21 августа в Алматы прошёл чемпионат Республики Казахстан по пара лёгкой атлетике. ' +
        'Михаил Холостенко в очередной раз вышел на старт этих соревнований.',
      'Михаил состязался в трёх дисциплинах — толкание ядра, метание диска и метание копья. ' +
        'В его классе выступали семь спортсменов; по итогам чемпионата Михаил занял второе и третье место.',
      'На фотографиях рядом с ним — его тренер Байтурин Молдабай, действующий чемпион мира среди ветеранов.',
      'West Arlan Group оказала Михаилу финансовую спонсорскую помощь, чтобы он смог приехать в Алматы и выступить на чемпионате.',
    ],
    facts: [
      { label: 'Соревнование', value: 'Чемпионат РК по пара лёгкой атлетике' },
      { label: 'Даты',         value: '17–21 августа 2026' },
      { label: 'Место',        value: 'Алматы' },
      { label: 'Дисциплины',   value: 'Толкание ядра, метание диска, метание копья' },
      { label: 'Результат',    value: '2-е и 3-е место, 7 спортсменов в классе' },
      { label: 'Тренер',       value: 'Байтурин Молдабай' },
    ],
    photos: [
      {
        src: '/news/para-athletics-2026/01-podium.webp',
        alt: 'Михаил Холостенко с двумя медалями на фоне баннера чемпионата',
        caption: 'Две медали чемпионата Республики Казахстан — за второе и третье место',
      },
      {
        src: '/news/para-athletics-2026/02-coach.webp',
        alt: 'Михаил Холостенко и его тренер Байтурин Молдабай с флагом West Arlan Group',
        caption: 'Михаил с тренером Байтурином Молдабаем — действующим чемпионом мира среди ветеранов',
      },
      {
        src: '/news/para-athletics-2026/03-medals.webp',
        alt: 'Михаил Холостенко показывает серебряную и бронзовую медали',
        caption: 'Серебро и бронза за три дисциплины: ядро, диск и копьё',
      },
      {
        src: '/news/para-athletics-2026/04-diplomas.webp',
        alt: 'Михаил Холостенко с дипломами за второе и третье место',
        caption: 'Дипломы за II и III места',
      },
      {
        src: '/news/para-athletics-2026/05-flag.webp',
        alt: 'Михаил Холостенко с флагом West Arlan Group на стадионе',
        caption: 'Стадион «Динамо», Алматы',
      },
      {
        src: '/news/para-athletics-2026/06-diplomas-wag.webp',
        alt: 'Михаил Холостенко с дипломами и медалями в форме с логотипом WAG',
      },
      {
        src: '/news/para-athletics-2026/07-back.webp',
        alt: 'Михаил Холостенко в футболке West Arlan Group, вид со спины',
      },
      {
        src: '/news/para-athletics-2026/08-flatlay.webp',
        alt: 'Две медали и два диплома чемпионата на флаге West Arlan Group',
        caption: 'Награды чемпионата',
      },
      {
        src: '/news/para-athletics-2026/09-podium-wide.webp',
        alt: 'Михаил Холостенко у пьедестала почёта чемпионата Казахстана по пара лёгкой атлетике',
      },
    ],
    photoCredit: 'Дарья Холостенко',
  },
  {
    slug: 'railway-day-2026',
    date: '2026-08-08',
    dateLabel: '8 августа 2026',
    category: 'Коллектив',
    title: 'Отметили День железнодорожника вместе с коллективом',
    excerpt:
      'Сотрудники компании собрались, чтобы поздравить друг друга с профессиональным ' +
      'праздником. Как прошёл вечер — в видеорепортаже.',
    cover: '/news/railway-day-2026/cover.webp',
    coverAlt: 'Сотрудники West Arlan Group на праздновании Дня железнодорожника',
    body: [
      '8 августа West Arlan Group отметила День железнодорожника вместе с коллективом: ' +
        'сотрудники компании собрались, чтобы поздравить друг друга с профессиональным праздником.',
      'Как прошёл вечер — в коротком ролике на канале компании.',
    ],
    facts: [
      { label: 'Повод',     value: 'День железнодорожника' },
      { label: 'Дата',      value: '8 августа 2026' },
      { label: 'Участники', value: 'Коллектив West Arlan Group' },
    ],
    video: {
      youtubeId: 'QlaFRkLZ2EM',
      poster: '/news/railway-day-2026/cover.webp',
      title: 'West Arlan Group — День железнодорожника',
      caption: 'Видеорепортаж с празднования Дня железнодорожника',
    },
    photos: [],
  },
];

/** Все новости, свежие сверху. */
export function getNewsItems(): NewsItem[] {
  return [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsItem(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

export function getNewsSlugs(): string[] {
  return NEWS.map((n) => n.slug);
}
